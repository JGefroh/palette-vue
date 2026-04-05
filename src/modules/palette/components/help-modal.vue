<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">×</button>

      <div class="modal-header">
        <div class="header-title">
          <h2>Get started with Palette</h2>
          <a href="https://github.com/jgefroh/palette-vue" target="_blank" rel="noopener noreferrer" class="github-link" title="View on GitHub">
            <span class="fa fa-fw fa-github"></span>
          </a>
        </div>
      </div>

      <div class="modal-body">
        <div class="shortcuts-grid">
          <div class="shortcuts-column">
            <h3>Tools</h3>
            <table class="shortcuts-table">
              <tr v-for="tool in tools" :key="tool.key">
                <td class="key">{{ tool.key }}</td>
                <td class="description">
                  {{ tool.name }}
                  <br v-if="tool.toggleMode" />
                  <span v-if="tool.toggleMode" class="toggle-info">fill/outline</span>
                </td>
              </tr>
            </table>
          </div>

          <div class="shortcuts-column">
            <h3>Commands</h3>
            <table class="shortcuts-table">
              <tr v-for="command in commands" :key="command.key">
                <td class="key">{{ command.key }}</td>
                <td class="description">{{ command.description }}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="section">
          <h3>Colors</h3>
          <p class="info-text"><strong>Assign shortcuts:</strong> Click a number repeatedly to assign shortcuts.</p>
          <p class="info-text"><strong>Organize:</strong> Drag colors to reorder, drag out to remove.</p>
          <p class="info-text"><strong>Add & browse:</strong> + to add new colors, ⚙ to select a theme.</p>
        </div>

        <div class="section">
          <h3>Storage</h3>
          <p class="info-text">Palette auto-saves work to your browser storage.</p>
        </div>

        <div class="section">
          <h3>Legal</h3>
          <p class="info-text">Author assumes absolutely no liability of any kind, reserves all rights, and provides as-is without any warranty.</p>
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
      tools: [
        { key: 'B', name: 'Brush' },
        { key: 'R', name: 'Rectangle', toggleMode: true },
        { key: 'C', name: 'Circle', toggleMode: true },
        { key: 'L', name: 'Line', toggleMode: true },
        { key: 'T', name: 'Text' },
        { key: 'S', name: 'Select', toggleMode: true }
      ],
      commands: [
        { key: 'Cmd+Z / Ctrl+Z', description: 'Undo' },
        { key: 'Cmd+Shift+Z / Ctrl+Y', description: 'Redo' },
        { key: 'Ctrl+Scroll / Cmd+Scroll', description: 'Zoom' },
        { key: 'Tab', description: 'Next tab' },
        { key: 'Shift+Tab', description: 'Previous tab' },
        { key: 'Cmd+C / Ctrl+C', description: 'Copy selected elements' },
        { key: 'Cmd+V / Ctrl+V', description: 'Paste copied elements' }
      ]
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
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

.modal-content {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  max-height: 80vh;
  position: relative;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(15px);
}

.modal-header {
  padding: 16px 20px 12px 20px;
  border-bottom: 1px solid rgba(185, 185, 185, 0.3);
  background-color: transparent;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-header h2 {
  margin: 0;
  color: #34495e;
  font-size: 16px;
  font-weight: 600;
}

.github-link {
  color: #34495e;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.github-link:hover {
  color: #7f8c8d;
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  background-color: transparent;
}

.section {
  margin-bottom: 12px;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.shortcuts-column h3 {
  margin: 0 0 8px 0;
  color: #34495e;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section h3 {
  margin: 0 0 8px 0;
  color: #34495e;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.shortcuts-table {
  width: 100%;
  border-collapse: collapse;
}

.shortcuts-table tr {
  border-bottom: 1px solid rgba(185, 185, 185, 0.15);
}

.shortcuts-table tr:last-child {
  border-bottom: none;
}

.shortcuts-table td {
  padding: 6px 0;
}

.shortcuts-table td.key {
  font-family: 'Monaco', 'Menlo', monospace;
  background-color: rgba(52, 73, 94, 0.05);
  padding: 4px 8px;
  border-radius: 3px;
  color: #34495e;
  font-weight: 600;
  width: 70px;
  font-size: 11px;
}

.shortcuts-table td.description {
  padding-left: 8px;
  color: #34495e;
  font-size: 11px;
}

.toggle-info {
  display: inline;
  color: #95a5a6;
  font-size: 10px;
  font-style: italic;
  margin-left: 4px;
}

.info-text {
  color: #7f8c8d;
  margin: 0 0 6px 0;
  font-size: 11px;
  line-height: 1.4;
}

.info-text strong {
  color: #34495e;
  font-weight: 600;
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #95a5a6;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #34495e;
}

.footer-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(185, 185, 185, 0.2);
  text-align: center;
}

.footer-section a {
  color: #34495e;
  text-decoration: none;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: #7f8c8d;
}
</style>
