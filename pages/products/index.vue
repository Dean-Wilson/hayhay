<template>
  <div class="products-page">
    <Header />
    <main class="main-content">
      <h1>Our Products</h1>
      <div class="products-grid">
        <div
          v-for="product in displayProducts"
          :key="product.handle"
          class="product-card"
        >
          <NuxtLink :to="`/products/${product.handle}`" class="product-link">
            <div class="product-image">
              <img
                v-if="product.image?.isRemote"
                :src="product.image.src"
                :alt="product.image.alt"
              />
              <NuxtImg
                v-else-if="product.image"
                :src="product.image.src"
                :alt="product.image.alt"
                format="webp"
                quality="80"
              />
            </div>
            <div class="product-info">
              <h2>{{ product.title }}</h2>
              <!-- <p>{{ product.description }}</p> -->
              <!-- <span class="price">${{ product.price }}</span> -->
            </div>
          </NuxtLink>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { products as localProducts, getProductImages } from '~/data/products'

const { data: shopifyResponse } = await useFetch('/api/shopify/products')

const displayProducts = computed(() => {
  const shopifyProducts = shopifyResponse.value?.products || []

  if (shopifyProducts.length > 0) {
    return shopifyProducts.map((product) => {
      const image = product.featuredImage || product.images?.nodes?.[0]

      return {
        handle: product.handle,
        title: product.title,
        description: product.description,
        image: image
          ? {
              src: image.url,
              alt: image.altText || product.title,
              isRemote: true,
            }
          : null,
      }
    })
  }

  return localProducts.map((product) => ({
    handle: product.name,
    title: product.title,
    description: product.description,
    image: {
      src: `/images/products/${product.name}/${
        getProductImages(product.name, product.color, 1)[0]
      }`,
      alt: product.title,
      isRemote: false,
    },
  }))
})
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

.product-card {
  border-radius: 8px;
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  height: 460px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.product-info {
  padding: 1.5rem;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .price {
    font-size: 1.25rem;
    font-weight: 600;
  }
}
</style>
