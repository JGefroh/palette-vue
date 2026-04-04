import { inputHandler } from '../utilities/input-handler.js'
import { globalState } from '../utilities/global-state.js'
import { SelectSizer } from './select-sizer.js'
import { SelectMove } from './select-move.js'
import { SelectIdle } from './select-idle.js'
import { SelectImageDrawer } from './select-image-drawer.js'
import { SelectClipboard } from './select-clipboard.js'
import { SelectOutline } from './select-outline.js'

export class Select {
  constructor({ drawingCtx, overlayCtx }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.selectionBounds = null // { x, y, width, height }
    this.mode = 'fill' // 'fill' or 'outline'
    this.name = 'Select'
    this.fillIcon = 'fa-object-group'
    this.outlineIcon = 'fa-object-ungroup'
    this.shortcut = 's'

    // Operation handlers
    this.sizerHandler = new SelectSizer(this)
    this.moveHandler = new SelectMove(this)
    this.idleHandler = new SelectIdle(this)
    this.imageDrawer = new SelectImageDrawer(this)
    this.clipboard = new SelectClipboard(this)
    this.outline = new SelectOutline(this)

    inputHandler.registerCommand('cmd+c', 'copy', () => {
      this.clipboard.copySelectedContent()
    })

    inputHandler.registerCommand('cmd+x', 'cut', () => {
      this.clipboard.copySelectedContent()
      this.deleteSelection()
    })

    inputHandler.registerCommand('cmd+a', 'select-all', () => {
      this.selectAll()
    })

    inputHandler.registerCommand('delete', 'delete-selection', () => {
      this.deleteSelection()
    })

    inputHandler.registerCommand('backspace', 'delete-selection', () => {
      this.deleteSelection()
    })
  }

  static new(drawingCtx, overlayCtx) {
    return new Select({ drawingCtx, overlayCtx })
  }
  
  identifyOperationState(coordinates) {
    if (this.moveHandler.selectedImageData) {
      return 'moving'
    } else if (this.sizerHandler.startCoordinates) {
      return 'selecting'
    } else if (coordinates && this.shouldStartMovingSelection(coordinates)) {
      return 'moving'
    } else {
      return 'idle'
    }
  }

  // SHAPE INTERFACE


  start(coordinates) {
    const operationState = this.identifyOperationState(coordinates)
    if (operationState === 'moving') {
      this.moveHandler.initiate(coordinates)
    } else {
      this.sizerHandler.initiate(coordinates)
    }
  }

  preProcess(coordinates) {
    const operationState = this.identifyOperationState(coordinates)
    this.updateOverlay(operationState, coordinates)
  }

  process(coordinates) {
    const operationState = this.identifyOperationState(coordinates)
    this.updateOverlay(operationState, coordinates)
  }

  updateOverlay(operationState, coordinates) {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)

    switch(operationState) {
      case 'idle':
        this.idleHandler.restore()
        break
      case 'selecting':
        this.sizerHandler.updatePreview(coordinates)
        break
      case 'moving':
        this.moveHandler.updatePreview(coordinates)
        break
    }
  }

  end(coordinates) {
    const operationState = this.identifyOperationState(coordinates)
    if (operationState === 'moving') {
      this.moveHandler.finalize(coordinates)
    } else if (operationState === 'selecting') {
      this.sizerHandler.finalize(coordinates)
    }
    this.cleanupAfterOperation(operationState)
  }

  // UTILITY METHODS


  shouldStartMovingSelection(coordinates) {
    return this.selectionBounds && this.isPointInSelection(coordinates.x, coordinates.y)
  }

  isPointInSelection(x, y) {
    if (!this.selectionBounds) return false
    const { x: sx, y: sy, width, height } = this.selectionBounds
    return x >= sx && x <= sx + width && y >= sy && y <= sy + height
  }

  calculateSelectionBounds(startCoords, currentCoords) {
    return {
      x: Math.min(startCoords.x, currentCoords.x),
      y: Math.min(startCoords.y, currentCoords.y),
      width: Math.abs(currentCoords.x - startCoords.x),
      height: Math.abs(currentCoords.y - startCoords.y)
    }
  }

  selectAll() {
    globalState.set('selectedTool', this)
    this.selectionBounds = {
      x: 0,
      y: 0,
      width: this.drawingCtx.canvas.width,
      height: this.drawingCtx.canvas.height
    }
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    this.idleHandler.restore()
  }

  deleteSelection() {
    if (!this.selectionBounds) return
    const { x, y, width, height } = this.selectionBounds
    this.drawingCtx.clearRect(x, y, width, height)
    this.selectionBounds = null
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
  }

  cleanupAfterOperation(operationState) {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)

    if (operationState === 'moving') {
      this.selectionBounds = null
      this.moveHandler.cleanup()
    } else if (operationState === 'selecting') {
      this.sizerHandler.cleanup()
      if (this.selectionBounds) {
        this.idleHandler.restore()
      }
    }
  }
}
