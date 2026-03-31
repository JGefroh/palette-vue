<template>
  <button class="tool" @click="undo" title="Undo">
    <span class="fa fa-fw fa-undo"></span>
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'

export default {
  methods: {
    undo() {
      globalCanvasManager.undoDrawing()
    }
  }
}
</script>
