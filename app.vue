<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
const siteUrl = 'https://hayhaydesign.com.au'
const defaultSocialImage = `${siteUrl}/images/branding/hay-hay-design-logo-bright-stacked.jpg`
const defaultDescription =
  'hay-hay design creates bold, tactile, hand-flocked objects for considered interiors, with playful colour, sculptural form and unexpected texture.'
const route = useRoute()
const canonicalUrl = computed(() => new URL(route.path, siteUrl).href)

useHead({
  titleTemplate: (title) =>
    title ? `${title} | hay-hay design` : 'hay-hay design',
  htmlAttrs: {
    lang: 'en-AU',
  },
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
})

useSeoMeta({
  description: defaultDescription,
  ogTitle: 'hay-hay design',
  ogDescription: defaultDescription,
  ogImage: defaultSocialImage,
  ogImageAlt: 'hay-hay design',
  ogSiteName: 'hay-hay design',
  ogType: 'website',
  ogLocale: 'en_AU',
  ogUrl: canonicalUrl,
  robots: 'index, follow',
  twitterCard: 'summary_large_image',
  twitterTitle: 'hay-hay design',
  twitterDescription: defaultDescription,
  twitterImage: defaultSocialImage,
  twitterImageAlt: 'hay-hay design',
})
</script>
