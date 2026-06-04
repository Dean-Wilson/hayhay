const PRODUCTS_CACHE_KEY = 'hayhay:shopify-products:v2'
const PRODUCTS_CACHE_TTL = 1000 * 60 * 15

const PRODUCTS_QUERY = `#graphql
  query Products {
    products(first: 50) {
      nodes {
        id
        handle
        title
        description
        availableForSale
        width: metafield(namespace: "custom", key: "width") {
          value
          type
        }
        height: metafield(namespace: "custom", key: "height") {
          value
          type
        }
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
            weight
            weightUnit
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

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      availableForSale
      width: metafield(namespace: "custom", key: "width") {
        value
        type
      }
      height: metafield(namespace: "custom", key: "height") {
        value
        type
      }
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
          weight
          weightUnit
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
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

export function useShopifyStorefront() {
  const products = useState('shopify-products', () => [])
  const isEnabled = useState('shopify-enabled', () => false)
  const isLoading = useState('shopify-loading', () => false)
  const error = useState('shopify-error', () => '')
  const config = useRuntimeConfig()

  const storeDomain = config.public.shopifyStoreDomain
  const publicToken = config.public.shopifyStorefrontPublicToken
  const apiVersion = config.public.shopifyStorefrontApiVersion || '2026-01'

  isEnabled.value = Boolean(storeDomain && publicToken)

  async function storefrontFetch(query, variables = {}) {
    if (!isEnabled.value) {
      throw new Error('Shopify Storefront API is not configured.')
    }

    const response = await $fetch(
      `https://${storeDomain}/api/${apiVersion}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': publicToken,
        },
        body: {
          query,
          variables,
        },
      },
    )

    if (response.errors?.length) {
      throw new Error(response.errors.map((item) => item.message).join(', '))
    }

    return response.data
  }

  function readCachedProducts() {
    if (!import.meta.client) {
      return []
    }

    try {
      const cached = JSON.parse(localStorage.getItem(PRODUCTS_CACHE_KEY) || '')

      if (Date.now() - cached.createdAt < PRODUCTS_CACHE_TTL) {
        return cached.products || []
      }
    } catch {
      localStorage.removeItem(PRODUCTS_CACHE_KEY)
    }

    return []
  }

  function writeCachedProducts(nextProducts) {
    if (!import.meta.client) {
      return
    }

    localStorage.setItem(
      PRODUCTS_CACHE_KEY,
      JSON.stringify({
        createdAt: Date.now(),
        products: nextProducts,
      }),
    )
  }

  async function fetchProducts({ force = false } = {}) {
    if (!isEnabled.value) {
      return []
    }

    if (!force) {
      const cachedProducts = readCachedProducts()

      if (cachedProducts.length > 0) {
        products.value = cachedProducts
        return cachedProducts
      }
    }

    isLoading.value = true
    error.value = ''

    try {
      const data = await storefrontFetch(PRODUCTS_QUERY)
      const nextProducts = data.products?.nodes || []

      products.value = nextProducts
      writeCachedProducts(nextProducts)

      return nextProducts
    } catch (fetchError) {
      error.value = fetchError.message || 'Shopify products could not load.'
      return products.value
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProduct(handle) {
    if (!isEnabled.value) {
      return null
    }

    const existingProduct = products.value.find(
      (product) => product.handle === handle,
    )

    if (existingProduct && hasProductDetails(existingProduct)) {
      return existingProduct
    }

    const data = await storefrontFetch(PRODUCT_QUERY, { handle })
    return data.product || null
  }

  function hasProductDetails(product) {
    return (
      'width' in product &&
      'height' in product &&
      Boolean(product.variants?.nodes?.every((variant) => 'weight' in variant))
    )
  }

  async function createCart(variantId, quantity = 1) {
    const data = await storefrontFetch(CART_CREATE_MUTATION, {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity,
          },
        ],
      },
    })
    const userErrors = data.cartCreate?.userErrors || []

    if (userErrors.length > 0) {
      throw new Error(userErrors.map((item) => item.message).join(', '))
    }

    return data.cartCreate?.cart
  }

  return {
    products,
    isEnabled,
    isLoading,
    error,
    fetchProducts,
    fetchProduct,
    createCart,
  }
}
