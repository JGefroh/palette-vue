import { inputHandler } from '../utilities/input-handler.js'

export class Select {
  constructor({ drawingCtx, overlayCtx, getLineWidth }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.getLineWidth = getLineWidth
    this.startCoordinates = null
    this.selection = null // { x, y, width, height }
    this.isMoving = false
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

  // SHAPE INTERFACE

  start(coordinates) {
    if (this.shouldStartMovingSelection(coordinates)) {
      this.initiateSelectionMove(coordinates)
    } else {
      this.initiateNewSelection(coordinates)
    }
  }

  preProcess(coordinates) {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    if (this.hasExistingIdleSelection()) {
      this.drawSelectionOutline(this.overlayCtx, this.selection.x, this.selection.y, this.selection.width, this.selection.height)
    }
  }

  process(coordinates) {
    if (this.isMoving) {
      this.updateLivePreviewDuringMove(coordinates)
    } else if (this.isDrawingSelectBox()) {
      this.updateLivePreviewDuringSelection(coordinates)
    }
  }

  end(coordinates) {
    const wasMoving = this.isMoving

    if (this.isMoving) {
      this.endMove(coordinates)
    } else if (this.isDrawingSelectBox()) {
      this.finalizeSelectionBox(coordinates)
    }

    this.cleanupAfterOperation(wasMoving)
  }

  // BELOW IS IMPLEMENTATION ETC.

  isPointInSelection(x, y) {
    if (!this.selection) return false
    const { x: sx, y: sy, width, height } = this.selection
    return x >= sx && x <= sx + width && y >= sy && y <= sy + height
  }

  isDrawingSelectBox() {
    return this.startCoordinates !== null
  }

  hasExistingIdleSelection() {
    return this.selection && !this.startCoordinates && !this.isMoving
  }

  shouldStartMovingSelection(coordinates) {
    return this.selection && !this.isMoving && this.isPointInSelection(coordinates.x, coordinates.y)
  }


  calculateSelectionBounds(startCoords, currentCoords) {
    return {
      x: Math.min(startCoords.x, currentCoords.x),
      y: Math.min(startCoords.y, currentCoords.y),
      width: Math.abs(currentCoords.x - startCoords.x),
      height: Math.abs(currentCoords.y - startCoords.y)
    }
  }

  drawSelectionOutlineFromCoordinates(ctx, startCoords, currentCoords) {
    const bounds = this.calculateSelectionBounds(startCoords, currentCoords)
    this.drawSelectionOutline(ctx, bounds.x, bounds.y, bounds.width, bounds.height)
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

  drawImageData(ctx, imageData, x, y, keepWhite = true) {
    if (keepWhite) {
      this.drawImageDataForFillMode(ctx, imageData, x, y)
    } else {
      this.drawImageDataForOutlineMode(ctx, imageData, x, y)
    }
  }

  initiateSelectionMove(coordinates) {
    this.isMoving = true
    this.moveStartCoordinates = { ...coordinates }
    this.moveOffset = { x: 0, y: 0 }
    const { x, y, width, height } = this.selection
    this.capturedImageData = this.drawingCtx.getImageData(x, y, width, height)
    this.drawingCtx.clearRect(x, y, width, height)
  }

  initiateNewSelection(coordinates) {
    this.selection = null
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    this.startCoordinates = { x: coordinates.x, y: coordinates.y }
    this.isMoving = false
    this.capturedImageData = null
  }

  copySelectedContent() {
    if (!this.selection) return
    const { x, y, width, height } = this.selection
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

  drawMovedContentForMode(ctx, newX, newY) {
    if (!this.capturedImageData) return
    const keepWhite = this.mode === 'fill'
    this.drawImageData(ctx, this.capturedImageData, newX, newY, keepWhite)
  }

  processMoveOverlay(newX, newY) {
    this.drawMovedContentForMode(this.overlayCtx, newX, newY)
    this.drawSelectionOutline(this.overlayCtx, newX, newY, this.selection.width, this.selection.height)
  }

  updateLivePreviewDuringMove(coordinates) {
    this.moveOffset.x = coordinates.x - this.moveStartCoordinates.x
    this.moveOffset.y = coordinates.y - this.moveStartCoordinates.y
    const newX = this.selection.x + this.moveOffset.x
    const newY = this.selection.y + this.moveOffset.y
    this.processMoveOverlay(newX, newY)
  }

  updateSelectionOutlineAsUserDrags(coordinates) {
    this.drawSelectionOutlineFromCoordinates(this.overlayCtx, this.startCoordinates, coordinates)
  }

  endMoveForMode(newX, newY) {
    this.drawMovedContentForMode(this.drawingCtx, newX, newY)
  }

  endMove(coordinates) {
    const newX = this.selection.x + this.moveOffset.x
    const newY = this.selection.y + this.moveOffset.y
    this.endMoveForMode(newX, newY)
    this.isMoving = false
    this.moveStartCoordinates = null
    this.capturedImageData = null
  }

  finalizeSelectionBox(coordinates) {
    this.selection = this.calculateSelectionBounds(this.startCoordinates, coordinates)
  }

  cleanupAfterOperation(wasMoving) {
    this.startCoordinates = null
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)

    if (wasMoving) {
      this.selection = null
      this.moveOffset = { x: 0, y: 0 }
    } else if (this.selection) {
      this.restoreIdleSelectionOutline()
    }
  }

  restoreIdleSelectionOutline() {
    this.drawSelectionOutline(this.overlayCtx, this.selection.x, this.selection.y, this.selection.width, this.selection.height)
  }

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
}
