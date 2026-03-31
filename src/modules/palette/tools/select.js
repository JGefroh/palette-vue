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
  }

  static new(drawingCtx, overlayCtx, getLineWidth) {
    return new Select({ drawingCtx, overlayCtx, getLineWidth })
  }

  isPointInSelection(x, y) {
    if (!this.selection) return false
    const { x: sx, y: sy, width, height } = this.selection
    return x >= sx && x <= sx + width && y >= sy && y <= sy + height
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

  makeWhitePixelsTransparent(imageData) {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      // If pixel is white (or very close to white), make it transparent
      if (r === 255 && g === 255 && b === 255) {
        data[i + 3] = 0 // Set alpha to 0
      }
    }
    return imageData
  }

  drawImageDataWithWhite(ctx, imageData, x, y) {
    // Create a copy of the image data
    const copy = ctx.createImageData(imageData)
    copy.data.set(imageData.data)

    // Fill transparent pixels with white
    const data = copy.data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      // If pixel is fully transparent, fill it with white
      if (a === 0) {
        data[i] = 255     // r
        data[i + 1] = 255 // g
        data[i + 2] = 255 // b
        data[i + 3] = 255 // a (make opaque)
      }
    }

    // Put the modified image data
    ctx.putImageData(copy, x, y)
  }

  drawImageDataSkippingWhite(ctx, imageData, x, y) {
    // Create temporary canvas
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    const tempCtx = tempCanvas.getContext('2d')

    // Create a copy of image data
    const copy = tempCtx.createImageData(imageData)
    copy.data.set(imageData.data)

    // Make white pixels transparent
    const data = copy.data
    for (let i = 3; i < data.length; i += 4) {
      const r = data[i - 3]
      const g = data[i - 2]
      const b = data[i - 1]

      if (r === 255 && g === 255 && b === 255) {
        data[i] = 0 // Set alpha to 0
      }
    }

    // Put modified image data on temp canvas
    tempCtx.putImageData(copy, 0, 0)

    // Draw temp canvas to main canvas (respecting transparency)
    ctx.drawImage(tempCanvas, x, y)
  }

  start(coordinates) {
    // After a move, selection is cleared. Any click is a new selection.
    if (this.selection && !this.isMoving && this.isPointInSelection(coordinates.x, coordinates.y)) {
      // Start moving existing selection
      this.isMoving = true
      this.moveStartCoordinates = { ...coordinates }
      this.moveOffset = { x: 0, y: 0 }
      // Capture the pixels inside the selection
      const { x, y, width, height } = this.selection
      this.capturedImageData = this.drawingCtx.getImageData(x, y, width, height)
      // Clear the original location immediately
      this.drawingCtx.clearRect(x, y, width, height)
    } else {
      // Clear any existing selection and start fresh
      this.selection = null
      this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
      this.startCoordinates = { x: coordinates.x, y: coordinates.y }
      this.isMoving = false
      this.capturedImageData = null
    }
  }

  preProcess(coordinates) {
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    // Redraw selection if it exists and we're not actively creating/moving
    if (this.selection && !this.startCoordinates && !this.isMoving) {
      this.drawSelectionOutline(this.overlayCtx, this.selection.x, this.selection.y, this.selection.width, this.selection.height)
    }
  }

  process(coordinates) {
    if (this.isMoving) {
      // Move selection and content
      this.moveOffset.x = coordinates.x - this.moveStartCoordinates.x
      this.moveOffset.y = coordinates.y - this.moveStartCoordinates.y
      const newX = this.selection.x + this.moveOffset.x
      const newY = this.selection.y + this.moveOffset.y

      // Draw the moved content on overlay preview
      if (this.capturedImageData) {
        if (this.mode === 'fill') {
          // Fill mode: show all pixels including white
          this.drawImageDataWithWhite(this.overlayCtx, this.capturedImageData, newX, newY)
        } else {
          // Outline mode: skip white pixels
          this.drawImageDataSkippingWhite(this.overlayCtx, this.capturedImageData, newX, newY)
        }
      }

      // Draw selection box at new position
      this.drawSelectionOutline(this.overlayCtx, newX, newY, this.selection.width, this.selection.height)
    } else if (this.startCoordinates) {
      // Draw new selection
      const x = Math.min(this.startCoordinates.x, coordinates.x)
      const y = Math.min(this.startCoordinates.y, coordinates.y)
      const width = Math.abs(coordinates.x - this.startCoordinates.x)
      const height = Math.abs(coordinates.y - this.startCoordinates.y)
      this.drawSelectionOutline(this.overlayCtx, x, y, width, height)
    }
  }

  end(coordinates) {
    const wasMoving = this.isMoving

    if (this.isMoving) {
      // Commit move to drawing canvas
      const newX = this.selection.x + this.moveOffset.x
      const newY = this.selection.y + this.moveOffset.y

      // Draw at new location
      if (this.capturedImageData) {
        if (this.mode === 'outline') {
          // In outline mode, skip white pixels when drawing
          this.drawImageDataSkippingWhite(this.drawingCtx, this.capturedImageData, newX, newY)
        } else {
          this.drawingCtx.putImageData(this.capturedImageData, newX, newY)
        }
      }

      this.isMoving = false
      this.moveStartCoordinates = null
      this.capturedImageData = null
    } else if (this.startCoordinates) {
      // Commit new selection
      const x = Math.min(this.startCoordinates.x, coordinates.x)
      const y = Math.min(this.startCoordinates.y, coordinates.y)
      const width = Math.abs(coordinates.x - this.startCoordinates.x)
      const height = Math.abs(coordinates.y - this.startCoordinates.y)
      this.selection = { x, y, width, height }
    }

    this.startCoordinates = null

    // Clear overlay
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)

    // If we just finished moving, reset selection completely
    if (wasMoving) {
      this.selection = null
      this.moveOffset = { x: 0, y: 0 }
    } else if (this.selection) {
      // If we just created a new selection, show it on overlay
      this.drawSelectionOutline(this.overlayCtx, this.selection.x, this.selection.y, this.selection.width, this.selection.height)
    }
  }
}
