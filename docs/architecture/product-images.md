# Product Images

## Context

HayHay product listing images are sourced from Shopify where uploaded source images may be square, landscape, or portrait. The listing page uses a consistent portrait card frame, so product photography and upload crops need to be prepared for that fixed presentation.

## Current Design

Product listing cards use a `4:5` portrait image frame in `pages/products/index.vue`.

Images fill the frame with `object-fit: cover`, so the uploaded/cropped image should already be composed for a `4:5` crop. This keeps the listing grid visually consistent and avoids visible background padding around mixed-aspect-ratio images.

Product detail pages may still show mixed image ratios because detail/gallery views are better suited to alternate crops and close-up images.

## Baselines

Use a `4:5` portrait aspect ratio for Shopify product listing images.

Recommended final upload size:

```text
2000 x 2500 px
```

Minimum acceptable upload size:

```text
1200 x 1500 px
```

## Photography Guidance

- Shoot the product straight-on and centred.
- Use a plain, light background.
- Keep the full product visible with generous space around it.
- Leave roughly 10-15% empty space above the product.
- Leave roughly 15-20% empty space below the product.
- Leave roughly 10-15% empty space on each side.
- Do not crop tightly in-camera.
- Make sure the base, feet, top edge, and any defining silhouette details are fully visible.
- Avoid angling the camera down too much; keep the product shape readable.

## Upload And Crop Guidance

Crop the final Shopify listing image to `4:5` portrait before upload.

The product should sit centred in the frame with enough padding that the catalogue tile can crop edge-to-edge without losing important details. If the object feels like it is touching the frame, the crop is too tight.

For tall products such as Petal:

- Keep the top petal detail fully inside the frame.
- Keep the round base fully inside the frame.
- Do not let the vase touch the top, bottom, or side edges.
- Aim for the product to occupy about 75-85% of the image height, not 100%.

## Key Paths

- `pages/products/index.vue`
- `composables/useShopifyStorefront.js`

## Constraints

- The products listing should not rely on visible placeholder or background padding to handle inconsistent source image ratios.
- Shopify listing images should be treated as the source of truth for catalogue composition.
- The frontend can enforce the consistent card ratio, but photography/upload crops must provide enough breathing room to avoid cutting off sculptural shapes.

## Operational Notes

When a product appears cut off in the listing grid, first replace or recrop the Shopify listing image to the `4:5` baseline rather than changing the product grid ratio.

Alternate images for product detail galleries can use other ratios when they serve a detail, angle, or material close-up purpose.

## Follow-ups

- Consider adding a short Shopify admin checklist or media naming convention if more people begin uploading product photos.
