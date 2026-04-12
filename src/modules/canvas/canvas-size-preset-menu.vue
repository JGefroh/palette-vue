<template>
  <div v-if="isOpen" class="preset-menu-wrapper">
    <div class="preset-menu">
      <div v-for="preset in presets" :key="preset.label" class="preset-item" @click="selectPreset(preset.width, preset.height, preset.label)">
        <span :class="preset.iconClass"></span>
        <span class="preset-name">{{ preset.label }}</span>
        <span class="preset-size">{{ preset.width }}×{{ preset.height }}</span>
      </div>
    </div>
    <div class="preset-menu-arrow"></div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    drawingCtx: {
      type: Object,
      default: null
    },
    setCanvasDimensions: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      presets: [
        { label: 'Facebook Post', width: 1200, height: 630, iconClass: 'fab fa-fw fa-facebook' },
        { label: 'Instagram Post', width: 1080, height: 1080, iconClass: 'fab fa-fw fa-instagram' },
        { label: 'Instagram Story', width: 1080, height: 1920, iconClass: 'fab fa-fw fa-instagram' },
        { label: 'LinkedIn Post', width: 1200, height: 627, iconClass: 'fab fa-fw fa-linkedin' },
        { label: 'Pinterest', width: 1000, height: 1500, iconClass: 'fab fa-fw fa-pinterest' },
        { label: 'TikTok', width: 1080, height: 1920, iconClass: 'fab fa-fw fa-tiktok' },
        { label: 'Twitter Post', width: 1200, height: 675, iconClass: 'fa fa-fw fa-x' },
        { label: 'YouTube Thumbnail', width: 1280, height: 720, iconClass: 'fab fa-fw fa-youtube' },
        { label: 'Maximum', width: 4096, height: 4096, iconClass: 'fa-fw fa-solid fa-maximize' }
      ]
    }
  },
  emits: ['close'],
  methods: {
    selectPreset(width, height, presetName) {
      if (!this.setCanvasDimensions) return
      this.setCanvasDimensions(width, height)
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
@use '../../styles/variables' as *;
@use '../../styles/mixins' as *;

.preset-menu-wrapper {
  position: absolute;
  bottom: calc(100% - 4px);
  left: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
}

.preset-menu-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid rgba(211, 211, 211, 0.49);
  margin-left: 12px;
  margin-top: -1px;
}

.preset-menu {
  @include glass-panel;
  min-width: 220px;
  max-height: 400px;
  overflow-y: auto;
}

.preset-item {
  padding: $space-md;
  display: flex;
  align-items: center;
  gap: $space-md;
  cursor: pointer;
  transition: $transition-default;
  border-bottom: 1px solid rgba(185, 185, 185, 0.2);
}

.preset-item:last-child {
  border-bottom: none;
}

.preset-item:hover {
  background-color: rgba(52, 73, 94, 0.1);
}

.preset-name {
  font-size: 12px;
  color: $color-primary;
  flex: 1;
  font-weight: $font-weight-medium;
}

.preset-size {
  font-size: 10px;
  color: $color-secondary;
  font-family: monospace;
}
</style>
