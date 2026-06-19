import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const inputCsvPath = path.join(rootDir, 'docs/shopify-product-inventory-priced.csv')
const outputDir = path.join(rootDir, 'docs/wholesale-price-list')
const assetDir = path.join(outputDir, 'assets')
const outputHtmlPath = path.join(outputDir, 'hay-hay-wholesale-vase-price-list.html')
const outputPdfPath = path.join(outputDir, 'hay-hay-wholesale-vase-price-list.pdf')
const logoSourcePath = path.join(
  rootDir,
  'public/images/branding/hay-hay-design-logo-inline.png',
)

const colourOptions = ['Cobalt Blue', 'Teal Green', 'Deep Plum']
const colourLabel = colourOptions.join(', ')
const shopifyApiVersion = '2026-01'
const excludedProductHandles = new Set(['spool'])

function readEnv(text) {
  const env = {}

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)

    if (!match) {
      continue
    }

    let value = match[2].trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[match[1]] = value
  }

  return env
}

async function loadEnv() {
  const envPath = path.join(rootDir, '.env')
  const fileEnv = existsSync(envPath)
    ? readEnv(await fs.readFile(envPath, 'utf8'))
    : {}

  return { ...fileEnv, ...process.env }
}

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

function formatMoney(value) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return 'TBC'
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 2,
  }).format(parsed)
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function formatWeight(value) {
  if (!value || /^no weight set$/i.test(value)) {
    return 'TBC'
  }

  return value
}

