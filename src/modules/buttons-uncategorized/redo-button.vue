<template>
  <button class="tool" @click="redo" title="Redo">
    <span class="fa fa-fw fa-arrow-rotate-right"></span>
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../input/input-handler.js'

export default {
  mounted() {
    inputHandler.onCommand('redo', () => this.redo());
  },
  methods: {
    redo() {
      globalCanvasManager.redoDrawing()
    }
  }
}
</script>
