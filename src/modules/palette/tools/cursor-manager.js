class CursorManager {
  constructor() {
    this.isMouseDown = false
    this.currentCoordinates = { x: 0, y: 0 }
    this.previousCoordinates = { x: 0, y: 0 }
    this.startCoordinates = { x: 0, y: 0 }
    this.endCoordinates = { x: 0, y: 0 }
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

  setCurrentCoordinates(coordinates) {
    this.previousCoordinates = { ...this.currentCoordinates }
    this.currentCoordinates = { ...coordinates }
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

export const cursorManager = new CursorManager()
