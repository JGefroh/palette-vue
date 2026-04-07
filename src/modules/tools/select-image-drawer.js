// Handles image data rendering (fill/outline modes)
export class SelectImageDrawer {
  constructor(select) {
    this.select = select
  }

  drawImageData(ctx, imageData, x, y, mode = 'fill', width, height) {
    if (!imageData) return
    if (mode === 'fill') {
      this.drawImageDataForFillMode(ctx, imageData, x, y, width, height)
    } else {
      this.drawImageDataForOutlineMode(ctx, imageData, x, y, width, height)
    }
  }

  drawImageDataForFillMode(ctx, imageData, x, y, width, height) {
    const copy = ctx.createImageData(imageData)
    copy.data.set(imageData.data)
    const data = copy.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) {
        data[i] = 255
        data[i + 1] = 255
        data[i + 2] = 255
        data[i + 3] = 255
      }
    }

    if (width !== undefined && height !== undefined) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = imageData.width
      tempCanvas.height = imageData.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.putImageData(copy, 0, 0)
      ctx.drawImage(tempCanvas, x, y, width, height)
    } else {
      ctx.putImageData(copy, x, y)
    }
  }

  drawImageDataForOutlineMode(ctx, imageData, x, y, width, height) {
    const copy = ctx.createImageData(imageData)
    copy.data.set(imageData.data)
    this.makeWhitePixelsTransparent(copy)
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(copy, 0, 0)

    if (width !== undefined && height !== undefined) {
      ctx.drawImage(tempCanvas, x, y, width, height)
    } else {
      ctx.drawImage(tempCanvas, x, y)
    }
  }

  makeWhitePixelsTransparent(imageData) {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
        data[i + 3] = 0
      }
    }
    return imageData
  }
}
