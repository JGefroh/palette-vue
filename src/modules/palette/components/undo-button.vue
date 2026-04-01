<template>
  <button class="tool" @click="undo" title="Undo">
    <span class="fa fa-fw fa-undo"></span>
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../utilities/input-handler.js'

export default {
  mounted() {
    inputHandler.registerCommand('cmd+z', 'undo', () => this.undo());
  },
  methods: {
    undo() {
      globalCanvasManager.undoDrawing()
    }
  }
}
</script>
