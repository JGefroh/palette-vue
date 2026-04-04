// Handles clipboard operations (copy)
export class SelectClipboard {
  constructor(select) {
    this.select = select
  }

  copySelectedContent() {
    if (!this.select.selectionBounds) return
    const { x, y, width, height } = this.select.selectionBounds
    const imageData = this.select.drawingCtx.getImageData(x, y, width, height)

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(imageData, 0, 0)

    tempCanvas.toBlob(blob => {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).catch(err => {
        console.error('Failed to copy:', err)
      })
    })
  }
}
