import { Shape } from './shape.js'
import { inputHandler } from '../utilities/input-handler.js'
import { globalState } from '../utilities/global-state.js'

export class ShapeRectangle extends Shape {
  constructor(dependencies) {
    super(dependencies)
    this.name = 'Rectangle'
    this.fillIcon = 'fa-square'
    this.outlineIcon = 'fa-square-o'
    this.shortcut = 'r'
    this.unsubscribeConstrainSquare = null
    this.unsubscribeUnconstrainSquare = null
  }

  static new(drawingCtx, overlayCtx, getLineWidth) {
    return new ShapeRectangle({ drawingCtx, overlayCtx, getLineWidth })
  }

  get label() {
    return 'Rectangle'
  }

  start(coordinates) {
    super.start(coordinates)
    globalState.set('constrainToSquare', false)
    inputHandler.registerKeyCombo('shift_press', 'constrainSquare')
    inputHandler.registerKeyCombo('shift_release', 'unconstrainSquare')
    this.unsubscribeConstrainSquare = inputHandler.onCommand('constrainSquare', () => {
      globalState.set('constrainToSquare', true)
    })
    this.unsubscribeUnconstrainSquare = inputHandler.onCommand('unconstrainSquare', () => {
      globalState.set('constrainToSquare', false)
    })
    if (inputHandler.getMode().shift) {
      globalState.set('constrainToSquare', true)
    }
  }

  end(coordinates) {
    if (this.unsubscribeConstrainSquare) {
      this.unsubscribeConstrainSquare()
    }
    if (this.unsubscribeUnconstrainSquare) {
      this.unsubscribeUnconstrainSquare()
    }
    super.end(coordinates)
  }

  drawShape(ctx, startCoords, endCoords) {
    let x = startCoords.x
    let y = startCoords.y
    let width = Math.abs(endCoords.x - startCoords.x)
    let height = Math.abs(endCoords.y - startCoords.y)

    if (globalState.get('constrainToSquare')) {
      const side = Math.max(width, height)
      if (endCoords.x < startCoords.x) {
        x = startCoords.x - side
      }
      if (endCoords.y < startCoords.y) {
        y = startCoords.y - side
      }
      width = side
      height = side
    } else {
      x = Math.min(startCoords.x, endCoords.x)
      y = Math.min(startCoords.y, endCoords.y)
    }

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, width, height)
    this.mode === 'fill' ? ctx.fill() : ctx.stroke()
    ctx.restore()
  }
}
