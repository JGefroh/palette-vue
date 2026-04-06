<template>
  <div ref="paper" class="paper">
    <div class="viewport" :style="viewportStyle">
      <overlay-canvas ref="overlayCanvas"></overlay-canvas>
      <drawing-canvas ref="drawingCanvas"></drawing-canvas>
    </div>
  </div>
</template>

<script>
import OverlayCanvas from './overlay-canvas.vue'
import DrawingCanvas from './drawing-canvas.vue'
import { globalCursorManager } from '../input/global-cursor-manager.js'
import { globalState } from '../persistence/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../input/input-handler.js'
import logoImage from '../../assets/logo.png'
export default {
  components: {
    OverlayCanvas,
    DrawingCanvas
  },
  emits: ['on-initialize', 'on-stroke-start'],
  data() {
    return {
      zoom: 1,
      panX: 0,
      panY: 0
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
      inputHandler.onCommand('image-drop', (e) => {
        this.fitDroppedImage(e)
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
</style>
