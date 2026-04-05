<template>
  <button class="tool" @click="redo" title="Redo">
    <span class="fa fa-fw fa-repeat"></span>
  </button>
</template>

<script>
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../utilities/input-handler.js'

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
