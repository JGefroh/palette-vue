<template>
  <div>
    <div class="colors">
      <button
        v-for="(color, index) in colors"
        :key="color.hex"
        class="color"
        :class="{ selected: color.hex === selectedColor.hex, dragging: draggedIndex === index, dragOver: dragOverIndex === index }"
        :style="{
          'background-color': color.hex
        }"
        @click="handleColorClick(color)"
        @dragstart="startDragColor($event, index)"
        @dragover.prevent="dragOverIndex = index"
        @drop="dropColor($event, index)"
        @dragend="endDragColor"
        @dragleave="dragOverIndex = null"
        draggable="true"
      >
        <span v-if="colorNumbers[color.hex] !== undefined" class="color-number">{{ colorNumbers[color.hex] }}</span>
        <span v-else>&nbsp;</span>
      </button>
      <div v-if="colors.length % 2 === 1" class="color-placeholder"></div>
      <button class="color color-add" @click="showColorPicker">+</button>
      <button class="color color-settings" @click="showThemeModal">⚙</button>
    </div>
    <ColorWheelPicker v-if="isPickerOpen" @color-picked="addCustomColor" @close="isPickerOpen = false" />
    <ThemeModal v-if="isThemeModalOpen" @theme-selected="applyTheme" @close="isThemeModalOpen = false" />
  </div>
</template>

<script>
import { globalState } from '../utilities/global-state.js'
import { inputHandler } from '../utilities/input-handler.js'
import { particleEffect } from '../utilities/particle-effect.js'
import ColorWheelPicker from './color-wheel-picker.vue'
import ThemeModal from './theme-modal.vue'

export default {
  components: {
    ColorWheelPicker,
    ThemeModal
  },
  props: {
  },
  emits: [],
  mounted() {
    this.loadColors()
    this.initializeDefaultColorNumbers()
    this.registerColorShortcuts()
    const canvas = document.querySelector('canvas')
    if (canvas) {
      this._handleCanvasDragover = (e) => e.preventDefault()
      this._handleCanvasDrop = (e) => {
        e.preventDefault()
        if (this.draggedIndex !== null) {
          const dropX = e.clientX
          const dropY = e.clientY
          this.deleteColor(dropX, dropY)
        }
      }
      canvas.addEventListener('dragover', this._handleCanvasDragover)
      canvas.addEventListener('drop', this._handleCanvasDrop)
    }
  },
  beforeUnmount() {
    const canvas = document.querySelector('canvas')
    if (canvas && this._handleCanvasDragover && this._handleCanvasDrop) {
      canvas.removeEventListener('dragover', this._handleCanvasDragover)
      canvas.removeEventListener('drop', this._handleCanvasDrop)
    }
  },
  beforeUnmount() {
  },
  data() {
    return {
      colors: [],
      colorNumbers: {},
      isPickerOpen: false,
      isThemeModalOpen: false,
      draggedIndex: null,
      dragOverIndex: null,
      dragOverTrash: false,
      defaultColors: [
        { label: 'Pure Black', hex: '#000000' },
        { label: 'Pure White', hex: '#FFFFFF' },
        { label: 'Turquoise', hex: '#1abc9c' },
        { label: 'Green Sea', hex: '#16a085' },
        { label: 'Emerald', hex: '#2ecc71' },
        { label: 'Nephritis', hex: '#27ae60' },
        { label: 'Lime Green', hex: '#32cd32' },
        { label: 'Peter River', hex: '#3498db' },
        { label: 'Belize Hole', hex: '#2980b9' },
        { label: 'Amethyst', hex: '#9b59b6' },
        { label: 'Wisteria', hex: '#8e44ad' },
        { label: 'Wet Asphalt', hex: '#34495e' },
        { label: 'Midnight Blue', hex: '#2c3e50' },
        { label: 'Yellow', hex: '#ffff00' },
        { label: 'Sun Flower', hex: '#f1c40f' },
        { label: 'Orange', hex: '#f39c12' },
        { label: 'Carrot', hex: '#e67e22' },
        { label: 'Pumpkin', hex: '#d35400' },
        { label: 'Alizarin', hex: '#e74c3c' },
        { label: 'Pomegranate', hex: '#c0392b' },
        { label: 'Clouds', hex: '#ecf0f1' },
        { label: 'Silver', hex: '#bdc3c7' },
        { label: 'Concrete', hex: '#95a5a6' },
        { label: 'Abestos', hex: '#7f8c8d' }
      ]
    }
  },
  computed: {
    selectedColor() {
      return globalState.get('selectedColor');
    }
  },
  methods: {
    initializeDefaultColorNumbers() {
      if (globalState.get('color-numbers')) {
        this.colorNumbers = globalState.get('color-numbers');
      } else {
        this.colorNumbers['#000000'] = '1' // Black
        this.colorNumbers['#FFFFFF'] = '2' // White
      }
    },
    registerColorShortcuts() {
      // Register 0-9 shortcuts for color selection
      for (let i = 0; i <= 9; i++) {
        const digit = String(i);
        inputHandler.registerCommand(digit, `select-color-${digit}`, () => {
          this.cycleColorsWithNumber(digit);
        });
      }
    },
    cycleColorsWithNumber(digit) {
      const colorsWithNumber = this.colors.filter(c => this.colorNumbers[c.hex] === digit);
      if (colorsWithNumber.length === 0) {
        return;
      }
      const currentIndex = colorsWithNumber.findIndex(c => c.hex === this.selectedColor.hex);
      const nextIndex = (currentIndex + 1) % colorsWithNumber.length;
      this.selectColor(colorsWithNumber[nextIndex]);
    },
    handleColorClick(color) {
      if (color.hex === this.selectedColor.hex) {
        // Already selected: increment number
        this.assignNumber(color)
      } else {
        // Different color: select it
        this.selectColor(color)
      }
    },
    selectColor(color) {
      globalState.set('selectedColor', color)
    },
    assignNumber(color) {
      const current = this.colorNumbers[color.hex]

      if (current === undefined) {
        this.colorNumbers[color.hex] = '0'
      } else if (current === '9') {
        delete this.colorNumbers[color.hex]
      } else {
        this.colorNumbers[color.hex] = String(parseInt(current) + 1)
      }

      globalState.set('color-numbers', this.colorNumbers);
    },
    showColorPicker() {
      this.isPickerOpen = true
    },
    addCustomColor(hex) {
      const exists = this.colors.some(c => c.hex.toUpperCase() === hex.toUpperCase())
      if (!exists) {
        this.colors.push({ label: 'Custom', hex })
        this.saveColors()
        this.selectColor({ label: 'Custom', hex })
      }
      this.isPickerOpen = false
    },
    loadColors() {
      const savedColors = globalState.get('saved-colors')
      if (savedColors && savedColors.length > 0) {
        this.colors = savedColors
      } else {
        this.colors = JSON.parse(JSON.stringify(this.defaultColors))
        this.saveColors()
      }
    },
    saveColors() {
      globalState.set('saved-colors', this.colors)
    },
    startDragColor(event, index) {
      this.draggedIndex = index
      event.dataTransfer.effectAllowed = 'move'
    },
    dropColor(event, targetIndex) {
      event.preventDefault()
      if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
        const draggedColor = this.colors[this.draggedIndex]
        this.colors.splice(this.draggedIndex, 1)
        if (targetIndex > this.draggedIndex) {
          this.colors.splice(targetIndex - 1, 0, draggedColor)
        } else {
          this.colors.splice(targetIndex, 0, draggedColor)
        }
        this.saveColors()
      }
      this.draggedIndex = null
      this.dragOverIndex = null
    },
    endDragColor() {
      this.draggedIndex = null
      this.dragOverIndex = null
      this.dragOverTrash = false
    },
    deleteColor(dropX = null, dropY = null) {
      if (this.draggedIndex !== null) {
        const deletedColor = this.colors[this.draggedIndex]
        this.colors.splice(this.draggedIndex, 1)
        this.saveColors()

        if (dropX !== null && dropY !== null) {
          particleEffect.createConfetti(dropX, dropY, deletedColor.hex)
        }
      }
      this.draggedIndex = null
      this.dragOverIndex = null
      this.dragOverTrash = false
    },
    showThemeModal() {
      this.isThemeModalOpen = true
    },
    applyTheme(themeColors) {
      this.colors = JSON.parse(JSON.stringify(themeColors))
      this.saveColors()
      this.isThemeModalOpen = false
    },
    saveColorOrder() {
      const colorOrder = this.colors.map(c => c.hex)
      globalState.set('color-order', colorOrder)
    }
  }
}
</script>

