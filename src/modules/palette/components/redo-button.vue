<template>
  <button class="tool" @click="redo" title="Redo">
    <span class="fa fa-fw fa-repeat"></span>
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'

export default {
  methods: {
    redo() {
      globalCanvasManager.redoDrawing()
    }
  }
}
</script>
