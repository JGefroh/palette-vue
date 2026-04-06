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
    <HelpButton />
  </div>
</template>

<script>
import HelpButton from '../help/help-button.vue'
import { globalState } from '../persistence/global-state.js'
import { inputHandler } from '../input/input-handler.js'

export default {
  components: {
    HelpButton
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
    inputHandler.onCommand('nextTab', () => this.nextTab())
    inputHandler.onCommand('prevTab', () => this.prevTab())
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
  gap: 4px;
  padding: 0 8px;
  background-color: #d3d3d37e;
  backdrop-filter: blur(15px);
}

.tab {
  padding: 8px 20px;
  border: none;
  border-bottom: 2px solid transparent;
  background-color: transparent;
  color: #7f8c8d;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  position: relative;
  transition: all 0.2s ease;
}

.tab.active {
  background-color: transparent;
  color: #34495e;
  border-bottom-color: #95a5a6;
  font-weight: 600;
}

.tab:hover:not(.active) {
  color: #34495e;
  border-bottom-color: rgba(52, 73, 94, 0.3);
}

.tab-delete {
  color: rgba(185, 185, 185, 0.6);
  font-size: 10px;
  margin-left: 6px;
  vertical-align: middle;
  transition: color 0.2s ease;
}

.tab-delete:hover {
  color: #95a5a6;
}

.tab-add {
  font-size: 16px;
  padding: 4px 10px;
}
</style>
