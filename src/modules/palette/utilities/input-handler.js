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
  }

  start() {
    if (this.isListening) {
      return;
    }
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    this.isListening = true;
  }

  stop() {
    if (!this.isListening) {
      return;
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.isListening = false;
  }

  registerCommand(shortcut, commandType, callback) {
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    this.shortcuts.set(normalizedShortcut, commandType);

    if (!this.commands.has(commandType)) {
      this.commands.set(commandType, new Set());
    }
    this.commands.get(commandType).add(callback);
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

  dispatchCommand(commandType) {
    if (this.commands.has(commandType)) {
      const callbacks = this.commands.get(commandType);
      callbacks.forEach(callback => {
        callback();
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
