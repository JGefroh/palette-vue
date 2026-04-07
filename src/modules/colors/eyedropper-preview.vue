<template>
  <div v-if="isVisible" class="eyedropper-preview" :style="previewStyle">
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

<style scoped>
.eyedropper-preview {
  position: fixed;
  z-index: 1000;
  background-color: rgba(211, 211, 211, 0.49);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(185, 185, 185, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid rgba(185, 185, 185, 0.3);
  flex-shrink: 0;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  color: #34495e;
  min-width: 130px;
}

.hex {
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.rgb {
  font-size: 11px;
  color: #34495e;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}
</style>
