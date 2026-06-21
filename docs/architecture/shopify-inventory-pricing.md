# Shopify Inventory And Pricing

## Context

HayHay uses Shopify as the product catalogue source of truth for product names, handles, variants, sale availability, product dimensions, weights, images, and RRP.

Local CSV outputs keep working wholesale and margin estimates for buyer-facing and operational documents.

## Current Design

- `docs/shopify-product-inventory.csv` is a Shopify-sourced inventory export.
- `docs/shopify-product-inventory-priced.csv` extends the Shopify export with local wholesale, cost, and margin fields.
- `docs/wholesale-price-list/` contains the buyer-facing wholesale price-list PDF and source HTML.
- `docs/stock-list/` contains the internal full Shopify stock-list PDF and source HTML.
- `scripts/update-shopify-product-inventory.mjs` refreshes both CSV inventory files from Shopify.
- `scripts/generate-wholesale-price-list.mjs` creates the shortlist wholesale PDF.
- `scripts/generate-stock-list.mjs` creates the full landscape stock-list PDF.

## Baselines

- RRP comes from Shopify variant prices.
- Wholesale price is calculated locally as `RRP * 0.5`.
- Cost is a local estimate kept in `docs/shopify-product-inventory-priced.csv`.
- Wholesale profit is `Wholesale Price - Cost`.
- Retail profit is `Retail Price - Cost`.
- Wholesale margin percentage is `(Wholesale Profit / Wholesale Price) * 100`.
- Retail margin percentage is `(Retail Profit / Retail Price) * 100`.
- Margin fields stay blank when no local cost estimate is available.

## Shortlist Rules

The wholesale buyer-facing PDF intentionally uses a shortlist rather than every Shopify product.

Current exclusions:

- Products with `lamp` in the name.
- `Petal`, because available stock is too limited.
- `Spool`, until it is ready for wholesale.

The full stock-list PDF includes everything returned by Shopify, including products excluded from the wholesale PDF.

## Key Paths

- `docs/shopify-product-inventory.csv`
- `docs/shopify-product-inventory-priced.csv`
- `docs/wholesale-price-list/hay-hay-wholesale-vase-price-list.pdf`
- `docs/stock-list/hay-hay-shopify-stock-list.pdf`
- `scripts/update-shopify-product-inventory.mjs`
- `scripts/generate-wholesale-price-list.mjs`
- `scripts/generate-stock-list.mjs`
- `composables/useShopifyStorefront.js`

## Operational Notes

Refresh inventory and local price/margin calculations:

```bash
npm run inventory:update
```

Regenerate the wholesale buyer PDF:

```bash
npm run inventory:wholesale-list
```

Regenerate the internal landscape stock-list PDF:

```bash
npm run inventory:stock-list
```

Print the generated HTML to PDF with headless Chrome when a PDF needs to be refreshed after the HTML output changes.

## Constraints

- Shopify Storefront API credentials must be present in `.env`.
- Shopify is expected to hold current RRP and product detail fields before final documents are generated.
- Local costs are estimates and should be reviewed before relying on margin outputs.
- Products with Shopify RRP of `0` should be treated as incomplete or draft pricing until confirmed.

## Follow-ups

- Add any missing Shopify weights, dimensions, prices, and images flagged by the stock-list output.
- Consider moving PDF printing into the Node scripts so one command refreshes both HTML and PDF.
