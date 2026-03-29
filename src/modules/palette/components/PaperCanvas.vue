<template>
  <div ref="paper" class="paper">
    <canvas ref="overlay" class="overlay"></canvas>
    <canvas ref="drawing" class="drawing"></canvas>
  </div>
</template>

<script>
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
  data() {
    return {
      overlayCtx: null,
      drawingCtx: null,
      history: [],
      future: [],
      defaultColor: 'black',
      defaultLineWidth: 10,
      lineWidth: 10,
      isMouseDown: false,
      tool: null,
      tools: []
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

      this.initializeCrayon()
      this.initializeTools()
      this.initializeListeners()
      this.tool = this.tools[0]

      // Set initial color and line width
      if (this.color) {
        this.drawingCtx.strokeStyle = this.color.hex
        this.overlayCtx.strokeStyle = this.color.hex
        this.overlayCtx.fillStyle = this.color.hex
      }
      this.lineWidth = this.brushSize
      this.drawingCtx.lineWidth = this.lineWidth
      this.drawingCtx.lineCap = 'round'
      this.drawingCtx.lineJoin = 'round'

      // Clear the overlay to make it transparent
      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    },

    initializeListeners() {
      window.addEventListener('resize', () => {
        this.resizeCanvas(this.overlayCtx)
        this.resizeCanvas(this.drawingCtx)
      })

      const paper = this.$refs.paper
      paper.addEventListener('mousedown', this.start.bind(this))
      paper.addEventListener('mousemove', this.process.bind(this))
      paper.addEventListener('mouseup', this.end.bind(this))
    },

    initializeCrayon() {
      this.drawingCtx.lineCap = 'round'
      this.drawingCtx.lineWidth = this.lineWidth
    },

    initializeTools() {
      this.tools = [
        {
          label: 'Pencil',
          start: (coordinates) => {
            if (!this.isMouseDown) {
              this.saveState(this.history)
              this.branchFuture()
              this.drawingCtx.beginPath()
              this.drawingCtx.moveTo(coordinates.x, coordinates.y)
            }
            this.isMouseDown = true
          },
          preProcess: (coordinates) => {
            this.overlayCtx.save()
            this.overlayCtx.fillStyle = '#FFFFFF'
            this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
            this.overlayCtx.restore()
          },
          process: (coordinates) => {
            this.overlayCtx.save()
            this.overlayCtx.strokeStyle = '#000000'
            this.overlayCtx.beginPath()
            this.overlayCtx.arc(coordinates.x, coordinates.y, this.lineWidth / 2, 0, 2 * Math.PI, false)
            this.overlayCtx.fill()
            this.overlayCtx.stroke()
            this.overlayCtx.restore()
            if (this.isMouseDown) {
              this.drawingCtx.lineTo(coordinates.x, coordinates.y)
              this.drawingCtx.stroke()
              this.drawingCtx.beginPath()
              this.drawingCtx.moveTo(coordinates.x, coordinates.y)
            }
          },
          end: (coordinates) => {
            this.drawingCtx.lineTo(coordinates.x, coordinates.y)
            this.drawingCtx.stroke()
            this.isMouseDown = false
          }
        }
      ]
    },

    start(event) {
      event.preventDefault()
      this.tool.start(this.getMousePosition(event))
    },

    process(event) {
      event.preventDefault()
      // Only process if we're in an active stroke
      if (!this.isMouseDown) {
        return
      }
      const coordinates = this.getMousePosition(event)
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
      this.tool.end(this.getMousePosition(event))
    },

    branchFuture() {
      this.future = []
    },

    undo() {
      if (this.history.length) {
        const previousState = this.history.pop()
        this.saveState(this.future)
        this.drawingCtx.putImageData(previousState, 0, 0)
      }
    },

    redo() {
      if (this.future.length) {
        const nextState = this.future.pop()
        this.saveState(this.history)
        this.drawingCtx.putImageData(nextState, 0, 0)
      }
    },

    saveState(where) {
      where.push(this.getState(this.drawingCtx))
    },

    getState(context) {
      return context.getImageData(0, 0, context.canvas.width, context.canvas.height)
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

    getMousePosition(event) {
      const bounds = this.drawingCtx.canvas.getBoundingClientRect()
      return {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      }
    }
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
