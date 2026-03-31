<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">×</button>

      <div class="modal-header">
        <h2>Help & Features</h2>
      </div>

      <div class="modal-body">
        <div class="section">
          <h3>Tool Shortcuts</h3>
          <table class="shortcuts-table">
            <tr v-for="tool in tools" :key="tool.key">
              <td class="key">{{ tool.key }}</td>
              <td class="description">
                {{ tool.name }}
                <br v-if="tool.toggleMode" />
                <span v-if="tool.toggleMode" class="toggle-info">toggle fill / outline</span>
              </td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3>Commands</h3>
          <table class="shortcuts-table">
            <tr v-for="command in commands" :key="command.key">
              <td class="key">{{ command.key }}</td>
              <td class="description">{{ command.description }}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3>Color Shortcuts</h3>
          <p class="info-text">Number keys 0-9 cycle through colors you've assigned them to. Click a color multiple times to assign a number.</p>
        </div>

        <div class="section">
          <h3>Supported Features</h3>
          <ul class="features-list">
            <li>Freehand drawing with customizable brush size (5-100px)</li>
            <li>Undo/Redo with keyboard shortcuts</li>
            <li>Multiple tabs for different drawings</li>
            <li>Save and load drawings (persisted locally)</li>
            <li>Zoom in/out with Ctrl+Scroll (or Cmd+Scroll on Mac)</li>
            <li>Pan canvas while zoomed</li>
            <li>Fill and outline shapes</li>
            <li>Text tool</li>
            <li>Selection and manipulation of drawn elements</li>
            <li>Drag and drop image import</li>
            <li>24-color palette with custom shortcuts</li>
          </ul>
        </div>

        <div class="section footer-section">
          <a href="https://github.com/jgefroh/palette-vue" target="_blank" rel="noopener noreferrer">
            <span class="fa fa-fw fa-github"></span> View on GitHub
          </a>
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
        { key: 'Cmd+S / Ctrl+S', description: 'Save' },
        { key: 'Ctrl+Scroll / Cmd+Scroll', description: 'Zoom' }
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  max-height: 80vh;
  position: relative;
  padding: 0;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #ecf0f1;
  background-color: #f8f9fa;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  color: #34495e;
  font-size: 24px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  margin: 0 0 12px 0;
  color: #34495e;
  font-size: 16px;
  font-weight: 600;
}

.shortcuts-table {
  width: 100%;
  border-collapse: collapse;
}

.shortcuts-table tr {
  border-bottom: 1px solid #ecf0f1;
}

.shortcuts-table tr:last-child {
  border-bottom: none;
}

.shortcuts-table td {
  padding: 8px 0;
}

.shortcuts-table td.key {
  font-family: 'Monaco', 'Menlo', monospace;
  background-color: #f8f9fa;
  padding: 8px 12px;
  border-radius: 4px;
  color: #e74c3c;
  font-weight: 600;
  width: 120px;
}

.shortcuts-table td.description {
  padding-left: 16px;
  color: #34495e;
}

.toggle-info {
  display: block;
  color: #95a5a6;
  font-size: 13px;
  font-style: italic;
  margin-top: 4px;
}

.info-text {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  padding: 8px 0;
  color: #34495e;
  border-bottom: 1px solid #ecf0f1;
}

.features-list li:last-child {
  border-bottom: none;
}

.close-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #95a5a6;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #34495e;
}

.footer-section {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #ecf0f1;
  text-align: center;
}

.footer-section a {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: #2980b9;
  text-decoration: underline;
}
</style>
