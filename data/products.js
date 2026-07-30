export const products = [
  {
    name: 'anchor',
    color: 'cobalt',
    title: 'Anchor',
    description: 'Modern anchor chair with premium comfort and elegant design.',
    price: 599,
    imageCount: 1,
    featured: true,
  },
  {
    name: 'orb',
    color: 'cobalt',
    title: 'Orb',
    description: 'Contemporary orb piece with bold statement design.',
    price: 349,
    imageCount: 4,
    featured: true,
  },
  {
    name: 'halo',
    color: 'cobalt',
    title: 'Halo',
    description: 'Elegant halo design that brings light and style together.',
    price: 499,
    imageCount: 2,
    featured: true,
  },
  {
    name: 'petal',
    color: 'paleblue',
    title: 'Petal',
    description: 'Soft and organic petal-inspired design.',
    price: 449,
    imageCount: 3,
    featured: false,
  },
  {
    name: 'puff',
    color: 'cobalt',
    title: 'Puff',
    shopifyHandle: 'puff',
    description:
      'A comfortable and stylish puff ottoman perfect for any living space.',
    price: 299,
    imageCount: 1,
    featured: false,
  },
  {
    name: 'bolt',
    color: 'cobalt',
    title: 'Bolt',
    description: 'Nature-inspired bolt design with clean lines.',
    price: 399,
    imageCount: 4,
    featured: false,
  },
  {
    name: 'totem',
    color: 'cobalt',
    title: 'Totem',
    description: 'Sculptural totem piece that makes a bold statement.',
    price: 699,
    imageCount: 2,
    featured: false,
  },
]

export function getProduct(name) {
  return products.find((p) => p.name === name)
}

export function getProductImages(name, color, count) {
  const images = []
  for (let i = 1; i <= count; i++) {
    images.push(`${name}-${color}-${i}.jpg`)
  }
  return images
}
