import { globalState } from '../persistence/global-state.js'

class InputHandler {
  constructor() {
    this.commands = new Map(); // Map<commandType, Set<callbacks>>
    this.shortcuts = new Map(); // Map<shortcutString, commandType>
    this.keyComboCommands = new Map(); // Map<keyCombo, Set<commandType>> (e.g., "shift_press" -> Set["enableSnap"])
    this.pressedKeys = new Set(); // Track currently pressed keys
    this.modes = {
      cmd: false,
      ctrl: false,
      shift: false,
      alt: false
    };
    this.isListening = false;
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundBlur = this.resetModifierKeys.bind(this);
    this.boundDocumentMouseUp = this.handleDocumentMouseUp.bind(this);
    this.paperElement = null;
    this.cursorManager = null;
  }

  start() {
    if (this.isListening) {
      return;
    }
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('blur', this.boundBlur);
    document.addEventListener('mouseup', this.boundDocumentMouseUp);
    this.isListening = true;
  }

  stop() {
    if (!this.isListening) {
      return;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('blur', this.boundBlur);
    document.removeEventListener('mouseup', this.boundDocumentMouseUp);
    this.isListening = false;
  }

  resetModifierKeys() {
    this.modes.cmd = false;
    this.modes.ctrl = false;
    this.modes.shift = false;
    this.modes.alt = false;
    this.pressedKeys.clear();
  }

  registerPaperElement(paperElement, cursorManager) {
    this.paperElement = paperElement;
    this.cursorManager = cursorManager;
    this.initializeMouseListeners();
  }

  initializeMouseListeners() {
    if (!this.paperElement) return;

    this.paperElement.addEventListener('dragenter', (e) => {
      if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
        this.dispatchCommand('image-drag-enter', e);
      }
    });

    this.paperElement.addEventListener('dragleave', (e) => {
      if (e.relatedTarget === null && e.dataTransfer.types.includes('Files')) {
        this.dispatchCommand('image-drag-leave', e);
      }
    });

    this.paperElement.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    this.paperElement.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dispatchCommand('image-drop', e);
      this.dispatchCommand('image-drag-leave', e);
    });

    this.paperElement.addEventListener('mousemove', (e) => {
      if (this.cursorManager) {
        this.cursorManager.updateFromMouseEvent(e);
      }
      this.dispatchCommand('cursor-update', e);
      if (this.cursorManager && this.cursorManager.getIsMouseDown()) {
        this.dispatchCommand('tool-process', e);
      }
    });

    this.paperElement.addEventListener('mouseleave', () => {
      const selectedTool = globalState.get('selectedTool');
      if (!selectedTool || selectedTool.name !== 'Select') {
        this.dispatchCommand('cursor-hide');
      }
      if (this.cursorManager && this.cursorManager.getIsMouseDown()) {
        if (!selectedTool || selectedTool.name !== 'Select') {
          this.dispatchCommand('tool-end');
        }
      }
    });

    this.paperElement.addEventListener('mouseenter', (e) => {
      if (this.cursorManager && this.cursorManager.getIsMouseDown()) {
        if (this.cursorManager) {
          this.cursorManager.updateFromMouseEvent(e);
        }
        this.dispatchCommand('tool-start', e);
      }
    });

    this.paperElement.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (this.cursorManager) {
        this.cursorManager.updateFromMouseEvent(e);
        this.cursorManager.setMouseDown(true);
      }
      this.dispatchCommand('tool-start', e);
    });

    this.paperElement.addEventListener('mouseup', (e) => {
      e.preventDefault();
      if (this.cursorManager) {
        this.cursorManager.updateFromMouseEvent(e);
        this.cursorManager.setMouseDown(false);
      }
      this.dispatchCommand('tool-end', e);
    });

    this.paperElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey) {
        this.dispatchCommand('zoom', e);
      } else {
        this.dispatchCommand('pan', e);
      }
    }, { passive: false });
  }

  registerCommand(shortcut, commandType) {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    this.shortcuts.set(normalizedShortcut, commandType);
  }

  onCommand(commandType, callback) {
    if (!this.commands.has(commandType)) {
      this.commands.set(commandType, new Set());
    }
    this.commands.get(commandType).add(callback);

    // Return unsubscribe function
    return () => {
      this.commands.get(commandType).delete(callback);
    };
  }

  registerKeyCombo(keyCombo, commandType) {
    if (!this.keyComboCommands.has(keyCombo)) {
      this.keyComboCommands.set(keyCombo, new Set());
    }
    this.keyComboCommands.get(keyCombo).add(commandType);
  }

  getMode() {
    return { ...this.modes };
  }

  normalizeShortcut(shortcut) {
    return shortcut.toLowerCase().trim();
  }

  normalizeKey(key) {
    let normalized = key.toLowerCase();
    if (normalized === ' ') {
      normalized = 'space';
    } else if (normalized === 'arrowup') {
      normalized = 'up';
    } else if (normalized === 'arrowdown') {
      normalized = 'down';
    } else if (normalized === 'arrowleft') {
      normalized = 'left';
    } else if (normalized === 'arrowright') {
      normalized = 'right';
    } else if (normalized === 'enter') {
      normalized = 'enter';
    } else if (normalized === 'escape') {
      normalized = 'esc';
    } else if (normalized === 'tab') {
      normalized = 'tab';
    }
    return normalized;
  }

  buildCurrentShortcut(event) {
    const parts = [];

    if (this.modes.cmd) {
      parts.push('cmd');
    }
    if (this.modes.ctrl) {
      parts.push('ctrl');
    }
    if (this.modes.shift) {
      parts.push('shift');
    }
    if (this.modes.alt) {
      parts.push('alt');
    }

    // Get the actual key
    let key = event.key.toLowerCase();
    if (key === ' ') {
      key = 'space';
    } else if (key === 'arrowup') {
      key = 'up';
    } else if (key === 'arrowdown') {
      key = 'down';
    } else if (key === 'arrowleft') {
      key = 'left';
    } else if (key === 'arrowright') {
      key = 'right';
    } else if (key === 'enter') {
      key = 'enter';
    } else if (key === 'escape') {
      key = 'esc';
    } else if (key === 'tab') {
      key = 'tab';
    }

    parts.push(key);
    return parts.join('+');
  }

  handleKeyDown(event) {
    // Update modes
    if (event.metaKey) {
      this.modes.cmd = true;
    }
    if (event.ctrlKey) {
      this.modes.ctrl = true;
    }
    if (event.shiftKey) {
      this.modes.shift = true;
    }
    if (event.altKey) {
      this.modes.alt = true;
    }

    // Generic key press detection
    const normalizedKey = this.normalizeKey(event.key);
    if (!this.pressedKeys.has(normalizedKey)) {
      this.pressedKeys.add(normalizedKey);
      const commands = this.keyComboCommands.get(`${normalizedKey}_press`);
      if (commands) {
        commands.forEach(commandType => this.dispatchCommand(commandType));
      }
    }

    const shortcut = this.buildCurrentShortcut(event);
    const commandType = this.shortcuts.get(shortcut);

    if (commandType) {
      event.preventDefault();
      this.dispatchCommand(commandType);
    }
  }

  handleKeyUp(event) {
    // Update modes
    if (!event.metaKey) {
      this.modes.cmd = false;
    }
    if (!event.ctrlKey) {
      this.modes.ctrl = false;
    }
    if (!event.shiftKey) {
      this.modes.shift = false;
    }
    if (!event.altKey) {
      this.modes.alt = false;
    }

    // Generic key release detection
    const normalizedKey = this.normalizeKey(event.key);
    if (this.pressedKeys.has(normalizedKey)) {
      this.pressedKeys.delete(normalizedKey);
      const commands = this.keyComboCommands.get(`${normalizedKey}_release`);
      if (commands) {
        commands.forEach(commandType => this.dispatchCommand(commandType));
      }
    }
  }

  handleDocumentMouseUp(e) {
    if (this.cursorManager) {
      this.cursorManager.setMouseDown(false);
    }
  }

  dispatchCommand(commandType, data) {
    if (this.commands.has(commandType)) {
      const callbacks = this.commands.get(commandType);
      callbacks.forEach(callback => {
        callback(data);
      });
    }
  }

  unregisterCommand(shortcut, callback) {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    const commandType = this.shortcuts.get(normalizedShortcut);

    if (commandType && this.commands.has(commandType)) {
      this.commands.get(commandType).delete(callback);
    }
  }
}

export const inputHandler = new InputHandler();
