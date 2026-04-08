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
          <ul class="info-list">
            <li><strong>Assign shortcuts:</strong> Click a number repeatedly to assign shortcuts.</li>
            <li><strong>Organize:</strong> Drag colors to reorder, drag out to remove.</li>
            <li><strong>Add & browse:</strong> + to add new colors, ⚙ to select a theme.</li>
            <li><strong>Extract from images:</strong> Drag an image onto the color bar to automatically extract the most common colors.</li>
          </ul>
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
        { title: 'Select, Copy & Paste', detail: 'Select elements on your canvas, copy them, and paste multiple times to duplicate and arrange. Resize by dragging corners or rotate by dragging near corners.\n- S - Select\n- Cmd+C - Copy\n- Cmd+V - Paste\n- Delete - Delete selected elements\n- Drag corners - Resize selected content\n- Shift+Drag corners - Preserve aspect ratio while resizing\n- Drag near corners - Rotate selected content\n- Shift+Rotate - Snap to 15° increments\nGreat for creating patterns and symmetrical designs.' },
        { title: 'Tabs', detail: 'Work on multiple drawings simultaneously. Each tab is independent with its own auto-save.\n- Tab - Next tab\n- Shift+Tab - Previous tab\n- Double-click tab name - Rename tab\n- Click X on tab - Delete tab\nSwitch between projects instantly.' },
        { title: 'Keyboard Shortcuts', detail: 'Every tool and command has a keyboard shortcut for efficient workflow.\n- B - Brush, R - Rectangle, C - Circle, L - Line\n- T - Text, S - Select\nAll shortcuts are listed in the Tools section of Help.' },
        { title: 'Download', detail: 'Export your drawing as a PNG file. The filename automatically matches your tab name.\n- Download button in nav bar\nSupports full transparency.' },
        { title: 'Snap & Aspect Ratio', detail: 'Draw precisely aligned shapes and maintain proportional resizes. Snap to axes for pixel-perfect alignment.\n- Hold modifiers while dragging\nGreat for creating grids and consistent designs.' },
        { title: 'Fill', detail: 'Quickly fill areas with the current color. Perfect for filling shapes or large regions.\n- F - Fill tool\n- Click anywhere to fill adjacent areas of similar color' },
        { title: 'Eyedropper', detail: 'Sample colors directly from your canvas or any image. Instantly add colors to your palette.\n- E - Toggle eyedropper\n- Click to sample a color\nColors are automatically added to your palette when sampled.' }
      ],
      tools: [
        { key: 'B', name: 'Brush', brushOptions: true },
        { key: 'R', name: 'Rectangle', toggleMode: true },
        { key: 'C', name: 'Circle', toggleMode: true },
        { key: 'L', name: 'Line', lineOptions: true },
        { key: 'T', name: 'Text' },
        { key: 'S', name: 'Select', toggleMode: true },
        { key: 'F', name: 'Fill' },
        { key: 'E', name: 'Eyedropper' }
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

<style scoped lang="scss">
.modal-overlay {
  @include modal-overlay;
}

.modal-content {
  @include modal-panel;
  width: 600px;
  height: 640px;
}

.modal-header {
  padding: $space-lg $space-xl $space-md $space-xl;
  border-bottom: $border-default;
  background-color: transparent;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: $space-sm;
}

.modal-header h2 {
  margin: 0;
  color: $color-primary;
  font-size: 16px;
  font-weight: $font-weight-semibold;
}

.github-link {
  color: $color-primary;
  text-decoration: none;
  font-size: 16px;
  transition: $transition-default;
  flex-shrink: 0;
}

.github-link:hover {
  color: $color-secondary;
}

.modal-tabs {
  display: flex;
  gap: $space-xs;
  padding: $space-sm $space-lg;
  background-color: rgba($border-color-default, 0.1);
  border-bottom: $border-default;
}

.tab-button {
  padding: $space-sm $space-lg;
  border: $border-default;
  border-radius: $radius-button;
  background-color: transparent;
  color: $color-secondary;
  cursor: pointer;
  font-family: $font-primary;
  font-size: 11px;
  font-weight: $font-weight-semibold;
  transition: $transition-default;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-button:hover {
  color: $color-primary;
  background-color: rgba($color-primary, 0.05);
  border-color: $border-color-hover;
}

.tab-button.active {
  color: $color-primary;
  background-color: $btn-active-bg;
  border-color: $border-color-active;
}

.modal-body {
  padding: $space-md $space-lg;
  overflow-y: auto;
  flex: 1;
  background-color: transparent;
}

.section {
  margin-bottom: $space-sm;
  margin-top: $space-md;
}

.section:first-of-type {
  margin-top: 0;
}

.info-list {
  list-style-type: disc;
  padding-left: $space-lg;
  margin: 0;
}

.info-list li {
  color: $color-secondary;
  font-size: 10px;
  line-height: 1.3;
  margin-bottom: $space-xs;
}

.info-list li:last-child {
  margin-bottom: 0;
}

.info-list li strong {
  color: $color-primary;
  font-weight: $font-weight-semibold;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  padding: 6px 0;
  color: $color-primary;
  border-bottom: $border-default;
  font-size: 11px;
  line-height: 1.4;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.features-list li:last-child {
  border-bottom: none;
}

.features-list li.hovered {
  background-color: rgba($color-primary, 0.05);
}

.feature-detail {
  margin-top: $space-md;
  padding-top: $space-sm;
}

.detail-divider {
  height: 1px;
  background-color: $border-default;
  margin-bottom: $space-sm;
}

.detail-text {
  color: $color-secondary;
  font-size: 10px;
  line-height: 1.6;
}

.detail-text > div {
  margin: $space-xs 0;
}

.detail-text > div.detail-bullet {
  margin-left: $space-md;
  color: $color-secondary;
}

.detail-text > div.detail-bullet::before {
  content: '• ';
  color: $color-tertiary;
  margin-right: $space-xs;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-md;
  margin-bottom: $space-md;
}

.shortcuts-column h3 {
  margin: 0 0 $space-xs 0;
  color: $color-primary;
  font-size: 11px;
  font-weight: $font-weight-semibold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section h3 {
  margin: 0 0 $space-xs 0;
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
  padding: $space-xs 0;
}

.shortcuts-table td.key {
  font-family: 'Monaco', 'Menlo', monospace;
  background-color: rgba($color-primary, 0.05);
  padding: $space-xs 6px;
  border-radius: 3px;
  color: $color-primary;
  font-weight: $font-weight-semibold;
  width: 70px;
  font-size: 10px;
}

.shortcuts-table td.description {
  padding-left: 6px;
  color: $color-primary;
  font-size: 10px;
}

.footer-section {
  margin-top: $space-md;
  padding-top: $space-md;
  border-top: $border-default;
  text-align: center;
}

.footer-section a {
  color: $color-primary;
  text-decoration: none;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: $space-xs;
  transition: $transition-default;
}

.toggle-info {
  display: inline;
  color: $color-tertiary;
  font-size: 9px;
  font-style: italic;
  margin-left: 2px;
}

.info-text {
  color: $color-secondary;
  margin: 0 0 3px 0;
  font-size: 10px;
  line-height: 1.3;
}

.info-text strong {
  color: $color-primary;
  font-weight: $font-weight-semibold;
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
