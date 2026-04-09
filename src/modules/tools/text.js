import { reactive, watch } from 'vue'
import { globalState } from '../persistence/global-state.js'
import { globalCanvasManager } from '../canvas/global-canvas-manager.js'

export const textToolState = reactive({
  isTyping: false,
  anchorX: 0,
  anchorY: 0,
  panelAnchorX: 0,
  panelAnchorY: 0,
  fontSize: 20,
  alignment: 'center',
  bold: false,
  italic: false,
  underline: false
})

export class Text {
  constructor(dependencies) {
    this.drawingCtx = dependencies.drawingCtx
    this.overlayCtx = dependencies.overlayCtx
    this.name = 'Text'
    this.icon = 'fa-font'

    this.chars = []
    this.cursor = 0
    this.selectionStart = null
    this.selectionEnd = null

    this.currentStyles = { bold: false, italic: false, underline: false, color: null }

    this.blinkInterval = null
    this.blinkVisible = true
    this.keyHandler = this.handleKey.bind(this)
    this.isDragging = false
    this.dragSelectStart = null
    this.dragStartX = 0
    this.dragStartY = 0

    this.options = reactive([])

    watch(() => textToolState.alignment, () => {
      if (textToolState.isTyping) {
        this.renderOverlay()
      }
    })

    watch(() => textToolState.fontSize, () => {
      if (textToolState.isTyping) {
        this.renderOverlay()
      }
    })

    watch(() => globalState.get('selectedColor'), (newColor) => {
      if (textToolState.isTyping && newColor) {
        const hexColor = newColor.hex
        if (this.selectionStart !== null && this.selectionEnd !== null) {
          this.applyColorToSelection(hexColor)
        } else {
          this.currentStyles.color = hexColor
          this.renderOverlay()
        }
      }
    }, { deep: true })
  }

  static new(drawingCtx, overlayCtx) {
    return new Text({ drawingCtx, overlayCtx })
  }

  get label() {
    return 'Text'
  }

  get text() {
    return this.chars.map(c => c.char).join('')
  }

  start(coordinates) {
    if (!textToolState.isTyping) {
      textToolState.isTyping = true
      textToolState.anchorX = coordinates.x
      textToolState.anchorY = coordinates.y
      textToolState.panelAnchorX = coordinates.x
      textToolState.panelAnchorY = coordinates.y

      this.chars = []
      this.cursor = 0
      this.selectionStart = null
      this.selectionEnd = null
      this.currentStyles = { bold: false, italic: false, underline: false }

      this.startKeyCapture()
      this.startBlinking()
      this.renderOverlay()
    } else {
      if (this.isClickOnEdge(coordinates)) {
        this.isDragging = true
        this.dragStartX = coordinates.x
        this.dragStartY = coordinates.y
      } else if (this.isClickInsideTextBox(coordinates)) {
        const charIndex = this.getCharIndexAtCoordinates(coordinates)
        this.cursor = charIndex
        this.dragSelectStart = charIndex
        this.selectionStart = null
        this.selectionEnd = null
        this.syncPanelState()
        this.renderOverlay()
      } else {
        this.commit()
      }
    }
  }

  isOnEdge(coordinates) {
    if (!textToolState.isTyping || this.chars.length === 0) return false

    const { lineChars } = this.getLineInfo()
    const maxLineWidth = Math.max(...lineChars.map(lc => this.measureStyledChars(this.overlayCtx, lc, textToolState.fontSize)), 0)

    let minX, maxX
    if (textToolState.alignment === 'center') {
      minX = textToolState.anchorX - maxLineWidth / 2 - 4
      maxX = textToolState.anchorX + maxLineWidth / 2 + 4
    } else if (textToolState.alignment === 'right') {
      minX = textToolState.anchorX - maxLineWidth - 4
      maxX = textToolState.anchorX + 4
    } else {
      minX = textToolState.anchorX - 4
      maxX = textToolState.anchorX + maxLineWidth + 4
    }

    const minY = textToolState.anchorY - textToolState.fontSize - 4
    const maxY = textToolState.anchorY + (lineChars.length - 1) * textToolState.fontSize * 1.3 + textToolState.fontSize * 0.3 + 4

    const edgeThreshold = 8
    const onLeftEdge = Math.abs(coordinates.x - minX) < edgeThreshold
    const onRightEdge = Math.abs(coordinates.x - maxX) < edgeThreshold
    const onTopEdge = Math.abs(coordinates.y - minY) < edgeThreshold
    const onBottomEdge = Math.abs(coordinates.y - maxY) < edgeThreshold

    return (onLeftEdge || onRightEdge) && (coordinates.y >= minY && coordinates.y <= maxY) ||
           (onTopEdge || onBottomEdge) && (coordinates.x >= minX && coordinates.x <= maxX)
  }

