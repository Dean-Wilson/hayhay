<template>
  <div class="product-page">
    <Header />
    <main class="main-content">
      <div v-if="displayProduct" class="product-detail">
        <div class="product-gallery">
          <div class="main-image">
            <img
              v-if="mainImage?.isRemote"
              :src="mainImage.src"
              :alt="mainImage.alt"
            />
            <img
              v-else-if="mainImage"
              :src="mainImage.src"
              :alt="mainImage.alt"
            />
          </div>
          <div class="thumbnail-list">
            <button
              v-for="image in galleryImages"
              :key="image.id"
              type="button"
              :aria-label="`Show ${image.alt}`"
              :aria-pressed="selectedImageId === image.id"
              @click="selectImage(image)"
              :class="['thumbnail', { active: selectedImageId === image.id }]"
            >
              <img v-if="image.isRemote" :src="image.src" alt="" />
              <img
                v-else
                :src="image.src"
                alt=""
              />
            </button>
          </div>
        </div>

        <div class="product-info">
          <h1>{{ displayTitle }}</h1>
          <p class="description">{{ displayDescription }}</p>

          <p v-if="displayPrice" class="product-info__price">
            {{ displayPrice }}
          </p>

          <dl v-if="productDetails.length" class="product-details">
            <div
              v-for="detail in productDetails"
              :key="detail.label"
              class="product-details__item"
            >
              <dt>{{ detail.label }}</dt>
              <dd>{{ detail.value }}</dd>
            </div>
          </dl>

          <div v-if="hasShopifyProduct" class="shopify-purchase">
            <label
              v-if="shopifyVariants.length > 1"
              class="shopify-purchase__variant"
            >
              <span>Colour</span>
              <select v-model="selectedVariantId">
                <option
                  v-for="variant in shopifyVariants"
                  :key="variant.id"
                  :value="variant.id"
                  :disabled="!variant.availableForSale"
                >
                  {{ getVariantLabel(variant) }}
                </option>
              </select>
            </label>

            <p
              v-if="!selectedVariant?.availableForSale"
              class="shopify-purchase__status"
            >
              Currently unavailable
            </p>

            <button
              class="shopify-purchase__button"
              type="button"
              :disabled="!canBuy || isBuying"
              @click="buySelectedVariant"
            >
              {{ isBuying ? 'Opening checkout...' : 'Buy now' }}
            </button>

            <p v-if="purchaseError" class="shopify-purchase__error">
              {{ purchaseError }}
            </p>
          </div>

          <NuxtLink to="/products" class="back-link">
            ← Back to Products
          </NuxtLink>
        </div>
      </div>

      <div v-else class="not-found">
        <h1>Product Not Found</h1>
        <p>The product you're looking for doesn't exist.</p>
        <NuxtLink to="/products" class="btn btn-primary">
          View All Products
        </NuxtLink>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { getProduct, getProductImages } from '~/data/products'
import {
  buildProductImageAlt,
  buildProductStructuredData,
  serializeJsonLd,
} from '~/utils/productSeo'

const SITE_URL = 'https://hayhaydesign.com.au'
const route = useRoute()
const handle = String(route.params.name)
const localProduct = getProduct(handle)
const { fetchProduct, createCart } = useShopifyStorefront()
const remoteProduct = ref(null)
const localImages = computed(() =>
  localProduct
    ? getProductImages(
        localProduct.name,
        localProduct.color,
        localProduct.imageCount,
      )
    : [],
)
const selectedImageId = ref('')
const selectedVariantId = ref('')
const isBuying = ref(false)
const purchaseError = ref('')
const hideUnpricedShopifyProduct = ref(false)

const { data: initialShopifyProduct } = await useAsyncData(
  `shopify-product-${handle}`,
  () => loadShopifyProduct(),
)

setRemoteProduct(initialShopifyProduct.value)

