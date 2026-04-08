<template>
  <div v-if="shouldShow" class="tool-options" :style="{ left: calculatedLeft }">
    <template v-for="(option, index) in tool.options" :key="option.key">
      <div v-if="index > 0" class="divider"></div>
      <div class="option-group">
        <button
          v-for="choice in option.choices"
          :key="choice.value"
          class="option-button"
          :class="{ active: option.selected === choice.value }"
          @click="option.selected = choice.value"
          :title="choice.label"
        >
          <template v-if="choice.icons">
            <span v-for="(icon, idx) in choice.icons" :key="idx" class="fa fa-fw icon-small" :class="icon"></span>
          </template>
          <span v-else class="fa fa-fw" :class="choice.icon"></span>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ToolOptions',
  props: {
    tool: {
      type: Object,
      default: null
    }
  },
  computed: {
    shouldShow() {
      return this.tool && this.tool.options && this.tool.options.length > 0
    },
    calculatedLeft() {
      if (!this.shouldShow) return '0'

      const toolbar = this.$el.parentElement
      if (!toolbar) return '0'

      const toolButtons = toolbar.querySelectorAll('.tool')
      let toolButtonIndex = 0

      for (let i = 0; i < toolButtons.length; i++) {
        const btn = toolButtons[i]
        const btnText = btn.textContent.trim()
        if (btnText === this.tool.name || btn.title === this.tool.name) {
          const rect = btn.getBoundingClientRect()
          const toolbarRect = toolbar.getBoundingClientRect()
          const centerX = rect.left - toolbarRect.left + rect.width / 2
          return `${centerX}px`
        }
      }

      return '0'
    }
  }
}
</script>

<style scoped lang="scss">
.tool-options {
  position: absolute;
  bottom: calc(100% + $space-sm);
  transform: translateX(-50%);
  @include glass-panel;
  padding: $space-sm;
  display: flex;
  gap: $space-xs;
  z-index: 101;
}

.tool-options::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid $surface-panel;
}

.option-group {
  display: flex;
  gap: $space-xs;
}

.divider {
  width: 1px;
  background-color: #c6c6c6;
  margin: 0 $space-xs;
}

.option-button {
  @include tool-button;
}

.icon-small {
  font-size: 0.6em;
  margin: 0 $space-xs;
}
</style>
