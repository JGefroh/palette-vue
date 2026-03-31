class GlobalConfiguration {
  constructor() {
    this.store = {
      selectedColor: { label: 'Turquoise', hex: '#1abc9c' },
      selectedToolIndex: 0,
      selectedSize: 10
    }
  }

  get(key) {
    return this.store[key]
  }

  set(key, value) {
    this.store[key] = value
  }
}

export const globalConfiguration = new GlobalConfiguration()
