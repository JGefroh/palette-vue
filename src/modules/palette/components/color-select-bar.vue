<template>
  <div class="colors">
    <button
      v-for="color in colors"
      :key="color.hex"
      class="color"
      :class="{ selected: color.hex === modelValue.hex }"
      :style="{
        'background-color': color.hex
      }"
      @click="handleColorClick(color)"
    >
      <span v-if="colorNumbers[color.hex] !== undefined" class="color-number">{{ colorNumbers[color.hex] }}</span>
      <span v-else>&nbsp;</span>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Object,
      default: () => ({ label: 'Turquoise', hex: '#1abc9c' })
    }
  },
  emits: ['update:modelValue'],
  watch: {
    colorNumbers: {
      deep: true,
      handler() {
        localStorage.setItem('palette-color-numbers', JSON.stringify(this.colorNumbers))
      }
    }
  },
  mounted() {
    const saved = localStorage.getItem('palette-color-numbers')
    if (saved) {
      this.colorNumbers = JSON.parse(saved)
    } else {
      this.initializeDefaultColorNumbers()
    }
    window.addEventListener('keydown', this.handleColorShortcut.bind(this))
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleColorShortcut.bind(this))
  },
  data() {
    return {
      colors: [
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
        { label: 'Abestos', hex: '#7f8c8d' },
        { label: 'Pure White', hex: '#FFFFFF' },
        { label: 'Pure Black', hex: '#000000' }
      ],
      colorNumbers: {}
    }
  },
  methods: {
    initializeDefaultColorNumbers() {
      this.colorNumbers['#000000'] = '1' // Black
      this.colorNumbers['#FFFFFF'] = '2' // White
    },
    handleColorClick(color) {
      if (color.hex === this.modelValue.hex) {
        // Already selected: increment number
        this.assignNumber(color)
      } else {
        // Different color: select it
        this.selectColor(color)
      }
    },
    selectColor(color) {
      this.$emit('update:modelValue', color)
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
    },
    handleColorShortcut(event) {
      // Color shortcuts: 0-9
      if (!/^[0-9]$/.test(event.key)) {
        return
      }
      const colorsWithNumber = this.colors.filter(c => this.colorNumbers[c.hex] === event.key)
      if (colorsWithNumber.length === 0) {
        return
      }
      const currentIndex = colorsWithNumber.findIndex(c => c.hex === this.modelValue.hex)
      const nextIndex = (currentIndex + 1) % colorsWithNumber.length
      this.selectColor(colorsWithNumber[nextIndex])
    }
  }
}
</script>

<style scoped>
.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px 20px;
  background-color: #ecf0f1;
}

.color {
  width: 36px;
  height: 36px;
  border: 2px solid #95a5a6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.2s ease;
  outline: none;
}

.color:focus {
  outline: none;
}

.color:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color.selected {
  border: 3px solid #34495e;
  box-shadow: 0 0 0 1px #34495e;
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
</style>
