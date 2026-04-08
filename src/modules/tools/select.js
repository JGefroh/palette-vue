import { inputHandler } from '../input/input-handler.js'
import { globalState } from '../persistence/global-state.js'
import { SelectSizer } from './select-sizer.js'
import { SelectResizer } from './select-resizer.js'
import { SelectRotator } from './select-rotator.js'
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

    // Operation handlers
    this.sizerHandler = new SelectSizer(this)
    this.resizerHandler = new SelectResizer(this)
    this.rotatorHandler = new SelectRotator(this)
    this.moveHandler = new SelectMove(this)
    this.idleHandler = new SelectIdle(this)
    this.imageDrawer = new SelectImageDrawer(this)
    this.clipboard = new SelectClipboard(this)
    this.outline = new SelectOutline(this)
    this.cornerThreshold = 10
    this.rotationThreshold = 30

    inputHandler.onCommand('copy', () => {
      this.clipboard.copySelectedContent()
    })

    inputHandler.onCommand('cut', () => {
      this.clipboard.copySelectedContent()
      this.deleteSelection()
    })

    inputHandler.onCommand('select-all', () => {
      this.selectAll()
    })

    inputHandler.onCommand('delete-selection', () => {
      this.deleteSelection()
    })
  }

  static new(drawingCtx, overlayCtx) {
    return new Select({ drawingCtx, overlayCtx })
  }
  
  identifyOperationState(coordinates) {
    if (this.rotatorHandler.startCoordinates) {
      return 'rotating'
    } else if (this.resizerHandler.startCoordinates) {
      return 'resizing'
    } else if (this.moveHandler.selectedImageData) {
      return 'moving'
    } else if (this.sizerHandler.startCoordinates) {
      return 'selecting'
    } else if (coordinates && this.shouldStartRotatingSelection(coordinates)) {
      return 'rotating'
    } else if (coordinates && this.shouldStartResizingSelection(coordinates)) {
      return 'resizing'
    } else if (coordinates && this.shouldStartMovingSelection(coordinates)) {
      return 'moving'
    } else {
      return 'idle'
    }
  }

  // SHAPE INTERFACE


  start(coordinates) {
    const operationState = this.identifyOperationState(coordinates)
    if (operationState === 'rotating') {
      this.rotatorHandler.initiate(coordinates)
    } else if (operationState === 'resizing') {
      const corner = this.getCornerAtCoordinates(coordinates)
      this.resizerHandler.initiate(coordinates, corner)
    } else if (operationState === 'moving') {
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
      case 'resizing':
        this.resizerHandler.updatePreview(coordinates, inputHandler.getMode().shift)
        break
      case 'rotating':
        this.rotatorHandler.updatePreview(coordinates, inputHandler.getMode().shift)
        break
    }
  }

  end(coordinates) {
    const operationState = this.identifyOperationState(coordinates)
    if (operationState === 'rotating') {
      this.rotatorHandler.finalize(coordinates, inputHandler.getMode().shift)
    } else if (operationState === 'resizing') {
      this.resizerHandler.finalize(coordinates, inputHandler.getMode().shift)
    } else if (operationState === 'moving') {
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
    } else if (operationState === 'rotating') {
      this.selectionBounds = null
      this.rotatorHandler.cleanup()
    } else if (operationState === 'selecting') {
      this.sizerHandler.cleanup()
      if (this.selectionBounds) {
        this.idleHandler.restore()
      }
    } else if (operationState === 'resizing') {
      this.resizerHandler.cleanup()
      if (this.selectionBounds) {
        this.idleHandler.restore()
      }
    }
  }

  shouldStartRotatingSelection(coordinates) {
    return this.selectionBounds && this.getCornerForRotation(coordinates) !== null
  }

  getCornerForRotation(coordinates) {
    if (!this.selectionBounds) return null

    const { x, y, width, height } = this.selectionBounds
    const minThreshold = this.cornerThreshold
    const maxThreshold = this.rotationThreshold

    const corners = {
      'top-left': { x: x, y: y },
      'top-right': { x: x + width, y: y },
      'bottom-left': { x: x, y: y + height },
      'bottom-right': { x: x + width, y: y + height }
    }

    for (const [corner, pos] of Object.entries(corners)) {
      const dx = coordinates.x - pos.x
      const dy = coordinates.y - pos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > minThreshold && distance <= maxThreshold) {
        return corner
      }
    }

    return null
  }

  shouldStartResizingSelection(coordinates) {
    return this.selectionBounds && this.getCornerAtCoordinates(coordinates) !== null
  }

  getCornerAtCoordinates(coordinates) {
    if (!this.selectionBounds) return null

    const { x, y, width, height } = this.selectionBounds
    const threshold = this.cornerThreshold

    const corners = {
      'top-left': { x: x, y: y },
      'top-right': { x: x + width, y: y },
      'bottom-left': { x: x, y: y + height },
      'bottom-right': { x: x + width, y: y + height }
    }

    for (const [corner, pos] of Object.entries(corners)) {
      if (Math.abs(coordinates.x - pos.x) <= threshold && Math.abs(coordinates.y - pos.y) <= threshold) {
        return corner
      }
    }

    return null
  }

  deselect() {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
  }
}