<style scoped>
.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background-color: #d3d3d37e;
  font-family: 'Montserrat', sans-serif;
  position: absolute;
  min-width: 95px;
  max-width: 90px;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  box-shadow: 1px 1px 3px #c6c6c6;
  z-index: 99;
}

.color-placeholder {
  width: 36px;
  height: 36px;
}

.color {
  width: 36px;
  height: 36px;
  border: 1px solid #b9b9b9d9;
  border-radius: 4px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.2s ease;
  outline: none;
  position: relative;
}

.color:active {
  cursor: grabbing;
}

.color:focus {
  outline: none;
}

.color:hover {
  transform: scale(1.08);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
}

.color.selected {
  border: 2px solid #34495e;
  background-color: rgba(52, 73, 94, 0.12);
}

.color.selected:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.color.dragging {
  opacity: 0.5;
}

.color.dragOver::before {
  content: '';
  position: absolute;
  left: -3px;
  top: 0;
  width: 3px;
  height: 100%;
  background-color: #34495e;
  border-radius: 2px;
}

.color-number {
  color: #ecf0f1;
  text-shadow:
    -1px -1px 0 #34495e,
    1px -1px 0 #34495e,
    -1px 1px 0 #34495e,
    1px 1px 0 #34495e,
    0px -1px 0 #34495e,
    0px 1px 0 #34495e,
    -1px 0px 0 #34495e,
    1px 0px 0 #34495e;
  font-weight: bold;
  font-size: 16px;
}

.color-add {
  width: 36px;
  height: 36px;
  background-color: transparent;
  color: #34495e;
  font-size: 20px;
  font-weight: bold;
  border: 1px solid rgba(185, 185, 185, 0.5);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-add:hover {
  background-color: rgba(52, 73, 94, 0.1);
  border-color: rgba(185, 185, 185, 0.7);
}

.color-trash {
  width: 36px;
  height: 36px;
  background-color: transparent;
  color: #95a5a6;
  font-size: 18px;
  border: 1px solid rgba(185, 185, 185, 0.5);
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-trash:hover {
  background-color: rgba(52, 73, 94, 0.05);
  border-color: rgba(185, 185, 185, 0.7);
}

.color-trash.dragOverTrash {
  border-color: #e74c3c;
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
}

.color-settings {
  width: 36px;
  height: 36px;
  background-color: transparent;
  color: #34495e;
  font-size: 16px;
  border: 1px solid rgba(185, 185, 185, 0.5);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-settings:hover {
  background-color: rgba(52, 73, 94, 0.1);
  border-color: rgba(185, 185, 185, 0.7);
}
</style>
