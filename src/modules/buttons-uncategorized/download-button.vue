<template>
  <button class="tool" @click="download" title="Download">
    <span class="fa fa-fw fa-download"></span>
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { globalState } from '../persistence/global-state.js'
import { inputHandler } from '../input/input-handler.js'

export default {
  mounted() {
    inputHandler.onCommand('download', () => {
      this.download()
    })
  },
  methods: {
    download() {
      const drawingCanvas = globalCanvasManager.getDrawingContext()?.canvas
      if (!drawingCanvas) return

      const bgCanvas = document.createElement('canvas')
      bgCanvas.width = drawingCanvas.width
      bgCanvas.height = drawingCanvas.height
      const bgCtx = bgCanvas.getContext('2d')
      bgCtx.fillStyle = '#FFFFFF'
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height)
      bgCtx.drawImage(drawingCanvas, 0, 0)

      const selectedTab = globalState.get('selectedTab')
      const tabName = selectedTab?.name || 'Canvas'
      const link = document.createElement('a')
      const filename = tabName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      link.download = `${filename}.png`
      link.href = bgCanvas.toDataURL()
      link.click()
    }
  }
}
</script>

<style scoped lang="scss">
.tool {
  padding: 8px 12px;
  border: $border-default;
  background-color: transparent;
  color: $color-primary;
  border-radius: $radius-button;
  cursor: pointer;
  font-family: $font-primary;
  font-size: 12px;
  transition: $transition-default;
}

.tool:hover {
  background-color: $btn-hover-bg;
  border-color: $border-color-hover;
}

.tool.active {
  background-color: $btn-active-bg;
  border-color: $border-color-active;
  color: $color-primary;
}
</style>
