import { reactive } from 'vue'

class GlobalState {
  constructor() {
    this.store = reactive(
      this.loadState() || {
      selectedColor: { label: 'Turquoise', hex: '#1abc9c' },
      selectedSize: 10,
      selectedTab: null,
      selectedTool: null
    })
  }

  get(key, initializationValue) {
    if (this.store[key]) {
      return this.store[key]
    }
    else {
      this.store[key] = initializationValue;
      return this.store[key]
    }
  }

  set(key, value) {
    this.store[key] = value
  }

  delete(key) {
    delete this.store[key]
  }

  saveState() {
    localStorage.setItem(`palette-state`, JSON.stringify(this.store))
  }

  loadState() {
    let stringData = localStorage.getItem(`palette-state`, JSON.stringify(this.store));

    if (stringData) {
      return JSON.parse(stringData)
    }
  }
}

export const globalState = new GlobalState()
