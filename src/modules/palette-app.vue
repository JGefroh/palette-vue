<template>
  <div class="palette-app">
    <div class="navigation">
      <div class="nav-left">
        <img src="../assets/favicon.ico" alt="Palette" class="favicon" />
        Palette <span class="version">v0.0.3</span>
      </div>
      <a href="https://jgefroh.com" class="nav-right">Created by Joseph Gefroh</a>
    </div>
    <TabBar />
    <PaperCanvas @on-initialize="onPaperCanvasInitialize" />
    <BottomBar :tools-definition="toolbarTools" />
    <ColorSelectBar />
  </div>
</template>

<script>
import PaperCanvas from './canvas/paper-canvas.vue'
import ColorSelectBar from './colors/color-select-bar.vue'
import BottomBar from './toolbar/bottom-bar.vue'
import TabBar from './tabs/tab-bar.vue'
import { globalState } from './persistence/global-state.js'
import { globalCanvasManager } from './canvas/global-canvas-manager.js'
import { inputHandler } from './input/input-handler.js'
import { Brush } from './tools/brush.js'
import { ShapeRectangle } from './tools/shape-rectangle.js'
import { ShapeCircle } from './tools/shape-circle.js'
import { ShapeLine } from './tools/shape-line.js'
import { Text } from './tools/text.js'
import { Select } from './tools/select.js'
import { Paste } from './tools/paste.js'
import { ToolUse } from './tools/tool-use.js'
import { shortcuts } from './input/shortcuts.js'


export default {
  components: {
    PaperCanvas,
    ColorSelectBar,
    BottomBar,
    TabBar
  },
  data() {
    return {
      toolbarTools: [],
      toolUse: null
    }
  },
  mounted() {
    inputHandler.start()
    this.initializeAutosave()
    globalCanvasManager.onContextsReady = () => {
      this.initializeTools()
      this.initializeShortcuts();
    }
  },
  beforeUnmount() {
    inputHandler.stop();
    clearTimeout(this.saveDebounceTimer)
    globalCanvasManager.onContextsReady = null
  },
  methods: {
    initializeAutosave() {
      setInterval(() => {
        globalState.saveState();
      }, 500);
    },
    initializeShortcuts() {
      shortcuts.register()

      this.toolbarTools.forEach(tool => {
        inputHandler.onCommand(`select-tool-${tool.name}`, () => {
          this.selectToolOrToggleMode(tool);
        });
      });
    },
    initializeTools() {
      const drawingCtx = globalCanvasManager.getDrawingContext()
      const overlayCtx = globalCanvasManager.getOverlayContext()

      if (!drawingCtx || !overlayCtx) return

      this.toolbarTools = [
        Brush.new(drawingCtx, overlayCtx),
        ShapeRectangle.new(drawingCtx, overlayCtx),
        ShapeCircle.new(drawingCtx, overlayCtx),
        ShapeLine.new(drawingCtx, overlayCtx),
        Text.new(drawingCtx, overlayCtx),
        Select.new(drawingCtx, overlayCtx)
      ]

      const pasteTool = Paste.new(drawingCtx, overlayCtx)
      pasteTool.start({ x: 0, y: 0 })

      this.initializeDefaultTool()
    },
    initializeDefaultTool() {
      const savedTool = globalState.get('selectedTool')
      if (savedTool && savedTool.name) {
        const tool = this.toolbarTools.find(t => t.name === savedTool.name)
        globalState.set('selectedTool', tool || this.toolbarTools[0])
      } else {
        globalState.set('selectedTool', this.toolbarTools[0])
      }
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
    },
    onPaperCanvasInitialize(cursorManager) {
      this.toolUse = new ToolUse(cursorManager)
      this.registerToolUseCommands()
    },
    registerToolUseCommands() {
      inputHandler.onCommand('tool-start', () => {
        this.toolUse.start()
      })
      inputHandler.onCommand('tool-process', () => {
        this.toolUse.process()
      })
      inputHandler.onCommand('tool-end', () => {
        this.toolUse.end()
      })
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
  background-color: rgba(211, 211, 211, 0.3);
  color: #34495e;
  padding: 10px 20px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(185, 185, 185, 0.2);
  backdrop-filter: blur(15px);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.favicon {
  width: 16px;
  height: 16px;
}

.version {
  color: #95a5a6;
  font-weight: 400;
  font-size: 11px;
}

.nav-right {
  color: #34495e;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-right:hover {
  color: #7f8c8d;
}
</style>
