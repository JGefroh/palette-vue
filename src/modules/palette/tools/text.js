export class Text {
  constructor(dependencies) {
    this.drawingCtx = dependencies.drawingCtx
    this.overlayCtx = dependencies.overlayCtx
  }

  get label() {
    return 'Text'
  }

  start(coordinates) {
    const text = prompt('Enter text:')
    if (!text) return
    this.drawingCtx.font = '24px sans-serif'
    this.drawingCtx.fillText(text, coordinates.x, coordinates.y)
  }

  process(coordinates) {}

  end(coordinates) {}
}
