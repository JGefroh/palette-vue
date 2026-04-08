import { reactive } from 'vue'
import { globalState } from '../persistence/global-state.js'
import { ToolUse } from './tool-use.js'

class ToolManager {
  constructor() {
    this.tools = reactive([])
    this.selectedTool = null
    this.toolUse = null
  }

  initializeToolUse(cursorManager) {
    this.toolUse = new ToolUse(cursorManager)
  }

  registerTool(tool) {
    this.tools.push(tool)
  }

  selectTool(tool) {
    const previousTool = this.selectedTool
    if (previousTool?.deselect) {
      previousTool.deselect()
    }
    this.selectedTool = tool
    globalState.set('selectedTool', tool)
  }

  deselectTool() {
    this.selectedTool = null
    globalState.set('selectedTool', null)
  }

  getSelectedTool() {
    return this.selectedTool
  }

  getTool(name) {
    return this.tools.find(t => t.name === name)
  }

  getTools() {
    return this.tools
  }

  startTool() {
    if (this.toolUse) {
      this.toolUse.start()
    }
  }

  processTool() {
    if (this.toolUse) {
      this.toolUse.process()
    }
  }

  endTool() {
    if (this.toolUse) {
      this.toolUse.end()
    }
  }
}

export const globalToolManager = new ToolManager()
