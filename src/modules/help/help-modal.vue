<template>
  <div class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">×</button>

      <div class="modal-header">
        <div class="header-title">
          <h2>Get started with Palette</h2>
          <a href="https://github.com/jgefroh/palette-vue" target="_blank" rel="noopener noreferrer" class="github-link" title="View on GitHub">
            <span class="fa-brands fa-github"></span>
          </a>
        </div>
      </div>

      <div class="modal-tabs">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'intro' }"
          @click="activeTab = 'intro'"
        >
          Intro
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'features' }"
          @click="activeTab = 'features'"
        >
          Features
        </button>
      </div>

      <div class="modal-body">
        <div v-if="activeTab === 'intro'">
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
                  <br v-if="tool.brushOptions" />
                  <span v-if="tool.brushOptions" class="toggle-info">B to cycle style, Cmd+B for arrow</span>
                  <br v-if="tool.lineOptions" />
                  <span v-if="tool.lineOptions" class="toggle-info">L to cycle style, Cmd+L for arrow</span>
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

        <div v-if="activeTab === 'features'">
          <p class="info-text">Palette's goal is simple, rapid sketching.</p>
          <ul class="features-list">
            <li
              v-for="(feature, index) in featuresList"
              :key="index"
              @mouseenter="hoveredFeature = index"
              @mouseleave="hoveredFeature = null"
              :class="{ hovered: hoveredFeature === index }"
            >
              {{ feature.title }}
            </li>
          </ul>
          <div v-if="hoveredFeature !== null" class="feature-detail">
            <div class="detail-divider"></div>
            <div class="detail-text">
              <div v-for="(line, index) in featuresList[hoveredFeature].detail.split('\n')" :key="index" :class="{ 'detail-bullet': line.trim().startsWith('-') }">
                {{ line.trim().startsWith('-') ? line.trim().substring(2) : line }}
              </div>
            </div>
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
      activeTab: 'intro',
      hoveredFeature: null,
      featuresList: [
        { title: 'Drawing & Shapes', detail: 'Freehand drawing and 4 shape tools (rectangle, circle, line) with fill or outline mode. Draw freely with the brush tool or use shapes for structured elements. Click a shape tool twice to toggle between fill and outline modes.\n- B - Brush (with line style and arrow options)\n- R - Rectangle\n- C - Circle\n- L - Line (with line style and arrow options)\nClick and drag to draw. Hold Shift while dragging shapes to preserve aspect ratio. Lines snap to axis. Each tool can have its own line style (solid, dashed, dotted).' },
        { title: 'Color Palette', detail: 'Manage colors with custom colors from the color wheel or pre-made themes. Add, remove, reorder, and assign keyboard shortcuts to colors.\n- + button - Add custom color\n- ⚙ button - Browse themes\n- Drag to reorder colors\n- Drag out to remove\n- Click a color repeatedly to assign 0–9 shortcuts\n- 0–9 - Toggle between assigned colors' },
        { title: 'Undo, Redo & Auto-Save', detail: 'Full undo/redo history and automatic saving to browser storage every 500ms. Your work persists even after closing the browser, unless your browser settings change this.\n- Cmd+Z - Undo\n- Cmd+Shift+Z - Redo\nAuto-save happens silently in the background.' },
        { title: 'Zoom & Pan', detail: 'Zoom in to see fine details or out for the full picture. Pan around the canvas while zoomed to explore different areas.\n- Ctrl+Scroll - Zoom (Cmd+Scroll on Mac)\nPan to navigate without losing focus on zoomed areas.' },
        { title: 'Image Import', detail: 'Drag images directly into your canvas for use as references, backgrounds, or tracing guides.\n- Drag any image onto canvas\nPerfect for tracing photos or layering backgrounds.' },
        { title: 'Select, Copy & Paste', detail: 'Select elements on your canvas, copy them, and paste multiple times to duplicate and arrange.\n- S - Select\n- Cmd+C - Copy\n- Cmd+V - Paste\n- Delete - Delete selected elements\nGreat for creating patterns and symmetrical designs.' },
        { title: 'Tabs', detail: 'Work on multiple drawings simultaneously. Each tab is independent with its own auto-save.\n- Tab - Next tab\n- Shift+Tab - Previous tab\n- Double-click tab name - Rename tab\n- Click X on tab - Delete tab\nSwitch between projects instantly.' },
        { title: 'Keyboard Shortcuts', detail: 'Every tool and command has a keyboard shortcut for efficient workflow.\n- B - Brush, R - Rectangle, C - Circle, L - Line\n- T - Text, S - Select\nAll shortcuts are listed in the Tools section of Help.' },
        { title: 'Download', detail: 'Export your drawing as a PNG file. The filename automatically matches your tab name.\n- Download button in nav bar\nSupports full transparency.' },
        { title: 'Snap & Aspect Ratio', detail: 'Draw precisely aligned shapes and maintain proportional resizes. Snap to axes for pixel-perfect alignment.\n- Hold modifiers while dragging\nGreat for creating grids and consistent designs.' }
      ],
      tools: [
        { key: 'B', name: 'Brush', brushOptions: true },
        { key: 'R', name: 'Rectangle', toggleMode: true },
        { key: 'C', name: 'Circle', toggleMode: true },
        { key: 'L', name: 'Line', lineOptions: true },
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
  width: 600px;
  height: 640px;
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

.modal-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  background-color: rgba(185, 185, 185, 0.1);
  border-bottom: 1px solid rgba(185, 185, 185, 0.2);
}

.tab-button {
  padding: 8px 16px;
  border: 1px solid rgba(185, 185, 185, 0.3);
  border-radius: 4px;
  background-color: transparent;
  color: #7f8c8d;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-button:hover {
  color: #34495e;
  background-color: rgba(52, 73, 94, 0.05);
  border-color: rgba(185, 185, 185, 0.5);
}

.tab-button.active {
  color: #34495e;
  background-color: rgba(52, 73, 94, 0.15);
  border-color: rgba(52, 73, 94, 0.5);
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

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  padding: 6px 0;
  color: #34495e;
  border-bottom: 1px solid rgba(185, 185, 185, 0.15);
  font-size: 11px;
  line-height: 1.4;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.features-list li:last-child {
  border-bottom: none;
}

.features-list li.hovered {
  background-color: rgba(52, 73, 94, 0.05);
}

.feature-detail {
  margin-top: 12px;
  padding-top: 8px;
}

.detail-divider {
  height: 1px;
  background-color: rgba(185, 185, 185, 0.2);
  margin-bottom: 8px;
}

.detail-text {
  color: #7f8c8d;
  font-size: 10px;
  line-height: 1.6;
}

.detail-text > div {
  margin: 4px 0;
}

.detail-text > div.detail-bullet {
  margin-left: 12px;
  color: #7f8c8d;
}

.detail-text > div.detail-bullet::before {
  content: '• ';
  color: #95a5a6;
  margin-right: 4px;
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
