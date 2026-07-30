<template>
  <div class="contact-page">
    <Header />
    <main class="contact-page__content">
      <h1 class="contact-page__title">Contact</h1>
      <div class="contact-page__details">
        <div class="contact-page__item">
          <h2 class="contact-page__item-title">Email</h2>
          <p class="contact-page__item-text">
            <a
              href="mailto:enquiries@hayhaydesign.com.au"
              class="contact-page__link"
              >enquiries@hayhaydesign.com.au</a
            >
          </p>
        </div>
        <div class="contact-page__item">
          <h2 class="contact-page__item-title">Phone</h2>
          <p class="contact-page__item-text">
            <a href="tel:0417305607" class="contact-page__link">0417 305 607</a>
          </p>
        </div>
        <div class="contact-page__item">
          <h2 class="contact-page__item-title">Instagram</h2>
          <p class="contact-page__item-text">
            <a
              href="https://www.instagram.com/hay_haydesign/"
              class="contact-page__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              @hay_haydesign
            </a>
          </p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
usePageSeo(
  'Contact',
  'Contact hay-hay design for product, ordering and wholesale enquiries by email, phone or Instagram.',
)
</script>

<style scoped lang="scss">
.contact-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__title {
    font-size: 3.5rem;
    margin-bottom: 2rem;
    font-family: 'Figuratika', sans-serif;
  }

  &__content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  &__details {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    margin-top: 2rem;
  }

  &__item {
    &-title {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    &-text {
      font-size: 1.1rem;
    }
  }

  &__link {
    color: #333;
    transition: color 0.3s;

    &:hover {
      color: #666;
    }
  }
}

@media (width <= 768px) {
  .contact-page {
    &__details {
      flex-direction: column;
    }
  }
}
</style>
