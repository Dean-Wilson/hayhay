# Shopify Inventory And Pricing

## Context

HayHay uses Shopify as the product catalogue source of truth for product names, handles, variants, sale availability, product dimensions, weights, images, and RRP. Retail prices must be changed in Shopify and then pulled into the repo; the CSV does not override them.

Local CSV outputs keep working wholesale and margin estimates for buyer-facing and operational documents.

## Current Design

- `docs/shopify-product-inventory.csv` is a Shopify-sourced inventory export.
- `docs/shopify-product-inventory-priced.csv` extends the Shopify export with local wholesale-pricing status, wholesale estimates, packed costs, and margins.
- `docs/wholesale-price-list/` contains the buyer-facing wholesale price-list PDF and source HTML.
- `docs/stock-list/` contains the internal full Shopify stock-list PDF and source HTML.
- `scripts/update-shopify-product-inventory.mjs` refreshes both CSV inventory files from Shopify.
- `scripts/generate-wholesale-price-list.mjs` creates the shortlist wholesale PDF.
- `scripts/generate-stock-list.mjs` creates the full landscape stock-list PDF.

## Baselines

- RRP comes from Shopify variant prices.
- Historical vase wholesale estimates are calculated locally as `RRP * 0.5` only for rows marked `50% RRP estimate`; these figures do not indicate that wholesale sales are currently active.
- Lamp rows are marked `Not set`, so their wholesale price and wholesale margin remain blank until a future wholesale model is agreed.
- Cost is a local packed-unit estimate kept in `docs/shopify-product-inventory-priced.csv`; it includes production labour and the current `$3.50` packaging-material allowance, but not outbound postage.
- Wholesale profit is `Wholesale Price - Cost`.
- Retail profit is `Retail Price - Cost`.
- Wholesale margin percentage is `(Wholesale Profit / Wholesale Price) * 100`.
- Retail margin percentage is `(Retail Profit / Retail Price) * 100`.
- Margin fields stay blank when no local cost estimate is available.

## Recovered Vase Cost Basis

The local vase costs were reconstructed from the original costing notes on 30 August 2026. They include materials and production labour rather than representing the vase blank alone.

Standard vase cost:

- Vase blank: approximately `$5.00`.
- Flock and glue: approximately `$5.00`.
- Primer and other consumables: approximately `$2.00`.
- Labour: `20 minutes at $100/hour = $33.33`.
- Estimated total: `$5.00 + $5.00 + $2.00 + $33.33 = $45.33`.

Puff uses the same assumptions except for a more expensive vase blank:

- Puff blank: approximately `$9.00`.
- Flock and glue: approximately `$5.00`.
- Primer and other consumables: approximately `$2.00`.
- Labour: `20 minutes at $100/hour = $33.33`.
- Estimated total: `$9.00 + $5.00 + $2.00 + $33.33 = $49.33`.

## Working Lamp Cost Basis

The lamp estimates use the recovered vase material categories as a starting point, but the material quantities and production time still need to be measured for each lamp.

Current inputs:

- Frill complete lamp, including cord and electrical components: `$54.00`.
- Halo complete lamp, including cord and electrical components: `$54.00`.
- Pillar complete lamp, including cord and electrical components: `$28.00`.
- Flock and glue allowance: `$7.50` per lamp, calculated as `1.5 * $5.00` because the lamps use more material than the vases.
- Primer and other consumables allowance: `$2.00` per lamp, provisionally carried over from the vase costing.
- Working labour rate: `$100/hour`, matching the vase costing.
- Current production time estimate: `45 minutes` per lamp.
- Labour cost per lamp: `0.75 hours * $100/hour = $75.00`.

Provisional unit costs at 45 minutes of labour:

- Frill: `$54.00 + $7.50 + $2.00 + $75.00 = $138.50`.
- Halo: `$54.00 + $7.50 + $2.00 + $75.00 = $138.50`.
- Pillar: `$28.00 + $7.50 + $2.00 + $75.00 = $112.50`.

Use this formula when testing reduced production times:

```text
Lamp cost = complete lamp cost + flock/glue + consumables + (labour hours * labour rate)
```

These production-cost inputs are the locked working basis for the current retail prices. They are still estimates rather than fully landed costs: confirm actual flock usage, consumables, labour time, inbound freight, electrical testing, wastage and any compliance allocation as better data becomes available.

## Packaging And Outbound Shipping

MyPost Business uses the greater of actual parcel weight and cubic weight. Use `length * width * height / 4,000` for the working cubic-weight estimate, with dimensions in centimetres.

Extra Large box:

- Dimensions: `51 cm * 36 cm * 40 cm`.
- Empty box weight: `600 g`.
- Box cost: approximately `$2.00` per unit.
- Cubic weight: `51 * 36 * 40 / 4,000 = 18.36 kg`, rounded to `18.4 kg`.
- Working charged weight: `18.4 kg`, because cubic weight dominates.
- Rough MyPost Business metro rate: `$30-$45`, depending on destination zone.
- Frill, Halo and Pillar all require this box.

Medium box:

- Dimensions: `16 cm * 19.5 cm * 30 cm`.
- Empty box weight: `200 g`.
- Box cost: approximately `$2.00` per unit.
- Cubic weight: `16 * 19.5 * 30 / 4,000 = 2.34 kg`, rounded to `2.3 kg`.
- Working charged weight: `2.3 kg`, provided the packed actual weight remains lower.
- Rough MyPost Business metro rate: `$10-$14`, depending on destination zone.

Shared packing materials:

- Protective inserts and packing material: approximately `$1.00` per unit.
- Product sticker for each vase or lamp: approximately `$0.50` per unit.
- Total packaging-material allowance: `$2.00 + $1.00 + $0.50 = $3.50` per unit.

