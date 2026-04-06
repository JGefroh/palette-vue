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
          width="300"
          height="300"
          @mousedown="startDrag"
          @mousemove="handleMouseMove"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        ></canvas>
        <div class="color-preview">
          <div class="preview-color" :style="{ backgroundColor: currentColor }"></div>
          <input
            v-model="hexInput"
            type="text"
            placeholder="#000000"
            @input="updateColorFromInput"
          >
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button class="btn-confirm" @click="confirmColor">Add Color</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['color-picked', 'close'],
  data() {
    return {
      currentColor: '#ff0000',
      hexInput: '#ff0000',
      isDragging: false
    }
  },
  mounted() {
    this.drawColorWheel()
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
      this.$emit('color-picked', this.currentColor)
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  font-family: 'Montserrat', sans-serif;
  backdrop-filter: blur(15px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(185, 185, 185, 0.3);
  background-color: transparent;
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
  color: #34495e;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #95a5a6;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #34495e;
}

.modal-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background-color: transparent;
}

canvas {
  border: 1px solid rgba(185, 185, 185, 0.5);
  border-radius: 4px;
  cursor: crosshair;
}

.color-preview {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.preview-color {
  width: 60px;
  height: 60px;
  border: 1px solid rgba(185, 185, 185, 0.5);
  border-radius: 4px;
}

input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(185, 185, 185, 0.5);
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  background-color: transparent;
  color: #34495e;
}

input[type="text"]:focus {
  outline: none;
  border-color: rgba(185, 185, 185, 0.7);
  background-color: rgba(52, 73, 94, 0.05);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid rgba(185, 185, 185, 0.3);
  justify-content: flex-end;
  background-color: transparent;
}

button {
  padding: 8px 16px;
  border: 1px solid rgba(185, 185, 185, 0.5);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  background-color: transparent;
  color: #34495e;
  transition: all 0.2s ease;
}

.btn-cancel {
  color: #7f8c8d;
}

.btn-cancel:hover {
  background-color: rgba(52, 73, 94, 0.05);
  border-color: rgba(185, 185, 185, 0.7);
}

.btn-confirm {
  color: #34495e;
  border-color: rgba(52, 73, 94, 0.3);
}

.btn-confirm:hover {
  background-color: rgba(52, 73, 94, 0.1);
  border-color: rgba(52, 73, 94, 0.5);
}
</style>
