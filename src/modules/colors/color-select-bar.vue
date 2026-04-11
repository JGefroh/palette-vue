<template>
  <div>
    <div class="color-bar-container" @dragover.prevent="handleImageDragOver" @drop="handleImageDrop">
      <div v-if="isImageDragOver" class="image-drop-overlay">
        <span class="fa fa-fw fa-image"></span>
        <span class="overlay-label">Extract colors</span>
      </div>
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
      <button class="color color-eyedropper" :class="{ active: isEyedropperActive }" @click="toggleEyedropper" title="Eyedropper">
        <span class="fa fa-fw fa-eyedropper"></span>
      </button>
      <button class="color color-add" :class="{ hidden: isPickerOpen }" @click="showColorPicker">
        <span class="fa fa-fw fa-plus"></span>
      </button>
      <button class="color color-settings" @click="showThemeModal">
        <span class="fa fa-fw fa-cog"></span>
      </button>
    </div>
    </div>
    <ColorWheelPicker v-if="isPickerOpen" :initial-color="selectedColor.hex" :selected-color="selectedColor.hex" :existing-colors="colors" @color-picked="handleColorPicked" @close="isPickerOpen = false" />
    <ThemeModal v-if="isThemeModalOpen" @theme-selected="applyTheme" @close="isThemeModalOpen = false" />
  </div>
</template>

