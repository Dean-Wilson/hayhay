<template>
  <footer class="footer">
    <!-- <div class="footer-content">
      <div class="footer-section">
        <h3>About</h3>
        <p>Quality products for your needs</p>
      </div>
      <div class="footer-section">
        <h3>Links</h3>
        <ul>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Contact</a></li>
          <li><a href="#">Privacy</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Follow</h3>
        <ul>
          <li><a href="#">Twitter</a></li>
          <li><a href="#">Instagram</a></li>
          <li><a href="#">Facebook</a></li>
        </ul>
      </div>
    </div> -->
    <div class="footer-bottom">
      <p>&copy; 2025 hay-hay design. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
// Footer component
</script>

<style scoped>
.footer {
  /* background-color: #f5f5f5; */
  /* border-top: 1px solid #e0e0e0; */
  margin-top: 2rem;
  padding: 2rem 0;
}

.footer-content {
  max-width: calc(100% - 200px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.footer-section h3 {
  margin-top: 0;
  color: #333;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #333;
}

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
  color: #999;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
