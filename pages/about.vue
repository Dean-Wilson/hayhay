<template>
  <div class="about-page">
    <Header />
    <main class="about-page__main">
      <h1 class="about-page__title">About</h1>

      <div class="about-page__layout">
        <div class="about-page__content">
          <section class="about-page__section">
            <p>
              hay-hay design creates bold, tactile pieces for considered
              interiors, with colour, shape, and material at the centre of each
              design.
            </p>
          </section>

          <section class="about-page__section">
            <h2>Wholesale</h2>
            <p>
              For wholesale enquiries, please
              <NuxtLink to="/contact">contact us</NuxtLink>
              to discuss current pieces, availability, and ordering options.
            </p>
          </section>

          <section class="about-page__section">
            <h2>Terms And Conditions</h2>
            <p>
              Please read our
              <NuxtLink to="/terms-and-conditions">
                terms and conditions
              </NuxtLink>
              before placing an order.
            </p>
          </section>
        </div>

        <ImageSlider
          class="about-page__gallery"
          :images="aboutImages"
          label="hay-hay design pieces in considered interiors"
        />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
const aboutImages = [
  {
    src: '/images/about/about-gallery-02.jpg',
    alt: 'Cobalt, teal green, and deep plum Puff vases displayed together.',
    width: 1080,
    height: 696,
  },
  {
    src: '/images/about/about-gallery-03.jpg',
    alt: 'Pale blue Petal vase styled beside a bathroom basin.',
    width: 1831,
    height: 1683,
    objectPosition: 'center bottom',
  },
  {
    src: '/images/about/about-gallery-04.jpg',
    alt: 'Cobalt Puff vase with sculptural branches against oak cabinetry.',
    width: 1809,
    height: 1731,
    objectPosition: 'center bottom',
  },
]

usePageSeo(
  'About & Wholesale',
  'Discover hay-hay design’s approach to bold, tactile objects for considered interiors, and enquire about wholesale availability and ordering.',
)
</script>

<style scoped lang="scss">
.about-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__main {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    padding: 2rem 1rem;
    margin: 0 auto;
  }

  &__title {
    margin-bottom: 2rem;
    font-family: 'Figuratika', sans-serif;
    font-size: 3.5rem;
  }

  &__layout {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(2rem, 5vw, 5rem);
    align-items: start;
  }

  &__section {
    margin-bottom: 2.5rem;

    h2 {
      margin-bottom: 0.75rem;
      font-size: 1.5rem;
    }

    p {
      margin: 0;
      font-size: 1.1rem;
      line-height: 1.7;
    }

    a {
      color: inherit;
      font-weight: 700;
    }
  }

  &__gallery {
    min-width: 0;
  }
}

@media (width <= 768px) {
  .about-page {
    &__layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }
}
</style>
