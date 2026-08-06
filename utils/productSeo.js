const DEFAULT_BRAND = 'hay-hay design'

const CATEGORY_SINGULARS = new Map([
  ['table lamps', 'table lamp'],
  ['vases', 'vase'],
])

export function buildProductImageAlt({ product, image, variant } = {}) {
  const title = cleanText(product?.title)
  const colour = getVariantOption(variant, ['color', 'colour'])
  const material = getVariantOption(variant, ['material'])
  const category = singularizeCategory(
    cleanText(product?.productType) || cleanText(product?.category?.name),
  )
  const authoredAlt = cleanText(image?.altText)

  if (
    authoredAlt &&
    !isGenericImageAlt(authoredAlt, { title, colour, category })
  ) {
    return authoredAlt
  }

  const parts = []

  appendUniquePart(parts, colour)
  appendUniquePart(parts, material)
  appendUniquePart(parts, title)
  appendUniquePart(parts, category)

  return parts.join(' ') || authoredAlt || 'Product'
}

export function buildProductStructuredData({
  product,
  variant,
  images = [],
  url,
  brandName = DEFAULT_BRAND,
} = {}) {
  const name = cleanText(product?.title)
  const productUrl = cleanText(url)
  const imageUrls = [
    ...images.map((image) => image?.src || image?.url),
    product?.featuredImage?.url,
  ]
    .map((imageUrl) => absoluteUrl(imageUrl, productUrl))
    .filter(Boolean)
    .filter((imageUrl, index, allImageUrls) =>
      allImageUrls.indexOf(imageUrl) === index,
    )

  if (!name || !productUrl || imageUrls.length === 0) {
    return null
  }

  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name,
    image: imageUrls,
    description: cleanText(product?.description) || undefined,
    category:
      cleanText(product?.productType) ||
      cleanText(product?.category?.name) ||
      undefined,
    color: getVariantOption(variant, ['color', 'colour']) || undefined,
    material: getVariantOption(variant, ['material']) || undefined,
    sku: cleanText(variant?.sku) || undefined,
    brand: {
      '@type': 'Brand',
      name: cleanText(product?.vendor) || brandName,
    },
  }

  const price = Number(variant?.price?.amount)

  if (Number.isFinite(price) && price > 0) {
    data.offers = {
      '@type': 'Offer',
      url: productUrl,
      price,
      priceCurrency: cleanText(variant?.price?.currencyCode) || 'AUD',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        variant?.availableForSale === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: cleanText(product?.vendor) || brandName,
      },
    }
  }

  return removeUndefined(data)
}

export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function appendUniquePart(parts, value) {
  const cleanValue = cleanText(value)
  const normalizedValue = normalizeText(cleanValue)
  const normalizedDescription = normalizeText(parts.join(' '))

  if (
    !cleanValue ||
    normalizedDescription.includes(normalizedValue) ||
    (Boolean(normalizedDescription) &&
      normalizedValue.includes(normalizedDescription))
  ) {
    return
  }

  parts.push(cleanValue)
}

function isGenericImageAlt(alt, { title, colour, category }) {
  const genericValues = [
    title,
    colour,
    `${title} ${colour}`,
    `${colour} ${title}`,
    `${title} in ${colour}`,
    `${title} ${category}`,
  ]
    .map(normalizeText)
    .filter(Boolean)

  return genericValues.includes(normalizeText(alt))
}

function getVariantOption(variant, names) {
  const normalizedNames = names.map(normalizeText)
  const option = variant?.selectedOptions?.find((selectedOption) =>
    normalizedNames.includes(normalizeText(selectedOption?.name)),
  )

  return cleanText(option?.value)
}

function singularizeCategory(category) {
  return CATEGORY_SINGULARS.get(normalizeText(category)) || category
}

function absoluteUrl(value, baseUrl) {
  const cleanValue = cleanText(value)

  if (!cleanValue) {
    return ''
  }

  try {
    return new URL(cleanValue, baseUrl).href
  } catch {
    return ''
  }
}

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function normalizeText(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function removeUndefined(value) {
  if (Array.isArray(value)) {
    return value.map(removeUndefined)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nestedValue]) => nestedValue !== undefined)
        .map(([key, nestedValue]) => [key, removeUndefined(nestedValue)]),
    )
  }

  return value
}
