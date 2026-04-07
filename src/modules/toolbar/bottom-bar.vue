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
      v-for="tool in toolsDefinition"
      :key="tool.name"
      class="tool"
      :class="{ active: tool === globalState.get('selectedTool'), 'with-text': !tool.icon && !tool.fillIcon && !tool.icons, 'tool-brush': tool.name === 'Brush' }"
      @click="inputHandler.dispatchCommand(`select-tool-${tool.name}`)"
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
import { globalState } from '../persistence/global-state.js'
import { inputHandler } from '../input/input-handler.js'
import UndoButton from '../buttons-uncategorized/undo-button.vue'
import RedoButton from '../buttons-uncategorized/redo-button.vue'
import ClearButton from '../buttons-uncategorized/clear-button.vue'
import DownloadButton from '../buttons-uncategorized/download-button.vue'
import ToolOptions from '../toolbar/tool-options.vue'

export default {
  components: {
    DownloadButton,
    UndoButton,
    RedoButton,
    ClearButton,
    ToolOptions
  },
  props: {
    toolsDefinition: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      globalState,
      inputHandler,
      brushSizes: [5, 10, 15, 20, 50, 100]
    }
  },
  mounted() {
    for (let i = 0; i < this.brushSizes.length; i++) {
      inputHandler.onCommand(`select-brush-size-${i}`, () => {
        globalState.set('selectedSize', this.brushSizes[i])
      })
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
