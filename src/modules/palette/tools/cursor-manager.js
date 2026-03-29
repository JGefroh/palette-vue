class CursorManager {
  constructor(canvas) {
    this.canvas = canvas
    this.isMouseDown = false
    this.currentCoordinates = { x: 0, y: 0 }
    this.previousCoordinates = { x: 0, y: 0 }
    this.startCoordinates = { x: 0, y: 0 }
    this.endCoordinates = { x: 0, y: 0 }
  }

  updateFromMouseEvent(event) {
    const coordinates = this.getCoordinatesFromEvent(event)
    this.previousCoordinates = { ...this.currentCoordinates }
    this.currentCoordinates = { ...coordinates }
  }

  getCoordinatesFromEvent(event) {
    const bounds = this.canvas.getBoundingClientRect()
    return {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    }
  }

  setMouseDown(isDown) {
    if (isDown && !this.isMouseDown) {
      this.startCoordinates = { ...this.currentCoordinates }
    }
    if (!isDown && this.isMouseDown) {
      this.endCoordinates = { ...this.currentCoordinates }
    }
    this.isMouseDown = isDown
  }

  getIsMouseDown() {
    return this.isMouseDown
  }

  getCurrentCoordinates() {
    return { ...this.currentCoordinates }
  }

  getPreviousCoordinates() {
    return { ...this.previousCoordinates }
  }

  getStartCoordinates() {
    return { ...this.startCoordinates }
  }

  getEndCoordinates() {
    return { ...this.endCoordinates }
  }
}

export { CursorManager }
