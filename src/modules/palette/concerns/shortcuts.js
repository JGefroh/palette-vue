import { inputHandler } from '../utilities/input-handler.js'

class Shortcuts {
  register(toolList = []) {
    // Global shortcuts
    inputHandler.registerCommand('cmd+z', 'undo')
    inputHandler.registerCommand('cmd+shift+z', 'redo')

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
    toolList.forEach(tool => {
      if (tool.shortcut) {
        inputHandler.registerCommand(tool.shortcut, `select-tool-${tool.name}`)
      }
    })

    // Brush shortcuts
    inputHandler.registerCommand('cmd+b', 'brush-toggle-arrow')

    // Line shortcuts
    inputHandler.registerCommand('cmd+l', 'line-toggle-arrow')
    inputHandler.registerKeyCombo('shift_press', 'enableSnap')
    inputHandler.registerKeyCombo('shift_release', 'disableSnap')

    // Rectangle shortcuts
    inputHandler.registerKeyCombo('shift_press', 'constrainSquare')
    inputHandler.registerKeyCombo('shift_release', 'unconstrainSquare')
  }
}

export const shortcuts = new Shortcuts()
