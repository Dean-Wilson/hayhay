// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/fonts', '@nuxt/image'],
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    shopifyStoreDomain: process.env.SHOPIFY_STORE_DOMAIN || '',
    shopifyStorefrontPrivateToken:
      process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ||
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
      '',
    shopifyStorefrontPublicToken:
      process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN || '',
    shopifyStorefrontApiVersion:
      process.env.SHOPIFY_STOREFRONT_API_VERSION || '2026-01',
  },
  vite: {
    server: {
      hmr: {
        port: 24679,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/_variables.scss" as *;',
        },
      },
    },
  },
  fonts: {
    families: [
      { name: 'Figuratika', src: '/fonts/figuratika/figuratika.woff2' },
      { name: 'Inter', provider: 'google' },
    ],
  },
})