const shopifyProduct = computed(() => remoteProduct.value)
const hasShopifyProduct = computed(() => Boolean(shopifyProduct.value))
const displayProduct = computed(() =>
  hideUnpricedShopifyProduct.value ? null : shopifyProduct.value || localProduct,
)
const shopifyVariants = computed(
  () => (shopifyProduct.value?.variants?.nodes || []).filter(hasVariantPrice),
)
const selectedVariant = computed(() =>
  shopifyVariants.value.find(
    (variant) => variant.id === selectedVariantId.value,
  ),
)
const galleryImages = computed(() => {
  const shopifyImages = collectShopifyImages()

  if (shopifyImages.length > 0) {
    return shopifyImages
  }

  return localImages.value.map((image) => ({
    id: image,
    src: `/images/products/${localProduct.name}/${image}`,
    alt: localProduct.title,
    isRemote: false,
  }))
})
const mainImage = computed(
  () =>
    galleryImages.value.find((image) => image.id === selectedImageId.value) ||
    galleryImages.value[0],
)
const displayDescription = computed(
  () => shopifyProduct.value?.description || localProduct?.description || '',
)
const displayTitle = computed(
  () => shopifyProduct.value?.title || localProduct?.title || '',
)
const displayPrice = computed(() => {
  if (selectedVariant.value?.price) {
    return formatPrice(selectedVariant.value.price)
  }

  if (localProduct?.price) {
    return formatPrice({
      amount: localProduct.price,
      currencyCode: 'AUD',
    })
  }

  return ''
})
const canBuy = computed(
  () =>
    Boolean(selectedVariant.value?.id) &&
    selectedVariant.value.availableForSale,
)
const productDetails = computed(() =>
  [
    {
      label: 'Width',
      value: formatMetafieldValue(shopifyProduct.value?.width),
    },
    {
      label: 'Height',
      value: formatMetafieldValue(shopifyProduct.value?.height),
    },
    {
      label: 'Weight',
      value: formatVariantWeight(selectedVariant.value),
    },
  ].filter((detail) => detail.value),
)
const seoTitle = computed(
  () => shopifyProduct.value?.seo?.title || displayTitle.value || 'Product',
)
const seoDescription = computed(
  () =>
    shopifyProduct.value?.seo?.description ||
    displayDescription.value ||
    'Explore this piece from hay-hay design.',
)
const seoImage = computed(
  () => shopifyProduct.value?.featuredImage?.url || mainImage.value?.src || '',
)
const structuredDataVariant = computed(
  () =>
    selectedVariant.value ||
    shopifyVariants.value.find((variant) => variant.availableForSale) ||
    shopifyVariants.value[0],
)
const productUrl = new URL(`/products/${handle}`, SITE_URL).href
const productStructuredData = computed(() =>
  buildProductStructuredData({
    product: displayProduct.value,
    variant: structuredDataVariant.value,
    images: galleryImages.value,
    url: productUrl,
  }),
)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: 'product',
  ogImage: () => seoImage.value || undefined,
  ogImageAlt: () => mainImage.value?.alt || displayTitle.value || seoTitle.value,
  robots: () =>
    displayProduct.value ? 'index, follow' : 'noindex, nofollow',
  twitterCard: () =>
    seoImage.value ? 'summary_large_image' : 'summary',
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => seoImage.value || undefined,
  twitterImageAlt: () =>
    mainImage.value?.alt || displayTitle.value || seoTitle.value,
})

useHead(() => ({
  script: productStructuredData.value
    ? [
        {
          key: 'product-structured-data',
          type: 'application/ld+json',
          innerHTML: serializeJsonLd(productStructuredData.value),
        },
      ]
    : [],
}))

onMounted(async () => {
  if (remoteProduct.value || hideUnpricedShopifyProduct.value) {
    return
  }

  setRemoteProduct(await loadShopifyProduct())
})

watchEffect(() => {
  if (selectedVariantId.value || shopifyVariants.value.length === 0) {
    return
  }

  selectedVariantId.value =
    shopifyVariants.value.find((variant) => variant.availableForSale)?.id ||
    shopifyVariants.value[0].id
})

watchEffect(() => {
  if (selectedImageId.value || galleryImages.value.length === 0) {
    return
  }

  selectedImageId.value =
    getImageForVariant(selectedVariant.value)?.id || galleryImages.value[0].id
})

watch(selectedVariantId, () => {
  purchaseError.value = ''
  const variantImage = getImageForVariant(selectedVariant.value)

  if (variantImage) {
    selectedImageId.value = variantImage.id
  }
})

function collectShopifyImages() {
  const imagesById = new Map()
  const variants = shopifyVariants.value
  const findImageVariant = (image) =>
    variants.find(
      (variant) => getVariantImageId(variant) === (image?.id || image?.url),
    ) || (variants.length === 1 ? variants[0] : null)

  const addImage = (image, variant = findImageVariant(image)) => {
    if (!image?.url) {
      return
    }

    imagesById.set(image.id || image.url, {
      id: image.id || image.url,
      src: image.url,
      alt: buildProductImageAlt({
        product: shopifyProduct.value,
        image,
        variant,
      }),
      isRemote: true,
    })
  }

  addImage(shopifyProduct.value?.featuredImage)
  shopifyProduct.value?.images?.nodes?.forEach((image) => addImage(image))
  shopifyVariants.value.forEach((variant) =>
    addImage(variant.image, variant),
  )

  return Array.from(imagesById.values())
}

async function loadShopifyProduct() {
  try {
    return await fetchProduct(handle)
  } catch {
    return null
  }
}

function setRemoteProduct(product) {
  if (product && !hasProductPrice(product)) {
    hideUnpricedShopifyProduct.value = true
    remoteProduct.value = null
    return
  }

  hideUnpricedShopifyProduct.value = false
  remoteProduct.value = product || null
}

function getVariantImageId(variant) {
  return variant?.image?.id || variant?.image?.url || ''
}

function getImageForVariant(variant) {
  if (!variant) {
    return null
  }

  const matchedImage = galleryImages.value.find((image) =>
    imageMatchesVariant(image, variant),
  )

  if (matchedImage) {
    return matchedImage
  }

  const variantImageId = getVariantImageId(variant)

  return (
    galleryImages.value.find((image) => image.id === variantImageId) || null
  )
}

