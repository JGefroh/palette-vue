<template>
  <div class="palette-app">
    <div class="navigation">
      <div class="nav-left">Palette <span class="version">v0.0.2</span></div>
      <a href="https://jgefroh.com" class="nav-right">Created by Joseph Gefroh</a>
    </div>
    <TabBar />
    <PaperCanvas />
    <ToolBar />
    <ColorSelectBar />
  </div>
</template>

<script>
import PaperCanvas from './components/paper-canvas.vue'
import ColorSelectBar from './components/color-select-bar.vue'
import ToolBar from './components/tool-bar.vue'
import TabBar from './components/tab-bar.vue'
import { globalState } from './utilities/global-state.js'
import { globalCanvasManager } from './canvas/global-canvas-manager.js'
import { inputHandler } from './utilities/input-handler.js'


export default {
  components: {
    PaperCanvas,
    ColorSelectBar,
    ToolBar,
    TabBar
  },
  data() {
    return {
    }
  },
  mounted() {
    inputHandler.start();
    this.initializeAutosave();
  },
  beforeUnmount() {
    inputHandler.stop();
    clearTimeout(this.saveDebounceTimer)
  },
  methods: {
    initializeAutosave() {
      setInterval(() => {
        globalState.saveState();
      }, 500);
    },
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
