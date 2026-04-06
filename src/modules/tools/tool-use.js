import { globalState } from '../persistence/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'

/**
 * This class is responsible for using tools and calling their use stages in the right order.
 */
export class ToolUse {
  constructor(cursorManager) {
    this.cursorManager = cursorManager
  }

  start() {
    const selectedTool = globalState.get('selectedTool')
    if (!selectedTool) return

    globalCanvasManager.saveDrawingState()
    selectedTool.start(this.cursorManager.getCurrentCoordinates())
  }

  process() {
    const selectedTool = globalState.get('selectedTool')
    if (!selectedTool || !this.cursorManager.getIsMouseDown()) return

    const coordinates = this.cursorManager.getCurrentCoordinates()

    if (selectedTool.preProcess) {
      selectedTool.preProcess(coordinates)
    }
    selectedTool.process(coordinates)
    if (selectedTool.postProcess) {
      selectedTool.postProcess(coordinates)
    }
  }

  end() {
    const selectedTool = globalState.get('selectedTool')
    if (!selectedTool) return

    selectedTool.end(this.cursorManager.getCurrentCoordinates())
    globalCanvasManager.persistCanvas(globalState.get('selectedTab').id)
  }
}
