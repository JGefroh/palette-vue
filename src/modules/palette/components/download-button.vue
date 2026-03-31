<template>
  <button class="tab tab-download" @click="download" title="Download">
    <span class="fa fa-fw fa-download"></span>
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'

export default {
  props: {
    tabName: {
      type: String,
      required: true
    }
  },
  methods: {
    download() {
      const drawingCanvas = globalCanvasManager.getDrawingContext()?.canvas
      if (!drawingCanvas) return

      const link = document.createElement('a')
      const filename = this.tabName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      link.download = `${filename}.png`
      link.href = drawingCanvas.toDataURL()
      link.click()
    }
  }
}
</script>

<style scoped>
.tab-download {
  margin-left: auto;
}
</style>
