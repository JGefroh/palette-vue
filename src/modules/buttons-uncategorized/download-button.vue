<template>
  <button class="tool" @click="download" title="Download">
    <span class="fa fa-fw fa-download"></span>
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { globalState } from '../persistence/global-state.js'

export default {
  methods: {
    download() {
      const drawingCanvas = globalCanvasManager.getDrawingContext()?.canvas
      if (!drawingCanvas) return

      const selectedTab = globalState.get('selectedTab')
      const tabName = selectedTab?.name || 'Canvas'
      const link = document.createElement('a')
      const filename = tabName
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
.tool {
  padding: 8px 12px;
  border: 1px solid rgba(185, 185, 185, 0.5);
  background-color: transparent;
  color: #34495e;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  transition: all 0.2s ease;
}

.tool:hover {
  background-color: rgba(52, 73, 94, 0.1);
  border-color: rgba(185, 185, 185, 0.7);
}

.tool.active {
  background-color: rgba(52, 73, 94, 0.15);
  border-color: rgba(52, 73, 94, 0.5);
  color: #34495e;
}
</style>
