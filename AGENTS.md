# AGENTS.md

## Project Overview

This is a basic Nuxt 3 website with:

- Home page
- Product page with Shopify buy button integration
- About page with wholesale enquiry section
- Terms and conditions page linked from About only
- Contact page

## Tech Stack

- Nuxt 3
- Vue 3
- Shopify Buy Button
- SCSS

## Git And Deployment

- Project override: committing and deploying directly from `main` is allowed for this project when the user asks for a production deploy.
- Use `npm run deploy` for production deploys.

## Project Structure

- `/pages/index.vue` - Home page
- `/pages/products/index.vue` - Products listing page
- `/pages/products/[name].vue` - Product detail page with Shopify integration
- `/pages/about.vue` - About page with wholesale enquiry section
- `/pages/terms-and-conditions.vue` - Terms and conditions page, not included in the primary nav
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

### TODO

- handle shipping
  - You can connect an Australia Post MyPost Business account to Shopify to purchase shipping labels directly from your admin when you fulfill orders.
- Product fields [/]
  - product description
  - care instructions
  - delivery
- Store name
