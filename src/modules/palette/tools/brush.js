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
    this.lineDashOffset = 0
    this.dotAccumulator = 0
    this.name = 'Brush'
    this.icon = 'fa-pencil'
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
      },
      {
        key: 'lineStyle',
        choices: [
          { value: 'solid', icon: 'fa-circle', label: 'Solid' },
          { value: 'dashed', icons: ['fa-minus', 'fa-minus'], label: 'Dashed' },
          { value: 'dotted', icon: 'fa-ellipsis-h', label: 'Dotted' }
        ],
        selected: 'solid'
      }
    ])
  }

  static new(drawingCtx, overlayCtx, getLineWidth) {
    const instance = new Brush({ drawingCtx, overlayCtx, getLineWidth })
    inputHandler.onCommand('brush-toggle-arrow', () => {
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
    const lineStyleOption = this.options.find(o => o.key === 'lineStyle')
    const arrowOption = this.options.find(o => o.key === 'arrowStyle')

    const hasArrow = arrowOption && arrowOption.selected === 'arrow'
    const lineStyle = lineStyleOption?.selected || 'solid'

    let icons = ['fa-pencil']

    if (lineStyle === 'dashed') {
      icons.push('fa-minus')
      icons.push('fa-minus')
    } else if (lineStyle === 'dotted') {
      icons.push('fa-ellipsis-h')
    }

    if (hasArrow) {
      icons.push('fa-arrow-right')
    }

    return icons
  }

  start(coordinates) {
    this.strokeStartCoordinates = { x: coordinates.x, y: coordinates.y }
    this.recentCoordinates = []
    this.lineDashOffset = 0
    this.dotAccumulator = 0
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
    // Brush cycles through line style when selected repeatedly
    this.cycleLineStyle()
  }

  cycleLineStyle() {
    const lineStyleOption = this.options.find(o => o.key === 'lineStyle')
    if (!lineStyleOption) return

    const choices = lineStyleOption.choices
    const currentIndex = choices.findIndex(c => c.value === lineStyleOption.selected)
    const nextIndex = (currentIndex + 1) % choices.length

    Object.assign(lineStyleOption, { selected: choices[nextIndex].value })
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
    this.applyLineStyle(this.drawingCtx)
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
    const lineStyleOption = this.options.find(o => o.key === 'lineStyle')
    const lineStyle = lineStyleOption?.selected || 'solid'

    const lastCoords = this.recentCoordinates[this.recentCoordinates.length - 1] || this.strokeStartCoordinates
    const dx = coordinates.x - lastCoords.x
    const dy = coordinates.y - lastCoords.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    this.drawingCtx.lineWidth = this.getLineWidth()

    if (lineStyle === 'dotted') {
      this.drawDottedLine(lastCoords, coordinates, distance)
    } else {
      this.drawingCtx.lineTo(coordinates.x, coordinates.y)
      this.drawingCtx.stroke()

      this.lineDashOffset += distance
      this.drawingCtx.lineDashOffset = this.lineDashOffset
    }

    this.drawingCtx.beginPath()
    this.drawingCtx.moveTo(coordinates.x, coordinates.y)
  }

  drawDottedLine(fromCoords, toCoords, distance) {
    const dotSpacing = this.getLineWidth() * 2
    const dotRadius = this.getLineWidth() / 2

    this.dotAccumulator += distance
    const numDots = Math.floor(this.dotAccumulator / dotSpacing)

    if (numDots > 0) {
      const stepX = (toCoords.x - fromCoords.x) / (distance || 1)
      const stepY = (toCoords.y - fromCoords.y) / (distance || 1)

      for (let i = 0; i < numDots; i++) {
        const offset = (i + 1) * dotSpacing - (this.dotAccumulator - distance)
        const x = fromCoords.x + stepX * offset
        const y = fromCoords.y + stepY * offset

        this.drawingCtx.beginPath()
        this.drawingCtx.arc(x, y, dotRadius, 0, Math.PI * 2)
        this.drawingCtx.fill()
      }

      this.dotAccumulator -= numDots * dotSpacing
    }
  }

  applyLineStyle(ctx) {
    const lineStyleOption = this.options.find(o => o.key === 'lineStyle')
    const lineStyle = lineStyleOption?.selected || 'solid'

    if (lineStyle === 'dashed') {
      ctx.setLineDash([ctx.lineWidth, ctx.lineWidth * 2])
    } else {
      ctx.setLineDash([])
    }
  }

  finalizeStroke(coordinates) {
    const lineStyleOption = this.options.find(o => o.key === 'lineStyle')
    const lineStyle = lineStyleOption?.selected || 'solid'

    // If no movement occurred, draw a point
    if (this.strokeStartCoordinates &&
        coordinates.x === this.strokeStartCoordinates.x &&
        coordinates.y === this.strokeStartCoordinates.y) {
      this.drawingCtx.lineWidth = this.getLineWidth()
      this.drawingCtx.arc(coordinates.x, coordinates.y, this.getLineWidth() / 2, 0, 2 * Math.PI)
      this.drawingCtx.fill()
    } else if (lineStyle !== 'dotted') {
      this.drawingCtx.lineWidth = this.getLineWidth()
      this.drawingCtx.lineTo(coordinates.x, coordinates.y)
      this.drawingCtx.stroke()
    }
    this.drawingCtx.setLineDash([])
    this.drawingCtx.lineDashOffset = 0
    this.lineDashOffset = 0
    this.dotAccumulator = 0
  }

}
