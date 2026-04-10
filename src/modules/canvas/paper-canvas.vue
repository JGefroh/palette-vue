<template>
  <div ref="paper" class="paper">
    <div class="viewport" :style="viewportStyle">
      <overlay-canvas ref="overlayCanvas"></overlay-canvas>
      <drawing-canvas ref="drawingCanvas"></drawing-canvas>
      <text-options-panel ref="textOptionsPanel"></text-options-panel>
    </div>
    <div v-if="isDragging" class="drop-overlay">
      <div class="drop-zone drop-zone--left" @dragover.prevent="hoveredZone = 'left'" @dragleave="hoveredZone = null" :class="{ 'drop-zone--active': hoveredZone === 'left' }" style="flex: 2">
        <div class="drop-zone__content">
          <div class="drop-zone__icon">⊟</div>
          <div class="drop-zone__label">Fit to Canvas</div>
        </div>
      </div>
      <div class="drop-zone drop-zone--middle" @dragover.prevent="hoveredZone = 'original'" @dragleave="hoveredZone = null" :class="{ 'drop-zone--active': hoveredZone === 'original' }" style="flex: 2">
        <div class="drop-zone__content">
          <div class="drop-zone__icon">⊕</div>
          <div class="drop-zone__label">Original Size</div>
        </div>
      </div>
      <div class="drop-zone drop-zone--right" @dragover.prevent="hoveredZone = 'edge'" @dragleave="hoveredZone = null" :class="{ 'drop-zone--active': hoveredZone === 'edge' }" style="flex: 1">
        <div class="drop-zone__content">
          <div class="drop-zone__icon">⊞</div>
          <div class="drop-zone__label">Edge Only</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OverlayCanvas from './overlay-canvas.vue'
