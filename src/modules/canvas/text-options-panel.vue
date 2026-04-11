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
      <select
        class="font-select"
        :value="textToolState.font"
        @change="setFont"
        @click.stop=""
      >
        <option v-for="font in fonts" :key="font" :value="font" :style="{ fontFamily: font }">
          {{ fontLabel(font) }}
        </option>
      </select>
    </div>
    <div class="divider"></div>
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
  props: {
    zoom: {
      type: Number,
      default: 1
    },
    panX: {
      type: Number,
      default: 0
    },
    panY: {
      type: Number,
      default: 0
    }
  },
  data() {
    const commonFonts = [
      'Montserrat',
      'sans-serif',
      'serif',
      'monospace',
      'Arial',
      'Arial Black',
      'Arial Narrow',
      'Book Antiqua',
      'Bookman',
      'Comic Sans MS',
      'Courier New',
      'Courier',
      'Garamond',
      'Georgia',
      'Impact',
      'Trebuchet MS',
      'Verdana'
    ]

    const windowsFonts = [
      ...commonFonts,
      'Calibri',
      'Cambria',
      'Candara',
      'Century Gothic',
      'Century Schoolbook',
      'Consolas',
      'Constantia',
      'Corbel',
      'Copperplate',
      'Curlz MT',
      'Franklin Gothic Medium',
      'Gill Sans MT',
      'Gloucester MT Extra Condensed',
      'Goudy Old Style',
      'Goudy Stout',
      'Haettenschweiler',
      'Harrington',
      'High Tower Text',
      'Informal Roman',
      'Jokerman',
      'Juice ITC',
      'Kristen ITC',
      'Kunstler Script',
      'Lucida Console',
      'Lucida Handwriting',
      'Lucida Sans',
      'Lucida Sans Typewriter',
      'Maiandra GD',
      'Matura MT Script Capitals',
      'Microsoft Sans Serif',
      'Mistral',
      'Modern No. 20',
      'Monotype Corsiva',
      'MS PGothic',
      'MS Serif',
      'Niagara Engraved',
      'Niagara Solid',
      'Onyx',
      'Palatino',
      'Palatino Linotype',
      'Papyrus',
      'Perpetua',
      'Perpetua Titling MT',
      'Playbill',
      'Rage Italic',
      'Rockwell',
      'Rockwell Extra Bold',
      'Script MT Bold',
      'Segoe Print',
      'Segoe Script',
      'Segoe UI',
      'Segoe UI Symbol',
      'Showcard Gothic',
      'Snap ITC',
      'Stencil',
      'Sylfaen',
      'Symbol',
      'Tahoma',
      'Tempus Sans ITC',
      'Terminal',
      'Times New Roman',
      'Tw Cen MT',
      'Tw Cen MT Condensed',
      'Tw Cen MT Condensed Extra Bold',
      'Utsaah',
      'Viner Hand ITC',
      'Vivaldi Italic',
      'Vladimir Script',
      'Vrinda',
      'Webdings',
      'Wingdings',
      'Wingdings 2',
      'Wingdings 3'
    ]

    const macFonts = [
      ...commonFonts,
      'Copperplate',
      'Didot',
      'Gill Sans',
      'Gill Sans MT',
      'Helvetica',
      'Helvetica Neue',
      'Hoefler Text',
      'Lucida Console',
      'Lucida Grande',
      'Lucida Handwriting',
      'Lucida Sans',
      'Palatino',
      'Palatino Linotype',
      'Papyrus',
      'Thonburi',
      'Times',
      'Times New Roman'
    ]

    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    const fonts = isMac ? macFonts : windowsFonts

    return {
      textToolState,
      fontSizes: [5, 10, 15, 20, 50],
      fonts
    }
  },
  computed: {
    isVisible() {
      const selectedTool = globalState.get('selectedTool')
      return selectedTool?.name === 'Text' && textToolState.isTyping
    },
    panelStyle() {
      const baseX = textToolState.panelAnchorX * this.zoom + this.panX
      const baseY = (textToolState.panelAnchorY - 60) * this.zoom + this.panY
      return {
        left: `${baseX}px`,
        top: `${baseY}px`,
        transform: 'translateX(-50%)',
        position: 'fixed',
        pointerEvents: 'all'
      }
    }
  },
  methods: {
    setFont(event) {
      const font = event.target.value
      const selectedTool = globalState.get('selectedTool')
      if (selectedTool && selectedTool.name === 'Text') {
        selectedTool.applyFontToSelection(font)
      }
    },
    fontLabel(font) {
      return font
    },
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

.font-select {
  @include tool-button;
  padding: 0 8px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  background-color: rgba(255, 255, 255, 0.1);
  color: #34495e;
  min-width: 120px;

  &:hover {
    background-color: rgba(52, 73, 94, 0.1);
  }

  &:active {
    background-color: rgba(52, 73, 94, 0.15);
  }

  option {
    background-color: white;
    color: #34495e;
    padding: 4px 8px;
  }
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
