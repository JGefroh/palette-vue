// Handles resizing selection content by dragging corners
export class SelectResizer {
  constructor(select) {
    this.select = select
    this.startCoordinates = null
    this.startBounds = null
    this.draggedCorner = null
    this.selectedImageData = null
  }

  initiate(coordinates, corner) {
    this.startCoordinates = { x: coordinates.x, y: coordinates.y }
    this.startBounds = { ...this.select.selectionBounds }
    this.draggedCorner = corner
    this.flipHorizontally = false
    this.flipVertically = false

    const { x, y, width, height } = this.select.selectionBounds
    this.selectedImageData = this.select.drawingCtx.getImageData(x, y, width, height)
    this.select.drawingCtx.clearRect(x, y, width, height)
  }

  updatePreview(coordinates, shiftKey) {
    const newBounds = this.calculateResizedBounds(coordinates, shiftKey)
    this.drawFlippedImage(
      this.select.overlayCtx,
      this.selectedImageData,
      newBounds,
      this.select.mode
    )
    this.select.outline.drawSelectionOutline(
      this.select.overlayCtx,
      newBounds.x,
      newBounds.y,
      newBounds.width,
      newBounds.height
    )
  }

  calculateResizedBounds(coordinates, shiftKey) {
    const deltaX = coordinates.x - this.startCoordinates.x
    const deltaY = coordinates.y - this.startCoordinates.y
    const originalBounds = this.startBounds

    // Get the opposite corner position before resizing
    const oppositeCornerPos = this.getOppositeCornerPositionFromOriginal(originalBounds)

    let newBounds = { ...originalBounds }

    switch(this.draggedCorner) {
      case 'top-left':
        newBounds.x = originalBounds.x + deltaX
        newBounds.y = originalBounds.y + deltaY
        newBounds.width = originalBounds.width - deltaX
        newBounds.height = originalBounds.height - deltaY
        break
      case 'top-right':
        newBounds.y = originalBounds.y + deltaY
        newBounds.width = originalBounds.width + deltaX
        newBounds.height = originalBounds.height - deltaY
        break
      case 'bottom-left':
        newBounds.x = originalBounds.x + deltaX
        newBounds.width = originalBounds.width - deltaX
        newBounds.height = originalBounds.height + deltaY
        break
      case 'bottom-right':
        newBounds.width = originalBounds.width + deltaX
        newBounds.height = originalBounds.height + deltaY
        break
    }

    // Handle axis crossing and flipping
    newBounds = this.handleAxisCrossing(newBounds)

    if (shiftKey) {
      // Preserve aspect ratio
      newBounds = this.preserveAspectRatio(newBounds, originalBounds)
      // Position bounds from opposite corner with constrained dimensions
      newBounds = this.adjustPositionFromOppositeCorner(newBounds, oppositeCornerPos)
    } else {
      // Adjust bounds so dragged corner stays at current mouse coordinates
      newBounds = this.adjustPositionForDraggedCorner(newBounds, coordinates)
    }

    return newBounds
  }

  getOppositeCornerPositionFromOriginal(bounds) {
    switch(this.draggedCorner) {
      case 'top-left':
        return { x: bounds.x + bounds.width, y: bounds.y + bounds.height }
      case 'top-right':
        return { x: bounds.x, y: bounds.y + bounds.height }
      case 'bottom-left':
        return { x: bounds.x + bounds.width, y: bounds.y }
      case 'bottom-right':
        return { x: bounds.x, y: bounds.y }
    }
  }

  handleAxisCrossing(bounds) {
    if (bounds.width < 0) {
      bounds.x = bounds.x + bounds.width
      bounds.width = -bounds.width
      this.flipHorizontally = true
    } else {
      this.flipHorizontally = false
    }

    if (bounds.height < 0) {
      bounds.y = bounds.y + bounds.height
      bounds.height = -bounds.height
      this.flipVertically = true
    } else {
      this.flipVertically = false
    }

    bounds.width = Math.max(1, bounds.width)
    bounds.height = Math.max(1, bounds.height)

    return bounds
  }

