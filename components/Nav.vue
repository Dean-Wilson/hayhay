<template>
  <nav class="nav">
    <ul class="nav-list">
      <li>
        <NuxtLink to="/">Home</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/products">Products</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/wholesale">Wholesale</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
// Navigation component
</script>

<style scoped>
.nav {
  display: flex;
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem;
}

.nav-list a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-list a:hover {
  color: #666;
}

.nav-list a.router-link-active {
  color: #000;
  border-bottom: 2px solid #000;
  padding-bottom: 0.25rem;
}
</style>