function htmlEscape(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function storefrontFetch(env, query, variables = {}) {
  const storeDomain = env.NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  const publicToken = env.NUXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN
  const apiVersion =
    env.NUXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || shopifyApiVersion

  if (!storeDomain || !publicToken) {
    throw new Error('Missing Shopify Storefront API config in .env')
  }

  const response = await fetch(
    `https://${storeDomain}/api/${apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': publicToken,
      },
      body: JSON.stringify({ query, variables }),
    },
  )
  const json = await response.json()

  if (!response.ok || json.errors?.length) {
    throw new Error(
      JSON.stringify({ status: response.status, errors: json.errors || json }),
    )
  }

  return json.data
}

async function fetchShopifyProducts(env) {
  const query = `#graphql
    query Products($cursor: String) {
      products(first: 250, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          handle
          title
          featuredImage {
            id
            url
            altText
          }
          images(first: 30) {
            nodes {
              id
              url
              altText
            }
          }
          variants(first: 30) {
            nodes {
              title
              selectedOptions {
                name
                value
              }
              image {
                id
                url
                altText
              }
            }
          }
        }
      }
    }
  `

  const products = []
  let cursor = null

  do {
    const data = await storefrontFetch(env, query, { cursor })
    products.push(...data.products.nodes)
    cursor = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null
  } while (cursor)

  return products
}

function variantColour(variant) {
  return (
    variant?.selectedOptions?.find((option) => /colou?r/i.test(option.name))
      ?.value || variant?.title
  )
}

function imageScore(image, productName, colour) {
  const haystack = normalizeText(
    [image?.altText, image?.url, productName].filter(Boolean).join(' '),
  )
  const colourWords = normalizeText(colour).split(' ').filter(Boolean)
  let score = 0

  for (const word of colourWords) {
    if (haystack.includes(word)) {
      score += 5
    }
  }

  if (haystack.includes(normalizeText(productName))) {
    score += 1
  }

  return score
}

function selectShopifyImage(product, productName, colour) {
  const colourKey = normalizeText(colour)
  const matchingVariant = product?.variants?.nodes?.find(
    (variant) => normalizeText(variantColour(variant)) === colourKey,
  )

  if (matchingVariant?.image?.url) {
    return matchingVariant.image
  }

  const images = [
    ...(product?.images?.nodes || []),
    product?.featuredImage,
  ].filter((image) => image?.url)

  const bestImage = images
    .map((image) => ({
      image,
      score: imageScore(image, productName, colour),
    }))
    .sort((a, b) => b.score - a.score)[0]

  return bestImage?.image || product?.featuredImage || images[0] || null
}

async function downloadAndPrepareImage(image, outputPath) {
  if (!image?.url) {
    return null
  }

  const response = await fetch(image.url)

  if (!response.ok) {
    throw new Error(`Could not download ${image.url}`)
  }

  const source = Buffer.from(await response.arrayBuffer())

  await sharp(source)
    .resize({
      width: 420,
      height: 420,
      fit: 'contain',
      background: '#fffef7',
    })
    .jpeg({ quality: 88 })
    .toFile(outputPath)

  return outputPath
}

function buildRows(csvRows, shopifyProducts) {
  const productByHandle = new Map(
    shopifyProducts.map((product) => [product.handle, product]),
  )
  const baseRows = csvRows.filter((row) => {
    const name = row.Name || ''

    return (
      !excludedProductHandles.has(row.Handle) &&
      !/lamp/i.test(name) &&
      !/^petal$/i.test(name)
    )
  })
  const uniqueProductRows = [
    ...new Map(baseRows.map((row) => [row.Handle, row])).values(),
  ]

  return uniqueProductRows
    .map((row) => {
      const product = productByHandle.get(row.Handle)

      return {
        name: row.Name,
        handle: row.Handle,
        colour: colourLabel,
        size: row.Size || 'TBC',
        weight: formatWeight(row.Weight),
        wholesalePrice: formatMoney(row['Wholesale Price']),
        rrp: formatMoney(row['Retail Price']),
        shopifyProduct: product,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'en-AU'))
}

async function prepareAssets(rows) {
  await fs.mkdir(assetDir, { recursive: true })
  await sharp(logoSourcePath)
    .resize({ width: 980, withoutEnlargement: true })
    .png()
    .toFile(path.join(assetDir, 'hay-hay-logo.png'))

  for (const row of rows) {
    const image = selectShopifyImage(row.shopifyProduct, row.name, 'Cobalt Blue')
    const fileName = `${row.handle}.jpg`
    const imagePath = path.join(assetDir, fileName)
    const preparedImagePath = await downloadAndPrepareImage(image, imagePath)
    row.imagePath = preparedImagePath ? `assets/${fileName}` : ''
    row.imageAlt = image?.altText || `${row.name} ${row.colour}`
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
          <td class="price-list__image-cell">
            ${
              row.imagePath
                ? `<img src="${htmlEscape(row.imagePath)}" alt="${htmlEscape(
                    row.imageAlt,
                  )}" class="price-list__product-image">`
                : '<div class="price-list__image-placeholder">Image TBC</div>'
            }
          </td>
          <td class="price-list__name">${htmlEscape(row.name)}</td>
          <td>${htmlEscape(row.colour)}</td>
          <td>${htmlEscape(row.weight)}</td>
          <td>${htmlEscape(row.size)}</td>
          <td class="price-list__money">${htmlEscape(row.wholesalePrice)}</td>
          <td class="price-list__money">${htmlEscape(row.rrp)}</td>
        </tr>`,
    )
    .join('\n')

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Hay Hay Wholesale Vase Price List</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 13mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #fffef7;
      color: #17223b;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      line-height: 1.25;
    }

    .price-list {
      width: 100%;
    }

    .price-list__header {
      align-items: flex-end;
      border-bottom: 2px solid #17223b;
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding-bottom: 10px;
    }

    .price-list__logo {
      display: block;
      height: 52px;
      object-fit: contain;
      object-position: left center;
      width: 300px;
    }

    .price-list__title-block {
      text-align: right;
    }

    .price-list__title {
      font-size: 19px;
      font-weight: 700;
      letter-spacing: 0;
      margin: 0 0 4px;
    }

    .price-list__meta {
      color: #546173;
      font-size: 10px;
      margin: 0;
    }

    .price-list__table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
    }

    .price-list__table th,
    .price-list__table td {
      border-bottom: 1px solid #d8d4c4;
      padding: 8px 7px;
      text-align: left;
      vertical-align: middle;
    }

    .price-list__table th {
      background: #17223b;
      color: #fffef7;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .price-list__table tbody tr:nth-child(even) {
      background: #f5f1df;
    }

    .price-list__image-column {
      width: 86px;
    }

    .price-list__name-column {
      width: 80px;
    }

    .price-list__colour-column {
      width: 145px;
    }

    .price-list__weight-column {
      width: 64px;
    }

    .price-list__size-column {
      width: 82px;
    }

    .price-list__price-column {
      width: 70px;
    }

    .price-list__image-cell {
      padding: 6px 7px;
    }

    .price-list__product-image {
      aspect-ratio: 1;
      background: #fffef7;
      display: block;
      height: 76px;
      object-fit: contain;
      width: 76px;
    }

    .price-list__image-placeholder {
      align-items: center;
      aspect-ratio: 1;
      background: #efe8cb;
      border: 1px solid #d8d4c4;
      color: #546173;
      display: flex;
      font-size: 9px;
      font-weight: 700;
      height: 76px;
      justify-content: center;
      text-align: center;
      text-transform: uppercase;
      width: 76px;
    }

    .price-list__name,
    .price-list__money {
      font-weight: 700;
    }

    .price-list__footer {
      color: #546173;
      font-size: 9px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <main class="price-list">
    <header class="price-list__header">
      <img src="assets/hay-hay-logo.png" alt="Hay Hay" class="price-list__logo">
      <div class="price-list__title-block">
        <h1 class="price-list__title">Wholesale Vase Price List</h1>
        <p class="price-list__meta">Prepared ${htmlEscape(dateLabel)} · AUD</p>
      </div>
    </header>

    <table class="price-list__table">
      <thead>
        <tr>
          <th class="price-list__image-column">Image</th>
          <th class="price-list__name-column">Name</th>
          <th class="price-list__colour-column">Colour</th>
          <th class="price-list__weight-column">Weight</th>
          <th class="price-list__size-column">Size</th>
          <th class="price-list__price-column">Wholesale</th>
          <th class="price-list__price-column">RRP</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <footer class="price-list__footer">
      <span>Wholesale prices shown exclude shipping.</span>
    </footer>
  </main>
</body>
</html>
`

  await fs.writeFile(outputHtmlPath, html, 'utf8')
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true })

  const env = await loadEnv()
  const csvRows = parseCsv(await fs.readFile(inputCsvPath, 'utf8'))
  const shopifyProducts = await fetchShopifyProducts(env)
  const rows = buildRows(csvRows, shopifyProducts)

  await prepareAssets(rows)
  await writeHtml(rows)

  console.log(JSON.stringify({ html: outputHtmlPath, pdf: outputPdfPath, rows }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
