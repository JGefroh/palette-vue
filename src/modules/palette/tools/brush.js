import { reactive } from 'vue'
import { globalState } from '../utilities/global-state.js'
import { inputHandler } from '../utilities/input-handler.js'

export class Brush {
  constructor(dependencies) {
    this.drawingCtx = dependencies.drawingCtx
    this.overlayCtx = dependencies.overlayCtx
    this.getLineWidth = dependencies.getLineWidth
    this.strokeStartCoordinates = null
    this.strokeEndCoordinates = null
    this.recentCoordinates = []
    this.name = 'Brush'
    this.icon = null
    this.shortcut = 'b'
    this.mode = undefined
    this.options = reactive([
      {
        key: 'arrowStyle',
        choices: [
          { value: 'none', icon: 'fa-minus', label: 'Nub' },
          { value: 'arrow', icon: 'fa-arrow-right', label: 'Arrow' }
        ],
        selected: 'none'
      }
    ])
  }

  static new(drawingCtx, overlayCtx, getLineWidth) {
    const instance = new Brush({ drawingCtx, overlayCtx, getLineWidth })
    inputHandler.registerCommand('cmd+b', 'brush-toggle-arrow', () => {
      const selectedTool = globalState.get('selectedTool')
      if (selectedTool && selectedTool.name === 'Brush') {
        selectedTool.toggleArrow()
      }
    })
    return instance
  }

  get label() {
    return 'Brush'
  }

  get icons() {
    const arrowOption = this.options.find(o => o.key === 'arrowStyle')
    if (arrowOption && arrowOption.selected === 'arrow') {
      return ['fa-arrow-right']
    }
    return null
  }

  start(coordinates) {
    this.strokeStartCoordinates = { x: coordinates.x, y: coordinates.y }
    this.recentCoordinates = []
    this.initializeStroke(coordinates)
  }

  preProcess(coordinates) {
    this.clearOverlay()
  }

  process(coordinates) {
    this.drawCursorPreview(coordinates)
    this.drawLine(coordinates)
    this.recentCoordinates.push({ x: coordinates.x, y: coordinates.y })
    if (this.recentCoordinates.length > 5) {
      this.recentCoordinates.shift()
    }
  }

  end(coordinates) {
    this.strokeEndCoordinates = { x: coordinates.x, y: coordinates.y }
    this.finalizeStroke(coordinates)
    this.drawArrowIfEnabled()
  }

  onAlreadySelected() {
    // Brush cycles through arrow options when selected repeatedly
    this.toggleArrow()
  }

  toggleArrow() {
    const arrowOption = this.options.find(o => o.key === 'arrowStyle')
    if (!arrowOption) return

    const choices = arrowOption.choices
    const currentIndex = choices.findIndex(c => c.value === arrowOption.selected)
    const nextIndex = (currentIndex + 1) % choices.length

    Object.assign(arrowOption, { selected: choices[nextIndex].value })
  }

  drawArrowIfEnabled() {
    const arrowOption = this.options.find(o => o.key === 'arrowStyle')
    if (!arrowOption || arrowOption.selected !== 'arrow') return
    if (this.recentCoordinates.length < 2) return

    const first = this.recentCoordinates[0]
    const last = this.recentCoordinates[this.recentCoordinates.length - 1]
    const arrowPosition = last

    const angle = Math.atan2(last.y - first.y, last.x - first.x)
    const arrowLength = this.getLineWidth() * 4
    const arrowWidth = this.getLineWidth() * 2

    this.drawingCtx.save()
    this.drawingCtx.translate(arrowPosition.x, arrowPosition.y)
    this.drawingCtx.rotate(angle)
    this.drawingCtx.fillStyle = this.drawingCtx.strokeStyle
    this.drawingCtx.beginPath()
    this.drawingCtx.moveTo(this.getLineWidth(), 0)
    this.drawingCtx.lineTo(-arrowLength + this.getLineWidth(), arrowWidth)
    this.drawingCtx.lineTo(-arrowLength + this.getLineWidth(), -arrowWidth)
    this.drawingCtx.closePath()
    this.drawingCtx.fill()
    this.drawingCtx.restore()
  }

  initializeStroke(coordinates) {
    this.drawingCtx.lineWidth = this.getLineWidth()
    this.drawingCtx.lineCap = 'round'
    this.drawingCtx.lineJoin = 'round'
    this.drawingCtx.beginPath()
    this.drawingCtx.moveTo(coordinates.x, coordinates.y)
  }

  clearOverlay() {
    this.overlayCtx.save()
    this.overlayCtx.fillStyle = '#FFFFFF'
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    this.overlayCtx.restore()
  }

  drawCursorPreview(coordinates) {
    this.overlayCtx.save()
    this.overlayCtx.beginPath()
    this.overlayCtx.arc(coordinates.x, coordinates.y, this.getLineWidth() / 2, 0, 2 * Math.PI, false)
    this.overlayCtx.fill()
    this.overlayCtx.restore()
  }

  drawLine(coordinates) {
    this.drawingCtx.lineWidth = this.getLineWidth()
    this.drawingCtx.lineTo(coordinates.x, coordinates.y)
    this.drawingCtx.stroke()
    this.drawingCtx.beginPath()
    this.drawingCtx.moveTo(coordinates.x, coordinates.y)
  }

  finalizeStroke(coordinates) {
    // If no movement occurred, draw a point
    if (this.strokeStartCoordinates &&
        coordinates.x === this.strokeStartCoordinates.x &&
        coordinates.y === this.strokeStartCoordinates.y) {
      this.drawingCtx.lineWidth = this.getLineWidth()
      this.drawingCtx.arc(coordinates.x, coordinates.y, this.getLineWidth() / 2, 0, 2 * Math.PI)
      this.drawingCtx.fill()
    } else {
      this.drawingCtx.lineWidth = this.getLineWidth()
      this.drawingCtx.lineTo(coordinates.x, coordinates.y)
      this.drawingCtx.stroke()
    }
  }

}
