<template>
  <div v-if="shouldShow" class="tool-options" :style="{ left: calculatedLeft }">
    <div v-for="option in tool.options" :key="option.key" class="option-group">
      <button
        v-for="choice in option.choices"
        :key="choice.value"
        class="option-button"
        :class="{ active: option.selected === choice.value }"
        @click="option.selected = choice.value"
        :title="choice.label"
      >
        <span class="fa fa-fw" :class="choice.icon"></span>
      </button>
    </div>
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

<style scoped>
.tool-options {
  position: absolute;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  background: rgba(211, 211, 211, 0.49);
  backdrop-filter: blur(15px);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  gap: 4px;
  z-index: 101;
}

.option-group {
  display: flex;
  gap: 4px;
}

.option-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid rgba(185, 185, 185, 0.5);
  background-color: transparent;
  color: #34495e;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  transition: all 0.2s ease;
  outline: none;
}

.option-button:hover {
  background-color: rgba(52, 73, 94, 0.1);
  border-color: rgba(185, 185, 185, 0.7);
}

.option-button.active {
  background-color: rgba(52, 73, 94, 0.15);
  border-color: rgba(52, 73, 94, 0.5);
  color: #34495e;
}
</style>
