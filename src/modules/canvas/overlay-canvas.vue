<template>
  <canvas ref="overlay" class="overlay" :style="{ cursor: overlayCanvasCursor }"></canvas>
</template>

<script>
import { globalState } from '../persistence/global-state.js'
import { globalCursorManager } from '../input/global-cursor-manager.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../input/input-handler.js'

export default {
  data() {
    return {
      overlayCtx: null
    }
  },
  watch: {
    drawingConfiguration() {
      this.syncColor()
      this.syncBrush()
    }
  },
  computed: {
    drawingConfiguration() {
      return {
        selectedColor: globalState.get('selectedColor'),
        selectedSize: globalState.get('selectedSize'),
        selectedTool: globalState.get('selectedTool')
      }
    },
    overlayCanvasCursor() {
      const selectedTool = globalState.get('selectedTool')
      if (selectedTool?.name === 'Brush') {
        return 'none'
      }
      if (selectedTool?.name === 'Eyedropper') {
        return 'none'
      }
      if (selectedTool?.name === 'Text') {
        const coordinates = globalCursorManager.getCurrentCoordinates()
        if (coordinates && selectedTool.isOnEdge(coordinates)) {
          return 'grab'
        }
        return 'text'
      }
      if (selectedTool?.name === 'Select') {
        const coordinates = globalCursorManager.getCurrentCoordinates()
        if (coordinates) {
          if (selectedTool.shouldStartRotatingSelection(coordinates)) {
            return 'grab'
          } else if (selectedTool.getCornerAtCoordinates(coordinates)) {
            return 'nwse-resize'
          } else if (selectedTool.shouldStartMovingSelection(coordinates)) {
            return 'move'
          }
        }
      }
      return 'crosshair'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initialize()
    })
  },
  methods: {
    initialize() {
      this.overlayCtx = this.$refs.overlay.getContext('2d', { willReadFrequently: true })
      globalCanvasManager.setOverlayContext(this.overlayCtx)
      this.syncColor()
      this.clear()
      this.registerCommandHandlers()
    },

    registerCommandHandlers() {
      window.addEventListener('resize', () => {
        const parentEl = this.$refs.overlay.parentElement.parentElement
        this.resizeCanvas(parentEl.offsetWidth, parentEl.offsetHeight)
      })

      inputHandler.onCommand('cursor-update', (e) => {
        this.updateCursor(e)
      })

      inputHandler.onCommand('cursor-hide', () => {
        this.hideCursor()
      })
    },

    getContext() {
      return this.overlayCtx
    },

    updateCursor(event) {
      if (!globalCursorManager) {
        return
      }

      if (event) {
        globalCursorManager.updateFromMouseEvent(event)
      }

      const selectedTool = globalState.get('selectedTool')
      if (selectedTool?.name === 'Eyedropper') {
        return
      }

      if (selectedTool?.name === 'Text') {
        const coordinates = globalCursorManager.getCurrentCoordinates()
        if (coordinates && selectedTool.isOnEdge(coordinates)) {
          this.$refs.overlay.style.cursor = 'grab'
        } else {
          this.$refs.overlay.style.cursor = 'text'
        }
        return
      }

      if (!this.isBrushSelected()) {
        return
      }

      this.drawCursorMarker()
    },

    hideCursor() {
      this.clear()
    },

    clear() {
      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    },

    drawCursorMarker() {
      if (!globalCursorManager) return
      this.clear()
      const coordinates = globalCursorManager.getCurrentCoordinates()
      this.overlayCtx.save()
      const radius = globalState.get('selectedSize') / 2
      this.overlayCtx.beginPath()
      this.overlayCtx.arc(coordinates.x, coordinates.y, radius, 0, 2 * Math.PI)
      this.overlayCtx.fill()
      this.overlayCtx.strokeStyle = 'rgba(150, 150, 150, 0.6)'
      this.overlayCtx.lineWidth = 1
      this.overlayCtx.stroke()
      this.overlayCtx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      this.overlayCtx.shadowBlur = 4
      this.overlayCtx.shadowOffsetX = 0
      this.overlayCtx.shadowOffsetY = 0
      this.overlayCtx.beginPath()
      this.overlayCtx.arc(coordinates.x, coordinates.y, radius, 0, 2 * Math.PI)
      this.overlayCtx.stroke()
      this.overlayCtx.restore()
    },

    syncColor() {
      const color = globalState.get('selectedColor')
      if (this.overlayCtx) {
        this.overlayCtx.strokeStyle = color.hex
        this.overlayCtx.fillStyle = color.hex
      }
    },

    syncBrush() {
      if (this.isBrushSelected() && globalCursorManager) {
        this.drawCursorMarker()
      }
    },

    isBrushSelected() {
      return globalState.get('selectedTool')?.name === 'Brush'
    },

    resizeCanvas(width, height) {
      let drawing = null
      if (this.overlayCtx.canvas.width > 0 && this.overlayCtx.canvas.height > 0) {
        drawing = this.overlayCtx.getImageData(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
      }
      this.overlayCtx.canvas.width = width
      this.overlayCtx.canvas.height = height
      if (drawing) {
        this.overlayCtx.putImageData(drawing, 0, 0)
      }
    }
  }
}
</script>

<style scoped>
.overlay {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>
