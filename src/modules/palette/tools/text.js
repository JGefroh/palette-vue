export class Text {
  constructor(dependencies) {
    this.drawingCtx = dependencies.drawingCtx
    this.overlayCtx = dependencies.overlayCtx
    this.name = 'Text'
    this.icon = 'fa-font'
  }

  static new(drawingCtx, overlayCtx) {
    return new Text({ drawingCtx, overlayCtx })
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
