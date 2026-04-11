<template>
  <div class="drawing-container">
    <canvas ref="drawing" class="drawing"></canvas>
    <div class="canvas-dimensions">{{ canvasWidth }}px × {{ canvasHeight }}px</div>
  </div>
</template>

<script>
import { globalState } from '../persistence/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../input/input-handler.js'

export default {
  data() {
    return {
      drawingCtx: null,
      canvasWidth: 0,
      canvasHeight: 0
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
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initialize()
      this.syncColor()
    })
  },
  methods: {
    initialize() {
      this.drawingCtx = this.$refs.drawing.getContext('2d', { willReadFrequently: true })
      globalCanvasManager.setDrawingContext(this.drawingCtx)
      this.resizeCanvas()
      this.registerCommandHandlers()
    },

    getContext() {
      return this.drawingCtx
    },

    registerCommandHandlers() {
      window.addEventListener('resize', () => {
        this.resizeCanvas()
      })
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
    }
  }
}
</script>

<style scoped>
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
  flex: 1;
  cursor: crosshair;
  z-index: 1;
  background-color: white;
}

.canvas-dimensions {
  font-family: monospace;
  font-size: 16px;
  color: #888;
  font-weight: 500;
  padding: 4px 8px;
  background-color: #c8c8c8;
  text-align: left;
}
</style>
