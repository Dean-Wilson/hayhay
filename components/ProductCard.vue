<template>
  <article class="product-card">
    <div
      class="product-card__media"
      @pointerdown="startSwipe"
      @pointerup="finishSwipe"
      @pointercancel="cancelSwipe"
      @click.capture="handleImageLinkClick"
    >
      <NuxtLink
        :to="`/products/${product.handle}`"
        class="product-card__image-link"
        :aria-label="`View ${product.title}`"
      >
        <img
          v-if="activeSlide?.image"
          :key="activeSlide.id"
          class="product-card__image"
          :src="activeSlide.image.src"
          :alt="activeSlide.image.alt"
          :width="activeSlide.image.width"
          :height="activeSlide.image.height"
          draggable="false"
        />
      </NuxtLink>

      <template v-if="hasMultipleSlides">
        <button
          class="product-card__control product-card__control--previous"
          type="button"
          :aria-label="`Show previous ${product.title} colour`"
          @click="selectRelativeSlide(-1)"
        >
          <svg
            class="product-card__chevron"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          class="product-card__control product-card__control--next"
          type="button"
          :aria-label="`Show next ${product.title} colour`"
          @click="selectRelativeSlide(1)"
        >
          <svg
            class="product-card__chevron"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </template>
    </div>

    <div
      v-if="hasMultipleSlides"
      class="product-card__swatches"
      role="group"
      :aria-label="`${product.title} colours`"
    >
      <button
        v-for="(slide, index) in slides"
        :key="slide.id"
        :class="[
          'product-card__swatch',
          { 'product-card__swatch--active': index === activeSlideIndex },
        ]"
        type="button"
        :aria-label="`Show ${product.title} in ${slide.label}`"
        :aria-pressed="index === activeSlideIndex"
        :title="slide.label"
        @click="selectSlide(index)"
      >
        <span
          class="product-card__swatch-colour"
          :style="{ '--product-swatch-colour': slide.swatchColor }"
          aria-hidden="true"
        />
      </button>
    </div>

    <NuxtLink
      :to="`/products/${product.handle}`"
      class="product-card__details"
    >
      <h2 class="product-card__title">{{ product.title }}</h2>
      <span v-if="displayPrice" class="product-card__price">
        {{ displayPrice }}
      </span>
    </NuxtLink>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const SWIPE_THRESHOLD = 40
const activeSlideIndex = ref(0)
let swipeStartX = null
let swipeStartY = null
let preventProductNavigationUntil = 0
const slides = computed(() => props.product.slides || [])
const hasMultipleSlides = computed(() => slides.value.length > 1)
const activeSlide = computed(
  () => slides.value[activeSlideIndex.value] || slides.value[0],
)
const displayPrice = computed(
  () => activeSlide.value?.price || props.product.price,
)

function selectSlide(index) {
  const slideCount = slides.value.length

  if (slideCount === 0) {
    return
  }

  activeSlideIndex.value = ((index % slideCount) + slideCount) % slideCount
}

function selectRelativeSlide(direction) {
  selectSlide(activeSlideIndex.value + direction)
}

function startSwipe(event) {
  if (
    !hasMultipleSlides.value ||
    event.pointerType === 'mouse' ||
    !event.target.closest('.product-card__image-link')
  ) {
    return
  }

  swipeStartX = event.clientX
  swipeStartY = event.clientY
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function finishSwipe(event) {
  if (swipeStartX === null || swipeStartY === null) {
    return
  }

  const horizontalDistance = event.clientX - swipeStartX
  const verticalDistance = event.clientY - swipeStartY
  const isHorizontalSwipe =
    Math.abs(horizontalDistance) >= SWIPE_THRESHOLD &&
    Math.abs(horizontalDistance) > Math.abs(verticalDistance)

  cancelSwipe()

  if (!isHorizontalSwipe) {
    return
  }

  selectRelativeSlide(horizontalDistance < 0 ? 1 : -1)
  preventProductNavigationUntil = Date.now() + 500
}

function cancelSwipe() {
  swipeStartX = null
  swipeStartY = null
}

function handleImageLinkClick(event) {
  if (
    Date.now() > preventProductNavigationUntil ||
    !event.target.closest('.product-card__image-link')
  ) {
    return
  }

  event.preventDefault()
  preventProductNavigationUntil = 0
}
</script>

<style scoped lang="scss">
.product-card {
  border-radius: 8px;
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  }

  &__media {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
  }

  &__image-link {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: pan-y;
    user-select: none;
  }

  &__image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    animation: product-card-image-in 0.2s ease-out;
  }

  &__control {
    position: absolute;
    top: 50%;
    display: grid;
    width: 2rem;
    height: 2rem;
    padding: 0;
    place-items: center;
    color: $text-primary;
    background: rgb(255 255 255 / 82%);
    border: 0;
    border-radius: 50%;
    box-shadow: 0 1px 5px rgb(0 0 0 / 15%);
    cursor: pointer;
    opacity: 0.78;
    transform: translateY(-50%);
    transition:
      opacity 0.2s,
      background-color 0.2s;

    &:hover {
      background: $background;
      opacity: 1;
    }

    &:focus-visible {
      outline: 2px solid $blue-100;
      outline-offset: 2px;
    }

    &--previous {
      left: 0.65rem;
    }

    &--next {
      right: 0.65rem;
    }
  }

  &__chevron {
    width: 1.15rem;
    height: 1.15rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  &__swatches {
    display: flex;
    min-height: 2.15rem;
    padding: 0.65rem 0.5rem 0.2rem;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  &__swatch {
    display: grid;
    width: 1.25rem;
    height: 1.25rem;
    padding: 2px;
    place-items: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 2px;
    cursor: pointer;

    &:hover {
      border-color: rgb(51 51 51 / 35%);
    }

    &:focus-visible {
      outline: 2px solid $blue-100;
      outline-offset: 2px;
    }

    &--active {
      border-color: $text-primary;
    }
  }

  &__swatch-colour {
    width: 100%;
    height: 100%;
    background: var(--product-swatch-colour, #d8d8d8);
    border: 1px solid rgb(0 0 0 / 10%);
    border-radius: 1px;
  }

  &__details {
    display: block;
    padding: 0.3rem 0.5rem 1rem;
    color: inherit;
    text-align: center;
    text-decoration: none;
  }

  &__title {
    margin: 0;
    font-size: 1.5rem;
  }

  &__price {
    font-size: 1.25rem;
    font-weight: 600;
  }
}

@keyframes product-card-image-in {
  from {
    opacity: 0.7;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-card {
    &__image {
      animation: none;
    }
  }
}
</style>
