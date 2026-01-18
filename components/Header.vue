<template>
  <header class="header">
    <div class="header-content">
      <Nav />
    </div>
  </header>
</template>

<script setup>
// Header component
</script>

<style scoped>
.header {
  /* background-color: #f5f5f5; */
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 0;
}

.header-content {
  max-width: calc(100% - 200px);
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 1rem;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}
</style>
