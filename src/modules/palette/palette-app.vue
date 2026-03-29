<template>
  <div class="palette-app">
    <div class="navigation">
      Palette v0.0.2
      <a href="http://www.jgefroh.com" style="float: right;">Created by Joseph Gefroh</a>
    </div>
    <div class="toolbar">
      <button class="tool" :class="{ unsaved: unsavedChanges }" @click="save" title="Save">
        <span class="fa fa-fw fa-save"></span> Save
      </button>
      <button class="tool" @click="undo" title="Undo">
        <span class="fa fa-fw fa-undo"></span>
      </button>
      <button class="tool" @click="redo" title="Redo">
        <span class="fa fa-fw fa-repeat"></span>
      </button>
      <button
        v-for="size in brushSizes"
        :key="size"
        class="tool"
        :class="{ active: selectedSize === size }"
        @click="selectedSize = size"
      >
        <span class="fa fa-fw fa-circle"></span> {{ size }}
      </button>
      <button
        v-for="(tool, index) in toolList"
        :key="tool.name"
        class="tool"
        :class="{ active: selectedToolIndex === index }"
        @click="selectedToolIndex = index"
        :title="tool.name"
      >
        <span v-if="tool.icon" class="fa fa-fw" :class="tool.icon"></span>
        <span v-else>{{ tool.name }}</span>
      </button>
      <button class="tool clear-button" @click="clear" title="Clear canvas" style="margin-left: auto;">
        <span class="fa fa-fw fa-trash"></span> Clear
      </button>
    </div>
    <ColorPalette v-model="selectedColor" />
    <PaperCanvas ref="canvas" :color="selectedColor" :brush-size="selectedSize" :tool="activeTool" @on-initialize="setupStateManager" @on-stroke-start="saveState" @on-change="detectChange" />
  </div>
</template>

<script>
import PaperCanvas from './components/paper-canvas.vue'
import ColorPalette from './components/color-palette.vue'
import { Pencil } from './tools/pencil.js'
import { Rectangle } from './tools/rectangle.js'
import { Circle } from './tools/circle.js'
import { CanvasStateManager } from './tools/canvas-state-manager.js'
import { CanvasClearer } from './tools/canvas-clearer.js'

export default {
  components: {
    PaperCanvas,
    ColorPalette
  },
  data() {
    return {
      selectedColor: { label: 'Turquoise', hex: '#1abc9c' },
      selectedSize: 10,
      brushSizes: [5, 10, 15, 20, 50, 100],
      selectedToolIndex: 0,
      toolList: [
        { name: 'Pencil', icon: null },
        { name: 'Rectangle', icon: 'fa-square' },
        { name: 'Circle', icon: 'fa-circle' }
      ],
      tools: [],
      canvasStateManager: null,
      canvasClearer: null,
      unsavedChanges: false
    }
  },
  computed: {
    activeTool() {
      return this.tools[this.selectedToolIndex] || null
    }
  },
  watch: {
    canvasStateManager: {
      handler() {
        this.unsavedChanges = this.canvasStateManager?.hasUnsavedChanges() ?? false
      },
      deep: true
    }
  },
  methods: {
    setupStateManager({ drawingCtx, overlayCtx }) {
      this.tools = [
        new Pencil({
          drawingCtx,
          overlayCtx,
          getLineWidth: () => this.$refs.canvas.lineWidth
        }),
        new Rectangle({
          drawingCtx,
          overlayCtx,
          getLineWidth: () => this.$refs.canvas.lineWidth
        }),
        new Circle({
          drawingCtx,
          overlayCtx,
          getLineWidth: () => this.$refs.canvas.lineWidth
        })
      ]
      this.selectedToolIndex = 0
      this.canvasStateManager = new CanvasStateManager({ drawingCtx })
      this.canvasClearer = new CanvasClearer(drawingCtx)
      this.canvasStateManager.load()
    },
    saveState() {
      this.canvasStateManager?.saveState()
      this.canvasStateManager?.branchFuture()
      this.unsavedChanges = this.canvasStateManager?.hasUnsavedChanges() ?? false
    },
    save() {
      this.canvasStateManager?.save()
      this.unsavedChanges = false
    },
    undo() {
      this.canvasStateManager?.undo()
      this.unsavedChanges = this.canvasStateManager?.hasUnsavedChanges() ?? false
    },
    redo() {
      this.canvasStateManager?.redo()
      this.unsavedChanges = this.canvasStateManager?.hasUnsavedChanges() ?? false
    },
    detectChange() {
      this.unsavedChanges = true
    },
    clear() {
      if (this.canvasClearer?.clear()) {
        this.unsavedChanges = true
      }
    }
  }
}
</script>

<style scoped>
.palette-app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.navigation {
  background-color: #34495e;
  color: white;
  padding: 12px 20px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navigation a {
  color: white;
  text-decoration: none;
}

.navigation a:hover {
  text-decoration: underline;
}

.toolbar {
  background-color: #ecf0f1;
  padding: 12px 20px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #bdc3c7;
}

.tool {
  padding: 8px 12px;
  border: 1px solid #95a5a6;
  background-color: white;
  color: #34495e;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tool:hover {
  background-color: #34495e;
  color: white;
}

.tool.active {
  background-color: #34495e;
  color: white;
}

.tool.unsaved {
  box-shadow: inset 0 -3px 0 #e74c3c;
}
</style>
