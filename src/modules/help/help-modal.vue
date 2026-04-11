<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">×</button>

      <div class="modal-header">
        <h2>Keyboard Shortcuts</h2>
      </div>

      <div class="modal-body">
        <div class="tip-section" @click="randomTip">
          <div class="tip-header">
            <div class="tip-label">💡 Tip</div>
            <div class="tip-refresh">↻</div>
          </div>
          <div class="tip-text">{{ currentTip }}</div>
        </div>

        <div class="shortcuts-grid">
          <div class="shortcuts-column">
            <h3>Tools</h3>
            <table class="shortcuts-table">
              <tr v-for="tool in tools" :key="tool.key">
                <td class="key">{{ tool.key }}</td>
                <td class="description">{{ tool.name }}</td>
              </tr>
            </table>
          </div>

          <div class="shortcuts-column">
            <h3>Global</h3>
            <table class="shortcuts-table">
              <tr v-for="command in commands" :key="command.key">
                <td class="key">{{ command.key }}</td>
                <td class="description">{{ command.description }}</td>
              </tr>
            </table>
          </div>

          <div class="shortcuts-column">
            <h3>Selection</h3>
            <table class="shortcuts-table">
              <tr v-for="cmd in selectionCommands" :key="cmd.key">
                <td class="key">{{ cmd.key }}</td>
                <td class="description">{{ cmd.description }}</td>
              </tr>
            </table>
          </div>

          <div class="shortcuts-column">
            <h3>Colors</h3>
            <table class="shortcuts-table">
              <tr v-for="cmd in colorCommands" :key="cmd.key">
                <td class="key">{{ cmd.key }}</td>
                <td class="description">{{ cmd.description }}</td>
              </tr>
            </table>
          </div>

          <div class="shortcuts-column">
            <h3>Modifiers</h3>
            <table class="shortcuts-table">
              <tr v-for="cmd in modifierCommands" :key="cmd.key">
                <td class="key">{{ cmd.key }}</td>
                <td class="description">{{ cmd.description }}</td>
              </tr>
            </table>
          </div>

          <div class="shortcuts-column">
            <h3>Tabs</h3>
            <table class="shortcuts-table">
              <tr v-for="cmd in tabCommands" :key="cmd.key">
                <td class="key">{{ cmd.key }}</td>
                <td class="description">{{ cmd.description }}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="notices">
          <div class="notice">
            <strong>Auto-save:</strong> Your work is automatically saved to browser storage.
          </div>
          <div class="notice legal">
            <strong>Legal:</strong> Author assumes absolutely no liability of any kind, reserves all rights, and provides as-is without any warranty.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['close'],
  data() {
    return {
      currentTip: '',
      tips: [
        'Constrain shapes to squares or snap lines to axes by holding Shift.',
        'Rename a tab by double-clicking its name.',
        'Manage colors by dragging to reorder or drag out to remove.',
        'Assign keyboard shortcuts (0–9) to colors by clicking repeatedly.',
        'Orient yourself while zoomed in with the position indicator on the bottom right',
        'Extract colors from an image by dragging it onto the color bar.',
        'Clear all colors at once by double-clicking the palette icon.',
        'Preserve aspect ratio while resizing by Shift+dragging a corner.',
        'Stamp a shape (Rectangle or Circle) elsewhere by clicking once after drawing.',
        'Reposition text while typing by dragging the edges of the text box.',
        'Expand the drawing surface up to 4096x4096 by clicking the arrows at the botom and right of it.'
      ],
      tools: [
        { key: 'B', name: 'Brush' },
        { key: 'R', name: 'Rectangle' },
        { key: 'C', name: 'Circle' },
        { key: 'L', name: 'Line' },
        { key: 'T', name: 'Text' },
        { key: 'S', name: 'Select' },
        { key: 'F', name: 'Fill' },
        { key: 'E', name: 'Eyedropper' }
      ],
      commands: [
        { key: 'Cmd+Z', description: 'Undo' },
        { key: 'Cmd+Shift+Z', description: 'Redo' },
        { key: 'Cmd+S', description: 'Download' },
        { key: 'Cmd+A', description: 'Select All' },
        { key: 'Shift+1', description: 'Zoom to fit' }
      ],
      selectionCommands: [
        { key: 'Cmd+C', description: 'Copy' },
        { key: 'Cmd+V', description: 'Paste' },
        { key: 'Cmd+X', description: 'Cut' },
        { key: 'Backspace', description: 'Delete' }
      ],
      colorCommands: [
        { key: '0–9', description: 'Select color' }
      ],
      modifierCommands: [
        { key: 'B', description: 'Cycle brush style' },
        { key: 'Cmd+B', description: 'Toggle arrow (brush)' },
        { key: 'L', description: 'Cycle line style' },
        { key: 'Cmd+L', description: 'Toggle arrow (line)' },
        { key: 'Shift', description: 'Constrain / snap' },
        { key: 'Q / W', description: 'Decrease / increase size' }
      ],
      tabCommands: [
        { key: 'Tab', description: 'Next tab' },
        { key: 'Shift+Tab', description: 'Previous tab' }
      ]
    }
  },
  mounted() {
    this.randomTip()
  },
  methods: {
    randomTip() {
      const randomIndex = Math.floor(Math.random() * this.tips.length)
      this.currentTip = this.tips[randomIndex]
    },
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.modal-overlay {
  @include modal-overlay;
}

.modal-content {
  @include modal-panel;
  width: 700px;
  height: auto;
  max-height: 80vh;
}

.modal-header {
  padding: $space-lg $space-xl;
  border-bottom: $border-default;
  background-color: transparent;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  color: $color-primary;
  font-size: 16px;
  font-weight: $font-weight-semibold;
}

.modal-body {
  padding: $space-lg;
  overflow-y: auto;
  background-color: transparent;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: $space-lg;
  margin-bottom: 0;
}

.shortcuts-column h3 {
  margin: 0 0 $space-sm 0;
  color: $color-primary;
  font-size: 11px;
  font-weight: $font-weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.shortcuts-table {
  width: 100%;
  border-collapse: collapse;
}

.shortcuts-table tr {
  border-bottom: $border-default;
}

.shortcuts-table tr:last-child {
  border-bottom: none;
}

.shortcuts-table td {
  padding: 4px 0;
}

.shortcuts-table td.key {
  font-family: 'Monaco', 'Menlo', monospace;
  background-color: rgba($color-primary, 0.05);
  padding: 3px 6px;
  border-radius: 3px;
  color: $color-primary;
  font-weight: $font-weight-semibold;
  font-size: 10px;
  width: 80px;
  flex-shrink: 0;
}

.shortcuts-table td.description {
  padding-left: 8px;
  color: $color-primary;
  font-size: 10px;
}

.tip-section {
  background-color: rgba($color-primary, 0.05);
  border: 1px solid rgba($color-primary, 0.1);
  border-radius: 4px;
  padding: $space-sm $space-md;
  margin-bottom: $space-md;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.tip-section:hover {
  background-color: rgba($color-primary, 0.08);
  border-color: rgba($color-primary, 0.2);
}

.tip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.tip-label {
  font-size: 10px;
  font-weight: $font-weight-semibold;
  color: $color-primary;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tip-refresh {
  font-size: 11px;
  color: $color-tertiary;
  opacity: 0.6;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tip-section:hover .tip-refresh {
  opacity: 1;
  transform: rotate(180deg);
}

.tip-text {
  font-size: 10px;
  line-height: 1.5;
  color: $color-secondary;
}

.notices {
  border-top: $border-default;
  padding-top: $space-lg;
  margin-top: $space-lg;
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.notice {
  color: $color-secondary;
  font-size: 9px;
  line-height: 1.4;
}

.notice strong {
  color: $color-primary;
  font-weight: $font-weight-semibold;
}

.notice.legal {
  color: $color-tertiary;
  font-size: 9px;
}

.close-button {
  position: absolute;
  top: $space-md;
  right: $space-md;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: $color-tertiary;
  width: $size-close;
  height: $size-close;
  @include flex-center;
  transition: $transition-default;
}

.close-button:hover {
  color: $color-primary;
}
</style>
