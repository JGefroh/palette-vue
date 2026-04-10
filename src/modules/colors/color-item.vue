<template>
  <div ref="colorItem" class="color-item" @click="handleClick" @mouseenter="$emit('hover', hex)" @mouseleave="$emit('unhover')">
    <div class="color-swatch" :style="{ backgroundColor: hex }"></div>
  </div>
</template>

<script>
export default {
  props: {
    hex: {
      type: String,
      required: true
    }
  },
  emits: ['add-color', 'hover', 'unhover'],
  methods: {
    handleClick(event) {
      const rect = this.$refs.colorItem.getBoundingClientRect()
      const screenX = rect.left + rect.width / 2
      const screenY = rect.top + rect.height / 2
      this.$emit('add-color', { screenX, screenY })
    }
  }
}
</script>

<style scoped lang="scss">
.color-item {
  cursor: pointer;
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
