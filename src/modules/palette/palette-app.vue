<template>
  <div class="palette-app">
    <div class="navigation">
      Palette v0.0.2
      <a href="https://jgefroh.com" style="float: right;">Created by Joseph Gefroh</a>
    </div>
    <Toolbar
      ref="toolbar"
      v-model:active-tool="activeTool"
    />
    <ColorSelectBar v-model="selectedColor" />
    <TabBar
      ref="tabBar"
      :on-switch-tab="loadCanvasForTab"
    />
    <PaperCanvas ref="canvas" :color="selectedColor" :brush-size="globalConfiguration.get('selectedSize')" :active-tool="activeTool" @on-initialize="setupStateManager" @on-stroke-start="saveState" @on-change="detectChange" />
  </div>
</template>

<script>
import PaperCanvas from './components/paper-canvas.vue'
import ColorSelectBar from './components/color-select-bar.vue'
import Toolbar from './components/toolbar.vue'
import TabBar from './components/tab-bar.vue'
import { globalConfiguration } from './utilities/global-configuration.js'
import { globalCanvasManager } from './canvas/global-canvas-manager.js'
import heroImage from '../../assets/hero.jpg'

export default {
  components: {
    PaperCanvas,
    ColorSelectBar,
    Toolbar,
    TabBar
  },
  data() {
    return {
      globalConfiguration,
      selectedColor: { label: 'Turquoise', hex: '#1abc9c' },
      activeTool: null,
      saveDebounceTimer: null
    }
  },
  mounted() {
    window.addEventListener('keydown', this.executeCommandFromShortcut)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.executeCommandFromShortcut)
    clearTimeout(this.saveDebounceTimer)
  },
  methods: {
    loadCanvasForTab(id) {
      const ctx = globalCanvasManager.getDrawingContext()
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      globalCanvasManager.loadCanvas(id)
    },
    setupStateManager({ drawingCtx, overlayCtx }) {
      globalCanvasManager.setContexts(drawingCtx, overlayCtx)

      if (this.$refs.tabBar.hasSavedTabs()) {
        const activeTabId = this.$refs.tabBar.activeTabId
        globalCanvasManager.loadCanvas(activeTabId)
      } else {
        this.$refs.canvas.fitImage(heroImage)
      }
    },
    saveState() {
      globalCanvasManager.saveDrawingState()
      this.autoSaveCanvas()
    },
    autoSaveCanvas() {
      clearTimeout(this.saveDebounceTimer)
      this.saveDebounceTimer = setTimeout(() => {
        const tabId = this.$refs.tabBar.activeTabId
        globalCanvasManager.persistCanvas(tabId)
        this.$refs.tabBar.saveTabs()
      }, 500)
    },
    detectChange() {
      this.autoSaveCanvas()
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
</style>
