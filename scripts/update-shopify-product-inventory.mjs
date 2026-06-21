import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const baseInventoryPath = path.join(rootDir, 'docs/shopify-product-inventory.csv')
const pricedInventoryPath = path.join(
  rootDir,
  'docs/shopify-product-inventory-priced.csv',
)
const shopifyApiVersion = '2026-01'

const simpleInventoryHeaders = [
  'Name',
  'Handle',
  'Variant',
  'Size',
  'Weight',
  'Retail Price',
  'Currency',
  'Available for sale',
  'Image URL',
]
const pricedInventoryHeaders = [
  'Name',
  'Handle',
  'Variant',
  'Size',
  'Weight',
  'Available for sale',
  'Image URL',
  'Matched Product',
  'Size Category',
  'Cost',
  'Wholesale Price',
  'Retail Price',
  'Wholesale Profit',
  'Retail Profit',
  'Wholesale Margin %',
  'Retail Margin %',
]

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

  if (!headers) {
    return []
  }

  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] || ''])),
  )
}

function csvEscape(value) {
  const text = String(value ?? '')

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

function stringifyCsv(headers, rows) {
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n') + '\n'
}

async function readCsvIfExists(filePath) {
  if (!existsSync(filePath)) {
    return []
  }

  return parseCsv(await fs.readFile(filePath, 'utf8'))
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
          availableForSale
          width: metafield(namespace: "custom", key: "width") {
            value
            type
          }
          height: metafield(namespace: "custom", key: "height") {
            value
            type
          }
          depth: metafield(namespace: "custom", key: "depth") {
            value
            type
          }
          size: metafield(namespace: "custom", key: "size") {
            value
            type
          }
          dimensions: metafield(namespace: "custom", key: "dimensions") {
            value
            type
          }
          featuredImage {
            url
            altText
          }
          images(first: 30) {
            nodes {
              url
              altText
            }
          }
          variants(first: 100) {
            nodes {
              title
              availableForSale
              weight
              weightUnit
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
              }
              price {
                amount
                currencyCode
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

function parseMaybeJson(value) {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function formatDimensionValue(value) {
  const parsed = parseMaybeJson(value)

  if (!parsed || typeof parsed !== 'object' || !('value' in parsed)) {
    return value || ''
  }

  const units = {
    CENTIMETERS: 'cm',
    METERS: 'm',
    MILLIMETERS: 'mm',
    INCHES: 'in',
    FEET: 'ft',
  }
  const unit = units[parsed.unit] || parsed.unit || ''

  return `${Number(parsed.value).toLocaleString('en-AU', {
    maximumFractionDigits: 2,
  })} ${unit}`.trim()
}

function metafieldValue(product, key) {
  return formatDimensionValue(product[key]?.value || '')
}

function formatSize(product, variant) {
  const direct = metafieldValue(product, 'size') || metafieldValue(product, 'dimensions')

  if (direct) {
    return direct
  }

  const dimensions = [
    metafieldValue(product, 'width'),
    metafieldValue(product, 'height'),
    metafieldValue(product, 'depth'),
  ].filter(Boolean)

  if (dimensions.length > 0) {
    return dimensions.join(' x ')
  }

  const sizeOption = variant.selectedOptions?.find((option) => /size/i.test(option.name))

  return sizeOption?.value || ''
}

function formatWeight(variant) {
  if (!variant?.weight) {
    return 'No weight set'
  }

  const units = {
    GRAMS: 'g',
    KILOGRAMS: 'kg',
    OUNCES: 'oz',
    POUNDS: 'lb',
  }
  const value = Number(variant.weight).toLocaleString('en-AU', {
    maximumFractionDigits: 3,
  })

  return `${value} ${units[variant.weightUnit] || variant.weightUnit || ''}`.trim()
}

function variantLabel(variant) {
  return (
    variant.selectedOptions?.find((option) => /colou?r/i.test(option.name))?.value ||
    variant.title ||
    'Default Title'
  )
}

function formatNumber(value, decimals = 2) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return ''
  }

  return String(Number(parsed.toFixed(decimals)))
}

function formatCurrencyNumber(value) {
  return formatNumber(value, 2)
}

function formatPercent(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return ''
  }

  return formatNumber((numerator / denominator) * 100, 1)
}

function parseLocalNumber(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return NaN
  }

  return Number(value)
}

function localKey(row) {
  return `${row.Handle || ''}::${row.Variant || ''}`
}

function buildLocalLookup(existingRows) {
  const byVariant = new Map()
  const byHandle = new Map()

  for (const row of existingRows) {
    if (row.Handle && !byHandle.has(row.Handle)) {
      byHandle.set(row.Handle, row)
    }

    if (row.Handle && row.Variant) {
      byVariant.set(localKey(row), row)
    }
  }

  return { byVariant, byHandle }
}

function localRowFor(row, lookup) {
  return lookup.byVariant.get(localKey(row)) || lookup.byHandle.get(row.Handle) || {}
}

function buildRows(products, existingPricedRows) {
  const localLookup = buildLocalLookup(existingPricedRows)
  const simpleRows = []
  const pricedRows = []

  for (const product of products) {
    const variants = product.variants?.nodes?.length
      ? product.variants.nodes
      : [
          {
            title: 'Default Title',
            availableForSale: product.availableForSale,
            selectedOptions: [],
            image: null,
            price: null,
          },
        ]

    for (const variant of variants) {
      const retailPrice = Number(variant.price?.amount)
      const wholesalePrice = Number.isFinite(retailPrice) ? retailPrice * 0.5 : NaN
      const imageUrl = variant.image?.url || product.featuredImage?.url || ''
      const baseRow = {
        Name: product.title,
        Handle: product.handle,
        Variant: variantLabel(variant),
        Size: formatSize(product, variant),
        Weight: formatWeight(variant),
        'Retail Price': formatCurrencyNumber(retailPrice),
        Currency: variant.price?.currencyCode || '',
        'Available for sale': variant.availableForSale ? 'Yes' : 'No',
        'Image URL': imageUrl,
      }
      const local = localRowFor(baseRow, localLookup)
      const cost =
        String(local.Cost || '').trim() === '0' && !local['Size Category']
          ? NaN
          : parseLocalNumber(local.Cost)
      const hasCost = Number.isFinite(cost)
      const wholesaleProfit =
        hasCost && Number.isFinite(wholesalePrice) ? wholesalePrice - cost : NaN
      const retailProfit =
        hasCost && Number.isFinite(retailPrice) ? retailPrice - cost : NaN

      simpleRows.push(baseRow)
      pricedRows.push({
        Name: baseRow.Name,
        Handle: baseRow.Handle,
        Variant: baseRow.Variant,
        Size: baseRow.Size,
        Weight: baseRow.Weight,
        'Available for sale': baseRow['Available for sale'],
        'Image URL': baseRow['Image URL'],
        'Matched Product': local['Matched Product'] || product.title,
        'Size Category': local['Size Category'] || '',
        Cost: hasCost ? formatCurrencyNumber(cost) : '',
        'Wholesale Price': formatCurrencyNumber(wholesalePrice),
        'Retail Price': formatCurrencyNumber(retailPrice),
        'Wholesale Profit': formatCurrencyNumber(wholesaleProfit),
        'Retail Profit': formatCurrencyNumber(retailProfit),
        'Wholesale Margin %': formatPercent(wholesaleProfit, wholesalePrice),
        'Retail Margin %': formatPercent(retailProfit, retailPrice),
      })
    }
  }

  return { simpleRows, pricedRows }
}

function summarize(pricedRows) {
  return {
    rows: pricedRows.length,
    missingRetailPrice: pricedRows.filter((row) => !row['Retail Price']).length,
    missingCost: pricedRows.filter((row) => !row.Cost).length,
    missingWeight: pricedRows.filter((row) => row.Weight === 'No weight set').length,
    missingImage: pricedRows.filter((row) => !row['Image URL']).length,
  }
}

async function main() {
  const env = await loadEnv()
  const existingPricedRows = await readCsvIfExists(pricedInventoryPath)
  const products = await fetchShopifyProducts(env)
  const { simpleRows, pricedRows } = buildRows(products, existingPricedRows)

  await fs.writeFile(baseInventoryPath, stringifyCsv(simpleInventoryHeaders, simpleRows))
  await fs.writeFile(
    pricedInventoryPath,
    stringifyCsv(pricedInventoryHeaders, pricedRows),
  )

  console.log(
    JSON.stringify(
      {
        products: products.length,
        ...summarize(pricedRows),
        files: {
          baseInventory: baseInventoryPath,
          pricedInventory: pricedInventoryPath,
        },
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
