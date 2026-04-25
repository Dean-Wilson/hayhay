const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.variantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'variantId is required',
    })
  }

  const data = await shopifyFetch(event, CART_CREATE_MUTATION, {
    input: {
      lines: [
        {
          merchandiseId: body.variantId,
          quantity: body.quantity || 1,
        },
      ],
    },
  })

  const errors = data.cartCreate?.userErrors || []

  if (errors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: errors.map((error) => error.message).join(', '),
    })
  }

  return {
    checkoutUrl: data.cartCreate?.cart?.checkoutUrl,
  }
})

