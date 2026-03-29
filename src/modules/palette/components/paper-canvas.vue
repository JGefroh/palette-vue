<template>
  <div ref="paper" class="paper">
    <canvas ref="overlay" class="overlay"></canvas>
    <canvas ref="drawing" class="drawing"></canvas>
  </div>
</template>

<script>
import { Pencil } from '../tools/pencil.js'
import { CursorManager } from '../tools/cursor-manager.js'

export default {
  props: {
    color: {
      type: Object,
      default: () => ({ hex: '#000000' })
    },
    brushSize: {
      type: Number,
      default: 10
    }
  },
  emits: ['on-initialize', 'on-stroke-start'],
  data() {
    return {
      overlayCtx: null,
      drawingCtx: null,
      defaultColor: 'black',
      defaultLineWidth: 10,
      lineWidth: 10,
      tool: null,
      tools: [],
      cursorManager: null
    }
  },
  watch: {
    color(newColor) {
      if (this.drawingCtx && this.overlayCtx) {
        if (newColor) {
          this.drawingCtx.strokeStyle = newColor.hex
          this.overlayCtx.strokeStyle = newColor.hex
          this.overlayCtx.fillStyle = newColor.hex
        } else {
          this.drawingCtx.strokeStyle = this.defaultColor
          this.overlayCtx.strokeStyle = this.defaultColor
        }
      }
    },
    brushSize(newSize) {
      this.lineWidth = newSize
      if (this.drawingCtx) {
        this.drawingCtx.lineWidth = this.lineWidth
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
      this.$emit('on-initialize', this.drawingCtx)
      this.initializeTools()
      this.initializeListeners()
      this.tool = this.tools[0]

      // Set initial context properties
      this.lineWidth = this.brushSize
      this.drawingCtx.lineWidth = this.lineWidth
      this.drawingCtx.lineCap = 'round'
      this.drawingCtx.lineJoin = 'round'

      // Set initial color
      if (this.color) {
        this.drawingCtx.strokeStyle = this.color.hex
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
      paper.addEventListener('mousemove', this.updateCursor.bind(this))
      paper.addEventListener('mousedown', this.start.bind(this))
      paper.addEventListener('mousemove', this.process.bind(this))
      paper.addEventListener('mouseup', this.end.bind(this))
    },

    updateCursor(event) {
      this.cursorManager.updateFromMouseEvent(event)
      const coordinates = this.cursorManager.getCurrentCoordinates()
      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
      this.overlayCtx.save()
      this.overlayCtx.strokeStyle = this.overlayCtx.fillStyle
      this.overlayCtx.beginPath()
      this.overlayCtx.arc(coordinates.x, coordinates.y, this.lineWidth / 2, 0, 2 * Math.PI)
      this.overlayCtx.fill()
      this.overlayCtx.stroke()
      this.overlayCtx.restore()
    },

    initializeTools() {
      this.tools = [
        new Pencil({
          drawingCtx: this.drawingCtx,
          overlayCtx: this.overlayCtx,
          getLineWidth: () => this.lineWidth
        })
      ]
    },

    start(event) {
      event.preventDefault()
      this.cursorManager.updateFromMouseEvent(event)
      this.cursorManager.setMouseDown(true)
      this.$emit('on-stroke-start')
      this.tool.start(this.cursorManager.getCurrentCoordinates())
    },

    process(event) {
      event.preventDefault()
      this.cursorManager.updateFromMouseEvent(event)
      // Only process if we're in an active stroke
      if (!this.cursorManager.getIsMouseDown()) {
        return
      }
      const coordinates = this.cursorManager.getCurrentCoordinates()
      if (this.tool.preProcess) {
        this.tool.preProcess(coordinates)
      }
      this.tool.process(coordinates)
      if (this.tool.postProcess) {
        this.tool.postProcess(coordinates)
      }
    },

    end(event) {
      event.preventDefault()
      this.cursorManager.updateFromMouseEvent(event)
      this.tool.end(this.cursorManager.getCurrentCoordinates())
      this.cursorManager.setMouseDown(false)
    },

    resizeCanvas(context) {
      let drawing = null
      if (context.canvas.width > 0 && context.canvas.height > 0) {
        drawing = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
      }
      const rect = context.canvas.parentElement.getBoundingClientRect()
      context.canvas.width = rect.width
      context.canvas.height = rect.height
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
