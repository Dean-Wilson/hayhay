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

      <section class="products-cta">
        <NuxtLink to="/products" class="btn btn-primary">View products</NuxtLink>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
usePageSeo(
  'Bold, Tactile Objects',
  'Explore bold, tactile, hand-flocked objects from hay-hay design, created for considered interiors with playful colour and sculptural form.',
)
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
  box-sizing: border-box;
  height: calc(100svh - 150px);
  min-height: 520px;
  overflow: hidden;
  padding: 16px 0;

  @media screen and (min-width: 900px) {
    height: calc(100svh - 160px);
    min-height: 620px;
    padding: 48px 0 16px;
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
    @media screen and (min-width: 1800px) {
      font-size: 15rem;
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

.products-cta {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0.75rem 0 3rem;

  @media screen and (min-width: 900px) {
    padding: 0.75rem 2rem 4rem;
  }
}
</style>
