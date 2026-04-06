import { Shape } from './shape.js'
import { globalState } from '../utilities/global-state.js'
import { reactive } from 'vue'
import { inputHandler } from '../utilities/input-handler.js'

export class ShapeLine extends Shape {
  constructor(dependencies) {
    super(dependencies)
    this.name = 'Line'
    this._icon = 'fa-minus'
    this.mode = undefined
    this.unsubscribeEnableSnap = null
    this.unsubscribeDisableSnap = null
    inputHandler.onCommand('line-toggle-arrow', () => {
      const selectedTool = globalState.get('selectedTool')
      if (selectedTool && selectedTool.name === 'Line') {
        selectedTool.toggleArrow()
      }
    })
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
          { value: 'solid', icon: 'fa-minus', label: 'Solid' },
          { value: 'dashed', icons: ['fa-minus', 'fa-minus'], label: 'Dashed' },
          { value: 'dotted', icon: 'fa-ellipsis-h', label: 'Dotted' }
        ],
        selected: 'solid'
      }
    ])
  }

  static new(drawingCtx, overlayCtx) {
    return new ShapeLine({ drawingCtx, overlayCtx })
  }

  get label() {
    return 'Line'
  }

  get icon() {
    const lineStyleOption = this.options.find(o => o.key === 'lineStyle')
    if (!lineStyleOption) return this._icon

    switch (lineStyleOption.selected) {
      case 'dashed':
        return null
      case 'dotted':
        return 'fa-ellipsis-h'
      default:
        return 'fa-minus'
    }
  }

  get icons() {
    const lineStyleOption = this.options.find(o => o.key === 'lineStyle')
    const arrowOption = this.options.find(o => o.key === 'arrowStyle')

    const hasArrow = arrowOption && arrowOption.selected === 'arrow'
    const lineStyle = lineStyleOption?.selected || 'solid'

    let icons = []

    if (lineStyle === 'solid' && hasArrow) {
      icons = ['fa-arrow-right']
    } else if (lineStyle === 'dashed') {
      icons = ['fa-minus', 'fa-minus']
      if (hasArrow) icons.push('fa-arrow-right')
    } else if (lineStyle === 'dotted') {
      icons = ['fa-ellipsis-h']
      if (hasArrow) icons.push('fa-arrow-right')
    } else {
      icons = ['fa-minus']
    }

    return icons.length > 0 ? icons : null
  }


  start(coordinates) {
    super.start(coordinates)
    globalState.set('snapEnabled', false)

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
    this.overlayCtx.lineWidth = globalState.get('selectedSize')
    this.overlayCtx.lineCap = 'round'
    this.overlayCtx.lineJoin = 'round'
    this.drawShape(this.overlayCtx, this.startCoordinates, snappedCoords)
    const angle = Math.atan2(snappedCoords.y - this.startCoordinates.y, snappedCoords.x - this.startCoordinates.x)
    this.drawAngleIndicator(this.overlayCtx, this.startCoordinates, angle)
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
      this.drawingCtx.lineWidth = globalState.get('selectedSize')
      this.drawingCtx.lineCap = 'round'
      this.drawingCtx.lineJoin = 'round'
      this.drawShape(this.drawingCtx, this.startCoordinates, snappedCoords)
      this.startCoordinates = null
    }
  }

  drawSolidLine(ctx, startCoords, endCoords) {
    ctx.beginPath()
    ctx.moveTo(startCoords.x, startCoords.y)
    ctx.lineTo(endCoords.x, endCoords.y)
    ctx.stroke()
  }

  drawDashedLine(ctx, startCoords, endCoords) {
    ctx.setLineDash([ctx.lineWidth, ctx.lineWidth * 2])
    ctx.beginPath()
    ctx.moveTo(startCoords.x, startCoords.y)
    ctx.lineTo(endCoords.x, endCoords.y)
    ctx.stroke()
    ctx.setLineDash([])
  }

  drawDottedLine(ctx, startCoords, endCoords) {
    const dx = endCoords.x - startCoords.x
    const dy = endCoords.y - startCoords.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const dotSpacing = ctx.lineWidth * 2
    const dotRadius = ctx.lineWidth / 2

    const numDots = Math.ceil(distance / dotSpacing)

    ctx.fillStyle = ctx.strokeStyle

    for (let i = 0; i <= numDots; i++) {
      const t = numDots > 0 ? i / numDots : 0
      const x = startCoords.x + dx * t
      const y = startCoords.y + dy * t

      ctx.beginPath()
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawShape(ctx, startCoords, endCoords) {
    ctx.save()

    const lineStyleOption = this.options.find(o => o.key === 'lineStyle')
    const lineStyle = lineStyleOption?.selected || 'solid'

    if (lineStyle === 'dashed') {
      this.drawDashedLine(ctx, startCoords, endCoords)
    } else if (lineStyle === 'dotted') {
      this.drawDottedLine(ctx, startCoords, endCoords)
    } else {
      this.drawSolidLine(ctx, startCoords, endCoords)
    }

    const angle = Math.atan2(endCoords.y - startCoords.y, endCoords.x - startCoords.x)

    const arrowOption = this.options.find(o => o.key === 'arrowStyle')
    if (arrowOption && arrowOption.selected === 'arrow') {
      const arrowLength = ctx.lineWidth * 4
      const arrowWidth = ctx.lineWidth * 2

      ctx.save()
      ctx.translate(endCoords.x, endCoords.y)
      ctx.rotate(angle)
      ctx.fillStyle = ctx.strokeStyle
      ctx.beginPath()
      ctx.moveTo(ctx.lineWidth, 0)
      ctx.lineTo(-arrowLength + ctx.lineWidth, arrowWidth)
      ctx.lineTo(-arrowLength + ctx.lineWidth, -arrowWidth)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    ctx.restore()
  }

  drawAngleIndicator(ctx, startCoords, angle) {
    let angleDegrees = Math.round((angle * 180) / Math.PI)
    const normalized = ((angleDegrees % 180) + 180) % 180
    angleDegrees = normalized > 90 ? 180 - normalized : normalized

    const distance = ctx.lineWidth * 2.5
    const oppositeAngle = angle + Math.PI
    const textX = startCoords.x + Math.cos(oppositeAngle) * distance
    const textY = startCoords.y + Math.sin(oppositeAngle) * distance

    ctx.save()
    ctx.font = `14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
    ctx.fillStyle = ctx.strokeStyle
    ctx.globalAlpha = 0.6
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${angleDegrees}°`, textX, textY)
    ctx.restore()
  }

  onAlreadySelected() {
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
}