  isClickOnEdge(coordinates) {
    return this.isOnEdge(coordinates)
  }

  isClickInsideTextBox(coordinates) {
    const { lineChars } = this.getLineInfo()
    if (lineChars.length === 0 || lineChars.every(lc => lc.length === 0)) return false

    const maxLineWidth = Math.max(...lineChars.map(lc => this.measureStyledChars(this.overlayCtx, lc, textToolState.fontSize)), 0)

    let minX, maxX
    if (textToolState.alignment === 'center') {
      minX = textToolState.anchorX - maxLineWidth / 2 - 4
      maxX = textToolState.anchorX + maxLineWidth / 2 + 4
    } else if (textToolState.alignment === 'right') {
      minX = textToolState.anchorX - maxLineWidth - 4
      maxX = textToolState.anchorX + 4
    } else {
      minX = textToolState.anchorX - 4
      maxX = textToolState.anchorX + maxLineWidth + 4
    }

    const minY = textToolState.anchorY - textToolState.fontSize - 4
    const maxY = textToolState.anchorY + (lineChars.length - 1) * textToolState.fontSize * 1.3 + textToolState.fontSize * 0.3 + 4

    return coordinates.x >= minX && coordinates.x <= maxX &&
           coordinates.y >= minY && coordinates.y <= maxY
  }

  getCharIndexAtCoordinates(coordinates) {
    const ctx = this.overlayCtx
    ctx.save()
    const { lineChars } = this.getLineInfo()
    const lineHeight = textToolState.fontSize * 1.3

    let targetLine = -1
    for (let i = 0; i < lineChars.length; i++) {
      const lineY = textToolState.anchorY + i * lineHeight
      if (coordinates.y >= lineY - textToolState.fontSize && coordinates.y < lineY + textToolState.fontSize * 0.3) {
        targetLine = i
        break
      }
    }

    if (targetLine === -1) {
      if (coordinates.y < textToolState.anchorY) {
        targetLine = 0
      } else {
        targetLine = lineChars.length - 1
      }
    }

    const maxLineWidth = Math.max(...lineChars.map(lc => this.measureStyledChars(ctx, lc, textToolState.fontSize)), 0)
    const lineCharList = lineChars[targetLine]
    let lineCharIndex = 0

    for (let i = 0; i < targetLine; i++) {
      lineCharIndex += lineChars[i].length + 1
    }

    const lineX = this.getTextXPosition(ctx, lineCharList, maxLineWidth)
    let charX = lineX
    let charPos = 0

    for (let i = 0; i < lineCharList.length; i++) {
      ctx.font = this.buildFont(lineCharList[i], textToolState.fontSize)
      const charWidth = ctx.measureText(lineCharList[i].char).width
      if (coordinates.x < charX + charWidth / 2) {
        ctx.restore()
        return lineCharIndex + charPos
      }
      charX += charWidth
      charPos++
    }

    ctx.restore()
    return lineCharIndex + lineCharList.length
  }

  process(coordinates) {
    if (!textToolState.isTyping) return

    if (this.isDragging) {
      const dx = coordinates.x - this.dragStartX
      const dy = coordinates.y - this.dragStartY
      textToolState.anchorX += dx
      textToolState.anchorY += dy
      textToolState.panelAnchorX += dx
      textToolState.panelAnchorY += dy
      this.dragStartX = coordinates.x
      this.dragStartY = coordinates.y
      this.renderOverlay()
    } else if (this.dragSelectStart !== null) {
      const charIndex = this.getCharIndexAtCoordinates(coordinates)
      this.cursor = charIndex
      this.selectionStart = Math.min(this.dragSelectStart, charIndex)
      this.selectionEnd = Math.max(this.dragSelectStart, charIndex)
      this.syncPanelState()
      this.renderOverlay()
    }
  }

