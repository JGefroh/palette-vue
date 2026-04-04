import { inputHandler } from '../utilities/input-handler.js'

export class Select {
  constructor({ drawingCtx, overlayCtx }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.startCoordinates = null
    this.selectionBounds = null // { x, y, width, height }
    this.moveStartCoordinates = null
    this.selectedImageData = null // Pixel data of selected region
    this.mode = 'fill' // 'fill' or 'outline'
    this.name = 'Select'
    this.fillIcon = 'fa-object-group'
    this.outlineIcon = 'fa-object-ungroup'
    this.shortcut = 's'

    inputHandler.registerCommand('cmd+c', 'copy', () => {
      this.copySelectedContent()
    })
  }

  static new(drawingCtx, overlayCtx) {
    return new Select({ drawingCtx, overlayCtx })
  }
  
  identifyOperationState(coordinates) {
    if (this.selectedImageData) {
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
        this.restoreIdleSelectionOutline()
        break
      case 'selecting':
        this.updateSelectionOutlineAsUserDrags(coordinates)
        break
      case 'moving':
        this.updateLivePreviewDuringMove(coordinates)
        break
    }
  }

  end(coordinates) {
    const operationState = this.identifyOperationState(coordinates)
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
    this.selectedImageData = null
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
    const { x, y, width, height } = this.selectionBounds
    this.selectedImageData = this.drawingCtx.getImageData(x, y, width, height)
    this.drawingCtx.clearRect(x, y, width, height)
  }

  updateLivePreviewDuringMove(coordinates) {
    const offsetX = coordinates.x - this.moveStartCoordinates.x
    const offsetY = coordinates.y - this.moveStartCoordinates.y
    const newX = this.selectionBounds.x + offsetX
    const newY = this.selectionBounds.y + offsetY
    this.processMoveOverlay(newX, newY)
  }

  processMoveOverlay(newX, newY) {
    this.drawImageData(this.overlayCtx, this.selectedImageData, newX, newY, this.mode)
    this.drawSelectionOutline(this.overlayCtx, newX, newY, this.selectionBounds.width, this.selectionBounds.height)
  }

  drawImageData(ctx, imageData, x, y, mode = 'fill') {
    if (!imageData) return
    if (mode === 'fill') {
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
    const offsetX = coordinates.x - this.moveStartCoordinates.x
    const offsetY = coordinates.y - this.moveStartCoordinates.y
    const newX = this.selectionBounds.x + offsetX
    const newY = this.selectionBounds.y + offsetY
    this.drawImageData(this.drawingCtx, this.selectedImageData, newX, newY, this.mode)
    this.moveStartCoordinates = null
    this.selectedImageData = null
  }

  // Idle

  restoreIdleSelectionOutline() {
    if (!this.selectionBounds) return
    const { x, y, width, height } = this.selectionBounds
    this.drawSelectionOutline(this.overlayCtx, x, y, width, height)
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

  // Selection Bounds Helpers

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
    } else if (this.selectionBounds) {
      this.restoreIdleSelectionOutline()
    }
  }
}
