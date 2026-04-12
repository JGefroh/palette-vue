<template>
  <div class="minimap-container">
    <div v-if="canvasWidth && canvasHeight" class="minimap-indicator" :class="{ 'is-hidden': canvasFullyVisibleInView }" :style="{ width: indicatorWidth + 'px', height: indicatorHeight + 'px' }">
      <div class="indicator-dot" :style="{ left: indicatorDotPercentX + '%', top: indicatorDotPercentY + '%' }"></div>
    </div>
  </div>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'

export default {
  props: {
    zoom: {
      type: Number,
      required: true
    },
    panX: {
      type: Number,
      required: true
    },
    panY: {
      type: Number,
      required: true
    },
    paperWidth: {
      type: Number,
      required: true
    },
    paperHeight: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      canvasWidth: 0,
      canvasHeight: 0,
      debounceTimeout: null
    }
  },
  watch: {
    canvasWidth() {
      // Force recomputation of indicator dimensions
    },
    canvasHeight() {
      // Force recomputation of indicator dimensions
    }
  },
  mounted() {
    this.$nextTick(() => {
      const drawingCtx = globalCanvasManager.getDrawingContext()
      if (drawingCtx) {
        this.canvasWidth = drawingCtx.canvas.width
        this.canvasHeight = drawingCtx.canvas.height
      }
    })

    setInterval(() => {
      const drawingCtx = globalCanvasManager.getDrawingContext()
      if (drawingCtx) {
        this.canvasWidth = drawingCtx.canvas.width
        this.canvasHeight = drawingCtx.canvas.height
      }
    }, 500)
  },
  computed: {
    isHovered() {
      return this.indicatorHovered || this.minimapHovered
    },
    indicatorWidth() {
      if (this.canvasWidth >= this.canvasHeight) {
        return 32
      }
      return 32 * (this.canvasWidth / this.canvasHeight)
    },
    indicatorHeight() {
      if (this.canvasHeight >= this.canvasWidth) {
        return 32
      }
      return 32 * (this.canvasHeight / this.canvasWidth)
    },
    indicatorDotPercentX() {
      if (this.canvasWidth === 0 || !this.canvasWidth) return 50
      const viewportCenterX = -(this.panX - this.paperWidth / 2) / this.zoom
      const percent = (viewportCenterX / this.canvasWidth) * 100
      const clamped = Math.max(0, Math.min(100, percent))
      return isNaN(clamped) ? 50 : clamped
    },
    indicatorDotPercentY() {
      if (this.canvasHeight === 0 || !this.canvasHeight) return 50
      const viewportCenterY = -(this.panY - this.paperHeight / 2) / this.zoom
      const percent = (viewportCenterY / this.canvasHeight) * 100
      const clamped = Math.max(0, Math.min(100, percent))
      return isNaN(clamped) ? 50 : clamped
    },
    canvasFullyVisibleInView() {
      return (this.canvasWidth * this.zoom <= this.paperWidth) &&
             (this.canvasHeight * this.zoom <= this.paperHeight)
    }
  },
  methods: {
    updateCanvasDimensions() {
      const drawingCtx = globalCanvasManager.getDrawingContext()
      if (drawingCtx) {
        this.canvasWidth = drawingCtx.canvas.width
        this.canvasHeight = drawingCtx.canvas.height
      }
    }
  },
}
</script>

<style scoped lang="scss">
.minimap-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  color: #999;
}

.minimap-indicator {
  transition: opacity 0.2s ease;
  position: relative;
  border: 1px solid #999;
  opacity: 0.6;
  border-radius: 2px;

  &:hover {
    opacity: 0.8;
  }

  &.is-hidden {
    opacity: 0;
    pointer-events: none;
  }
}

.indicator-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: #555;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
</style>