  end(coordinates) {
    this.isDragging = false
    this.dragSelectStart = null
  }

  deselect() {
    if (textToolState.isTyping) {
      this.commit()
    }
    this.stopKeyCapture()
    this.stopBlinking()
  }

  startKeyCapture() {
    window.addEventListener('keydown', this.keyHandler, true)
  }

  stopKeyCapture() {
    window.removeEventListener('keydown', this.keyHandler, true)
  }

  startBlinking() {
    this.blinkVisible = true
    this.blinkInterval = setInterval(() => {
      this.blinkVisible = !this.blinkVisible
      if (textToolState.isTyping) {
        this.renderOverlay()
      }
    }, 500)
  }

  stopBlinking() {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval)
      this.blinkInterval = null
    }
  }

  handleKey(event) {
    if (!textToolState.isTyping) return

    const key = event.key

    if ((event.metaKey || event.ctrlKey) && key === 'a') {
      event.preventDefault()
      event.stopPropagation()
      this.selectAll()
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'ArrowLeft') {
      event.preventDefault()
      event.stopPropagation()
      this.handleHome(event.shiftKey)
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'ArrowRight') {
      event.preventDefault()
      event.stopPropagation()
      this.handleEnd(event.shiftKey)
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'b') {
      event.preventDefault()
      event.stopPropagation()
      this.applyStyleToSelection('bold')
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'i') {
      event.preventDefault()
      event.stopPropagation()
      this.applyStyleToSelection('italic')
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'u') {
      event.preventDefault()
      event.stopPropagation()
      this.applyStyleToSelection('underline')
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'c') {
      event.preventDefault()
      event.stopPropagation()
      this.copySelection()
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'x') {
      event.preventDefault()
      event.stopPropagation()
      this.copySelection()
      this.deleteSelection()
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'v') {
      event.preventDefault()
      event.stopPropagation()
      this.pasteFromClipboard()
      return
    }

    if ((event.metaKey || event.ctrlKey) && key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      this.commit()
      return
    }

    if (event.metaKey || event.ctrlKey) {
      return
    }

    if (key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      this.insertChar('\n')
    } else if (key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      this.cancel()
    } else if (key === 'Backspace') {
      event.preventDefault()
      event.stopPropagation()
      this.deleteSelection()
    } else if (key === 'Delete') {
      event.preventDefault()
      event.stopPropagation()
      this.deleteForward()
    } else if (key === 'ArrowLeft') {
      event.preventDefault()
      event.stopPropagation()
      this.handleArrowLeft(event.shiftKey)
    } else if (key === 'ArrowRight') {
      event.preventDefault()
      event.stopPropagation()
      this.handleArrowRight(event.shiftKey)
    } else if (key === 'ArrowUp') {
      event.preventDefault()
      event.stopPropagation()
      this.handleArrowUp(event.shiftKey)
    } else if (key === 'ArrowDown') {
      event.preventDefault()
      event.stopPropagation()
      this.handleArrowDown(event.shiftKey)
    } else if (key === 'Home') {
      event.preventDefault()
      event.stopPropagation()
      this.handleHome(event.shiftKey)
    } else if (key === 'End') {
      event.preventDefault()
      event.stopPropagation()
      this.handleEnd(event.shiftKey)
    } else if (key.length === 1) {
      event.preventDefault()
      event.stopPropagation()
      this.insertChar(key)
    }
  }

  insertChar(char) {
    const color = this.currentStyles.color || globalState.get('selectedColor').hex
    if (this.selectionStart !== null) {
      this.chars.splice(this.selectionStart, this.selectionEnd - this.selectionStart, {
        char,
        bold: this.currentStyles.bold,
        italic: this.currentStyles.italic,
        underline: this.currentStyles.underline,
        color: color
      })
      this.cursor = this.selectionStart + 1
      this.selectionStart = null
      this.selectionEnd = null
    } else {
      this.chars.splice(this.cursor, 0, {
        char,
        bold: this.currentStyles.bold,
        italic: this.currentStyles.italic,
        underline: this.currentStyles.underline,
        color: color
      })
      this.cursor++
    }
    this.syncPanelState()
    this.renderOverlay()
  }

  deleteSelection() {
    if (this.selectionStart !== null) {
      this.chars.splice(this.selectionStart, this.selectionEnd - this.selectionStart)
      this.cursor = this.selectionStart
      this.selectionStart = null
      this.selectionEnd = null
    } else if (this.cursor > 0) {
      this.chars.splice(this.cursor - 1, 1)
      this.cursor--
    }
    this.syncPanelState()
    this.renderOverlay()
  }

  deleteForward() {
    if (this.selectionStart !== null) {
      this.chars.splice(this.selectionStart, this.selectionEnd - this.selectionStart)
      this.cursor = this.selectionStart
      this.selectionStart = null
      this.selectionEnd = null
    } else if (this.cursor < this.chars.length) {
      this.chars.splice(this.cursor, 1)
    }
    this.syncPanelState()
    this.renderOverlay()
  }

  handleArrowLeft(shift) {
    if (shift) {
      if (this.selectionStart === null) {
        if (this.cursor > 0) {
          this.selectionStart = this.cursor - 1
          this.selectionEnd = this.cursor
          this.cursor--
        }
      } else {
        if (this.cursor > 0) {
          this.cursor--
          if (this.cursor < this.selectionStart) {
            this.selectionStart = this.cursor
          } else {
            this.selectionEnd = this.cursor
          }
        }
      }
    } else {
      if (this.selectionStart !== null) {
        this.cursor = this.selectionStart
        this.selectionStart = null
        this.selectionEnd = null
      } else {
        this.cursor = Math.max(0, this.cursor - 1)
      }
    }
    this.syncPanelState()
    this.renderOverlay()
  }

  handleArrowRight(shift) {
    if (shift) {
      if (this.selectionStart === null) {
        if (this.cursor < this.chars.length) {
          this.selectionStart = this.cursor
          this.selectionEnd = this.cursor + 1
          this.cursor++
        }
      } else {
        if (this.cursor < this.chars.length) {
          this.cursor++
          if (this.cursor > this.selectionEnd) {
            this.selectionEnd = this.cursor
          } else {
            this.selectionStart = this.cursor
          }
        }
      }
    } else {
      if (this.selectionStart !== null) {
        this.cursor = this.selectionEnd
        this.selectionStart = null
        this.selectionEnd = null
      } else {
        this.cursor = Math.min(this.chars.length, this.cursor + 1)
      }
    }
    this.syncPanelState()
    this.renderOverlay()
  }

  handleHome(shift) {
    const { lineChars } = this.getLineInfo()
    let charIndex = 0
    let lineStartPos = 0

    for (let i = 0; i < lineChars.length; i++) {
      if (charIndex + lineChars[i].length >= this.cursor) {
        lineStartPos = charIndex
        break
      }
      charIndex += lineChars[i].length + 1
    }

    if (shift) {
      if (this.selectionStart === null) {
        this.selectionStart = lineStartPos
        this.selectionEnd = this.cursor
      } else {
        this.selectionStart = lineStartPos
      }
    } else {
      this.selectionStart = null
      this.selectionEnd = null
    }
    this.cursor = lineStartPos
    this.syncPanelState()
    this.renderOverlay()
  }

  handleEnd(shift) {
    const { lineChars } = this.getLineInfo()
    let charIndex = 0
    let lineEndPos = this.chars.length

    for (let i = 0; i < lineChars.length; i++) {
      if (charIndex + lineChars[i].length >= this.cursor) {
        lineEndPos = charIndex + lineChars[i].length
        break
      }
      charIndex += lineChars[i].length + 1
    }

    if (shift) {
      if (this.selectionStart === null) {
        this.selectionStart = this.cursor
        this.selectionEnd = lineEndPos
      } else {
        this.selectionEnd = lineEndPos
      }
    } else {
      this.selectionStart = null
      this.selectionEnd = null
    }
    this.cursor = lineEndPos
    this.syncPanelState()
    this.renderOverlay()
  }

  selectAll() {
    this.selectionStart = 0
    this.selectionEnd = this.chars.length
    this.cursor = this.chars.length
    this.syncPanelState()
    this.renderOverlay()
  }

  handleArrowUp(shift) {
    const { lineChars, cursorLine, cursorCol } = this.getLineInfo()

    if (cursorLine === 0) return

    const newLine = cursorLine - 1
    let lineCharIndex = 0
    for (let i = 0; i < newLine; i++) {
      lineCharIndex += lineChars[i].length + 1
    }

    const maxCol = lineChars[newLine].length
    const newCol = Math.min(cursorCol, maxCol)
    const newCursor = lineCharIndex + newCol

    if (shift) {
      if (this.selectionStart === null) {
        this.selectionStart = newCursor
        this.selectionEnd = this.cursor
      } else {
        if (this.cursor === this.selectionEnd) {
          this.selectionEnd = newCursor
        } else {
          this.selectionStart = newCursor
        }
      }
    } else {
      this.selectionStart = null
      this.selectionEnd = null
    }

    this.cursor = newCursor
    this.syncPanelState()
    this.renderOverlay()
  }

  handleArrowDown(shift) {
    const { lineChars, cursorLine, cursorCol } = this.getLineInfo()

    if (cursorLine === lineChars.length - 1) return

    const newLine = cursorLine + 1
    let lineCharIndex = 0
    for (let i = 0; i < newLine; i++) {
      lineCharIndex += lineChars[i].length + 1
    }

    const maxCol = lineChars[newLine].length
    const newCol = Math.min(cursorCol, maxCol)
    const newCursor = lineCharIndex + newCol

    if (shift) {
      if (this.selectionStart === null) {
        this.selectionStart = this.cursor
        this.selectionEnd = newCursor
      } else {
        if (this.cursor === this.selectionStart) {
          this.selectionStart = newCursor
        } else {
          this.selectionEnd = newCursor
        }
      }
    } else {
      this.selectionStart = null
      this.selectionEnd = null
    }

    this.cursor = newCursor
    this.syncPanelState()
    this.renderOverlay()
  }

  applyStyleToSelection(style) {
    if (this.selectionStart !== null && this.selectionEnd !== null) {
      const hasAllStyle = this.chars.slice(this.selectionStart, this.selectionEnd).every(c => c[style])
      const toggleValue = !hasAllStyle

      for (let i = this.selectionStart; i < this.selectionEnd; i++) {
        this.chars[i][style] = toggleValue
      }
    } else {
      this.currentStyles[style] = !this.currentStyles[style]
    }

    this.syncPanelState()
    this.renderOverlay()
  }

  applyColorToSelection(color) {
    if (this.selectionStart !== null && this.selectionEnd !== null) {
      for (let i = this.selectionStart; i < this.selectionEnd; i++) {
        this.chars[i].color = color
      }
    }
    this.syncPanelState()
    this.renderOverlay()
  }

  syncPanelState() {
    if (this.selectionStart !== null && this.selectionEnd !== null && this.selectionStart < this.selectionEnd) {
      const selectedChars = this.chars.slice(this.selectionStart, this.selectionEnd)
      textToolState.bold = selectedChars.length > 0 && selectedChars.every(c => c.bold)
      textToolState.italic = selectedChars.length > 0 && selectedChars.every(c => c.italic)
      textToolState.underline = selectedChars.length > 0 && selectedChars.every(c => c.underline)
    } else {
      textToolState.bold = this.currentStyles.bold
      textToolState.italic = this.currentStyles.italic
      textToolState.underline = this.currentStyles.underline
    }
  }

  getLineInfo() {
    const lines = this.text.split('\n')
    const lineChars = []
    let charCount = 0
    let cursorLine = 0
    let cursorCol = 0

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= this.cursor) {
        cursorLine = i
        cursorCol = this.cursor - charCount
        break
      }
      charCount += lines[i].length + 1
    }

    charCount = 0
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length
      lineChars.push(this.chars.slice(charCount, charCount + lineLength))
      charCount += lineLength + 1
    }

    return { lines, lineChars, cursorLine, cursorCol, charCount }
  }

  buildFont(charObj, fontSize) {
    let font = ''
    if (charObj.italic) font += 'italic '
    if (charObj.bold) font += 'bold '
    font += `${fontSize}px sans-serif`
    return font
  }

  measureStyledChars(ctx, chars, fontSize) {
    let width = 0
    let i = 0
    while (i < chars.length) {
      let runEnd = i + 1
      while (runEnd < chars.length &&
             chars[runEnd].bold === chars[i].bold &&
             chars[runEnd].italic === chars[i].italic &&
             chars[runEnd].underline === chars[i].underline) {
        runEnd++
      }
      const run = chars.slice(i, runEnd)
      const runText = run.map(c => c.char).join('')
      ctx.font = this.buildFont(run[0], fontSize)
      width += ctx.measureText(runText).width
      i = runEnd
    }
    return width
  }

  renderRun(ctx, run, x, y, fontSize) {
    const runText = run.map(c => c.char).join('')
    ctx.font = this.buildFont(run[0], fontSize)
    const runColor = run[0].color || globalState.get('selectedColor').hex
    ctx.fillStyle = runColor
    ctx.fillText(runText, x, y)

    if (run[0].underline) {
      const runWidth = ctx.measureText(runText).width
      ctx.fillRect(x, y + 3, runWidth, 1)
    }

    return ctx.measureText(runText).width
  }

  renderLine(ctx, lineChars, lineX, lineY, fontSize) {
    let x = lineX
    let i = 0
    while (i < lineChars.length) {
      let runEnd = i + 1
      const runColor = lineChars[i].color || globalState.get('selectedColor').hex
      while (runEnd < lineChars.length &&
             lineChars[runEnd].bold === lineChars[i].bold &&
             lineChars[runEnd].italic === lineChars[i].italic &&
             lineChars[runEnd].underline === lineChars[i].underline &&
             (lineChars[runEnd].color || globalState.get('selectedColor').hex) === runColor) {
        runEnd++
      }
      const run = lineChars.slice(i, runEnd)
      x += this.renderRun(ctx, run, x, lineY, fontSize)
      i = runEnd
    }
    return x - lineX
  }

  renderOverlay() {
    const ctx = this.overlayCtx
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (!textToolState.isTyping) {
      return
    }

    ctx.save()
    ctx.fillStyle = globalState.get('selectedColor').hex
    ctx.textBaseline = 'alphabetic'

    const { lineChars, cursorLine, cursorCol } = this.getLineInfo()
    const lineHeight = textToolState.fontSize * 1.3
    const maxLineWidth = Math.max(...lineChars.map(lc => this.measureStyledChars(ctx, lc, textToolState.fontSize)), 0)
    let charIndex = 0

    this.drawTextBoundingBox(ctx, lineChars, maxLineWidth)

    for (let lineIdx = 0; lineIdx < lineChars.length; lineIdx++) {
      const lineCharList = lineChars[lineIdx]
      const lineY = textToolState.anchorY + lineIdx * lineHeight
      const lineX = this.getTextXPosition(ctx, lineCharList, maxLineWidth)

      if (this.selectionStart !== null && this.selectionEnd !== null) {
        const selStart = this.selectionStart
        const selEnd = this.selectionEnd
        let lineStart = charIndex
        let lineEnd = charIndex + lineCharList.length

        if (selEnd > lineStart && selStart < lineEnd) {
          const startCol = Math.max(0, selStart - lineStart)
          const endCol = Math.min(lineCharList.length, selEnd - lineStart)

          const beforeChars = lineCharList.slice(0, startCol)
          const selectedChars = lineCharList.slice(startCol, endCol)

          const beforeWidth = beforeChars.length > 0 ? this.measureStyledChars(ctx, beforeChars, textToolState.fontSize) : 0
          const selWidth = this.measureStyledChars(ctx, selectedChars, textToolState.fontSize)

          ctx.fillStyle = 'rgba(100, 150, 255, 0.4)'
          ctx.fillRect(
            lineX + beforeWidth,
            lineY - textToolState.fontSize,
            selWidth,
            textToolState.fontSize * 1.2
          )

          ctx.fillStyle = globalState.get('selectedColor').hex
        }
      }

      this.renderLine(ctx, lineCharList, lineX, lineY, textToolState.fontSize)

      if (this.blinkVisible && lineIdx === cursorLine) {
        const beforeCursorChars = lineCharList.slice(0, cursorCol)
        const cursorX = lineX + (beforeCursorChars.length > 0 ? this.measureStyledChars(ctx, beforeCursorChars, textToolState.fontSize) : 0)
        ctx.fillStyle = globalState.get('selectedColor').hex
        ctx.fillRect(cursorX, lineY - textToolState.fontSize, 1.5, textToolState.fontSize * 1.2)
      }

      charIndex += lineCharList.length + 1
    }

    ctx.restore()
  }

  drawTextBoundingBox(ctx, lineChars, maxLineWidth) {
    if (lineChars.length === 0 || lineChars.every(lc => lc.length === 0)) return

    let minX, maxX
    if (textToolState.alignment === 'center') {
      minX = textToolState.anchorX - maxLineWidth / 2
      maxX = textToolState.anchorX + maxLineWidth / 2
    } else if (textToolState.alignment === 'right') {
      minX = textToolState.anchorX - maxLineWidth
      maxX = textToolState.anchorX
    } else {
      minX = textToolState.anchorX
      maxX = textToolState.anchorX + maxLineWidth
    }

    const minY = textToolState.anchorY - textToolState.fontSize
    const maxY = textToolState.anchorY + (lineChars.length - 1) * textToolState.fontSize * 1.3 + textToolState.fontSize * 0.3

    const padding = 4
    ctx.strokeStyle = 'rgba(185, 185, 185, 0.5)'
    ctx.lineWidth = 1
    ctx.strokeRect(minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2)
  }

  getTextXPosition(ctx, lineChars, maxWidth) {
    if (lineChars.length === 0) return textToolState.anchorX

    const lineWidth = this.measureStyledChars(ctx, lineChars, textToolState.fontSize)

    if (textToolState.alignment === 'center') {
      return textToolState.anchorX - lineWidth / 2
    } else if (textToolState.alignment === 'right') {
      return textToolState.anchorX - lineWidth
    }
    return textToolState.anchorX
  }

  commit() {
    if (this.chars.length === 0) {
      this.cancel()
      return
    }

    this.drawingCtx.save()
    this.drawingCtx.fillStyle = globalState.get('selectedColor').hex
    this.drawingCtx.textBaseline = 'alphabetic'

    const { lineChars } = this.getLineInfo()
    const lineHeight = textToolState.fontSize * 1.3
    const maxLineWidth = Math.max(...lineChars.map(lc => this.measureStyledChars(this.drawingCtx, lc, textToolState.fontSize)), 0)

    for (let i = 0; i < lineChars.length; i++) {
      const lineCharList = lineChars[i]
      const lineY = textToolState.anchorY + i * lineHeight
      const lineX = this.getTextXPosition(this.drawingCtx, lineCharList, maxLineWidth)

      this.renderLine(this.drawingCtx, lineCharList, lineX, lineY, textToolState.fontSize)
    }

    this.drawingCtx.restore()

    globalCanvasManager.persistCanvas(globalState.get('selectedTab').id)

    this.exitTypingMode()
  }

  cancel() {
    this.exitTypingMode()
  }

  exitTypingMode() {
    textToolState.isTyping = false
    this.overlayCtx.clearRect(0, 0, this.overlayCtx.canvas.width, this.overlayCtx.canvas.height)
    this.chars = []
    this.cursor = 0
    this.selectionStart = null
    this.selectionEnd = null
    this.currentStyles = { bold: false, italic: false, underline: false, color: null }
    textToolState.bold = false
    textToolState.italic = false
    textToolState.underline = false
    textToolState.panelAnchorX = 0
    textToolState.panelAnchorY = 0
  }

  copySelection() {
    let textToCopy = ''
    if (this.selectionStart !== null && this.selectionEnd !== null) {
      textToCopy = this.chars.slice(this.selectionStart, this.selectionEnd).map(c => c.char).join('')
    } else {
      textToCopy = this.text
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).catch(err => {
        console.error('Failed to copy:', err)
      })
    }
  }

  pasteFromClipboard() {
    navigator.clipboard.readText().then(text => {
      for (const char of text) {
        this.insertChar(char)
      }
    }).catch(err => {
      console.error('Failed to paste:', err)
    })
  }
}