function imageMatchesVariant(image, variant) {
  const variantWords = normalizeForMatch(getVariantLabel(variant))
  const imageWords = normalizeForMatch(`${image.alt || ''} ${image.src || ''}`)

  if (variantWords.length === 0 || imageWords.length === 0) {
    return false
  }

  return variantWords.every((word) => imageWords.includes(word))
}

function normalizeForMatch(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
}

function selectImage(image) {
  selectedImageId.value = image.id

  const matchingVariant = shopifyVariants.value.find(
    (variant) =>
      getImageForVariant(variant)?.id === image.id ||
      getVariantImageId(variant) === image.id,
  )

  if (matchingVariant) {
    selectedVariantId.value = matchingVariant.id
  }
}

async function buySelectedVariant() {
  if (!canBuy.value || isBuying.value) {
    return
  }

  isBuying.value = true
  purchaseError.value = ''

  try {
    const cart = await createCart(selectedVariant.value.id)

    if (!cart?.checkoutUrl) {
      throw new Error('Checkout could not be created.')
    }

    window.location.href = cart.checkoutUrl
  } catch (error) {
    purchaseError.value =
      error.message || 'Checkout could not be opened. Please try again.'
  } finally {
    isBuying.value = false
  }
}

function getVariantLabel(variant) {
  const colour = variant.selectedOptions?.find(
    (option) => option.name.toLowerCase() === 'colour',
  )
  const color = variant.selectedOptions?.find(
    (option) => option.name.toLowerCase() === 'color',
  )

  return colour?.value || color?.value || variant.title
}

function formatMetafieldValue(metafield) {
  if (!metafield?.value) {
    return ''
  }

  try {
    const parsedValue = JSON.parse(metafield.value)

    if (parsedValue?.value && parsedValue?.unit) {
      return `${parsedValue.value} ${formatMeasurementUnit(parsedValue.unit)}`
    }
  } catch {
    // Shopify single-line metafields are already ready to display.
  }

  return metafield.value
}

function formatMeasurementUnit(unit) {
  const normalizedUnit = unit.toLowerCase()
  const units = {
    centimeters: 'cm',
    centimeter: 'cm',
    centimetres: 'cm',
    centimetre: 'cm',
    millimeters: 'mm',
    millimeter: 'mm',
    millimetres: 'mm',
    millimetre: 'mm',
    meters: 'm',
    meter: 'm',
    metres: 'm',
    metre: 'm',
    inches: 'in',
    inch: 'in',
    feet: 'ft',
    foot: 'ft',
  }

  return units[normalizedUnit] || normalizedUnit
}

function formatVariantWeight(variant) {
  if (!variant?.weight) {
    return ''
  }

  const units = {
    GRAMS: 'g',
    KILOGRAMS: 'kg',
    OUNCES: 'oz',
    POUNDS: 'lb',
  }
  const formattedWeight = Number.isInteger(variant.weight)
    ? variant.weight
    : Number(variant.weight).toLocaleString('en-AU', {
        maximumFractionDigits: 2,
      })

  return `${formattedWeight} ${units[variant.weightUnit] || variant.weightUnit}`
}

function hasProductPrice(product) {
  return product?.variants?.nodes?.some(hasVariantPrice) || false
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
.product-page {
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

.product-detail {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.product-gallery {
  .main-image {
    width: 100%;
    height: 500px;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .thumbnail {
    width: 80px;
    height: 80px;
    border: 2px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    background: none;
    padding: 0;
    transition: border-color 0.3s;

    // &:hover {
    //   border-color: $secondary;
    // }

    // &.active {
    //   border-color: $primary;
    // }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

.product-info {
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-family: 'Figuratika', sans-serif;
  }

  .description {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  &__price {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .product-details {
    display: grid;
    gap: 0.75rem;
    max-width: 320px;
    margin-bottom: 2rem;

    &__item {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      border-bottom: 1px solid #ddd;
      padding-bottom: 0.75rem;
    }

    dt {
      font-weight: 700;
    }

    dd {
      margin: 0;
      text-align: right;
    }
  }

  .shopify-purchase {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;

    &__variant {
      display: grid;
      gap: 0.5rem;
      max-width: 320px;
      font-weight: 600;
    }

    select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      font: inherit;
    }

    &__status {
      color: $secondary;
      font-weight: 600;
    }

    &__button {
      width: 100%;
      max-width: 320px;
      border: 0;
      border-radius: 4px;
      background-color: $blue-100;
      color: white;
      cursor: pointer;
      font-weight: 700;
      padding: 0.9rem 1.25rem;
      transition:
        background-color 0.2s,
        opacity 0.2s;

      &:hover:not(:disabled) {
        background-color: $orange-100;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
    }

    &__error {
      color: $error;
      max-width: 320px;
    }

  }

  .back-link {
    display: inline-block;
    font-weight: 500;
  }
}

.not-found {
  text-align: center;
  padding: 4rem 2rem;

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 2rem;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s;
  }

  .btn-primary {
    color: white;

    // &:hover {
    // }
  }
}
</style>
