<template>
  <div class="palette-app">
    <div class="navigation">
      Palette v0.0.2
      <a href="http://www.jgefroh.com" style="float: right;">Created by Joseph Gefroh</a>
    </div>
    <div class="toolbar">
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
    </div>
    <ColorPalette v-model="selectedColor" />
    <PaperCanvas ref="canvas" :color="selectedColor" :brush-size="selectedSize" />
  </div>
</template>

<script>
import PaperCanvas from './components/PaperCanvas.vue'
import ColorPalette from './components/ColorPalette.vue'

export default {
  components: {
    PaperCanvas,
    ColorPalette
  },
  data() {
    return {
      selectedColor: { label: 'Turquoise', hex: '#1abc9c' },
      selectedSize: 10,
      brushSizes: [5, 10, 15, 20, 50, 100]
    }
  },
  methods: {
    undo() {
      this.$refs.canvas.undo()
    },
    redo() {
      this.$refs.canvas.redo()
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
</style>
