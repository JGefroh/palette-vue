<template>
  <div class="toolbar">
    <DownloadButton />
    <button class="tool" @click="zoomToFit" title="Zoom to Fit (Shift+1)">
      <span class="fa fa-fw fa-maximize"></span>
    </button>
    <button class="tool" @click="zoomReset" title="Zoom Reset (Shift+2)">
      <span class="fa fa-fw fa-compress"></span>
    </button>
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
    inputHandler.onCommand('brush-size-increase', () => {
      const currentSize = globalState.get('selectedSize')
      const currentIndex = this.brushSizes.indexOf(currentSize)
      if (currentIndex < this.brushSizes.length - 1) {
        globalState.set('selectedSize', this.brushSizes[currentIndex + 1])
      }
    })

    inputHandler.onCommand('brush-size-decrease', () => {
      const currentSize = globalState.get('selectedSize')
      const currentIndex = this.brushSizes.indexOf(currentSize)
      if (currentIndex > 0) {
        globalState.set('selectedSize', this.brushSizes[currentIndex - 1])
      }
    })
  },
  methods: {
    zoomToFit() {
      inputHandler.dispatchCommand('zoom-to-fit')
    },
    zoomReset() {
      inputHandler.dispatchCommand('zoom-reset')
    }
  }
}
</script>

<style scoped lang="scss">
.toolbar {
  @include glass-panel;
  padding: $space-sm;
  display: flex;
  gap: $space-xs;
  position: absolute;
  bottom: $space-sm;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  user-select: none;
}

.tool {
  @include tool-button;
}

.tool.with-text {
  width: auto;
  padding: $space-sm $space-md;
}

.divider {
  width: 1px;
  background-color: #c6c6c6;
  margin: 2px $space-xs;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-xs;
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
