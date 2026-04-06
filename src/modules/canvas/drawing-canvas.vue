<template>
  <canvas ref="drawing" class="drawing"></canvas>
</template>

<script>
import { globalState } from '../persistence/global-state.js'
import { inputHandler } from '../input/input-handler.js'

export default {
  data() {
    return {
      drawingCtx: null
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

    resizeCanvas() {
      let drawing = null
      if (this.drawingCtx.canvas.width > 0 && this.drawingCtx.canvas.height > 0) {
        drawing = this.drawingCtx.getImageData(0, 0, this.drawingCtx.canvas.width, this.drawingCtx.canvas.height)
      }
      const parentEl = this.$refs.drawing.parentElement.parentElement
      this.drawingCtx.canvas.width = parentEl.offsetWidth
      this.drawingCtx.canvas.height = parentEl.offsetHeight
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
.drawing {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: white;
}
</style>
