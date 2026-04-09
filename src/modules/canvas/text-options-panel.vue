<template>
  <div
    v-if="isVisible"
    class="text-options-panel"
    :style="panelStyle"
    @click.stop=""
    @mousedown.stop=""
    @mouseup.stop=""
  >
    <div class="option-group">
      <button
        v-for="size in fontSizes"
        :key="size"
        class="font-size-button"
        :class="{ active: textToolState.fontSize === size }"
        :title="`Font size ${size}px`"
        @click.stop="setFontSize(size)"
      >
        {{ sizeLabel(size) }}
      </button>
    </div>
    <div class="divider"></div>
    <div class="option-group">
      <button
        class="alignment-button"
        :class="{ active: textToolState.alignment === 'left' }"
        title="Align left"
        @click.stop="changeAlignment('left')"
      >
        <span class="fa fa-align-left"></span>
      </button>
      <button
        class="alignment-button"
        :class="{ active: textToolState.alignment === 'center' }"
        title="Align center"
        @click.stop="changeAlignment('center')"
      >
        <span class="fa fa-align-center"></span>
      </button>
      <button
        class="alignment-button"
        :class="{ active: textToolState.alignment === 'right' }"
        title="Align right"
        @click.stop="changeAlignment('right')"
      >
        <span class="fa fa-align-right"></span>
      </button>
    </div>
    <div class="divider"></div>
    <div class="option-group">
      <button
        class="style-button"
        :class="{ active: textToolState.bold }"
        title="Bold"
        @click.stop="applyStyle('bold')"
      >
        <span class="fa fa-bold"></span>
      </button>
      <button
        class="style-button"
        :class="{ active: textToolState.italic }"
        title="Italic"
        @click.stop="applyStyle('italic')"
      >
        <span class="fa fa-italic"></span>
      </button>
      <button
        class="style-button"
        :class="{ active: textToolState.underline }"
        title="Underline"
        @click.stop="applyStyle('underline')"
      >
        <span class="fa fa-underline"></span>
      </button>
    </div>
  </div>
</template>

<script>
import { globalState } from '../persistence/global-state.js'
import { textToolState } from '../tools/text.js'

export default {
  name: 'TextOptionsPanel',
  data() {
    return {
      textToolState,
      fontSizes: [5, 10, 15, 20, 50]
    }
  },
  computed: {
    isVisible() {
      const selectedTool = globalState.get('selectedTool')
      return selectedTool?.name === 'Text' && textToolState.isTyping
    },
    panelStyle() {
      return {
        left: `${textToolState.panelAnchorX}px`,
        top: `${textToolState.panelAnchorY - 120}px`,
        transform: 'translateX(-50%)'
      }
    }
  },
  methods: {
    setFontSize(size) {
      textToolState.fontSize = size
    },
    sizeLabel(size) {
      return String(size)
    },
    applyStyle(style) {
      const selectedTool = globalState.get('selectedTool')
      if (selectedTool && selectedTool.name === 'Text') {
        selectedTool.applyStyleToSelection(style)
      }
    },
    changeAlignment(alignment) {
      const selectedTool = globalState.get('selectedTool')
      if (!selectedTool || selectedTool.name !== 'Text') return

      const oldAlignment = textToolState.alignment
      textToolState.alignment = alignment

      if (selectedTool.chars.length > 0) {
        const { lineChars } = selectedTool.getLineInfo()
        const maxLineWidth = Math.max(...lineChars.map(lc => selectedTool.measureStyledChars(selectedTool.overlayCtx, lc, textToolState.fontSize)), 0)

        let adjustX = 0
        if (oldAlignment === 'left' && alignment === 'center') {
          adjustX = maxLineWidth / 2
        } else if (oldAlignment === 'left' && alignment === 'right') {
          adjustX = maxLineWidth
        } else if (oldAlignment === 'center' && alignment === 'left') {
          adjustX = -maxLineWidth / 2
        } else if (oldAlignment === 'center' && alignment === 'right') {
          adjustX = maxLineWidth / 2
        } else if (oldAlignment === 'right' && alignment === 'left') {
          adjustX = -maxLineWidth
        } else if (oldAlignment === 'right' && alignment === 'center') {
          adjustX = -maxLineWidth / 2
        }

        textToolState.anchorX += adjustX
      }

      selectedTool.syncPanelState()
      selectedTool.renderOverlay()
    }
  }
}
</script>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.text-options-panel {
  @include glass-panel;
  position: absolute;
  display: flex;
  align-items: center;
  gap: $space-xs;
  padding: $space-sm;
  z-index: 100;
  pointer-events: all;
}

.option-group {
  display: flex;
  gap: $space-xs;
}

.divider {
  width: 1px;
  height: $size-button;
  background-color: #c6c6c6;
  margin: 0 $space-xs;
}

.font-size-button {
  @include tool-button;
}

.alignment-button {
  @include tool-button;
}

.style-button {
  @include tool-button;
}
</style>
