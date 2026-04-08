<template>
  <div v-if="isVisible" class="eyedropper-preview" :style="previewStyle" :class="{ shake: eyedropperPreviewState.shouldShake }">
    <div class="color-swatch" :style="{ backgroundColor: sample.hex }"></div>
    <div class="color-info">
      <div class="hex">{{ sample.hex }}</div>
      <div class="rgb">rgb({{ sample.r }}, {{ sample.g }}, {{ sample.b }})</div>
    </div>
  </div>
</template>

<script>
import { globalState } from '../persistence/global-state.js'
import { eyedropperPreviewState } from '../tools/eyedropper.js'

export default {
  data() {
    return {
      globalState,
      eyedropperPreviewState
    }
  },
  computed: {
    sample() {
      return this.eyedropperPreviewState.sample
    },
    isVisible() {
      const selectedTool = globalState.get('selectedTool')
      return selectedTool?.name === 'Eyedropper' && this.sample
    },
    previewStyle() {
      if (!this.sample) return {}
      let left = this.sample.screenX + 20
      let top = this.sample.screenY + 20

      if (left + 150 > window.innerWidth) {
        left = this.sample.screenX - 170
      }
      if (top + 100 > window.innerHeight) {
        top = this.sample.screenY - 110
      }

      return {
        left: left + 'px',
        top: top + 'px'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.eyedropper-preview {
  @include glass-panel;
  position: fixed;
  z-index: 1000;
  padding: $space-sm $space-md;
  display: flex;
  gap: $space-md;
  align-items: center;
  pointer-events: none;
}

.color-swatch {
  width: $size-button;
  height: $size-button;
  border-radius: $radius-button;
  border: $border-default;
  flex-shrink: 0;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: $space-xs;
  font-family: $font-primary;
  font-size: $font-size-subheader;
  color: $color-primary;
  min-width: 130px;
}

.hex {
  font-weight: $font-weight-semibold;
  font-family: $font-primary;
  font-size: $font-size-body;
  letter-spacing: 0.5px;
}

.rgb {
  font-size: $font-size-subheader;
  color: $color-primary;
  font-family: $font-primary;
  font-weight: $font-weight-medium;
}

.eyedropper-preview.shake {
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-12px); }
  20% { transform: translateX(12px); }
  30% { transform: translateX(-12px); }
  40% { transform: translateX(12px); }
  50% { transform: translateX(-8px); }
  60% { transform: translateX(8px); }
  70% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
</style>