Packaging materials are required for every sale and are included in the current priced CSV cost and unit-margin calculations:

- Standard vase packed cost: `$45.33 + $3.50 = $48.83`.
- Puff packed cost: `$49.33 + $3.50 = $52.83`.
- Frill packed cost before postage: `$138.50 + $3.50 = $142.00`.
- Halo packed cost before postage: `$138.50 + $3.50 = $142.00`.
- Pillar packed cost before postage: `$112.50 + $3.50 = $116.00`.

Current sales are retail-only. If HayHay absorbs website delivery, use:

```text
Postage-adjusted contribution = selling price - production cost - packaging materials - outbound postage
```

At the current `$30-$45` Extra Large postage estimate, packed lamp variable costs become:

- Frill: `$142.00 + $30-$45 = $172.00-$187.00`.
- Halo: `$142.00 + $30-$45 = $172.00-$187.00`.
- Pillar: `$116.00 + $30-$45 = $146.00-$161.00`.

Treat postage rates as point-in-time planning estimates and check current MyPost Business rates and destination zones before setting a delivered retail price.

## Working Retail Strategy And Future Wholesale

Current retail direction:

- Current pricing work is for direct website retail only.
- Aim for an RRP slightly below `2 * packed product cost` where that remains commercially and market appropriate.
- Offer free website shipping when the retail order subtotal is at least `$200`.
- Treat the `$200` free-shipping threshold as a working policy until it has been configured and tested in Shopify.

The locked lamp RRPs use approximately `1.9 * packed product cost`, rounded to customer-friendly prices:

- Frill: `$270.00` RRP in Shopify.
- Halo: `$270.00` RRP in Shopify.
- Pillar: `$220.00` RRP in Shopify.

All lamps qualify for free shipping individually under the working `$200` threshold. Before outbound postage, the packed-cost retail margins are approximately `47.4%` for Frill and Halo and `47.3%` for Pillar. After the current `$30-$45` postage estimate, direct-sale contribution before tax and other overheads is:

- Frill and Halo: `$83.00-$98.00`, or approximately `30.7%-36.3%` of the `$270.00` RRP.
- Pillar: `$59.00-$74.00`, or approximately `26.8%-33.6%` of the `$220.00` RRP.

Shopify remains the source of truth for these RRPs. Run the inventory refresh after changing them in Shopify; do not type an alternate retail price into the priced CSV.

Wholesale is not part of the current launch pricing. If wholesale is offered later, HayHay expects to deliver local wholesale orders directly, removing the `$30-$45` parcel-postage cost. Packaging materials still apply, and delivery time, fuel and vehicle costs should be assessed separately.

The existing `Wholesale Price = RRP * 0.5` rule remains incompatible with an RRP near twice packed cost even when HayHay self-delivers. At exactly `2 * cost`, wholesale equals packed cost and has no product margin; below twice cost, wholesale loses money before delivery labour or fuel.

Until a final wholesale margin target is agreed, use a margin floor rather than blindly applying 50%:

```text
Wholesale price = max(RRP * 0.5, packed product cost / (1 - target wholesale margin))
```

Indicative wholesale floors are:

| Product cost basis | Packed cost | 25% margin floor | 30% margin floor |
| --- | ---: | ---: | ---: |
| Standard vase | `$48.83` | `$65.11` | `$69.76` |
| Puff | `$52.83` | `$70.44` | `$75.47` |
| Frill / Halo | `$142.00` | `$189.33` | `$202.86` |
| Pillar | `$116.00` | `$154.67` | `$165.71` |

Round final customer and wholesale prices only after choosing the target margin and confirming whether the working calculations should use GST-inclusive or GST-exclusive amounts.

## Decision / Reasoning Notes

- Keep material allowances, labour rate and labour time explicit so the cost can be reproduced when inputs change.
- Both vase and lamp costing use `$100/hour`; lamp production currently allows 45 minutes instead of the vase allowance of 20 minutes.
- The lamp flock and glue allowance is 1.5 times the vase allowance to reflect the larger surface area, pending measurement of actual usage.
- Locked lamp RRPs are Frill `$270`, Halo `$270`, and Pillar `$220`, sourced from Shopify.
- Current priced-CSV costs include the `$3.50` packaging-material allowance for both vases and lamps.
- Keep website shipping thresholds separate from any future wholesale pricing because current retail orders use parcel delivery while future local wholesale orders are expected to be self-delivered.
- Do not apply the historical 50%-of-RRP wholesale rule when it would breach the agreed wholesale margin floor.
- Do not infer that the existing vase cost estimates include packaging, freight, duty or other landed-cost overheads because the recovered breakdown does not list them.

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

Regenerate the internal landscape stock-list HTML and PDF:

```bash
npm run inventory:stock-list
```

The stock-list generator uses local Chrome or Chromium to print the generated HTML to PDF. Set `CHROME_PATH` if the browser is installed somewhere other than the known default paths.

## Constraints

- Shopify Storefront API credentials must be present in `.env`.
- Shopify must hold current RRP and product detail fields before final documents are generated.
- Local costs are estimates and should be reviewed before relying on margin outputs.
- Products with Shopify RRP of `0` should be treated as incomplete or draft pricing until confirmed.

## Follow-ups

- Add any missing Shopify weights, dimensions, prices, and images flagged by the stock-list output.
- Verify the working carton, protective-insert and sticker allowances against future supplier invoices.
- Verify MyPost Business rates by destination zone.
- Confirm the GST basis before revising local lamp costs or retail prices in Shopify.
- If wholesale is introduced later, confirm its margin floor and account for self-delivery time, fuel and vehicle costs.
- Configure and test the `$200` free-shipping threshold in Shopify once the policy is final.
