export class Fill {
  constructor({ drawingCtx, overlayCtx }) {
    this.drawingCtx = drawingCtx
    this.overlayCtx = overlayCtx
    this.name = 'Fill'
    this.icon = 'fa-bucket'
    this.tolerance = 64
  }

  static new(drawingCtx, overlayCtx) {
    return new Fill({ drawingCtx, overlayCtx })
  }

  get label() {
    return 'Fill'
  }

  start(coords) {
    const x = Math.max(0, Math.min(Math.floor(coords.x), this.drawingCtx.canvas.width - 1))
    const y = Math.max(0, Math.min(Math.floor(coords.y), this.drawingCtx.canvas.height - 1))

    const fillColor = this.parseFillColor(this.drawingCtx.fillStyle)
    this.floodFill(x, y, fillColor)
  }

  preProcess() {}

  process() {}

  end() {}

  parseFillColor(fillStyleString) {
    const offscreen = document.createElement('canvas')
    offscreen.width = offscreen.height = 1
    const octx = offscreen.getContext('2d')
    octx.fillStyle = fillStyleString
    octx.fillRect(0, 0, 1, 1)
    const px = octx.getImageData(0, 0, 1, 1).data
    return { r: px[0], g: px[1], b: px[2], a: px[3] }
  }

  floodFill(startX, startY, fillColor) {
    const ctx = this.drawingCtx
    const canvas = ctx.canvas
    const width = canvas.width
    const height = canvas.height

    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    const startIdx = (startY * width + startX) * 4
    const targetColor = {
      r: data[startIdx],
      g: data[startIdx + 1],
      b: data[startIdx + 2],
      a: data[startIdx + 3]
    }

    if (this.colorDistance(targetColor, fillColor) < 5) {
      return
    }

    const visited = new Uint8Array(width * height)

    const stack = [[startY, startX, startX]]

    while (stack.length) {
      const [y, x1, x2] = stack.pop()

      if (y < 0 || y >= height) continue

      let leftEdge = x1
      let rightEdge = x2

      while (leftEdge > 0 && this.pixelMatches(data, y, leftEdge - 1, width, targetColor) && !visited[y * width + (leftEdge - 1)]) {
        leftEdge--
      }

      while (rightEdge < width - 1 && this.pixelMatches(data, y, rightEdge + 1, width, targetColor) && !visited[y * width + (rightEdge + 1)]) {
        rightEdge++
      }

      for (let x = leftEdge; x <= rightEdge; x++) {
        if (!visited[y * width + x]) {
          const idx = (y * width + x) * 4
          data[idx] = fillColor.r
          data[idx + 1] = fillColor.g
          data[idx + 2] = fillColor.b
          data[idx + 3] = fillColor.a
          visited[y * width + x] = 1
        }
      }

      for (const ny of [y - 1, y + 1]) {
        if (ny < 0 || ny >= height) continue

        let x = leftEdge
        while (x <= rightEdge) {
          if (this.pixelMatches(data, ny, x, width, targetColor) && !visited[ny * width + x]) {
            const runStart = x
            while (x <= rightEdge && this.pixelMatches(data, ny, x, width, targetColor) && !visited[ny * width + x]) {
              x++
            }
            stack.push([ny, runStart, x - 1])
          } else {
            x++
          }
        }
      }
    }

    this.dilate(data, visited, width, height, fillColor)
    ctx.putImageData(imageData, 0, 0)
  }

  dilate(data, visited, width, height, fillColor) {
    const dilations = 1
    const toFill = new Uint8Array(width * height)

    for (let dilation = 0; dilation < dilations; dilation++) {
      toFill.fill(0)

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x
          if (!visited[idx]) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const ny = y + dy
                const nx = x + dx
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  if (visited[ny * width + nx]) {
                    toFill[idx] = 1
                    break
                  }
                }
              }
              if (toFill[idx]) break
            }
          }
        }
      }

      for (let i = 0; i < width * height; i++) {
        if (toFill[i]) {
          visited[i] = 1
          const pixelIdx = i * 4
          data[pixelIdx] = fillColor.r
          data[pixelIdx + 1] = fillColor.g
          data[pixelIdx + 2] = fillColor.b
          data[pixelIdx + 3] = fillColor.a
        }
      }
    }
  }

  pixelMatches(data, y, x, width, targetColor) {
    const idx = (y * width + x) * 4
    return this.colorDistance({
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
      a: data[idx + 3]
    }, targetColor) <= this.tolerance
  }

  colorDistance(c1, c2) {
    const dr = c1.r - c2.r
    const dg = c1.g - c2.g
    const db = c1.b - c2.b
    const da = c1.a - c2.a
    return Math.sqrt(dr * dr + dg * dg + db * db + da * da)
  }
}
