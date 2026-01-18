<template>
  <div class="product-page">
    <Header />
    <main class="main-content">
      <div v-if="product" class="product-detail">
        <div class="product-gallery">
          <div class="main-image">
            <NuxtImg
              :src="`/images/products/${product.name}/${selectedImage}`"
              :alt="product.title"
              format="webp"
              quality="85"
            />
          </div>
          <div class="thumbnail-list">
            <button
              v-for="image in images"
              :key="image"
              @click="selectedImage = image"
              :class="['thumbnail', { active: selectedImage === image }]"
            >
              <NuxtImg
                :src="`/images/products/${product.name}/${image}`"
                :alt="product.title"
                format="webp"
                quality="80"
              />
            </button>
          </div>
        </div>

        <div class="product-info">
          <h1>{{ product.title }}</h1>
          <p class="description">{{ product.description }}</p>
          <!-- <p class="price">${{ product.price }}</p> -->

          <!-- <div class="shopify-button">
            <div id="product-component"></div>
          </div> -->

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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getProduct, getProductImages } from '~/data/products'

const route = useRoute()
const product = getProduct(route.params.name)
const images = computed(() =>
  product
    ? getProductImages(product.name, product.color, product.imageCount)
    : [],
)
const selectedImage = ref(images.value[0] || '')
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
  grid-template-columns: 1fr 1fr;
  gap: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.product-gallery {
  .main-image {
    width: 100%;
    height: 500px;
    background-color: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .thumbnail-list {
    display: flex;
    gap: 1rem;
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
      object-fit: cover;
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

  .price {
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 2rem;
  }

  .shopify-button {
    margin-bottom: 2rem;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;

    &::before {
      content: 'Shopify Buy Button Placeholder';
      display: block;
      font-style: italic;
    }
  }

  .back-link {
    display: inline-block;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
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
