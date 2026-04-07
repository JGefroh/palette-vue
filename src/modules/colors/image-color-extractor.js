export class ImageColorExtractor {
  extract(imageElement, maxColors = 10) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    canvas.width = imageElement.width
    canvas.height = imageElement.height

    ctx.drawImage(imageElement, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const colorFrequency = {}

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      if (a < 128) continue

      const key = `${r},${g},${b}`
      colorFrequency[key] = (colorFrequency[key] || 0) + 1
    }

    const totalPixels = Object.values(colorFrequency).reduce((sum, count) => sum + count, 0)
    const minThreshold = totalPixels * 0.01

    const sortedColors = Object.entries(colorFrequency)
      .filter(([, count]) => count >= minThreshold)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxColors)
      .map(([key]) => {
        const [r, g, b] = key.split(',').map(Number)
        return this.rgbToHex(r, g, b)
      })

    return sortedColors
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(x => {
        const hex = Math.min(255, Math.max(0, x)).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
      .toUpperCase()
  }
}
