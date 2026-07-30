const SITE_NAME = 'hay-hay design'

export function usePageSeo(title, description) {
  const socialTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME

  useSeoMeta({
    title,
    description,
    ogTitle: socialTitle,
    ogDescription: description,
    twitterTitle: socialTitle,
    twitterDescription: description,
  })
}
