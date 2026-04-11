import { inputHandler } from '../input/input-handler.js'

class Shortcuts {
  register() {
    // Global shortcuts
    inputHandler.registerCommand('cmd+z', 'undo')
    inputHandler.registerCommand('cmd+shift+z', 'redo')
    inputHandler.registerCommand('cmd+s', 'download')

    // Color shortcuts
    for (let i = 0; i <= 9; i++) {
      const digit = String(i)
      inputHandler.registerCommand(digit, `select-color-${digit}`)
    }

    // Tab shortcuts
    inputHandler.registerCommand('tab', 'nextTab')
    inputHandler.registerCommand('shift+tab', 'prevTab')

    // Selection shortcuts
    inputHandler.registerCommand('cmd+c', 'copy')
    inputHandler.registerCommand('cmd+x', 'cut')
    inputHandler.registerCommand('cmd+a', 'select-all')
    inputHandler.registerCommand('delete', 'delete-selection')
    inputHandler.registerCommand('backspace', 'delete-selection')

    // Paste shortcut
    inputHandler.registerCommand('cmd+v', 'paste')

    // Tool shortcuts
    inputHandler.registerCommand('b', 'select-tool-Brush')
    inputHandler.registerCommand('esc', 'select-tool-Brush')
    inputHandler.registerCommand('r', 'select-tool-Rectangle')
    inputHandler.registerCommand('c', 'select-tool-Circle')
    inputHandler.registerCommand('l', 'select-tool-Line')
    inputHandler.registerCommand('t', 'select-tool-Text')
    inputHandler.registerCommand('f', 'select-tool-Fill')
    inputHandler.registerCommand('s', 'select-tool-Select')
    inputHandler.registerCommand('e', 'toggle-eyedropper')

    // Brush shortcuts
    inputHandler.registerCommand('cmd+b', 'brush-toggle-arrow')
    inputHandler.registerCommand('q', 'brush-size-decrease')
    inputHandler.registerCommand('w', 'brush-size-increase')

    // Line shortcuts
    inputHandler.registerCommand('cmd+l', 'line-toggle-arrow')
    inputHandler.registerKeyCombo('shift_press', 'enableSnap')
    inputHandler.registerKeyCombo('shift_release', 'disableSnap')

    // Zoom shortcuts
    inputHandler.registerCommand('shift+!', 'zoom-to-fit')

    // Help shortcuts
    inputHandler.registerCommand('f1', 'open-help')
    inputHandler.registerCommand('h', 'open-help')

    // Rectangle shortcuts
    inputHandler.registerKeyCombo('shift_press', 'constrainSquare')
    inputHandler.registerKeyCombo('shift_release', 'unconstrainSquare')
  }
}

export const shortcuts = new Shortcuts()
