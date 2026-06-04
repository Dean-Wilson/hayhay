<template>
  <div class="about-page">
    <Header />
    <main class="main-content">
      <h1>About</h1>

      <section class="about-section">
        <p>
          hay-hay design creates bold, tactile pieces for considered interiors,
          with colour, shape, and material at the centre of each design.
        </p>
      </section>

      <section class="about-section">
        <h2>Wholesale</h2>
        <p>
          For wholesale enquiries, please
          <NuxtLink to="/contact">contact us</NuxtLink>
          to discuss current pieces, availability, and ordering options.
        </p>
      </section>

      <section class="about-section">
        <h2>Terms And Conditions</h2>
        <p>
          Please read our
          <NuxtLink to="/terms-and-conditions">terms and conditions</NuxtLink>
          before placing an order.
        </p>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
//
</script>

<style scoped lang="scss">
.about-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 2rem;
  font-family: 'Figuratika', sans-serif;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.about-section {
  max-width: 720px;
  margin-bottom: 2.5rem;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.7;
    margin: 0;
  }

  a {
    color: inherit;
    font-weight: 700;
  }
}
</style>
