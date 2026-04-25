# AGENTS.md

## Project Overview

This is a basic Nuxt 3 website with:
- Home page
- Product page with Shopify buy button integration
- Wholesale page
- Contact page

## Tech Stack
- Nuxt 3
- Vue 3
- Shopify Buy Button
- SCSS

## Project Structure
- `/pages/index.vue` - Home page
- `/pages/products/index.vue` - Products listing page
- `/pages/products/[name].vue` - Product detail page with Shopify integration
- `/pages/wholesale.vue` - Wholesale page
- `/pages/contact.vue` - Contact page

## Naming Conventions

### CSS/SCSS Classes - BEM (Block Element Modifier)
Use BEM naming convention for all classes:
- **Block**: `.block-name` (e.g., `.product-page`, `.contact-page`)
- **Element**: `.block-name__element` (e.g., `.product-page__title`, `.contact-page__details`)
- **Modifier**: `.block-name--modifier` (e.g., `.product-page--featured`)

For nested SCSS, use the `&` ampersand to create nested selectors:
```scss
.component-name {
  display: flex;

  &__element {
    font-size: 1rem;
  }

  &__item {
    margin: 1rem 0;

    &-title {
      font-weight: bold;
    }

    &-text {
      color: #666;
    }
  }

  &--modifier {
    background: #f0f0f0;
  }
}
```

### Vue Components
- Use PascalCase for component names (e.g., `Header.vue`, `Footer.vue`, `Nav.vue`)
- Use camelCase for component props and data properties
