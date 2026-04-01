<template>
  <div class="palette-app">
    <div class="navigation">
      Palette v0.0.2
      <a href="https://jgefroh.com" style="float: right;">Created by Joseph Gefroh</a>
    </div>
    <ToolBar />
    <ColorSelectBar />
    <TabBar />
    <PaperCanvas />
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