import DrawingCanvas from './drawing-canvas.vue'
import TextOptionsPanel from './text-options-panel.vue'
import { globalCursorManager } from '../input/global-cursor-manager.js'
import { globalState } from '../persistence/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { globalToolManager } from '../tools/global-tool-manager.js'
import { inputHandler } from '../input/input-handler.js'
import logoImage from '../../assets/logo.png'
export default {
  components: {
    OverlayCanvas,
    DrawingCanvas,
    TextOptionsPanel
  },
  emits: ['on-initialize', 'on-stroke-start'],
  data() {
    return {
      zoom: 1,
      panX: 0,
      panY: 0,
      isDragging: false,
      hoveredZone: null,
      // Edge detection config
      edgeThreshold: 30,           // gradient magnitude threshold (higher = thinner, sharper lines)
      edgeAlphaMode: 'gradient'    // 'gradient' (magnitude-based), 'binary' (all-or-nothing), or 'amplified' (2x magnitude)
    }
  },
  watch: {
    canvasConfiguration() {
      this.syncTab();
    }
  },
  computed: {
    canvasConfiguration() {
      return {
        selectedTab: globalState.get('selectedTab')
      }
    },
    viewportStyle() {
      return {
        transformOrigin: '0 0',
        transform: `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initialize()
    })
  },
  methods: {
    initialize() {
      const drawingCanvas = this.$refs.drawingCanvas.$refs.drawing

      globalCursorManager.setCanvas(drawingCanvas)
      inputHandler.registerPaperElement(this.$refs.paper, globalCursorManager)
      this.registerCommandHandlers()
      this.$emit('on-initialize', globalCursorManager)

      const width = this.$refs.paper.offsetWidth
      const height = this.$refs.paper.offsetHeight
      this.$refs.overlayCanvas.resizeCanvas(width, height)

      if (globalState.get('isNewUser')) {
        this.fitImage(logoImage)
      }
      else {
        const selectedTab = globalState.get('selectedTab')
        if (selectedTab) {
          globalCanvasManager.loadCanvas(selectedTab.id)
        }
      }
    },

    registerCommandHandlers() {
      inputHandler.onCommand('image-drag-enter', () => {
        this.isDragging = true
      })

      inputHandler.onCommand('image-drag-leave', () => {
        this.isDragging = false
        this.hoveredZone = null
      })

      inputHandler.onCommand('image-drop', (e) => {
        this.fitDroppedImage(e)
        this.isDragging = false
      })

      inputHandler.onCommand('zoom', (e) => {
        this.adjustZoom(e)
      })

      inputHandler.onCommand('pan', (e) => {
        this.adjustPan(e)
      })
    },

    fitImage(src) {
      this.$refs.drawingCanvas.drawImage(src)
    },

    applyEdgeDetection(imageData) {
      const { data, width, height } = imageData
      const output = new Uint8ClampedArray(data.length)

      const gray = (i) => {
        return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      }
      const idx = (x, y) => (y * width + x) * 4

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const gx =
            -gray(idx(x-1, y-1)) + gray(idx(x+1, y-1)) +
            -2*gray(idx(x-1, y)) + 2*gray(idx(x+1, y)) +
            -gray(idx(x-1, y+1)) + gray(idx(x+1, y+1))

          const gy =
            -gray(idx(x-1, y-1)) - 2*gray(idx(x, y-1)) - gray(idx(x+1, y-1)) +
            gray(idx(x-1, y+1)) + 2*gray(idx(x, y+1)) + gray(idx(x+1, y+1))

          const magnitude = Math.sqrt(gx*gx + gy*gy)
          const i = idx(x, y)

          if (magnitude > this.edgeThreshold) {
            output[i] = 0
            output[i+1] = 0
            output[i+2] = 0

            // Determine alpha based on selected mode
            let alpha
            if (this.edgeAlphaMode === 'binary') {
              alpha = 255
            } else if (this.edgeAlphaMode === 'amplified') {
              alpha = Math.min(255, magnitude * 2)
            } else {
              // 'gradient' (default)
              alpha = Math.min(255, magnitude)
            }
            output[i+3] = alpha
          }
        }
      }

      return new ImageData(output, width, height)
    },

    fitDroppedImage(event) {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) return

      const src = URL.createObjectURL(file)
      const zone = this.hoveredZone

      const img = new Image()
      img.onload = () => {
        const drawingCtx = this.$refs.drawingCanvas.$refs.drawing.getContext('2d')
        const cw = drawingCtx.canvas.width
        const ch = drawingCtx.canvas.height
        let bounds

        if (zone === 'left') {
          // Fit to canvas
          const scale = Math.min(cw / img.width, ch / img.height)
          const x = (cw - img.width * scale) / 2
          const y = (ch - img.height * scale) / 2
          drawingCtx.drawImage(img, x, y, img.width * scale, img.height * scale)
          bounds = { x, y, width: img.width * scale, height: img.height * scale }
        } else if (zone === 'original') {
          // Original size
          const x = (cw - img.width) / 2
          const y = (ch - img.height) / 2
          drawingCtx.drawImage(img, x, y)
          bounds = { x, y, width: img.width, height: img.height }
        } else if (zone === 'edge') {
          // Edge detection with fit to canvas
          const scale = Math.min(cw / img.width, ch / img.height)
          const scaledWidth = Math.floor(img.width * scale)
          const scaledHeight = Math.floor(img.height * scale)
          const x = (cw - scaledWidth) / 2
          const y = (ch - scaledHeight) / 2

          // Create temp canvas for image and edge detection
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = scaledWidth
          tempCanvas.height = scaledHeight
          const tempCtx = tempCanvas.getContext('2d')
          tempCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight)

          // Apply edge detection
          const imageData = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight)
          const edgeData = this.applyEdgeDetection(imageData)
          tempCtx.putImageData(edgeData, 0, 0)

          // Draw result to main canvas
          drawingCtx.drawImage(tempCanvas, x, y)
          bounds = { x, y, width: scaledWidth, height: scaledHeight }
        }

        const selectedTool = globalState.get('selectedTool')
        const tools = globalToolManager.getTools()
        const selectTool = tools.find(t => t.name === 'Select')
        if (selectTool) {
          selectTool.setSelectionBounds(bounds)
        }
      }
      img.src = src
    },

    adjustZoom(event) {
      const factor = event.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.max(0.1, Math.min(8, this.zoom * factor))
      const rect = this.$refs.paper.getBoundingClientRect()
      const relX = event.clientX - rect.left
      const relY = event.clientY - rect.top
      const ratio = newZoom / this.zoom
      this.panX = relX * (1 - ratio) + this.panX * ratio
      this.panY = relY * (1 - ratio) + this.panY * ratio
      this.zoom = newZoom
    },
    adjustPan(event) {
      this.panX += event.deltaX
      this.panY += event.deltaY
    },
    syncTab() {
      const ctx = globalCanvasManager.getDrawingContext()
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      globalCanvasManager.loadCanvas(globalState.get('selectedTab').id)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../../styles/variables';

.paper {
  position: relative;
  flex: 1;
  overflow: hidden;
  background-color: #c8c8c8;
}

.viewport {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.drop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
}

.drop-zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(211, 211, 211, 0.25);
  backdrop-filter: blur(30px);
  border: none;
  transition: all 0.15s ease;
  cursor: pointer;
  pointer-events: auto;

  &--active {
    background: $surface-panel;
    backdrop-filter: blur(30px);
    border: 1px solid rgba(185, 185, 185, 0.3);

    .drop-zone__icon {
      color: $color-secondary;
      transform: scale(1.1);
    }

    .drop-zone__label {
      color: $color-secondary;
      font-weight: $font-weight-semibold;
    }
  }

  &--left {
    border-right: 1px solid rgba(185, 185, 185, 0.3);
  }

  &--middle {
    border-right: 1px solid rgba(185, 185, 185, 0.3);
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-sm;
    pointer-events: auto;
  }

  &__icon {
    font-size: 32px;
    color: $color-tertiary;
    transition: all 0.15s ease;
    line-height: 1;
  }

  &__label {
    font-family: $font-primary;
    font-size: 14px;
    font-weight: $font-weight-medium;
    color: $color-primary;
    text-align: center;
    user-select: none;
    transition: all 0.15s ease;
  }
}
</style>
