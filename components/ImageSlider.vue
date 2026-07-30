<template>
  <figure
    class="image-slider"
    role="group"
    :aria-label="label"
    @pointerdown="startSwipe"
    @pointerup="finishSwipe"
    @pointercancel="cancelSwipe"
  >
    <div class="image-slider__viewport">
      <img
        v-if="activeImage"
        :key="activeImage.src"
        class="image-slider__image"
        :src="activeImage.src"
        :alt="activeImage.alt"
        :width="activeImage.width"
        :height="activeImage.height"
        :style="{ objectPosition: activeImage.objectPosition || 'center' }"
        draggable="false"
      />

      <template v-if="hasMultipleImages">
        <button
          class="image-slider__control image-slider__control--previous"
          type="button"
          aria-label="Show previous image"
          @click="selectRelativeImage(-1)"
        >
          <svg
            class="image-slider__chevron"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          class="image-slider__control image-slider__control--next"
          type="button"
          aria-label="Show next image"
          @click="selectRelativeImage(1)"
        >
          <svg
            class="image-slider__chevron"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </template>
    </div>

    <figcaption class="image-slider__status" aria-live="polite">
      Image {{ activeImageIndex + 1 }} of {{ images.length }}
    </figcaption>
  </figure>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
  label: {
    type: String,
    default: 'Image gallery',
  },
})

const SWIPE_THRESHOLD = 40
const activeImageIndex = ref(0)
let swipeStartX = null
let swipeStartY = null
const hasMultipleImages = computed(() => props.images.length > 1)
const activeImage = computed(
  () => props.images[activeImageIndex.value] || props.images[0],
)

function selectImage(index) {
  const imageCount = props.images.length

  if (imageCount === 0) {
    return
  }

  activeImageIndex.value =
    ((index % imageCount) + imageCount) % imageCount
}

function selectRelativeImage(direction) {
  selectImage(activeImageIndex.value + direction)
}

function startSwipe(event) {
  if (
    !hasMultipleImages.value ||
    event.pointerType === 'mouse' ||
    !event.target.closest('.image-slider__image')
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

  selectRelativeImage(horizontalDistance < 0 ? 1 : -1)
}

function cancelSwipe() {
  swipeStartX = null
  swipeStartY = null
}
</script>

<style scoped lang="scss">
.image-slider {
  width: 100%;

  &__viewport {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 2;
    overflow: hidden;
    background: #f5f5f5;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    touch-action: pan-y;
    user-select: none;
    animation: image-slider-image-in 0.2s ease-out;
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

  &__status {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

@keyframes image-slider-image-in {
  from {
    opacity: 0.7;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .image-slider {
    &__image {
      animation: none;
    }
  }
}
</style>
