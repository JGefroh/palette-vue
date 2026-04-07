import { reactive } from 'vue'
import { inputHandler } from '../input/input-handler.js'
import { globalState } from '../persistence/global-state.js'
import { globalCursorManager } from '../input/global-cursor-manager.js'

export const eyedropperPreviewState = reactive({
  sample: null
})

export class Eyedropper {
  constructor({ drawingCtx, overlayCtx }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.name = 'Eyedropper'
    this.currentSample = null

    inputHandler.onCommand('cursor-update', (event) => {
      if (globalState.get('selectedTool')?.name !== 'Eyedropper') return
      globalCursorManager.updateFromMouseEvent(event)
      const coords = globalCursorManager.getCurrentCoordinates()
      this.sampleAndPreview(coords, event)
    })
  }

  static new(drawingCtx, overlayCtx) {
    return new Eyedropper({ drawingCtx, overlayCtx })
  }

  sampleAndPreview(coords, event) {
    const x = Math.floor(coords.x)
    const y = Math.floor(coords.y)
    const pixel = this.drawingCtx.getImageData(x, y, 1, 1).data
    const hex = this.rgbToHex(pixel[0], pixel[1], pixel[2])

    this.currentSample = {
      hex,
      r: pixel[0],
      g: pixel[1],
      b: pixel[2]
    }

    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    this.drawCrosshair(coords)

    eyedropperPreviewState.sample = {
      hex,
      r: pixel[0],
      g: pixel[1],
      b: pixel[2],
      screenX: event.clientX,
      screenY: event.clientY
    }
  }

  start() {}

  preProcess() {}

  process() {}

  end() {
    if (this.currentSample) {
      inputHandler.dispatchCommand('eyedropper-pick', this.currentSample.hex)
    }
  }

  drawCrosshair(coords) {
    const size = 8
    const ctx = this.overlayCtx
    ctx.save()
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(coords.x, coords.y, size, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(coords.x - size - 4, coords.y)
    ctx.lineTo(coords.x + size + 4, coords.y)
    ctx.moveTo(coords.x, coords.y - size - 4)
    ctx.lineTo(coords.x, coords.y + size + 4)
    ctx.stroke()
    ctx.restore()
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()
  }
}
