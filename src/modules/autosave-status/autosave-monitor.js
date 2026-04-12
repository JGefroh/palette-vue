import { reactive } from 'vue'

const MAX_STORAGE_SIZE = 5 * 1024 * 1024
const STORAGE_WARNING_THRESHOLD = 0.50

class AutosaveMonitor {
  constructor() {
    this.status = reactive({
      state: 'enabled',
      message: 'Autosave enabled'
    })
    this.lastError = null
    this.checkInterval = null
    this.messages = {
      "enabled": {
        state: 'enabled',
        message: "Autosave enabled"
      },
      "near-limit": {
        state: 'near-limit',
        message: "{{percentageRemaining}}% storage remaining"
      },
      "no-storage": {
        state: 'no-storage',
        message: 'Autosave failing - no storage left'
      },
      "unavailable": {
        state: 'unavailable',
        message: 'Autosave failing - storage unavailable'
      }
    }
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
        this.setState('near-limit', {"percentageRemaining": percentageRemaining});
      } else {
        this.setState('enabled')
      }

      this.lastError = null
    } catch (error) {
      this.reportSaveFailure(error)
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
      this.setState('no-storage');
    } else {
      this.setState('unavailable');
    }
    this.lastError = error
  }

  setState(stateKey, stateParams) {
    const state = this.messages[stateKey];
    if (!state) {
      return;
    }
    this.status.state = state.state;
    let message = state.message;

    if (stateParams) {
      Object.keys(stateParams).forEach((key) => {
        message = message.replace(`{{${key}}}`, stateParams[key]);
      });
    }

    this.status.message = message;
  }
}

export const autosaveMonitor = new AutosaveMonitor()
