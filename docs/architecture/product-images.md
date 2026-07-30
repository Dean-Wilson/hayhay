# Product Images

## Context

HayHay product listing images are sourced from Shopify where uploaded source images may be square, landscape, or portrait. The listing page uses a consistent portrait card frame, so product photography and upload crops need to be prepared for that fixed presentation.

## Current Design

Product listing cards use a `4:5` portrait image frame in `pages/products/index.vue`.

Images fill the frame with `object-fit: cover`, so the uploaded/cropped image should already be composed for a `4:5` crop. This keeps the listing grid visually consistent and avoids visible background padding around mixed-aspect-ratio images.

Product detail pages may still show mixed image ratios because detail/gallery views are better suited to alternate crops and close-up images.

## Catalogue Image Standard

Use a `4:5` portrait aspect ratio for every Shopify featured product image.

Recommended Canva master and final upload size:

```text
2000 x 2500 px
```

The existing `1080 x 1350 px` Shopify images use the correct ratio and are also
large enough for the current catalogue. Do not upscale an existing 1080 px image
just to meet the recommended master size.

Use a solid white (`#ffffff`) background so that the image background and the
website page blend together.

### Safe Zone

Create permanent guides in the Canva template and keep the complete product
silhouette inside them:

| Canvas | Left and right guides | Top and bottom guides | Inner display zone |
| --- | --- | --- | --- |
| `2000 x 2500 px` | `300 px` from each side | `300 px` from top and bottom | `1400 x 1900 px` |
| `1080 x 1350 px` | `162 px` from each side | `162 px` from top and bottom | `756 x 1026 px` |

This leaves 15% safe space on the left and right, and 12% above and below.

Scale the product proportionally until it fits inside the display zone:

- A tall, narrow product normally reaches a top or bottom guide first.
- A broad or round product normally reaches a side guide first.
- Do not stretch the product or make every product the same height.
- Keep the product optically centred. Start with mathematical centring, then
  make only a small visual correction if an asymmetric shape looks off-centre.
- Include the entire silhouette, including the base, rim, petals, handles, and
  any soft shadow that is meant to remain visible.

This is a maximum-size rule rather than a representation of the products'
physical scale. It gives differently shaped pieces consistent breathing room
and visual weight in the catalogue.

### Canva Template

Maintain one locked Canva design named `Product catalogue image — 4:5 master`.

1. Create a `2000 x 2500 px` white design.
2. Add vertical guides at x positions `300 px` and `1700 px`.
3. Add horizontal guides at y positions `300 px` and `2200 px`.
4. Add centre guides at x `1000 px` and y `1250 px`.
5. Put the product cut-out above the white background and below any temporary
   guide overlay.
6. Scale proportionally to fit the safe zone, then optically centre it.
7. Hide any visible guide overlay before export.
8. Export the catalogue image as a high-quality JPG in sRGB.

Duplicate this master for every product rather than starting from a blank
Canva design.

## Photography Guidance

- Shoot the product straight-on and centred.
- Use a plain, light background.
- Keep the full product visible with generous space around it.
- Do not crop tightly in-camera.
- Make sure the base, feet, top edge, and any defining silhouette details are fully visible.
- Avoid angling the camera down too much; keep the product shape readable.

## Shopify Workflow

The whitespace and final composition should be created in Canva, not Shopify.
Shopify is the delivery source for the finished image; it cannot reliably add
the missing canvas around a tightly cropped product.

For each product:

1. Export the finished `4:5` catalogue image from the Canva master.
2. Upload it to the product's media in Shopify.
3. Make it the product's featured image / first media item.
4. Keep alternate angles, details, and lifestyle photos after it for the
   product detail gallery.
5. Check the catalogue on desktop and mobile after publishing.

The website checks Shopify's featured image first, so changing that image
updates the catalogue without product-specific CSS. Product data may remain in
the browser cache for up to 15 minutes.

## Pre-publish Checklist

- Canvas is exactly `4:5`.
- Background is `#ffffff`.
- No part of the product or intended shadow crosses the safe-zone guides.
- Product is not stretched and is optically centred.
- The export contains no Canva guides or overlay.
- Image is the Shopify featured / first product image.
- The catalogue has been checked at desktop and mobile widths.

## Key Paths

- `pages/products/index.vue`
- `composables/useShopifyStorefront.js`

## Constraints

- The products listing should not rely on visible placeholder or background padding to handle inconsistent source image ratios.
- Shopify listing images should be treated as the source of truth for catalogue composition.
- The frontend can enforce the consistent card ratio, but photography/upload crops must provide enough breathing room to avoid cutting off sculptural shapes.
- Avoid product-specific CSS scale or position exceptions. They are difficult to
  maintain and hide inconsistent source assets.

## Operational Notes

When a product is too large, too small, or vertically misaligned in the listing
grid, adjust it in the Canva master and replace its Shopify featured image.
Do not change the website grid ratio to compensate for one product.

Alternate images for product detail galleries can use other ratios when they serve a detail, angle, or material close-up purpose.
