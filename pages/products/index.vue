<template>
  <div class="products-page">
    <Header />
    <main class="main-content">
      <h1>Our Products</h1>
      <div class="products-grid">
        <ProductCard
          v-for="product in displayProducts"
          :key="product.handle"
          :product="product"
        />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { products as localProducts, getProductImages } from '~/data/products'

usePageSeo(
  'Products',
  'Explore bold, tactile pieces from hay-hay design—hand-flocked sculptural objects shaped by playful colour, rounded forms and unexpected texture.',
)

const { products: shopifyProducts, fetchProducts } = useShopifyStorefront()

await useAsyncData('shopify-products-page', async () => {
  await fetchProducts()
  return true
})

onMounted(() => {
  fetchProducts()
})

const displayProducts = computed(() => {
  if (shopifyProducts.value.length > 0) {
    return shopifyProducts.value
      .map((product) => {
        const slides = getShopifyProductSlides(product)
        const price = formatProductPrice(product)

        if (slides.length === 0 || !price) {
          return null
        }

        return {
          handle: product.handle,
          title: product.title,
          description: product.description,
          price,
          slides,
        }
      })
      .filter(Boolean)
  }

  return localProducts
    .map((product) => {
      const image = getLocalProductImage(product)

      if (!image) {
        return null
      }

      return {
        handle: product.name,
        title: product.title,
        description: product.description,
        price: formatPrice({
          amount: product.price,
          currencyCode: 'AUD',
        }),
        slides: [
          {
            id: `${product.name}-${product.color}`,
            label: product.color,
            swatchColor: '',
            image,
          },
        ],
      }
    })
    .filter(Boolean)
})

function getShopifyProductSlides(product) {
  const primaryImage = getShopifyProductImage(product)

  if (!primaryImage) {
    return []
  }

  const colourOption = product.options?.find((option) =>
    /^colou?r$/i.test(option.name.trim()),
  )

  if (!colourOption || colourOption.optionValues.length < 2) {
    return [createShopifySlide(product, null, primaryImage)]
  }

  const slides = colourOption.optionValues
    .map((optionValue) => {
      const variant = getVariantForOptionValue(
        product.variants?.nodes || [],
        colourOption.name,
        optionValue.name,
      )

      if (!variant) {
        return null
      }

      const image = hasImageUrl(variant.image) ? variant.image : primaryImage

      return createShopifySlide(product, variant, image, optionValue)
    })
    .filter(Boolean)

  return slides.length > 0
    ? slides
    : [createShopifySlide(product, null, primaryImage)]
}

function createShopifySlide(product, variant, image, optionValue = null) {
  const colourName = optionValue?.name || ''

  return {
    id: optionValue?.id || variant?.id || image.id || product.id,
    label: colourName,
    swatchColor: normalizeSwatchColor(optionValue?.swatch?.color),
    price: formatPrice(variant?.price),
    image: {
      src: image.url,
      alt:
        image.altText ||
        (colourName ? `${product.title} in ${colourName}` : product.title),
      width: image.width,
      height: image.height,
    },
  }
}

function getVariantForOptionValue(variants, optionName, optionValue) {
  const matchingVariants = variants.filter((variant) =>
    variant.selectedOptions?.some(
      (selectedOption) =>
        selectedOption.name.toLowerCase() === optionName.toLowerCase() &&
        selectedOption.value.toLowerCase() === optionValue.toLowerCase(),
    ),
  )

  return (
    matchingVariants.find(
      (variant) =>
        variant.availableForSale &&
        hasImageUrl(variant.image) &&
        hasVariantPrice(variant),
    ) ||
    matchingVariants.find(
      (variant) => hasImageUrl(variant.image) && hasVariantPrice(variant),
    ) ||
    matchingVariants[0]
  )
}

function getShopifyProductImage(product) {
  return [
    product.featuredImage,
    ...(product.images?.nodes || []),
    ...(product.variants?.nodes || []).map((variant) => variant.image),
  ].find((image) => hasImageUrl(image))
}

function normalizeSwatchColor(color) {
  if (
    typeof color === 'string' &&
    /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(color)
  ) {
    return color
  }

  return '#d8d8d8'
}

function getLocalProductImage(product) {
  if (!product.imageCount) {
    return null
  }

  const imageName = getProductImages(product.name, product.color, 1)[0]

  if (!imageName) {
    return null
  }

  return {
    src: `/images/products/${product.name}/${imageName}`,
    alt: product.title,
    isRemote: false,
  }
}

function hasImageUrl(image) {
  return typeof image?.url === 'string' && image.url.trim().length > 0
}

function formatProductPrice(product) {
  const availableVariant =
    product.variants?.nodes?.find(
      (variant) => variant.availableForSale && hasVariantPrice(variant),
    ) || product.variants?.nodes?.find(hasVariantPrice)

  return formatPrice(availableVariant?.price)
}

function hasVariantPrice(variant) {
  return getPriceAmount(variant?.price) > 0
}

function formatPrice(price) {
  const amount = getPriceAmount(price)

  if (amount <= 0) {
    return ''
  }

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: price.currencyCode || 'AUD',
  }).format(amount)
}

function getPriceAmount(price) {
  const amount = Number(price?.amount)

  return Number.isFinite(amount) ? amount : 0
}
</script>

<style scoped lang="scss">
.products-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 2rem;
  font-family: 'Figuratika', sans-serif;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}
</style>
