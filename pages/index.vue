<template>
  <div class="home">
    <Header />
    <main class="main-content">
      <section class="hero">
        <div class="hero__about">
          <h1 class="hero__content">hay-hay design</h1>
        </div>
        <div class="hero__products">
          <div class="hero__product">
            <img
              src="/images/products/puff/puff-cobalt-1.png"
              alt="Puff Cobalt Vase"
              class="hero__product-image"
            />
          </div>
        </div>
      </section>

      <section class="featured">
        <!-- <h2>Featured Products</h2> -->
        <div class="products-grid">
          <div
            v-for="product in featuredProducts"
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
                <img
                  v-else-if="product.image"
                  :src="product.image.src"
                  :alt="product.image.alt"
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
        <NuxtLink to="/products" class="btn btn-primary">See all</NuxtLink>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { products as localProducts, getProductImages } from '~/data/products'

const { products: shopifyProducts, fetchProducts } = useShopifyStorefront()

onMounted(() => {
  fetchProducts()
})

const featuredProducts = computed(() => {
  if (shopifyProducts.value.length > 0) {
    return shopifyProducts.value.slice(0, 3).map((product) => {
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

  return localProducts
    .filter((product) => product.featured)
    .map((product) => ({
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
.home {
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  margin: 0 auto;
  max-width: calc(100% - 40px);
  @media screen and (min-width: 782px) {
    max-width: calc(100% - 200px);
  }
}

.hero {
  text-align: center;
  display: grid;
  height: calc(100vh - 100px);
  min-height: 900px;
  overflow: hidden;
  padding: 20px 0;
  @media screen and (min-width: 900px) {
    padding: 100px 0;
    grid-template-columns: 1fr 1fr;
  }

  &__about {
    background-color: $blue-100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    overflow: hidden;
  }

  &__content {
    padding: 2rem;
    font-family: 'Figuratika', sans-serif;
    font-size: 5rem;
    color: $yellow-highlight;
    line-height: 1.1;
    word-break: break-word;
    @media screen and (min-width: 782px) {
      font-size: 7rem;
    }
    @media screen and (min-width: 1200px) {
      font-size: 10rem;
    }
  }

  &__products {
    height: 100%;
    max-height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__product {
    height: 100%;
    width: 100%;
    background-color: $yellow-highlight;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
  background-color: $blue-100;
  color: white;
}

.btn-primary:hover {
  background-color: $orange-100;
}

.featured {
  margin-top: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  @media screen and (min-width: 900px) {
    padding: 2rem;
  }
  h2 {
    font-size: 1.75rem;
    margin-bottom: 2rem;
    color: #333;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
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
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: auto;
    display: block;
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
