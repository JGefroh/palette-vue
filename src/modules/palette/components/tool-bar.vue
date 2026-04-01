<template>
  <div class="toolbar">
    <HelpButton />
    <div class="divider"></div>
    <UndoButton />
    <RedoButton />
    <div class="divider"></div>
    <button
      v-for="size in brushSizes"
      :key="size"
      class="tool"
      :class="{ active: globalState.get('selectedSize') === size }"
      @click="globalState.set('selectedSize', size)"
    >
      <span class="fa fa-fw fa-circle"></span> {{ size }}
    </button>
    <div class="divider"></div>
    <button
      v-for="tool in toolList"
      :key="tool.name"
      class="tool"
      :class="{ active: tool === globalState.get('selectedTool') }"
      @click="selectToolOrToggleMode(tool)"
      :title="tool.name"
    >
      <span v-if="tool.fillIcon" class="fa fa-fw" :class="tool.mode === 'fill' ? tool.fillIcon : tool.outlineIcon"></span>
      <span v-else-if="tool.icon" class="fa fa-fw" :class="tool.icon"></span>
      <span v-else>{{ tool.name }}</span>
    </button>
    <ClearButton />
  </div>
</template>

<script>
import { globalState } from '../utilities/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { Brush } from '../tools/brush.js'
import { ShapeRectangle } from '../tools/shape-rectangle.js'
import { ShapeCircle } from '../tools/shape-circle.js'
import { ShapeLine } from '../tools/shape-line.js'
import { Text } from '../tools/text.js'
import { Select } from '../tools/select.js'
import UndoButton from './undo-button.vue'
import RedoButton from './redo-button.vue'
import ClearButton from './clear-button.vue'
import HelpButton from './help-button.vue'

export default {
  components: {
    HelpButton,
    UndoButton,
    RedoButton,
    ClearButton
  },
  data() {
    return {
      globalState,
      brushSizes: [5, 10, 15, 20, 50, 100],
      toolList: []
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleToolShortcut)
    globalCanvasManager.onContextsReady = () => this.initializeTools()
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleToolShortcut)
    globalCanvasManager.onContextsReady = null
  },
  methods: {
    initializeTools() {
      const drawingCtx = globalCanvasManager.getDrawingContext()
      const overlayCtx = globalCanvasManager.getOverlayContext()

      if (!drawingCtx || !overlayCtx) return

      const getLineWidth = () => globalState.get('selectedSize')

      this.toolList = [
        Brush.new(drawingCtx, overlayCtx, getLineWidth),
        ShapeRectangle.new(drawingCtx, overlayCtx, getLineWidth),
        ShapeCircle.new(drawingCtx, overlayCtx, getLineWidth),
        ShapeLine.new(drawingCtx, overlayCtx, getLineWidth),
        Text.new(drawingCtx, overlayCtx),
        Select.new(drawingCtx, overlayCtx, getLineWidth)
      ]

      const savedTool = globalState.get('selectedTool')
      if (savedTool && savedTool.name) {
        const tool = this.toolList.find(t => t.name === savedTool.name)
        globalState.set('selectedTool', tool || this.toolList[0])
      } else {
        globalState.set('selectedTool', this.toolList[0])
      }
    },
    selectToolOrToggleMode(tool) {
      if (globalState.get('selectedTool') === tool && tool.mode !== undefined) {
        tool.mode = tool.mode === 'fill' ? 'outline' : 'fill'
      } else {
        globalState.set('selectedTool', tool)
      }
    },
    handleToolShortcut(event) {
      const tool = this.toolList.find(t => t.shortcut === event.key)
      if (tool) this.selectToolOrToggleMode(tool)
    }
  }
}
</script>

<style scoped>
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

.divider {
  width: 1px;
  background-color: #bdc3c7;
  margin: 2px 4px;
}
</style>
