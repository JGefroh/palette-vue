<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Pick a Color</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-content">
        <canvas
          ref="colorWheel"
          width="250"
          height="250"
          @mousedown="startDrag"
          @mousemove="handleMouseMove"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        ></canvas>
        <div class="color-preview" @click="confirmColor" ref="colorPreview">
          <div class="preview-color" :style="{ backgroundColor: previewColor || currentColor }"></div>
          <div class="color-info">
            <div class="hex">{{ previewColor || currentColor }}</div>
            <div class="rgb">{{ previewColorRGB }}</div>
          </div>
        </div>
        <div class="generated-colors">
          <div v-for="category in colorCategoryOrder" :key="category.label" class="generated-section">
            <div class="section-label">{{ category.label }}</div>
            <div class="colors-grid" :class="{ single: category.isSingle }">
              <template v-for="key in category.keys" :key="key">
                <ColorItem
                  v-for="hex in generatedColors[key]"
                  :key="hex"
                  :hex="hex"
                  @add-color="addColorToBar(hex, $event)"
                  @hover="previewColor = $event"
                  @unhover="previewColor = null"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import ColorItem from './color-item.vue'

export default {
  components: {
    ColorItem
  },
  emits: ['color-picked', 'close'],
  props: {
    initialColor: {
      type: String,
      default: '#ff0000'
    },
    selectedColor: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      currentColor: this.initialColor,
      hexInput: this.initialColor,
      isDragging: false,
      previewColor: null,
      generatedColors: {
        palette: ['#ff0000', '#00ffff', '#ff00ff', '#ffff00'],
        dark: ['#800000', '#400000'],
        light: ['#ff8080', '#ffbfbf'],
        complement: ['#00ffff', '#00e6ff', '#00ccff', '#00b3ff'],
        contrast: ['#00ff00', '#33ff00', '#0000ff', '#ff0033'],
        analogous: ['#ff6600', '#ff3300', '#ff0033', '#ff0066'],
        triadic: ['#00ff00', '#0080ff', '#0000ff', '#ff00ff'],
        desaturated: ['#cc6666', '#bb7777', '#996666', '#885555'],
        grayscale: ['#999999', '#777777', '#666666', '#333333']
      },
      colorCategoryOrder: [
        { label: 'Palette', keys: ['palette'] },
        { label: 'Darker / Lighter', keys: ['light', 'dark'] },
        { label: 'Complementary', keys: ['complement'] },
        { label: 'Contrasting', keys: ['contrast'] },
        { label: 'Analogous', keys: ['analogous'] },
        { label: 'Triadic', keys: ['triadic'] },
        { label: 'Desaturated', keys: ['desaturated'] },
        { label: 'Grayscale', keys: ['grayscale'] }
      ]
    }
  },
  computed: {
    colorRGB() {
      const r = parseInt(this.currentColor.slice(1, 3), 16)
      const g = parseInt(this.currentColor.slice(3, 5), 16)
      const b = parseInt(this.currentColor.slice(5, 7), 16)
      return `rgb(${r}, ${g}, ${b})`
    },
    previewColorRGB() {
      const hex = this.previewColor || this.currentColor
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgb(${r}, ${g}, ${b})`
    }
  },
  watch: {
    currentColor() {
      this.generateColorVariants()
    },
    selectedColor(newColor) {
      if (newColor && newColor !== this.currentColor) {
        this.currentColor = newColor
      }
    }
  },
  mounted() {
    this.drawColorWheel()
    this.generateColorVariants()
  },
  methods: {
    drawColorWheel() {
      const canvas = this.$refs.colorWheel
      const ctx = canvas.getContext('2d')
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) - 10

      // Draw color wheel
      for (let angle = 0; angle < 360; angle += 1) {
        const rad = (angle * Math.PI) / 180
        const gradient = ctx.createLinearGradient(
          centerX,
          centerY,
          centerX + Math.cos(rad) * radius,
          centerY + Math.sin(rad) * radius
        )
        gradient.addColorStop(0, `hsl(${angle}, 0%, 50%)`)
        gradient.addColorStop(0.5, `hsl(${angle}, 50%, 50%)`)
        gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, rad, rad + (Math.PI / 180) * 1.1)
        ctx.closePath()
        ctx.fill()
      }
    },
    startDrag(event) {
      this.isDragging = true
      this.updateColorFromEvent(event)
    },
    endDrag() {
      this.isDragging = false
    },
    handleMouseMove(event) {
      const canvas = this.$refs.colorWheel
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const radius = Math.min(centerX, centerY) - 10

      if (distToCenter <= radius) {
        canvas.style.cursor = 'crosshair'
      } else {
        canvas.style.cursor = 'default'
      }

      if (this.isDragging) {
        this.updateColorFromEvent(event)
      }
    },
    updateColorFromEvent(event) {
      const color = this.getColorFromClick(event)
      this.currentColor = color
      this.hexInput = color
    },
    getColorFromClick(event) {
      const canvas = this.$refs.colorWheel
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      const dx = x - centerX
      const dy = y - centerY
      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
      if (angle < 0) angle += 360

      const distance = Math.sqrt(dx * dx + dy * dy)
      const radius = Math.min(centerX, centerY) - 10
      const saturation = Math.min(distance / radius, 1)
      const lightness = 50

      return this.hslToHex(angle, saturation * 100, lightness)
    },
    hslToHex(h, s, l) {
      s /= 100
      l /= 100
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = l - c / 2

      let r = 0, g = 0, b = 0
      if (h >= 0 && h < 60) {
        r = c; g = x; b = 0
      } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0
      } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x
      } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c
      } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c
      } else {
        r = c; g = 0; b = x
      }

      const toHex = (value) => {
        const hex = Math.round((value + m) * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
    },
    updateColorFromInput(event) {
      const hex = event.target.value
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        this.currentColor = hex
      }
    },
    confirmColor() {
      const rect = this.$refs.colorPreview.getBoundingClientRect()
      const screenX = rect.left + rect.width / 2
      const screenY = rect.top + rect.height / 2
      this.$emit('color-picked', { hex: this.currentColor, screenX, screenY })
    },
    addColorToBar(color, positionData) {
      this.$emit('color-picked', { hex: color, screenX: positionData?.screenX, screenY: positionData?.screenY })
    },
    generateColorVariants() {
      const hsl = this.hexToHsl(this.currentColor)
      this.generatedColors.palette = [
        this.currentColor,
        this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h - 90 + 360) % 360, hsl.s, hsl.l)
      ]
      this.generatedColors.dark = [
        this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 5)),
        this.hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 40, 5))
      ]
      this.generatedColors.light = [
        this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 95)),
        this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 40, 95))
      ]
      this.generatedColors.complement = [
        this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 180) % 360, hsl.s, Math.min(hsl.l + 15, 95)),
        this.hslToHex((hsl.h + 180) % 360, Math.max(hsl.s - 15, 20), hsl.l),
        this.hslToHex((hsl.h + 180) % 360, Math.max(hsl.s - 30, 10), hsl.l)
      ]
      this.generatedColors.contrast = [
        this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
      ]
      this.generatedColors.analogous = [
        this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h - 15 + 360) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
      ]
      this.generatedColors.triadic = [
        this.hslToHex(hsl.h, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
        this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
      ]
      this.generatedColors.desaturated = [
        this.hslToHex(hsl.h, Math.max(hsl.s - 20, 15), hsl.l),
        this.hslToHex(hsl.h, Math.max(hsl.s - 35, 10), hsl.l),
        this.hslToHex(hsl.h, Math.max(hsl.s - 50, 5), hsl.l),
        this.hslToHex(hsl.h, Math.max(hsl.s - 65, 0), hsl.l)
      ]
      this.generatedColors.grayscale = [
        this.hslToHex(0, 0, hsl.l),
        this.hslToHex(0, 0, Math.max(hsl.l - 20, 5)),
        this.hslToHex(0, 0, Math.max(hsl.l - 40, 5)),
        this.hslToHex(0, 0, Math.min(hsl.l + 25, 95))
      ]
    },
    invertColor(hex) {
      const r = 255 - parseInt(hex.slice(1, 3), 16)
      const g = 255 - parseInt(hex.slice(3, 5), 16)
      const b = 255 - parseInt(hex.slice(5, 7), 16)
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase()
    },
    hexToHsl(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0, s = 0
      const l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
          case g: h = ((b - r) / d + 2) / 6; break
          case b: h = ((r - g) / d + 4) / 6; break
        }
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
    }
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  @include modal-overlay;
  z-index: 100;
}

.modal {
  @include modal-panel;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-lg $space-xl;
  border-bottom: $border-default;
  background-color: transparent;
}

.modal-header h2 {
  margin: 0;
  font-size: $font-size-subheader;
  color: $color-primary;
  font-weight: $font-weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: $color-tertiary;
  padding: 0;
  width: $size-close;
  height: $size-close;
  @include flex-center;
  transition: $transition-default;
}

.close-btn:hover {
  color: $color-primary;
}

.modal-content {
  padding: $space-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-xl;
  background-color: transparent;
  overflow-y: auto;
}

canvas {
  border: $border-default;
  border-radius: $radius-button;
  cursor: crosshair;
}

.color-preview {
  @include glass-panel;
  display: flex;
  gap: $space-lg;
  align-items: center;
  padding: $space-sm $space-lg $space-md $space-lg;
  cursor: pointer;
  transition: $transition-default;
  min-width: 250px;
}

.color-preview:hover {
  background-color: rgba($color-primary, 0.08);
  border-color: $border-color-hover;
}

.preview-color {
  width: calc($size-button * 1.5);
  height: calc($size-button * 1.5);
  border: $border-default;
  border-radius: $radius-button;
  flex-shrink: 0;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: $space-xs;
}

.hex {
  font-weight: $font-weight-semibold;
  font-family: $font-primary;
  font-size: $font-size-body;
  color: $color-primary;
  letter-spacing: 0.5px;
}

.rgb {
  font-size: $font-size-subheader;
  color: $color-primary;
  font-family: $font-primary;
  font-weight: $font-weight-medium;
}

.generated-colors {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: $space-xl * 2.5;
  row-gap: $space-xl;
  max-width: fit-content;
  margin: 0 auto;
}

.generated-section {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  align-items: center;
}

.section-label {
  font-size: $font-size-body;
  color: $color-tertiary;
  font-weight: $font-weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(4, $size-button);
  gap: $space-md;
}

.colors-grid.single {
  grid-template-columns: $size-button;
}


.modal-footer {
  display: flex;
  gap: $space-md;
  padding: $space-lg $space-xl;
  border-top: $border-default;
  justify-content: flex-end;
  background-color: transparent;
}

button {
  padding: $space-sm $space-lg;
  border: $border-default;
  border-radius: $radius-button;
  cursor: pointer;
  font-size: $font-size-body;
  font-weight: $font-weight-semibold;
  background-color: transparent;
  color: $color-primary;
  transition: $transition-default;
}

button:hover {
  background-color: $btn-hover-bg;
  border-color: $border-color-hover;
}

button:active {
  background-color: $btn-active-bg;
  border-color: $border-color-active;
}
</style>
