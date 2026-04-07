export class ImageColorExtractor {
  extract(imageElement, maxColors = 10, deltaEThreshold = 15) {
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

    const colors = Object.entries(colorFrequency)
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number)
        return { r, g, b, count }
      })

    const buckets = this.clusterByDeltaE(colors, deltaEThreshold)

    return buckets
      .slice(0, maxColors)
      .map(bucket => this.rgbToHex(bucket.r, bucket.g, bucket.b))
  }

  clusterByDeltaE(colors, threshold) {
    const clusters = []

    for (const color of colors) {
      let merged = false
      for (const cluster of clusters) {
        const distance = this.deltaE2000(
          this.rgbToLab(color.r, color.g, color.b),
          this.rgbToLab(cluster.r, cluster.g, cluster.b)
        )
        if (distance < threshold) {
          cluster.count += color.count
          merged = true
          break
        }
      }
      if (!merged) {
        clusters.push(color)
      }
    }

    return clusters.sort((a, b) => b.count - a.count)
  }

  rgbToLab(r, g, b) {
    let [r_, g_, b_] = [r, g, b].map(x => {
      x = x / 255
      return x > 0.04045 ? Math.pow((x + 0.055) / 1.055, 2.4) : x / 12.92
    })

    const x = r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805
    const y = r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722
    const z = r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505

    const [xn, yn, zn] = [0.95047, 1, 1.08883]
    const [xr, yr, zr] = [x / xn, y / yn, z / zn]

    const [fx, fy, fz] = [xr, yr, zr].map(t =>
      t > 0.008856 ? Math.pow(t, 1 / 3) : (7.787 * t + 16) / 116
    )

    const L = 116 * fy - 16
    const a = 500 * (fx - fy)
    const bVal = 200 * (fy - fz)

    return { L, a, b: bVal }
  }

  deltaE2000(lab1, lab2) {
    const { L: L1, a: a1, b: b1 } = lab1
    const { L: L2, a: a2, b: b2 } = lab2

    const dL = L2 - L1
    const da = a2 - a1
    const db = b2 - b1

    const C1 = Math.sqrt(a1 * a1 + b1 * b1)
    const C2 = Math.sqrt(a2 * a2 + b2 * b2)
    const dC = C2 - C1

    const dH_sq = da * da + db * db - dC * dC
    const dH = dH_sq < 0 ? 0 : Math.sqrt(dH_sq)

    const Lm = (L1 + L2) / 2
    const Cm = (C1 + C2) / 2
    const SL = 1
    const SC = 1 + 0.045 * Cm
    const SH = 1 + 0.015 * Cm

    return Math.sqrt(
      (dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2
    )
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
