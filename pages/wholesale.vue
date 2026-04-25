<template>
  <div class="wholesale-page">
    <Header />
    <main class="main-content">
      <h1>Wholesale</h1>
      <p>Wholesale page coming soon.</p>
    </main>
    <Footer />
  </div>
</template>

<script setup>
//
</script>

<style scoped lang="scss">
.wholesale-page {
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
</style>
