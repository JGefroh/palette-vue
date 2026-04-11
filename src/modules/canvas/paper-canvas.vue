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
      // Canny edge detection config
      cannyLowThreshold: 50,
      cannyHighThreshold: 70
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

      const selectedTab = globalState.get('selectedTab')
      const tabId = selectedTab?.id
      const savedWidth = globalState.get(`${tabId}-width`)
      const savedHeight = globalState.get(`${tabId}-height`)

      // If no saved dimensions, use default parent size
      if (!savedWidth || !savedHeight) {
        const width = this.$refs.paper.offsetWidth
        const height = this.$refs.paper.offsetHeight
        this.$refs.overlayCanvas.resizeCanvas(width, height)
        this.$refs.overlayCanvas.syncColor()
      }

      if (globalState.get('isNewUser')) {
        this.fitImage(logoImage)
      }
      else if (tabId) {
        globalCanvasManager.loadCanvas(tabId)
        this.$nextTick(() => {
          this.$refs.drawingCanvas.updateCanvasDisplay()
          this.$refs.drawingCanvas.syncColor()
          this.$refs.drawingCanvas.syncBrush()
          const ctx = globalCanvasManager.getDrawingContext()
          if (ctx) {
            this.$refs.overlayCanvas.resizeCanvas(ctx.canvas.width, ctx.canvas.height)
            this.$refs.overlayCanvas.syncColor()
          }
        })
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

      inputHandler.onCommand('zoom-to-fit', () => {
        this.zoomToFit()
      })
    },

    zoomToFit() {
      const ctx = globalCanvasManager.getDrawingContext()
      if (!ctx) return

      const canvasWidth = ctx.canvas.width
      const canvasHeight = ctx.canvas.height
      const viewportWidth = this.$refs.paper.offsetWidth
      const viewportHeight = this.$refs.paper.offsetHeight

      const zoomX = viewportWidth / canvasWidth
      const zoomY = viewportHeight / canvasHeight
      this.zoom = Math.min(zoomX, zoomY, 8)
      this.panX = (viewportWidth - canvasWidth * this.zoom) / 2
      this.panY = (viewportHeight - canvasHeight * this.zoom) / 2
    },

    fitImage(src) {
      this.$refs.drawingCanvas.drawImage(src)
    },

    applyEdgeDetection(imageData) {
      // Canny edge detection
      const { data, width, height } = imageData
      const output = new Uint8ClampedArray(data.length)

      // Convert to grayscale
      const gray = new Float32Array(width * height)
      for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4
        gray[idx] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      }

      // Gaussian blur (3x3 kernel)
      const blurred = new Float32Array(width * height)
      const kernel = [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16]
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let sum = 0
          let ki = 0
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              sum += gray[(y + dy) * width + (x + dx)] * kernel[ki++]
            }
          }
          blurred[y * width + x] = sum
        }
      }

      // Sobel operator: compute gradients
      const gx = new Float32Array(width * height)
      const gy = new Float32Array(width * height)
      const magnitude = new Float32Array(width * height)
      const angle = new Float32Array(width * height)

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x
          const sobelGx =
            -blurred[(y-1)*width+(x-1)] + blurred[(y-1)*width+(x+1)] +
            -2*blurred[y*width+(x-1)] + 2*blurred[y*width+(x+1)] +
            -blurred[(y+1)*width+(x-1)] + blurred[(y+1)*width+(x+1)]

          const sobelGy =
            -blurred[(y-1)*width+(x-1)] - 2*blurred[(y-1)*width+x] - blurred[(y-1)*width+(x+1)] +
            blurred[(y+1)*width+(x-1)] + 2*blurred[(y+1)*width+x] + blurred[(y+1)*width+(x+1)]

          gx[idx] = sobelGx
          gy[idx] = sobelGy
          magnitude[idx] = Math.sqrt(sobelGx * sobelGx + sobelGy * sobelGy)
          angle[idx] = Math.atan2(sobelGy, sobelGx)
        }
      }

      // Non-maximum suppression
      const suppressed = new Float32Array(width * height)
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x
          const mag = magnitude[idx]
          const ang = angle[idx]

          let mag1 = mag
          let mag2 = mag
          const normalizedAngle = ((ang + Math.PI) * 180 / Math.PI + 360) % 360

          if ((normalizedAngle >= 0 && normalizedAngle < 22.5) || (normalizedAngle >= 157.5 && normalizedAngle < 202.5) || (normalizedAngle >= 337.5)) {
            mag1 = magnitude[y * width + (x + 1)]
            mag2 = magnitude[y * width + (x - 1)]
          } else if ((normalizedAngle >= 22.5 && normalizedAngle < 67.5) || (normalizedAngle >= 202.5 && normalizedAngle < 247.5)) {
            mag1 = magnitude[(y + 1) * width + (x - 1)]
            mag2 = magnitude[(y - 1) * width + (x + 1)]
          } else if ((normalizedAngle >= 67.5 && normalizedAngle < 112.5) || (normalizedAngle >= 247.5 && normalizedAngle < 292.5)) {
            mag1 = magnitude[(y + 1) * width + x]
            mag2 = magnitude[(y - 1) * width + x]
          } else if ((normalizedAngle >= 112.5 && normalizedAngle < 157.5) || (normalizedAngle >= 292.5 && normalizedAngle < 337.5)) {
            mag1 = magnitude[(y + 1) * width + (x + 1)]
            mag2 = magnitude[(y - 1) * width + (x - 1)]
          }

          suppressed[idx] = (mag >= mag1 && mag >= mag2) ? mag : 0
        }
      }

      // Double thresholding + hysteresis
      const edges = new Uint8Array(width * height)
      const STRONG = 255
      const WEAK = 127
      const lowThresh = this.cannyLowThreshold
      const highThresh = this.cannyHighThreshold

      for (let i = 0; i < suppressed.length; i++) {
        const mag = suppressed[i]
        if (mag >= highThresh) edges[i] = STRONG
        else if (mag >= lowThresh) edges[i] = WEAK
      }

      // Edge tracking by hysteresis (flood fill from strong edges)
      const stack = []
      for (let i = 0; i < edges.length; i++) {
        if (edges[i] === STRONG) stack.push(i)
      }

      while (stack.length > 0) {
        const idx = stack.pop()
        const y = Math.floor(idx / width)
        const x = idx % width

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx === 0) continue
            const ny = y + dy
            const nx = x + dx
            if (nx >= 1 && nx < width - 1 && ny >= 1 && ny < height - 1) {
              const nidx = ny * width + nx
              if (edges[nidx] === WEAK) {
                edges[nidx] = STRONG
                stack.push(nidx)
              }
            }
          }
        }
      }

      // Convert to output (black edges on transparent)
      for (let i = 0; i < width * height; i++) {
        const oi = i * 4
        if (edges[i] === STRONG) {
          output[oi] = 0
          output[oi + 1] = 0
          output[oi + 2] = 0
          output[oi + 3] = 255
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
      const factor = event.deltaY < 0 ? 1.05 : 0.95
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
      if (!ctx) return

      const selectedTab = globalState.get('selectedTab')
      const tabId = selectedTab?.id
      const savedWidth = globalState.get(`${tabId}-width`)
      const savedHeight = globalState.get(`${tabId}-height`)

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      // If no saved dimensions, reset to default
      if (!savedWidth || !savedHeight) {
        this.$refs.drawingCanvas.resizeCanvas()
      }

      globalCanvasManager.loadCanvas(tabId)
      this.$nextTick(() => {
        this.$refs.drawingCanvas.updateCanvasDisplay()
        this.$refs.drawingCanvas.syncColor()
        this.$refs.drawingCanvas.syncBrush()
        const width = ctx.canvas.width
        const height = ctx.canvas.height
        this.$refs.overlayCanvas.resizeCanvas(width, height)
        this.$refs.overlayCanvas.syncColor()
      })
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
