<template>
  <div ref="paper" class="paper">
    <div class="viewport" :style="viewportStyle">
      <canvas ref="overlay" class="overlay"></canvas>
      <canvas ref="drawing" class="drawing"></canvas>
    </div>
  </div>
</template>

<script>
import { CursorManager } from '../input/cursor-manager.js'
import { globalState } from '../persistence/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../input/input-handler.js'
import logoImage from '../../assets/logo.png'
export default {
  emits: ['on-initialize', 'on-stroke-start'],
  data() {
    return {
      overlayCtx: null,
      drawingCtx: null,
      cursorManager: null,
      zoom: 1,
      panX: 0,
      panY: 0
    }
  },
  watch: {
    canvasConfiguration() {
      this.syncTab();
    },
    drawingConfiguration() {
      this.syncBrush();
      this.syncColor();
      this.updateCursor();
    }
  },
  computed: {
    canvasConfiguration() {
      return {
        selectedTab: globalState.get('selectedTab')
      }
    },
    drawingConfiguration() {
      return {
        selectedColor: globalState.get('selectedColor'),
        selectedSize: globalState.get('selectedSize')
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
      this.syncColor();
    })
  },
  methods: {
    initialize() {
      this.overlayCtx = this.$refs.overlay.getContext('2d', { willReadFrequently: true })
      this.drawingCtx = this.$refs.drawing.getContext('2d', { willReadFrequently: true })

      this.resizeCanvas(this.drawingCtx)
      this.resizeCanvas(this.overlayCtx)

      this.cursorManager = new CursorManager(this.$refs.drawing)
      globalCanvasManager.setContexts(this.drawingCtx, this.overlayCtx)
      inputHandler.registerPaperElement(this.$refs.paper, this.cursorManager)
      this.registerCommandHandlers()
      this.$emit('on-initialize', this.cursorManager)

      // Clear the overlay to make it transparent
      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)

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
      window.addEventListener('resize', () => {
        this.resizeCanvas(this.overlayCtx)
        this.resizeCanvas(this.drawingCtx)
      })

      inputHandler.onCommand('image-drop', (e) => {
        this.fitDroppedImage(e)
      })

      inputHandler.onCommand('cursor-update', (e) => {
        this.updateCursor(e)
      })

      inputHandler.onCommand('cursor-hide', () => {
        this.hideCursor()
      })

      inputHandler.onCommand('zoom', (e) => {
        this.adjustZoom(e)
      })

      inputHandler.onCommand('pan', (e) => {
        this.adjustPan(e)
      })
    },

    updateCursor(event) {
      if (event) {
        this.cursorManager.updateFromMouseEvent(event)
      }

      // Only show cursor marker for Brush tool
      if (!globalState.get('selectedTool') || globalState.get('selectedTool').constructor.name !== 'Brush') {
        return
      }

      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
      const coordinates = this.cursorManager.getCurrentCoordinates()
      this.overlayCtx.save()
      this.overlayCtx.beginPath()
      this.overlayCtx.arc(coordinates.x, coordinates.y, globalState.get('selectedSize') / 2, 0, 2 * Math.PI)
      this.overlayCtx.fill()
      this.overlayCtx.restore()
    },

    hideCursor() {
      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    },
    fitImage(src) {
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

    fitDroppedImage(event) {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) return
      this.fitImage(URL.createObjectURL(file))
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
    resizeCanvas(context) {
      let drawing = null
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        drawing = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
      }
      context.canvas.width = this.$refs.paper.offsetWidth
      context.canvas.height = this.$refs.paper.offsetHeight
      if (drawing) {
        context.putImageData(drawing, 0, 0)
      }
    },
    syncColor() {
      let color = globalState.get('selectedColor')
      if (this.drawingCtx && this.overlayCtx) {
        this.drawingCtx.strokeStyle = color.hex
        this.drawingCtx.fillStyle = color.hex
        this.overlayCtx.strokeStyle = color.hex
        this.overlayCtx.fillStyle = color.hex
      }
    },
    syncBrush() {
      if (globalState.get('selectedTool') && globalState.get('selectedTool').constructor.name === 'Brush' && this.cursorManager) {
        this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
        const coordinates = this.cursorManager.getCurrentCoordinates()
        this.overlayCtx.save()
        this.overlayCtx.beginPath()
        this.overlayCtx.arc(coordinates.x, coordinates.y, globalState.get('selectedSize') / 2, 0, 2 * Math.PI)
        this.overlayCtx.fill()
        this.overlayCtx.restore()
      }

      this.drawingCtx.lineWidth = globalState.get('selectedSize')
      this.drawingCtx.lineCap = 'round'
      this.drawingCtx.lineJoin = 'round'
    },
    syncTab() {
      const ctx = globalCanvasManager.getDrawingContext()
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      globalCanvasManager.loadCanvas(globalState.get('selectedTab').id)
    }
  }
}
</script>

<style scoped>
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

canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
  width: 100%;
  height: 100%;
}

.drawing {
  z-index: 1;
  background-color: white;
}

.overlay {
  z-index: 2;
}
</style>
