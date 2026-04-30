// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  modules: ['@nuxt/fonts'],
  css: ['~/assets/scss/main.scss'],
  runtimeConfig: {
    public: {
      shopifyStoreDomain: process.env.NUXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '',
      shopifyStorefrontPublicToken:
        process.env.NUXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN || '',
      shopifyStorefrontApiVersion:
        process.env.NUXT_PUBLIC_SHOPIFY_STOREFRONT_API_VERSION || '2026-01',
    },
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
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/products',
        '/products/anchor',
        '/products/dot',
        '/products/halo',
        '/products/petal',
        '/products/puff',
        '/products/stem',
        '/products/totem',
        '/wholesale',
        '/contact',
      ],
    },
  },
})
