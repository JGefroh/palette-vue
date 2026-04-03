import { Shape } from './shape.js'
import { inputHandler } from '../utilities/input-handler.js'
import { globalState } from '../utilities/global-state.js'

export class ShapeLine extends Shape {
  constructor(dependencies) {
    super(dependencies)
    this.name = 'Line'
    this.icon = 'fa-minus'
    this.shortcut = 'l'
    this.unsubscribeEnableSnap = null
    this.unsubscribeDisableSnap = null
  }

  static new(drawingCtx, overlayCtx, getLineWidth) {
    return new ShapeLine({ drawingCtx, overlayCtx, getLineWidth })
  }

  get label() {
    return 'Line'
  }

  start(coordinates) {
    super.start(coordinates)
    globalState.set('snapEnabled', false)
    inputHandler.registerKeyCombo('shift_press', 'enableSnap')
    inputHandler.registerKeyCombo('shift_release', 'disableSnap')
    this.unsubscribeEnableSnap = inputHandler.onCommand('enableSnap', () => {
      globalState.set('snapEnabled', true)
    })
    this.unsubscribeDisableSnap = inputHandler.onCommand('disableSnap', () => {
      globalState.set('snapEnabled', false)
    })
    if (inputHandler.getMode().shift) {
      globalState.set('snapEnabled', true)
    }
  }

  snapToAxis(coordinates) {
    if (!globalState.get('snapEnabled') || !this.startCoordinates) {
      return coordinates
    }

    const dx = coordinates.x - this.startCoordinates.x
    const dy = coordinates.y - this.startCoordinates.y

    if (Math.abs(dx) > Math.abs(dy)) {
      return { x: coordinates.x, y: this.startCoordinates.y }
    } else {
      return { x: this.startCoordinates.x, y: coordinates.y }
    }
  }

  process(coordinates) {
    const snappedCoords = this.snapToAxis(coordinates)
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    if (!this.startCoordinates) return
    if (this.getLineWidth) {
      this.overlayCtx.lineWidth = this.getLineWidth()
    }
    this.drawShape(this.overlayCtx, this.startCoordinates, snappedCoords)
  }

  end(coordinates) {
    const snappedCoords = this.snapToAxis(coordinates)
    if (this.unsubscribeEnableSnap) {
      this.unsubscribeEnableSnap()
    }
    if (this.unsubscribeDisableSnap) {
      this.unsubscribeDisableSnap()
    }
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    if (this.startCoordinates) {
      if (this.getLineWidth) {
        this.drawingCtx.lineWidth = this.getLineWidth()
      }
      this.drawShape(this.drawingCtx, this.startCoordinates, snappedCoords)
      this.startCoordinates = null
    }
  }

  drawShape(ctx, startCoords, endCoords) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(startCoords.x, startCoords.y)
    ctx.lineTo(endCoords.x, endCoords.y)
    ctx.stroke()
    ctx.restore()
  }
}
