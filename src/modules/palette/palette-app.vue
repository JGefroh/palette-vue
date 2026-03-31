<template>
  <div class="palette-app">
    <div class="navigation">
      Palette v0.0.2
      <a href="https://jgefroh.com" style="float: right;">Created by Joseph Gefroh</a>
    </div>
    <Toolbar
      ref="toolbar"
      v-model:active-tool="activeTool"
      :unsaved-changes="activeTab?.unsavedChanges"
      @save="save"
      @undo="undo"
      @redo="redo"
      @clear="clear"
    />
    <ColorSelectBar v-model="selectedColor" />
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTabId === tab.id }"
        @click="switchTab(tab.id)"
        @dblclick="renameTab(tab)"
      >{{ tab.name }} <span class="tab-delete" @click.stop="deleteTab(tab)">✕</span></button>
      <button class="tab tab-add" @click="addTab">+</button>
      <button class="tab tab-download" @click="download" style="margin-left: auto;" title="Download">
        <span class="fa fa-fw fa-download"></span>
      </button>
    </div>
    <PaperCanvas ref="canvas" :color="selectedColor" :brush-size="globalConfiguration.get('selectedSize')" :active-tool="activeTool" @on-initialize="setupStateManager" @on-stroke-start="saveState" @on-change="detectChange" />
  </div>
</template>

<script>
import PaperCanvas from './components/paper-canvas.vue'
import ColorSelectBar from './components/color-select-bar.vue'
import { globalConfiguration } from './tools/global-configuration.js'
import { globalCanvasManager } from './tools/global-canvas-manager.js'
import Toolbar from './components/toolbar.vue'
import heroImage from '../../assets/hero.jpg'
import { CanvasStateManager } from './tools/canvas-state-manager.js'
import { CanvasClearer } from './tools/canvas-clearer.js'

export default {
  components: {
    PaperCanvas,
    ColorSelectBar,
    Toolbar
  },
  data() {
    return {
      globalConfiguration,
      selectedColor: { label: 'Turquoise', hex: '#1abc9c' },
      activeTool: null,
      canvasStateManager: null,
      canvasClearer: null,
      tabs: [{ id: 1, name: 'Canvas 1', unsavedChanges: false }],
      activeTabId: 1,
      nextTabId: 2
    }
  },
  computed: {
    activeTab() {
      return this.tabs.find(t => t.id === this.activeTabId)
    },
  },
  mounted() {
    window.addEventListener('keydown', this.executeCommandFromShortcut)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.executeCommandFromShortcut)
  },
  methods: {
    deleteTab(tab) {
      if (!confirm(`Delete "${tab.name}"?`)) return
      const index = this.tabs.indexOf(tab)
      this.tabs.splice(index, 1)
      localStorage.removeItem(`palette-canvas-${tab.id}`)
      if (this.tabs.length === 0) this.tabs.push({ id: this.nextTabId++, name: 'Canvas 1', unsavedChanges: false })
      if (this.activeTabId === tab.id) {
        this.switchTab(this.tabs[Math.max(0, index - 1)].id)
      }
      this.saveTabs()
    },
    renameTab(tab) {
      const name = prompt('Canvas name:', tab.name)
      if (name) { tab.name = name; this.saveTabs() }
    },
    switchTab(id) {
      this.activeTabId = id
      const ctx = this.canvasStateManager?.drawingCtx
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      this.canvasStateManager?.load(`palette-canvas-${id}`)
      this.activeTab.unsavedChanges = false
    },
    addTab() {
      const id = this.nextTabId++
      this.tabs.push({ id, name: `Canvas ${id}`, unsavedChanges: false })
      this.switchTab(id)
    },
    executeCommandFromShortcut(event) {
      // Save: Cmd+S (Mac) or Ctrl+S (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        this.save()
        return
      }
      // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) {
          this.redo()
        } else {
          this.undo()
        }
        return
      }
    },
    setupStateManager({ drawingCtx, overlayCtx }) {
      globalCanvasManager.setContexts(drawingCtx, overlayCtx)
      this.canvasStateManager = new CanvasStateManager({ drawingCtx })
      this.canvasClearer = new CanvasClearer(drawingCtx)

      const savedTabs = localStorage.getItem('palette-tabs')
      if (savedTabs) {
        this.tabs = JSON.parse(savedTabs).map(t => ({ ...t, unsavedChanges: false }))
        this.activeTabId = this.tabs[0].id
        this.nextTabId = Math.max(...this.tabs.map(t => t.id)) + 1
        this.canvasStateManager.load(`palette-canvas-${this.activeTabId}`)
      } else {
        this.$refs.canvas.fitImage(heroImage)
      }
    },
    saveState() {
      this.canvasStateManager?.saveState()
      this.canvasStateManager?.branchFuture()
      this.activeTab.unsavedChanges = true
    },
    saveTabs() {
      localStorage.setItem('palette-tabs', JSON.stringify(this.tabs))
    },
    save() {
      this.canvasStateManager?.save(`palette-canvas-${this.activeTabId}`)
      this.saveTabs()
      this.activeTab.unsavedChanges = false
    },
    undo() {
      this.canvasStateManager?.undo()
      this.activeTab.unsavedChanges = this.canvasStateManager?.hasUnsavedChanges() ?? false
    },
    redo() {
      this.canvasStateManager?.redo()
      this.activeTab.unsavedChanges = this.canvasStateManager?.hasUnsavedChanges() ?? false
    },
    detectChange() {
      this.activeTab.unsavedChanges = true
    },
    download() {
      const link = document.createElement('a')
      const filename = this.activeTab.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      link.download = `${filename}.png`
      link.href = this.$refs.canvas.$refs.drawing.toDataURL()
      link.click()
    },
    clear() {
      if (this.canvasClearer?.clear()) {
        this.activeTab.unsavedChanges = true
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

.tab-bar {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 0 20px;
  background-color: #ecf0f1;
  border-bottom: 2px solid #bdc3c7;
}

.tab {
  padding: 6px 20px;
  border: 1px solid #bdc3c7;
  border-bottom: none;
  background-color: #dde1e4;
  color: #7f8c8d;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  position: relative;
  bottom: -2px;
}

.tab.active {
  background-color: white;
  color: #34495e;
  border-color: #bdc3c7;
  border-bottom: 2px solid white;
  font-weight: 600;
}

.tab:hover:not(.active) {
  background-color: #cdd1d4;
}

.tab-delete {
  color: #bdc3c7;
  font-size: 10px;
  margin-left: 6px;
  vertical-align: middle;
}

.tab-delete:hover {
  color: #7f8c8d;
}

.tab-add {
  font-size: 16px;
  padding: 4px 10px;
}
</style>
