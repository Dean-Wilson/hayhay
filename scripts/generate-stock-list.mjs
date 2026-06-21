import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const inputCsvPath = path.join(rootDir, 'docs/shopify-product-inventory-priced.csv')
const outputDir = path.join(rootDir, 'docs/stock-list')
const assetDir = path.join(outputDir, 'assets')
const outputHtmlPath = path.join(outputDir, 'hay-hay-shopify-stock-list.html')
const outputPdfPath = path.join(outputDir, 'hay-hay-shopify-stock-list.pdf')
const logoSourcePath = path.join(
  rootDir,
  'public/images/branding/hay-hay-design-logo-inline.png',
)

function parseCsv(text) {
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        index += 1
      }
      row.push(field)
      field = ''
      if (row.some((value) => value !== '')) {
        rows.push(row)
      }
      row = []
      continue
    }

    field += char
  }

  row.push(field)

  if (row.some((value) => value !== '')) {
    rows.push(row)
  }

  const [headers, ...records] = rows

  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] || ''])),
  )
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function htmlEscape(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== ''))]
}

function displayList(values, fallback = 'TBC') {
  const items = unique(values)

  if (items.length === 0) {
    return fallback
  }

  return items.join(', ')
}

function displayVariantList(values) {
  const items = unique(values).filter((value) => value !== 'Default Title')

  if (items.length === 0) {
    return 'Default'
  }

  return items.join(', ')
}

function formatMoney(value) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return ''
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 2,
  }).format(parsed)
}

function formatMoneyRange(values) {
  const amounts = unique(values)
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)

  if (amounts.length === 0) {
    return 'TBC'
  }

  if (amounts[0] === amounts[amounts.length - 1]) {
    return formatMoney(amounts[0])
  }

  return `${formatMoney(amounts[0])}-${formatMoney(amounts[amounts.length - 1])}`
}

function displayNumericRange(values, suffix = '') {
  const amounts = unique(values)
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b)

  if (amounts.length === 0) {
    return 'TBC'
  }

  const format = (value) =>
    `${Number(value.toFixed(1)).toLocaleString('en-AU')}${suffix}`

  if (amounts[0] === amounts[amounts.length - 1]) {
    return format(amounts[0])
  }

  return `${format(amounts[0])}-${format(amounts[amounts.length - 1])}`
}