  preserveAspectRatio(newBounds, originalBounds) {
    const originalAspectRatio = originalBounds.width / originalBounds.height
    const newAspectRatio = newBounds.width / newBounds.height

    if (newAspectRatio > originalAspectRatio) {
      newBounds.width = newBounds.height * originalAspectRatio
    } else {
      newBounds.height = newBounds.width / originalAspectRatio
    }

    return newBounds
  }


  adjustPositionFromOppositeCorner(bounds, oppositeCornerPos) {
    // Figure out which corner is being dragged after flips
    let draggedCornerName = this.draggedCorner

    if (this.flipHorizontally) {
      draggedCornerName = this.flipCornerHorizontally(draggedCornerName)
    }
    if (this.flipVertically) {
      draggedCornerName = this.flipCornerVertically(draggedCornerName)
    }

    // Position bounds from the opposite corner with current dimensions
    switch(draggedCornerName) {
      case 'top-left':
        bounds.x = oppositeCornerPos.x - bounds.width
        bounds.y = oppositeCornerPos.y - bounds.height
        break
      case 'top-right':
        bounds.x = oppositeCornerPos.x
        bounds.y = oppositeCornerPos.y - bounds.height
        break
      case 'bottom-left':
        bounds.x = oppositeCornerPos.x - bounds.width
        bounds.y = oppositeCornerPos.y
        break
      case 'bottom-right':
        bounds.x = oppositeCornerPos.x
        bounds.y = oppositeCornerPos.y
        break
    }

    return bounds
  }

  adjustPositionForDraggedCorner(bounds, dragCoordinates) {
    // Figure out which corner is now being dragged (after flips)
    let draggedCornerName = this.draggedCorner

    if (this.flipHorizontally) {
      draggedCornerName = this.flipCornerHorizontally(draggedCornerName)
    }
    if (this.flipVertically) {
      draggedCornerName = this.flipCornerVertically(draggedCornerName)
    }

    // Adjust bounds so the dragged corner is at the mouse position
    switch(draggedCornerName) {
      case 'top-left':
        bounds.x = dragCoordinates.x
        bounds.y = dragCoordinates.y
        break
      case 'top-right':
        bounds.x = dragCoordinates.x - bounds.width
        bounds.y = dragCoordinates.y
        break
      case 'bottom-left':
        bounds.x = dragCoordinates.x
        bounds.y = dragCoordinates.y - bounds.height
        break
      case 'bottom-right':
        bounds.x = dragCoordinates.x - bounds.width
        bounds.y = dragCoordinates.y - bounds.height
        break
    }

    return bounds
  }

  flipCornerHorizontally(corner) {
    switch(corner) {
      case 'top-left':
        return 'top-right'
      case 'top-right':
        return 'top-left'
      case 'bottom-left':
        return 'bottom-right'
      case 'bottom-right':
        return 'bottom-left'
    }
  }

  flipCornerVertically(corner) {
    switch(corner) {
      case 'top-left':
        return 'bottom-left'
      case 'top-right':
        return 'bottom-right'
      case 'bottom-left':
        return 'top-left'
      case 'bottom-right':
        return 'top-right'
    }
  }

  finalize(coordinates, shiftKey) {
    const newBounds = this.calculateResizedBounds(coordinates, shiftKey)
    this.select.selectionBounds = newBounds
    this.drawFlippedImage(
      this.select.drawingCtx,
      this.selectedImageData,
      newBounds,
      this.select.mode
    )
    this.cleanup()
  }

  drawFlippedImage(ctx, imageData, bounds, mode) {
    if (!imageData) return

    ctx.save()

    const centerX = bounds.x + bounds.width / 2
    const centerY = bounds.y + bounds.height / 2

    ctx.translate(centerX, centerY)
    if (this.flipHorizontally) ctx.scale(-1, 1)
    if (this.flipVertically) ctx.scale(1, -1)
    ctx.translate(-centerX, -centerY)

    this.select.imageDrawer.drawImageData(
      ctx,
      imageData,
      bounds.x,
      bounds.y,
      mode,
      bounds.width,
      bounds.height
    )

    ctx.restore()
  }

  cleanup() {
    this.startCoordinates = null
    this.startBounds = null
    this.draggedCorner = null
    this.selectedImageData = null
    this.flipHorizontally = false
    this.flipVertically = false
  }
}
