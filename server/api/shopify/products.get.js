const PRODUCTS_QUERY = `#graphql
  query Products {
    products(first: 50) {
      nodes {
        id
        handle
        title
        description
        availableForSale
        featuredImage {
          id
          url
          altText
          width
          height
        }
        images(first: 1) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        variants(first: 1) {
          nodes {
            id
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  if (
    !config.shopifyStoreDomain ||
    (!config.shopifyStorefrontPrivateToken &&
      !config.shopifyStorefrontPublicToken)
  ) {
    return {
      enabled: false,
      products: [],
    }
  }

  const data = await shopifyFetch(event, PRODUCTS_QUERY)

  return {
    enabled: true,
    products: data.products?.nodes || [],
  }
})
