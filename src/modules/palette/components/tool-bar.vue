<template>
  <div class="toolbar">
    <DownloadButton />
    <div class="divider"></div>
    <UndoButton />
    <RedoButton />
    <div class="divider"></div>
    <button
      v-for="size in brushSizes"
      :key="size"
      class="tool with-text"
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
      :class="{ active: tool === globalState.get('selectedTool'), 'with-text': !tool.icon && !tool.fillIcon && !tool.icons, 'tool-brush': tool.name === 'Brush' }"
      @click="selectToolOrToggleMode(tool)"
      :title="tool.name"
    >
      <div v-if="tool.icons" class="icon-container" :class="{ 'icon-container-compact': tool.icons.includes('fa-arrow-right') }">
        <span v-for="(icon, idx) in tool.icons" :key="idx" class="fa fa-fw" :class="[icon, { 'icon-small-minus': tool.icons.includes('fa-arrow-right') && icon === 'fa-minus' }]"></span>
      </div>
      <span v-else-if="tool.fillIcon" class="fa fa-fw" :class="tool.mode === 'fill' ? tool.fillIcon : tool.outlineIcon"></span>
      <span v-else-if="tool.icon && tool.icon.startsWith('fa-')" class="fa fa-fw" :class="tool.icon"></span>
      <span v-else-if="tool.icon" class="unicode-icon">{{ tool.icon }}</span>
      <span v-else>{{ tool.name }}</span>
    </button>
    <div class="divider"></div>
    <ClearButton />
    <ToolOptions :tool="globalState.get('selectedTool')" />
  </div>
</template>

<script>
import { globalState } from '../utilities/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'
import { inputHandler } from '../utilities/input-handler.js'
import { Brush } from '../tools/brush.js'
import { ShapeRectangle } from '../tools/shape-rectangle.js'
import { ShapeCircle } from '../tools/shape-circle.js'
import { ShapeLine } from '../tools/shape-line.js'
import { Text } from '../tools/text.js'
import { Select } from '../tools/select.js'
import { Paste } from '../tools/paste.js'
import UndoButton from './undo-button.vue'
import RedoButton from './redo-button.vue'
import ClearButton from './clear-button.vue'
import DownloadButton from './download-button.vue'
import ToolOptions from './tool-options.vue'

export default {
  components: {
    DownloadButton,
    UndoButton,
    RedoButton,
    ClearButton,
    ToolOptions
  },
  data() {
    return {
      globalState,
      brushSizes: [5, 10, 15, 20, 50, 100],
      toolList: []
    }
  },
  mounted() {
    globalCanvasManager.onContextsReady = () => this.initializeTools()
  },
  beforeUnmount() {
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

      // Initialize Paste tool (always listening, hidden from toolbar)
      const pasteTool = Paste.new(drawingCtx, overlayCtx)
      pasteTool.start({ x: 0, y: 0 })

      const savedTool = globalState.get('selectedTool')
      if (savedTool && savedTool.name) {
        const tool = this.toolList.find(t => t.name === savedTool.name)
        globalState.set('selectedTool', tool || this.toolList[0])
      } else {
        globalState.set('selectedTool', this.toolList[0])
      }

      // Register tool shortcuts
      this.toolList.forEach(tool => {
        if (tool.shortcut) {
          inputHandler.registerCommand(tool.shortcut, `select-tool-${tool.name}`, () => {
            this.selectToolOrToggleMode(tool);
          });
        }
      });
    },
    selectToolOrToggleMode(tool) {
      if (globalState.get('selectedTool') === tool) {
        if (tool.mode !== undefined) {
          tool.mode = tool.mode === 'fill' ? 'outline' : 'fill'
        } else if (tool.onAlreadySelected) {
          tool.onAlreadySelected()
        }
      } else {
        globalState.set('selectedTool', tool)
      }
    }
  }
}
</script>

<style scoped>
.toolbar {
  background-color: rgba(211, 211, 211, 0.49);
  padding: 8px;
  display: flex;
  gap: 4px;
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 100;
  backdrop-filter: blur(15px);
}

.tool {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid rgba(185, 185, 185, 0.5);
  background-color: transparent;
  color: #34495e;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  transition: all 0.2s ease;
  outline: none;
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

.tool.with-text {
  width: auto;
  padding: 8px 12px;
}

.divider {
  width: 1px;
  background-color: #c6c6c6;
  margin: 2px 4px;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.icon-container-compact {
  gap: 1px;
}

.icon-small-minus {
  font-size: 0.5em;
}

.unicode-icon {
  font-size: 1.2em;
  line-height: 1;
}

.tool-brush {
  width: 65px;
}
</style>
