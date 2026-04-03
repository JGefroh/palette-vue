<template>
  <div class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: getSelectedTab()?.id === tab.id }"
      @click="selectTab(tab.id)"
      @dblclick="renameTab(tab)"
    >{{ tab.name }} <span class="tab-delete" @click.stop="deleteTab(tab)">✕</span></button>
    <button class="tab tab-add" @click="addTab(false)">+</button>
    <DownloadButton
      :tab-name="getSelectedTab()?.name || 'Canvas'"
    />
  </div>
</template>

<script>
import DownloadButton from './download-button.vue'
import { globalState } from '../utilities/global-state.js'
import { inputHandler } from '../utilities/input-handler.js'

export default {
  components: {
    DownloadButton
  },
  props: {
  },
  emits: [],
  data() {
    return {
      nextTabId: 1
    }
  },
  computed: {
    tabs() {
      return globalState.get('palette-tabs');
    }
  },
  mounted() {
    this.loadSavedTabs()
    inputHandler.registerCommand('tab', 'nextTab', () => this.nextTab())
    inputHandler.registerCommand('shift+tab', 'prevTab', () => this.prevTab())
  },
  methods: {
    selectTab(id) {
      const tab = this.tabs.find(t => t.id === id)
      if (tab) {
        globalState.set('selectedTab', tab)
      }
    },
    addTab(isWelcomeTab) {
      let id = `canvas-${Math.random()}`;
      globalState.get('palette-tabs').push({ id: id, name: isWelcomeTab ? 'Welcome!' : `New canvas` })
      this.selectTab(id)
    },
    deleteTab(tab) {
      if (!confirm(`Delete "${tab.name}"?`)) return
      const index = globalState.get('palette-tabs').indexOf(tab);
      globalState.get('palette-tabs').splice(index, 1)
      globalState.delete(tab.id)
      if (!globalState.get('palette-tabs').length) {
        this.addTab();
      }

      const nextTabIndex = Math.max(0, Math.min(index, this.tabs.length - 1))
      this.selectTab(this.tabs[nextTabIndex].id)
    },
    renameTab(tab) {
      const name = prompt('Canvas name:', tab.name)
      if (name) {
        tab.name = name
      }
    },
    getSelectedTab() {
      return globalState.get('selectedTab');
    },
    loadSavedTabs() {
      if (globalState.get('palette-tabs', []).length) {
        globalState.set('selectedTab', this.tabs[0])
        globalState.set('isNewUser', false);
      }
      else {
        globalState.set('isNewUser', true);
        this.addTab(true);
      }
    },
    nextTab() {
      const currentTab = this.getSelectedTab()
      const currentIndex = this.tabs.findIndex(t => t.id === currentTab?.id)
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % this.tabs.length
        this.selectTab(this.tabs[nextIndex].id)
      }
    },
    prevTab() {
      const currentTab = this.getSelectedTab()
      const currentIndex = this.tabs.findIndex(t => t.id === currentTab?.id)
      if (currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length
        this.selectTab(this.tabs[prevIndex].id)
      }
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
