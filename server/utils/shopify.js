export async function shopifyFetch(event, query, variables = {}) {
  const config = useRuntimeConfig(event)
  const storeDomain = config.shopifyStoreDomain
  const privateToken = config.shopifyStorefrontPrivateToken
  const publicToken = config.shopifyStorefrontPublicToken
  const apiVersion = config.shopifyStorefrontApiVersion || '2026-01'

  if (!storeDomain || (!privateToken && !publicToken)) {
    throw createError({
      statusCode: 501,
      statusMessage:
        'Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_PRIVATE_TOKEN.',
    })
  }

  const headers = {
    'Content-Type': 'application/json',
  }

  if (privateToken) {
    headers['Shopify-Storefront-Private-Token'] = privateToken

    const buyerIp = getRequestIP(event, { xForwardedFor: true })
    if (buyerIp) {
      headers['Shopify-Storefront-Buyer-IP'] = buyerIp
    }
  } else {
    headers['X-Shopify-Storefront-Access-Token'] = publicToken
  }

  const response = await $fetch(
    `https://${storeDomain}/api/${apiVersion}/graphql.json`,
    {
      method: 'POST',
      headers,
      body: {
        query,
        variables,
      },
    },
  )

  if (response.errors?.length) {
    throw createError({
      statusCode: 502,
      statusMessage: response.errors.map((error) => error.message).join(', '),
    })
  }

  return response.data
}
