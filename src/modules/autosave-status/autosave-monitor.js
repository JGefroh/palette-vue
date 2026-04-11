import { reactive } from 'vue'

const MAX_STORAGE_SIZE = 5 * 1024 * 1024
const STORAGE_WARNING_THRESHOLD = 0.8

class AutosaveMonitor {
  constructor() {
    this.status = reactive({
      state: 'enabled',
      message: 'Autosave enabled'
    })
    this.lastError = null
    this.checkInterval = null
  }

  start() {
    this.checkInterval = setInterval(() => {
      this.checkStorageStatus()
    }, 1000)
    this.checkStorageStatus()
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  checkStorageStatus() {
    try {
      const testKey = '__autosave_test_' + Date.now()
      const testValue = 'test'

      localStorage.setItem(testKey, testValue)
      localStorage.removeItem(testKey)

      const storageUsage = this.getStorageUsage()
      const usageRatio = storageUsage / MAX_STORAGE_SIZE
      const percentageRemaining = Math.round((1 - usageRatio) * 100)

      if (usageRatio >= STORAGE_WARNING_THRESHOLD) {
        this.status.state = 'near-limit'
        this.status.message = `${percentageRemaining}% storage remaining`
      } else {
        this.status.state = 'enabled'
        this.status.message = 'Autosave enabled'
      }

      this.lastError = null
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.status.state = 'no-storage'
        this.status.message = 'Autosave failing - no storage left'
      } else {
        this.status.state = 'unavailable'
        this.status.message = 'Autosave failing - storage unavailable'
      }
      this.lastError = error
    }
  }

  getStorageUsage() {
    let total = 0
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage.getItem(key).length + key.length
        }
      }
    } catch (error) {
      return 0
    }
    return total
  }

  getStatus() {
    return this.status.state
  }

  getMessage() {
    return this.status.message
  }

  reportSaveFailure(error) {
    if (error.name === 'QuotaExceededError') {
      this.status.state = 'no-storage'
      this.status.message = 'Autosave failing - no storage left'
    } else {
      this.status.state = 'unavailable'
      this.status.message = 'Autosave failing - storage unavailable'
    }
    this.lastError = error
  }
}

export const autosaveMonitor = new AutosaveMonitor()
