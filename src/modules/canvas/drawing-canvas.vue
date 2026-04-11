<template>
  <div class="drawing-container">
    <canvas ref="drawing" class="drawing"></canvas>
    <button v-if="canvasHeight < 4096" @click="doubleHeight" class="extend-canvas-btn extend-canvas-btn--down" :style="extendCanvasBtnStyle">
      <div class="extend-canvas-icon">▼</div>
    </button>
    <button v-if="canvasWidth < 4096" @click="doubleWidth" class="extend-canvas-btn extend-canvas-btn--right" :style="extendCanvasBtnRightStyle">
      <div class="extend-canvas-icon">▶</div>
    </button>
    <div class="canvas-dimensions">
      <button class="social-preset-btn" @click="showPresetMenu = !showPresetMenu" title="Social media presets">
        <span class="fa fa-fw fa-images"></span>
      </button>
      <div class="dimensions-text">{{ canvasWidth }}px × {{ canvasHeight }}px • AR {{ aspectRatio }} • DPR {{ devicePixelRatio }}</div>
      <social-media-preset-menu :is-open="showPresetMenu" :drawing-ctx="drawingCtx" @close="showPresetMenu = false" />
    </div>
  </div>
</template>

<script>
import { globalState } from '../persistence/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../input/input-handler.js'
import SocialMediaPresetMenu from './social-media-preset-menu.vue'

