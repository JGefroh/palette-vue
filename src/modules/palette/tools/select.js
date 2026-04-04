import { inputHandler } from '../utilities/input-handler.js'

export class Select {
  constructor({ drawingCtx, overlayCtx, getLineWidth }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.getLineWidth = getLineWidth
    this.startCoordinates = null
    this.selectionBounds = null // { x, y, width, height }
    this.moveStartCoordinates = null
    this.moveOffset = { x: 0, y: 0 }
    this.capturedImageData = null // Store pixels being moved
    this.mode = 'fill' // 'fill' or 'outline'
    this.name = 'Select'
    this.fillIcon = 'fa-object-group'
    this.outlineIcon = 'fa-object-ungroup'
    this.shortcut = 's'

    inputHandler.registerCommand('cmd+c', 'copy', () => {
      this.copySelectedContent()
    })
  }

  static new(drawingCtx, overlayCtx, getLineWidth) {
    return new Select({ drawingCtx, overlayCtx, getLineWidth })
  }
  
  identifyOperationState(coordinates) {
    if (this.capturedImageData) {
      return 'moving'
    } else if (this.startCoordinates) {
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
      this.initiateSelectionMove(coordinates)
    } else {
      this.initiateNewSelection(coordinates)
    }
  }

  preProcess(coordinates) {
    const operationState = this.identifyOperationState()
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    if (operationState === 'idle') {
      this.restoreIdleSelectionOutline()
    }
  }

  process(coordinates) {
    const operationState = this.identifyOperationState()
    if (operationState === 'moving') {
      this.updateLivePreviewDuringMove(coordinates)
    } else if (operationState === 'selecting') {
      this.updateSelectionOutlineAsUserDrags(coordinates)
    }
  }

  end(coordinates) {
    const operationState = this.identifyOperationState()
    if (operationState === 'moving') {
      this.endMove(coordinates)
    } else if (operationState === 'selecting') {
      this.saveSelectionBounds(coordinates)
    }
    this.cleanupAfterOperation(operationState)
  }

  // BELOW IS IMPLEMENTATION ETC.

  // New Selection

  initiateNewSelection(coordinates) {
    this.selectionBounds = null
    this.capturedImageData = null
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    this.startCoordinates = { x: coordinates.x, y: coordinates.y }
  }

  // Selection Resize

  updateSelectionOutlineAsUserDrags(coordinates) {
    const bounds = this.calculateSelectionBounds(this.startCoordinates, coordinates)
    this.drawSelectionOutline(this.overlayCtx, bounds.x, bounds.y, bounds.width, bounds.height)
  }

  saveSelectionBounds(coordinates) {
    this.selectionBounds = this.calculateSelectionBounds(this.startCoordinates, coordinates)
  }

  // Selection Move

  initiateSelectionMove(coordinates) {
    this.moveStartCoordinates = { ...coordinates }
    this.moveOffset = { x: 0, y: 0 }
    const { x, y, width, height } = this.selectionBounds
    this.capturedImageData = this.drawingCtx.getImageData(x, y, width, height)
    this.drawingCtx.clearRect(x, y, width, height)
  }

  updateLivePreviewDuringMove(coordinates) {
    this.moveOffset.x = coordinates.x - this.moveStartCoordinates.x
    this.moveOffset.y = coordinates.y - this.moveStartCoordinates.y
    const newX = this.selectionBounds.x + this.moveOffset.x
    const newY = this.selectionBounds.y + this.moveOffset.y
    this.processMoveOverlay(newX, newY)
  }

  processMoveOverlay(newX, newY) {
    this.drawMovedContentForMode(this.overlayCtx, newX, newY)
    this.drawSelectionOutline(this.overlayCtx, newX, newY, this.selectionBounds.width, this.selectionBounds.height)
  }

  drawMovedContentForMode(ctx, newX, newY) {
    if (!this.capturedImageData) return
    const keepWhite = this.mode === 'fill'
    this.drawImageData(ctx, this.capturedImageData, newX, newY, keepWhite)
  }

  drawImageData(ctx, imageData, x, y, keepWhite = true) {
    if (keepWhite) {
      this.drawImageDataForFillMode(ctx, imageData, x, y)
    } else {
      this.drawImageDataForOutlineMode(ctx, imageData, x, y)
    }
  }

  drawImageDataForFillMode(ctx, imageData, x, y) {
    const copy = ctx.createImageData(imageData)
    copy.data.set(imageData.data)
    const data = copy.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) {
        data[i] = 255
        data[i + 1] = 255
        data[i + 2] = 255
        data[i + 3] = 255
      }
    }
    ctx.putImageData(copy, x, y)
  }

  drawImageDataForOutlineMode(ctx, imageData, x, y) {
    const copy = ctx.createImageData(imageData)
    copy.data.set(imageData.data)
    this.makeWhitePixelsTransparent(copy)
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(copy, 0, 0)
    ctx.drawImage(tempCanvas, x, y)
  }

  makeWhitePixelsTransparent(imageData) {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
        data[i + 3] = 0
      }
    }
    return imageData
  }

  endMove(coordinates) {
    const newX = this.selectionBounds.x + this.moveOffset.x
    const newY = this.selectionBounds.y + this.moveOffset.y
    this.drawMovedContentForMode(this.drawingCtx, newX, newY)
    this.moveStartCoordinates = null
    this.capturedImageData = null
  }

  // Idle

  restoreIdleSelectionOutline() {
    if (!this.selectionBounds) return
    this.drawSelectionOutline(this.overlayCtx, this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height)
  }

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

  // Selection Box Helpers

  drawSelectionOutline(ctx, x, y, width, height) {
    ctx.save()
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    ctx.stroke()
    ctx.restore()
  }


  // Command - Copy Selected

  copySelectedContent() {
    if (!this.selectionBounds) return
    const { x, y, width, height } = this.selectionBounds
    const imageData = this.drawingCtx.getImageData(x, y, width, height)

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(imageData, 0, 0)

    tempCanvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).catch(err => {
        console.error('Failed to copy:', err)
      })
    })
  }

  cleanupAfterOperation(operationState) {
    this.startCoordinates = null
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)

    if (operationState === 'moving') {
      this.selectionBounds = null
      this.moveOffset = { x: 0, y: 0 }
    } else if (this.selectionBounds) {
      this.restoreIdleSelectionOutline()
    }
  }
}