<script>
import { globalState } from '../persistence/global-state.js'
import { inputHandler } from '../input/input-handler.js'
import { particleEffect } from './particle-effect.js'
import { eyedropperPreviewState } from '../tools/eyedropper.js'
import { ImageColorExtractor } from './image-color-extractor.js'
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

    inputHandler.onCommand('eyedropper-pick', (data) => {
      const wasAdded = this.addCustomColorWithAnimation(data.hex, data.screenX, data.screenY)
      this.selectColor({ hex: data.hex, label: 'Custom' })
      if (!wasAdded) {
        eyedropperPreviewState.shouldShake = true
        setTimeout(() => {
          eyedropperPreviewState.shouldShake = false
        }, 500)
      }
    })

    inputHandler.onCommand('clear-colors', () => {
      this.clearColorsWithAnimation()
    })

    inputHandler.onCommand('image-drag-enter', () => {
      this.isImageDragOver = true
    })

    inputHandler.onCommand('image-drag-leave', () => {
      this.isImageDragOver = false
    })

    inputHandler.onCommand('image-drop', () => {
      this.isImageDragOver = false
    })

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
      isImageDragOver: false,
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
    },
    isEyedropperActive() {
      return globalState.get('selectedTool')?.name === 'Eyedropper'
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
      for (let i = 0; i <= 9; i++) {
        const digit = String(i);
        inputHandler.onCommand(`select-color-${digit}`, () => {
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
    toggleEyedropper() {
      inputHandler.dispatchCommand('toggle-eyedropper')
    },
    handleColorPicked(colorData) {
      const hex = typeof colorData === 'string' ? colorData : colorData.hex
      const screenX = colorData.screenX
      const screenY = colorData.screenY

      if (screenX !== undefined && screenY !== undefined) {
        this.addCustomColorWithAnimation(hex, screenX, screenY)
      } else {
        this.addCustomColor(hex)
      }
    },
    addCustomColor(hex) {
      const exists = this.colors.some(c => c.hex.toUpperCase() === hex.toUpperCase())
      if (!exists && this.colors.length < 40) {
        this.colors.push({ label: 'Custom', hex })
        this.saveColors()
        return true
      }
      return false
    },
    addCustomColorWithAnimation(hex, screenX, screenY) {
      const wasAdded = this.addCustomColor(hex)
      if (!wasAdded) return false

      this.$nextTick(() => {
        const colorButtons = this.$el.querySelectorAll('.color:not(.color-add):not(.color-eyedropper):not(.color-settings)')
        const lastColorButton = colorButtons[colorButtons.length - 1]

        if (lastColorButton) {
          const targetRect = lastColorButton.getBoundingClientRect()
          const targetX = targetRect.left + targetRect.width / 2
          const targetY = targetRect.top + targetRect.height / 2

          const animElement = document.createElement('div')
          animElement.style.position = 'fixed'
          animElement.style.width = '36px'
          animElement.style.height = '36px'
          animElement.style.backgroundColor = hex
          animElement.style.borderRadius = '4px'
          animElement.style.left = screenX - 18 + 'px'
          animElement.style.top = screenY - 18 + 'px'
          animElement.style.pointerEvents = 'none'
          animElement.style.zIndex = '9999'
          animElement.style.border = '1px solid rgba(185, 185, 185, 0.3)'
          animElement.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'

          document.body.appendChild(animElement)

          requestAnimationFrame(() => {
            animElement.style.left = targetX - 18 + 'px'
            animElement.style.top = targetY - 18 + 'px'
            animElement.style.opacity = '0'
            animElement.style.transform = 'scale(0.5)'
          })

          setTimeout(() => {
            animElement.remove()
          }, 1500)
        }
      })
      return true
    },
    clearColorsWithAnimation() {
      if (this.colors.length === 0) return

      const canvasEl = document.querySelector('canvas')
      if (!canvasEl) return

      const colorsCopy = [...this.colors]

      colorsCopy.forEach((color, index) => {
        setTimeout(() => {
          const colorButtons = this.$el.querySelectorAll('.color:not(.color-add):not(.color-eyedropper):not(.color-settings)')
          const button = colorButtons[0]

          if (button) {
            const rect = button.getBoundingClientRect()
            const fromX = rect.left + rect.width / 2
            const fromY = rect.top + rect.height / 2

            const canvasRect = canvasEl.getBoundingClientRect()
            const toX = canvasRect.left + Math.random() * canvasRect.width
            const toY = canvasRect.top + Math.random() * canvasRect.height

            const bgColor = window.getComputedStyle(button).backgroundColor
            const animEl = document.createElement('div')
            animEl.style.position = 'fixed'
            animEl.style.width = '36px'
            animEl.style.height = '36px'
            animEl.style.backgroundColor = bgColor
            animEl.style.borderRadius = '4px'
            animEl.style.left = fromX - 18 + 'px'
            animEl.style.top = fromY - 18 + 'px'
            animEl.style.pointerEvents = 'none'
            animEl.style.zIndex = '10000'
            animEl.style.border = '1px solid rgba(185, 185, 185, 0.3)'
            animEl.style.transition = 'all 0.5s ease-in'

            document.body.appendChild(animEl)

            requestAnimationFrame(() => {
              animEl.style.left = toX - 18 + 'px'
              animEl.style.top = toY - 18 + 'px'
              animEl.style.opacity = '0'
              animEl.style.transform = 'scale(0.3) rotate(180deg)'
            })

            setTimeout(() => {
              particleEffect.createConfetti(toX, toY, bgColor)
              animEl.remove()
            }, 500)
          }

          this.colors.shift()
          this.saveColors()
        }, index * 50)
      })
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
    },
    handleImageDragOver(e) {
      if (e.dataTransfer.types.includes('Files') && this.draggedIndex === null) {
        this.isImageDragOver = true
      }
    },
    handleImageDragLeave() {
      this.isImageDragOver = false
    },
    handleImageDrop(e) {
      e.preventDefault()
      this.isImageDragOver = false
      inputHandler.dispatchCommand('image-drag-leave', e)

      if (this.draggedIndex !== null) return

      const file = e.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) return

      const img = new Image()
      img.onload = () => {
        const slots = 40 - this.colors.length
        const extractor = new ImageColorExtractor()
        const hexColors = extractor.extract(img, slots)
        hexColors.forEach(hex => this.addCustomColor(hex))
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    }
  }
}
</script>

<style scoped lang="scss">
.color-bar-container {
  position: absolute;
  width: 92px;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  z-index: 101;
}

.colors {
  display: flex;
  flex-wrap: wrap;
  gap: $space-xs;
  padding: $space-sm;
  background-color: $surface-panel;
  font-family: $font-primary;
  box-shadow: $shadow-panel;
  backdrop-filter: $blur-panel;
  border-radius: $radius-panel;
}

.color-placeholder {
  width: $size-button;
  height: $size-button;
}

.color {
  width: $size-button;
  height: $size-button;
  border: 1px solid #b9b9b9d9;
  border-radius: $radius-button;
  cursor: grab;
  @include flex-center;
  font-weight: bold;
  font-size: 18px;
  transition: $transition-default;
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
  border: $border-default;
  box-shadow: 0 0 0 1px rgba(52, 73, 94, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.color.selected::after {
  content: '✓';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 14px;
  height: 14px;
  background-color: $color-primary;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: $font-weight-semibold;
  box-shadow: 0 0.5px 2px rgba(0, 0, 0, 0.15);
}

.color.selected:hover {
  box-shadow: 0 0 0 2px rgba(52, 73, 94, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
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
  background-color: $color-primary;
  border-radius: 2px;
}

.color-number {
  color: #ecf0f1;
  text-shadow:
    -1px -1px 0 $color-primary,
    1px -1px 0 $color-primary,
    -1px 1px 0 $color-primary,
    1px 1px 0 $color-primary,
    0px -1px 0 $color-primary,
    0px 1px 0 $color-primary,
    -1px 0px 0 $color-primary,
    1px 0px 0 $color-primary;
  font-weight: bold;
  font-size: 16px;
}

.color-add {
  @include tool-button;
}

.color-settings {
  @include tool-button;
}

.color-eyedropper {
  @include tool-button;
}

.color-eyedropper.active {
  background-color: rgba(52, 73, 94, 0.2);
  border-color: $border-color-active;
  color: #2c3e50;
}

.color.disabled {
  visibility: hidden;
}

.color-add.hidden {
  visibility: hidden;
  transition: none;
}

.image-drop-overlay {
  position: absolute;
  inset: 0;
  background: $surface-modal;
  backdrop-filter: $blur-panel;
  border-radius: $radius-button;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: $color-primary;
  font-family: $font-primary;
  pointer-events: none;
  z-index: 10;
  box-shadow: $shadow-panel;
  box-sizing: border-box;
  border: 1px solid rgba(185, 185, 185, 0.3);
}

.image-drop-overlay .fa {
  font-size: 20px;
  color: $color-primary;
  opacity: 0.7;
}

.overlay-label {
  text-align: center;
  max-width: 85%;
  line-height: 1.3;
  font-size: 12px;
  font-weight: $font-weight-normal;
  letter-spacing: 0.3px;
  color: rgba(52, 73, 94, 0.8);
}
</style>
