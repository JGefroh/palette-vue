<template>
  <div class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: activeTabId === tab.id }"
      @click="switchTab(tab.id)"
      @dblclick="renameTab(tab)"
    >{{ tab.name }} <span class="tab-delete" @click.stop="deleteTab(tab)">✕</span></button>
    <button class="tab tab-add" @click="addTab">+</button>
    <DownloadButton
      :tab-name="getActiveTab()?.name || 'Canvas'"
    />
  </div>
</template>

<script>
import DownloadButton from './download-button.vue'

export default {
  components: {
    DownloadButton
  },
  props: {
    onSwitchTab: {
      type: Function,
      required: true
    }
  },
  emits: ['tab-changed'],
  data() {
    return {
      tabs: [{ id: 1, name: 'Canvas 1' }],
      activeTabId: 1,
      nextTabId: 2
    }
  },
  mounted() {
    this.loadSavedTabs()
  },
  methods: {
    switchTab(id) {
      this.activeTabId = id
      this.onSwitchTab(id)
    },
    addTab() {
      const id = this.nextTabId++
      this.tabs.push({ id, name: `Canvas ${id}` })
      this.switchTab(id)
      this.saveTabs()
    },
    deleteTab(tab) {
      if (!confirm(`Delete "${tab.name}"?`)) return
      const index = this.tabs.indexOf(tab)
      this.tabs.splice(index, 1)
      localStorage.removeItem(`palette-canvas-${tab.id}`)
      if (this.tabs.length === 0) {
        this.tabs.push({ id: this.nextTabId++, name: 'Canvas 1' })
      }
      if (this.activeTabId === tab.id) {
        this.switchTab(this.tabs[Math.max(0, index - 1)].id)
      }
      this.saveTabs()
    },
    renameTab(tab) {
      const name = prompt('Canvas name:', tab.name)
      if (name) {
        tab.name = name
        this.saveTabs()
      }
    },
    getActiveTab() {
      return this.tabs.find(t => t.id === this.activeTabId)
    },
    saveTabs() {
      localStorage.setItem('palette-tabs', JSON.stringify(this.tabs))
      this.$emit('tab-changed')
    },
    loadSavedTabs() {
      const savedTabs = localStorage.getItem('palette-tabs')
      if (savedTabs) {
        this.tabs = JSON.parse(savedTabs)
        this.activeTabId = this.tabs[0].id
        this.nextTabId = Math.max(...this.tabs.map(t => t.id)) + 1
        return true
      }
      return false
    },
    hasSavedTabs() {
      return !!localStorage.getItem('palette-tabs')
    }
  }
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  padding: 0 20px;
  background-color: #ecf0f1;
  border-bottom: 2px solid #bdc3c7;
}

.tab {
  padding: 6px 20px;
  border: 1px solid #bdc3c7;
  border-bottom: none;
  background-color: #dde1e4;
  color: #7f8c8d;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  position: relative;
  bottom: -2px;
}

.tab.active {
  background-color: white;
  color: #34495e;
  border-color: #bdc3c7;
  border-bottom: 2px solid white;
  font-weight: 600;
}

.tab:hover:not(.active) {
  background-color: #cdd1d4;
}

.tab-delete {
  color: #bdc3c7;
  font-size: 10px;
  margin-left: 6px;
  vertical-align: middle;
}

.tab-delete:hover {
  color: #7f8c8d;
}

.tab-add {
  font-size: 16px;
  padding: 4px 10px;
}
</style>
