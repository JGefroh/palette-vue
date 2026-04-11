<template>
  <div v-if="isOpen" class="preset-menu-wrapper">
    <div class="preset-menu">
      <div class="preset-item" @click="selectPreset(1200, 630, 'Facebook Post')">
        <span class="fab fa-fw fa-facebook"></span>
        <span class="preset-name">Facebook Post</span>
        <span class="preset-size">1200×630</span>
      </div>
      <div class="preset-item" @click="selectPreset(1080, 1080, 'Instagram Post')">
        <span class="fab fa-fw fa-instagram"></span>
        <span class="preset-name">Instagram Post</span>
        <span class="preset-size">1080×1080</span>
      </div>
      <div class="preset-item" @click="selectPreset(1080, 1920, 'Instagram Story')">
        <span class="fab fa-fw fa-instagram"></span>
        <span class="preset-name">Instagram Story</span>
        <span class="preset-size">1080×1920</span>
      </div>
      <div class="preset-item" @click="selectPreset(1200, 627, 'LinkedIn Post')">
        <span class="fab fa-fw fa-linkedin"></span>
        <span class="preset-name">LinkedIn Post</span>
        <span class="preset-size">1200×627</span>
      </div>
      <div class="preset-item" @click="selectPreset(1000, 1500, 'Pinterest')">
        <span class="fab fa-fw fa-pinterest"></span>
        <span class="preset-name">Pinterest</span>
        <span class="preset-size">1000×1500</span>
      </div>
      <div class="preset-item" @click="selectPreset(1080, 1920, 'TikTok')">
        <span class="fab fa-fw fa-tiktok"></span>
        <span class="preset-name">TikTok</span>
        <span class="preset-size">1080×1920</span>
      </div>
      <div class="preset-item" @click="selectPreset(1200, 675, 'Twitter Post')">
        <span class="fa fa-fw fa-x"></span>
        <span class="preset-name">Twitter Post</span>
        <span class="preset-size">1200×675</span>
      </div>
      <div class="preset-item" @click="selectPreset(1280, 720, 'YouTube Thumbnail')">
        <span class="fab fa-fw fa-youtube"></span>
        <span class="preset-name">YouTube Thumbnail</span>
        <span class="preset-size">1280×720</span>
      </div>
    </div>
    <div class="preset-menu-arrow"></div>
  </div>
</template>

<script>
import { globalState } from '../persistence/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../input/input-handler.js'

export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    drawingCtx: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  methods: {
    selectPreset(width, height, presetName) {
      if (!this.drawingCtx) return

      const drawing = this.drawingCtx.getImageData(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
      this.drawingCtx.canvas.width = width
      this.drawingCtx.canvas.height = height
      this.drawingCtx.putImageData(drawing, 0, 0)

      // Sync canvas state
      const color = globalState.get('selectedColor')
      this.drawingCtx.strokeStyle = color.hex
      this.drawingCtx.fillStyle = color.hex
      const size = globalState.get('selectedSize')
      this.drawingCtx.lineWidth = size
      this.drawingCtx.lineCap = 'round'
      this.drawingCtx.lineJoin = 'round'

      globalCanvasManager.persistCanvas(globalState.get('selectedTab').id)
      inputHandler.dispatchCommand('canvas-resize', { width, height })
      inputHandler.dispatchCommand('zoom-to-fit')
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../styles/variables';
@import '../../styles/mixins';

.preset-menu-wrapper {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
}

.preset-menu-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(211, 211, 211, 0.49);
  margin-left: 12px;
  margin-top: -1px;
}

.preset-menu {
  @include glass-panel;
  min-width: 220px;
  max-height: 400px;
  overflow-y: auto;
}

.preset-item {
  padding: $space-md;
  display: flex;
  align-items: center;
  gap: $space-md;
  cursor: pointer;
  transition: $transition-default;
  border-bottom: 1px solid rgba(185, 185, 185, 0.2);
}

.preset-item:last-child {
  border-bottom: none;
}

.preset-item:hover {
  background-color: rgba(52, 73, 94, 0.1);
}

.preset-name {
  font-size: 12px;
  color: $color-primary;
  flex: 1;
  font-weight: $font-weight-medium;
}

.preset-size {
  font-size: 10px;
  color: $color-secondary;
  font-family: monospace;
}
</style>