export default {
  components: {
    SocialMediaPresetMenu
  },
  data() {
    return {
      drawingCtx: null,
      canvasWidth: 0,
      canvasHeight: 0,
      showPresetMenu: false
    }
  },
  watch: {
    drawingConfiguration() {
      this.syncBrush()
      this.syncColor()
    }
  },
  computed: {
    drawingConfiguration() {
      return {
        selectedColor: globalState.get('selectedColor'),
        selectedSize: globalState.get('selectedSize')
      }
    },
    devicePixelRatio() {
      return window.devicePixelRatio?.toFixed(1) || '1.0'
    },
    aspectRatio() {
      if (!this.canvasWidth || !this.canvasHeight) return '—'
      const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
      const divisor = gcd(this.canvasWidth, this.canvasHeight)
      const ratioWidth = this.canvasWidth / divisor
      const ratioHeight = this.canvasHeight / divisor
      const decimal = (this.canvasWidth / this.canvasHeight).toFixed(2)
      return `${ratioWidth}:${ratioHeight} (${decimal})`
    },
    extendCanvasBtnStyle() {
      return {
        top: (this.canvasHeight + 100) + 'px',
        left: ((this.canvasWidth - 140) / 2) + 'px'
      }
    },
    extendCanvasBtnRightStyle() {
      return {
        top: ((this.canvasHeight - 140) / 2) + 'px',
        left: (this.canvasWidth + 100) + 'px'
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initialize()
    })
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    initialize() {
      this.drawingCtx = this.$refs.drawing.getContext('2d', { willReadFrequently: true })
      globalCanvasManager.setDrawingContext(this.drawingCtx)
      this.resizeCanvas()
      this.updateCanvasDisplay()
      this.syncColor()
      this.syncBrush()
    },

    getContext() {
      return this.drawingCtx
    },

    drawImage(src) {
      const img = new Image()
      img.onload = () => {
        const cw = this.drawingCtx.canvas.width
        const ch = this.drawingCtx.canvas.height
        const scale = Math.min(cw / img.width, ch / img.height)
        const x = (cw - img.width * scale) / 2
        const y = (ch - img.height * scale) / 2
        this.drawingCtx.drawImage(img, x, y, img.width * scale, img.height * scale)
      }
      img.src = src
    },

    drawImageOriginalSize(src) {
      const img = new Image()
      img.onload = () => {
        const cw = this.drawingCtx.canvas.width
        const ch = this.drawingCtx.canvas.height
        const x = (cw - img.width) / 2
        const y = (ch - img.height) / 2
        this.drawingCtx.drawImage(img, x, y)
      }
      img.src = src
    },

    resizeCanvas() {
      let drawing = null
      if (this.drawingCtx.canvas.width > 0 && this.drawingCtx.canvas.height > 0) {
        drawing = this.drawingCtx.getImageData(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
      }
      const parentEl = this.$refs.drawing.parentElement.parentElement
      this.drawingCtx.canvas.width = parentEl.offsetWidth
      this.drawingCtx.canvas.height = parentEl.offsetHeight
      this.canvasWidth = this.drawingCtx.canvas.width
      this.canvasHeight = this.drawingCtx.canvas.height
      if (drawing) {
        this.drawingCtx.putImageData(drawing, 0, 0)
      }
    },

    syncColor() {
      const color = globalState.get('selectedColor')
      if (this.drawingCtx) {
        this.drawingCtx.strokeStyle = color.hex
        this.drawingCtx.fillStyle = color.hex
      }
    },

    syncBrush() {
      if (this.drawingCtx) {
        this.drawingCtx.lineWidth = globalState.get('selectedSize')
        this.drawingCtx.lineCap = 'round'
        this.drawingCtx.lineJoin = 'round'
      }
    },

    updateCanvasDisplay() {
      this.canvasWidth = this.drawingCtx.canvas.width
      this.canvasHeight = this.drawingCtx.canvas.height
      this.$refs.drawing.style.width = this.canvasWidth + 'px'
      this.$refs.drawing.style.height = this.canvasHeight + 'px'
    },

    doubleWidth() {
      const drawing = this.drawingCtx.getImageData(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
      this.drawingCtx.canvas.width = Math.min(Math.max(this.drawingCtx.canvas.width * 1.5, 1024), 4096)
      this.canvasWidth = this.drawingCtx.canvas.width
      this.$refs.drawing.style.width = this.canvasWidth + 'px'
      this.drawingCtx.putImageData(drawing, 0, 0)
      this.syncColor()
      this.syncBrush()
      globalCanvasManager.persistCanvas(globalState.get('selectedTab').id)
      inputHandler.dispatchCommand('canvas-resize', { width: this.canvasWidth, height: this.canvasHeight })
    },

    doubleHeight() {
      const drawing = this.drawingCtx.getImageData(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
      this.drawingCtx.canvas.height = Math.min(Math.max(this.drawingCtx.canvas.height * 1.5, 1024), 4096)
      this.canvasHeight = this.drawingCtx.canvas.height
      this.$refs.drawing.style.height = this.canvasHeight + 'px'
      this.drawingCtx.putImageData(drawing, 0, 0)
      this.syncColor()
      this.syncBrush()
      globalCanvasManager.persistCanvas(globalState.get('selectedTab').id)
      inputHandler.dispatchCommand('canvas-resize', { width: this.canvasWidth, height: this.canvasHeight })
    },

    handleClickOutside(e) {
      if (this.showPresetMenu && !e.target.closest('.canvas-dimensions')) {
        this.showPresetMenu = false
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../styles/variables';
@import '../../styles/mixins';
.drawing-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawing {
  display: block;
  cursor: crosshair;
  z-index: 1;
  background-color: white;
}

.canvas-dimensions {
  position: relative;
  font-family: monospace;
  font-size: 16px;
  color: #888;
  font-weight: 500;
  padding: 4px 8px 4px 0;
  background-color: #c8c8c8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dimensions-text {
  flex: 1;
  padding-left: 8px;
}

.extend-canvas-btn {
  position: absolute;
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background-color: transparent;
  color: $color-primary;
  border-radius: $radius-button;
  cursor: pointer;
  font-family: $font-primary;
  font-size: 30px;
  outline: none;
  z-index: 3;
  transition: opacity 0.3s ease;
}

.extend-canvas-btn:hover {
  background-color: transparent;
  border-color: transparent;
}

.extend-canvas-icon {
  font-size: 60px;
  line-height: 1;
  color: rgba(185, 185, 185, 0.8);
  transition: color 0.3s ease;
}

.extend-canvas-btn:hover .extend-canvas-icon {
  color: rgba(185, 185, 185, 0.95);
}

.social-preset-btn {
  position: relative;
  flex-shrink: 0;
  padding: 4px 8px;
  border: $border-default;
  background-color: transparent;
  color: $color-primary;
  border-radius: $radius-button;
  cursor: pointer;
  font-family: $font-primary;
  font-size: 12px;
  transition: $transition-default;
}

.social-preset-btn:hover {
  background-color: $btn-hover-bg;
  border-color: $border-color-hover;
}

</style>
