<template>
  <div ref="colorItem" class="color-item" :class="{ shake: shouldShake }" @click="handleClick" @mouseenter="$emit('hover', hex)" @mouseleave="$emit('unhover')">
    <div class="color-swatch" :style="{ backgroundColor: hex }"></div>
  </div>
</template>

<script>
import { reactive } from 'vue'

const colorItemState = reactive({
  shakeHex: null
})

export default {
  props: {
    hex: {
      type: String,
      required: true
    },
    isDuplicate: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-color', 'hover', 'unhover'],
  data() {
    return {
      colorItemState
    }
  },
  computed: {
    shouldShake() {
      return this.colorItemState.shakeHex === this.hex
    }
  },
  methods: {
    handleClick(event) {
      if (this.isDuplicate) {
        this.colorItemState.shakeHex = this.hex
        setTimeout(() => {
          this.colorItemState.shakeHex = null
        }, 400)
      }

      const rect = this.$refs.colorItem.getBoundingClientRect()
      const screenX = rect.left + rect.width / 2
      const screenY = rect.top + rect.height / 2
      this.$emit('add-color', { screenX, screenY })
    }
  }
}
</script>

<style scoped lang="scss">
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-12px); }
  20% { transform: translateX(12px); }
  30% { transform: translateX(-12px); }
  40% { transform: translateX(12px); }
  50% { transform: translateX(-8px); }
  60% { transform: translateX(8px); }
  70% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.color-item {
  cursor: pointer;
}

.color-item.shake {
  animation: shake 0.4s ease-in-out;
}

.color-swatch {
  width: $size-button;
  height: $size-button;
  border: $border-default;
  border-radius: $radius-button;
  transition: $transition-default;
}

.color-item:hover .color-swatch {
  border-color: $border-color-hover;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
}
</style>
