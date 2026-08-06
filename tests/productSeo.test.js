import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildProductImageAlt,
  buildProductStructuredData,
  serializeJsonLd,
} from '../utils/productSeo.js'

const puff = {
  id: 'gid://shopify/Product/1',
  title: 'Puff',
  description: 'A hand-flocked sculptural vase.',
  productType: '',
  vendor: 'hay-hay design',
  category: { name: 'Vases' },
}

const cobaltVariant = {
  id: 'gid://shopify/ProductVariant/1',
  title: 'Cobalt Blue',
  sku: 'PUFF-COBALT',
  availableForSale: true,
  selectedOptions: [{ name: 'Colour', value: 'Cobalt Blue' }],
  price: { amount: '299.00', currencyCode: 'AUD' },
}

test('builds image alt text from Shopify colour, title, and category', () => {
  assert.equal(
    buildProductImageAlt({
      product: puff,
      image: { altText: null },
      variant: cobaltVariant,
    }),
    'Cobalt Blue Puff vase',
  )
})

test('expands a generic merchant alt but preserves a descriptive one', () => {
  assert.equal(
    buildProductImageAlt({
      product: puff,
      image: { altText: 'Puff' },
      variant: cobaltVariant,
    }),
    'Cobalt Blue Puff vase',
  )

  assert.equal(
    buildProductImageAlt({
      product: puff,
      image: { altText: 'Cobalt Puff vase styled against white tiles' },
      variant: cobaltVariant,
    }),
    'Cobalt Puff vase styled against white tiles',
  )
})

test('does not repeat a category already present in the product title', () => {
  assert.equal(
    buildProductImageAlt({
      product: {
        title: 'Pillar Table Lamp',
        category: { name: 'Table Lamps' },
      },
      image: {},
      variant: { selectedOptions: [] },
    }),
    'Pillar Table Lamp',
  )
})

test('builds Google Product and Offer structured data', () => {
  assert.deepEqual(
    buildProductStructuredData({
      product: puff,
      variant: cobaltVariant,
      images: [
        { src: 'https://cdn.shopify.com/puff.jpg' },
        { src: '/images/products/puff-detail.jpg' },
      ],
      url: 'https://hayhaydesign.com.au/products/puff',
    }),
    {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      '@id': 'https://hayhaydesign.com.au/products/puff#product',
      name: 'Puff',
      image: [
        'https://cdn.shopify.com/puff.jpg',
        'https://hayhaydesign.com.au/images/products/puff-detail.jpg',
      ],
      description: 'A hand-flocked sculptural vase.',
      category: 'Vases',
      color: 'Cobalt Blue',
      sku: 'PUFF-COBALT',
      brand: { '@type': 'Brand', name: 'hay-hay design' },
      offers: {
        '@type': 'Offer',
        url: 'https://hayhaydesign.com.au/products/puff',
        price: 299,
        priceCurrency: 'AUD',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'hay-hay design' },
      },
    },
  )
})

test('escapes markup-significant characters when serializing JSON-LD', () => {
  assert.equal(
    serializeJsonLd({ name: '</script>' }),
    '{"name":"\\u003c/script>"}',
  )
})
