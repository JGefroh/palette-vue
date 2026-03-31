<template>
  <button class="tool clear-button" @click="clear" title="Clear canvas">
    <span class="fa fa-fw fa-trash"></span> Clear
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'

export default {
  methods: {
    clear() {
      if (!confirm('Are you sure?')) return

      const ctx = globalCanvasManager.getDrawingContext()
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        globalCanvasManager.save()
      }
    }
  }
}
</script>

<style scoped>
.clear-button {
  margin-left: auto;
}
</style>