function groupRows(rows) {
  const byHandle = new Map()

  for (const row of rows) {
    if (!byHandle.has(row.Handle)) {
      byHandle.set(row.Handle, [])
    }

    byHandle.get(row.Handle).push(row)
  }

  return [...byHandle.values()]
    .map((group) => {
      const first = group[0]

      return {
        name: first.Name,
        handle: first.Handle,
        variants: displayVariantList(group.map((row) => row.Variant)),
        size: displayList(group.map((row) => row.Size)),
        weight: displayList(group.map((row) => row.Weight), 'No weight set'),
        availability: group.some((row) => row['Available for sale'] === 'Yes')
          ? 'Yes'
          : 'No',
        retailPrice: formatMoneyRange(group.map((row) => row['Retail Price'])),
        wholesalePrice: formatMoneyRange(group.map((row) => row['Wholesale Price'])),
        cost: formatMoneyRange(group.map((row) => row.Cost)),
        wholesaleMargin: displayNumericRange(group.map((row) => row['Wholesale Margin %']), '%'),
        retailMargin: displayNumericRange(group.map((row) => row['Retail Margin %']), '%'),
        imageUrl: group.find((row) => row['Image URL'])?.['Image URL'] || '',
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en-AU'))
}

async function downloadAndPrepareImage(imageUrl, outputPath) {
  if (!imageUrl) {
    return ''
  }

  const response = await fetch(imageUrl)

  if (!response.ok) {
    return ''
  }

  const source = Buffer.from(await response.arrayBuffer())

  await sharp(source)
    .resize({
      width: 300,
      height: 300,
      fit: 'contain',
      background: '#fffef7',
    })
    .jpeg({ quality: 86 })
    .toFile(outputPath)

  return outputPath
}

async function prepareAssets(rows) {
  await fs.mkdir(assetDir, { recursive: true })

  await sharp(logoSourcePath)
    .resize({ width: 760, withoutEnlargement: true })
    .png()
    .toFile(path.join(assetDir, 'hay-hay-logo.png'))

  for (const row of rows) {
    const fileName = `${normalizeText(row.handle)}.jpg`
    const imagePath = path.join(assetDir, fileName)
    const preparedImagePath = await downloadAndPrepareImage(row.imageUrl, imagePath)

    row.imagePath = preparedImagePath ? `assets/${fileName}` : ''
  }
}

async function writeHtml(rows) {
  const dateLabel = new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td class="stock-list__image-cell">
            ${
              row.imagePath
                ? `<img src="${htmlEscape(row.imagePath)}" alt="${htmlEscape(
                    row.name,
                  )}" class="stock-list__product-image">`
                : '<div class="stock-list__image-placeholder">Image TBC</div>'
            }
          </td>
          <td class="stock-list__name">${htmlEscape(row.name)}</td>
          <td>${htmlEscape(row.variants)}</td>
          <td>${htmlEscape(row.size)}</td>
          <td>${htmlEscape(row.weight)}</td>
          <td>${htmlEscape(row.availability)}</td>
          <td class="stock-list__money">${htmlEscape(row.retailPrice)}</td>
          <td class="stock-list__money">${htmlEscape(row.wholesalePrice)}</td>
          <td class="stock-list__money">${htmlEscape(row.cost)}</td>
          <td>${htmlEscape(row.wholesaleMargin)}</td>
          <td>${htmlEscape(row.retailMargin)}</td>
        </tr>`,
    )
    .join('\n')
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Hay Hay Shopify Stock List</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #fffef7;
      color: #17223b;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.6px;
      line-height: 1.2;
    }

    .stock-list__header {
      align-items: flex-end;
      border-bottom: 2px solid #17223b;
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 8px;
    }

    .stock-list__logo {
      display: block;
      height: 38px;
      object-fit: contain;
      object-position: left center;
      width: 230px;
    }

    .stock-list__title-block {
      text-align: right;
    }

    .stock-list__title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0;
      margin: 0 0 3px;
    }

    .stock-list__meta {
      color: #546173;
      font-size: 9px;
      margin: 0;
    }

    .stock-list__table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
    }

    .stock-list__table th,
    .stock-list__table td {
      border-bottom: 1px solid #d8d4c4;
      padding: 4px 5px;
      text-align: left;
      vertical-align: middle;
    }

    .stock-list__table th {
      background: #17223b;
      color: #fffef7;
      font-size: 7.7px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .stock-list__table tbody tr:nth-child(even) {
      background: #f5f1df;
    }

    .stock-list__image-column {
      width: 46px;
    }

    .stock-list__name-column {
      width: 85px;
    }

    .stock-list__variant-column {
      width: 145px;
    }

    .stock-list__size-column {
      width: 80px;
    }

    .stock-list__weight-column {
      width: 64px;
    }

    .stock-list__available-column {
      width: 46px;
    }

    .stock-list__money-column {
      width: 62px;
    }

    .stock-list__margin-column {
      width: 62px;
    }

    .stock-list__product-image,
    .stock-list__image-placeholder {
      aspect-ratio: 1;
      height: 42px;
      width: 42px;
    }

    .stock-list__product-image {
      background: #fffef7;
      display: block;
      object-fit: contain;
    }

    .stock-list__image-placeholder {
      align-items: center;
      background: #efe8cb;
      border: 1px solid #d8d4c4;
      color: #546173;
      display: flex;
      font-size: 7px;
      font-weight: 700;
      justify-content: center;
      text-align: center;
      text-transform: uppercase;
    }

    .stock-list__name,
    .stock-list__money {
      font-weight: 700;
    }

    .stock-list__footer {
      color: #546173;
      font-size: 8px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <main class="stock-list">
    <header class="stock-list__header">
      <img src="assets/hay-hay-logo.png" alt="Hay Hay" class="stock-list__logo">
      <div class="stock-list__title-block">
        <h1 class="stock-list__title">Shopify Stock List</h1>
        <p class="stock-list__meta">Prepared ${htmlEscape(dateLabel)} · AUD · variants collapsed</p>
      </div>
    </header>

    <table class="stock-list__table">
      <thead>
        <tr>
          <th class="stock-list__image-column">Image</th>
          <th class="stock-list__name-column">Name</th>
          <th class="stock-list__variant-column">Colours / variants</th>
          <th class="stock-list__size-column">Size</th>
          <th class="stock-list__weight-column">Weight</th>
          <th class="stock-list__available-column">For sale</th>
          <th class="stock-list__money-column">RRP</th>
          <th class="stock-list__money-column">Wholesale</th>
          <th class="stock-list__money-column">Cost est.</th>
          <th class="stock-list__margin-column">Wholesale margin</th>
          <th class="stock-list__margin-column">Retail margin</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <footer class="stock-list__footer">
      <span>RRP, product details and images are sourced from Shopify. Wholesale is calculated at 50% of RRP. Cost and margin fields are local estimates.</span>
    </footer>
  </main>
</body>
</html>
`

  await fs.writeFile(outputHtmlPath, html, 'utf8')
}

async function main() {
  if (!existsSync(inputCsvPath)) {
    throw new Error(`Missing source CSV: ${inputCsvPath}`)
  }

  await fs.mkdir(outputDir, { recursive: true })

  const rows = groupRows(parseCsv(await fs.readFile(inputCsvPath, 'utf8')))

  await prepareAssets(rows)
  await writeHtml(rows)

  console.log(JSON.stringify({ html: outputHtmlPath, pdf: outputPdfPath, rows }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
