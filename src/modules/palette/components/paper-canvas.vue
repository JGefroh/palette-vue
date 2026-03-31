<template>
  <div ref="paper" class="paper">
    <div class="viewport" :style="viewportStyle">
      <canvas ref="overlay" class="overlay"></canvas>
      <canvas ref="drawing" class="drawing"></canvas>
    </div>
  </div>
</template>

<script>
import { CursorManager } from '../utilities/cursor-manager.js'

export default {
  props: {
    color: {
      type: Object,
      default: () => ({ hex: '#000000' })
    },
    brushSize: {
      type: Number,
      default: 10
    },
    activeTool: {
      type: Object,
      default: null
    }
  },
  emits: ['on-initialize', 'on-stroke-start', 'on-change'],
  data() {
    return {
      overlayCtx: null,
      drawingCtx: null,
      defaultColor: 'black',
      defaultLineWidth: 10,
      lineWidth: 10,
      cursorManager: null,
      zoom: 1,
      panX: 0,
      panY: 0
    }
  },
  watch: {
    color(newColor) {
      if (this.drawingCtx && this.overlayCtx) {
        if (newColor) {
          this.drawingCtx.strokeStyle = newColor.hex
          this.drawingCtx.fillStyle = newColor.hex
          this.overlayCtx.strokeStyle = newColor.hex
          this.overlayCtx.fillStyle = newColor.hex
        } else {
          this.drawingCtx.strokeStyle = this.defaultColor
          this.drawingCtx.fillStyle = this.defaultColor
          this.overlayCtx.strokeStyle = this.defaultColor
        }
      }
      // Redraw cursor marker if Pencil tool is selected
      if (this.activeTool && this.activeTool.constructor.name === 'Pencil' && this.cursorManager) {
        this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
        const coordinates = this.cursorManager.getCurrentCoordinates()
        this.overlayCtx.save()
        this.overlayCtx.beginPath()
        this.overlayCtx.arc(coordinates.x, coordinates.y, this.lineWidth / 2, 0, 2 * Math.PI)
        this.overlayCtx.fill()
        this.overlayCtx.restore()
      }
    },
    brushSize(newSize) {
      this.lineWidth = newSize
      if (this.drawingCtx) {
        this.drawingCtx.lineWidth = this.lineWidth
        this.overlayCtx.lineWidth = this.lineWidth
      }
    }
  },
  computed: {
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
      this.overlayCtx = this.$refs.overlay.getContext('2d', { willReadFrequently: true })
      this.drawingCtx = this.$refs.drawing.getContext('2d', { willReadFrequently: true })

      this.resizeCanvas(this.drawingCtx)
      this.resizeCanvas(this.overlayCtx)

      this.cursorManager = new CursorManager(this.$refs.drawing)
      this.$emit('on-initialize', { drawingCtx: this.drawingCtx, overlayCtx: this.overlayCtx })
      this.initializeListeners()

      // Set initial context properties
      this.lineWidth = this.brushSize
      this.drawingCtx.lineWidth = this.lineWidth
      this.drawingCtx.lineCap = 'round'
      this.drawingCtx.lineJoin = 'round'

      // Set initial color
      if (this.color) {
        this.drawingCtx.strokeStyle = this.color.hex
        this.drawingCtx.fillStyle = this.color.hex
        this.overlayCtx.strokeStyle = this.color.hex
        this.overlayCtx.fillStyle = this.color.hex
      }

      // Clear the overlay to make it transparent
      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    },

    initializeListeners() {
      window.addEventListener('resize', () => {
        this.resizeCanvas(this.overlayCtx)
        this.resizeCanvas(this.drawingCtx)
      })

      const paper = this.$refs.paper
      paper.addEventListener('dragover', (e) => e.preventDefault())
      paper.addEventListener('drop', this.fitDroppedImage.bind(this))
      paper.addEventListener('mousemove', this.updateCursor.bind(this))
      paper.addEventListener('mouseleave', this.hideCursor.bind(this))
      paper.addEventListener('mousedown', this.start.bind(this))
      paper.addEventListener('mousemove', this.process.bind(this))
      paper.addEventListener('mouseup', this.end.bind(this))
      paper.addEventListener('wheel', this.onWheel.bind(this), { passive: false })
    },

    updateCursor(event) {
      this.cursorManager.updateFromMouseEvent(event)

      // Only show cursor marker for Pencil tool
      if (!this.activeTool || this.activeTool.constructor.name !== 'Pencil') {
        return
      }

      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
      const coordinates = this.cursorManager.getCurrentCoordinates()
      this.overlayCtx.save()
      this.overlayCtx.beginPath()
      this.overlayCtx.arc(coordinates.x, coordinates.y, this.lineWidth / 2, 0, 2 * Math.PI)
      this.overlayCtx.fill()
      this.overlayCtx.restore()
    },

    hideCursor() {
      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    },

    start(event) {
      event.preventDefault()
      this.cursorManager.updateFromMouseEvent(event)
      this.cursorManager.setMouseDown(true)
      this.$emit('on-stroke-start')
      this.activeTool.start(this.cursorManager.getCurrentCoordinates())
    },

    process(event) {
      event.preventDefault()
      this.cursorManager.updateFromMouseEvent(event)
      // Only process if we're in an active stroke
      if (!this.cursorManager.getIsMouseDown()) {
        return
      }
      const coordinates = this.cursorManager.getCurrentCoordinates()
      if (this.activeTool.preProcess) {
        this.activeTool.preProcess(coordinates)
      }
      this.activeTool.process(coordinates)
      if (this.activeTool.postProcess) {
        this.activeTool.postProcess(coordinates)
      }
      this.$emit('on-change')
    },

    end(event) {
      event.preventDefault()
      this.cursorManager.updateFromMouseEvent(event)
      this.activeTool.end(this.cursorManager.getCurrentCoordinates())
      this.cursorManager.setMouseDown(false)
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
        this.$emit('on-change')
      }
      img.src = src
    },

    fitDroppedImage(event) {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) return
      this.fitImage(URL.createObjectURL(file))
    },

    onWheel(event) {
      if (!event.ctrlKey) return
      event.preventDefault()
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
