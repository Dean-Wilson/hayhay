const PRODUCT_QUERY = `#graphql
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
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
      images(first: 20) {
        nodes {
          id
          url
          altText
          width
          height
        }
      }
      variants(first: 20) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
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
      product: null,
    }
  }

  const handle = getRouterParam(event, 'handle')
  const data = await shopifyFetch(event, PRODUCT_QUERY, { handle })

  return {
    enabled: true,
    product: data.productByHandle,
  }
})
