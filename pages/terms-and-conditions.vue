<template>
  <div class="terms-page">
    <Header />
    <main class="main-content">
      <h1>Terms And Conditions</h1>

      <section class="terms-section">
        <h2>Orders</h2>
        <p>
          Orders are subject to product availability and confirmation at the
          time of purchase.
        </p>
      </section>

      <section class="terms-section">
        <h2>Product Details</h2>
        <p>
          Product colours and finishes may vary slightly between photographs,
          screens, and handmade production batches.
        </p>
      </section>

      <section class="terms-section">
        <h2>Care Instructions</h2>
        <ul>
          <li>Gently remove dust with a lint roller or tape.</li>
          <li>Handle with dry hands.</li>
          <li>Indoor use only.</li>
          <li>Keep completely dry. Moisture will damage the flocked surface.</li>
          <li>Not suitable for fresh flowers.</li>
        </ul>
      </section>

      <section class="terms-section">
        <h2>Shipping</h2>
        <p>
          Shipping details, costs, and delivery timeframes will be confirmed
          during checkout or order correspondence.
        </p>
      </section>

      <section class="terms-section">
        <h2>Returns</h2>
        <p>
          Please contact us if there is an issue with your order so we can
          review the best next step.
        </p>
      </section>

      <section class="terms-section">
        <h2>Wholesale</h2>
        <p>
          Wholesale orders may be subject to separate lead times, minimum order
          quantities, and payment terms.
        </p>
      </section>

      <section class="terms-section">
        <h2>Finish</h2>
        <p>
          Thank you for choosing hay-hay design. Each piece is individually
          hand-flocked. Slight variations are part of the finish.
        </p>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
usePageSeo(
  'Terms & Conditions',
  'Read hay-hay design’s terms and conditions covering orders, product details, care instructions, shipping, returns and wholesale purchases.',
)
</script>

<style scoped lang="scss">
.terms-page {
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

h1 {
  font-size: 3.5rem;
  margin-bottom: 2rem;
  font-family: 'Figuratika', sans-serif;
}

.terms-section {
  max-width: 760px;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  p {
    font-size: 1.05rem;
    line-height: 1.7;
    margin: 0;
  }

  ul {
    display: grid;
    gap: 0.5rem;
    list-style: disc;
    padding-left: 1.25rem;
  }

  li {
    font-size: 1.05rem;
    line-height: 1.6;
  }
}
</style>
