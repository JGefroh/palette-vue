<template>
  <div class="autosave-badge" :class="`status-${status}`">
    <span class="badge-dot"></span>
    <span class="badge-text">{{ message }}</span>
  </div>
</template>

<script>
import { autosaveMonitor } from './autosave-monitor.js'
import { watch } from 'vue'

export default {
  data() {
    return {
      autosaveMonitor
    }
  },
  computed: {
    status() {
      return this.autosaveMonitor.status.state
    },
    message() {
      return this.autosaveMonitor.status.message
    }
  },
  mounted() {
    autosaveMonitor.start()
  },
  beforeUnmount() {
    autosaveMonitor.stop()
  }
}
</script>

<style scoped lang="scss">
.autosave-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 400;
  white-space: nowrap;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.autosave-badge:hover {
  opacity: 1;
}

.badge-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-enabled {
  color: #639e46;

  .badge-dot {
    background-color: #639e46;
    opacity: 0.6;
  }
}

.status-unavailable {
  color: #f44336;

  .badge-dot {
    background-color: #f44336;
    opacity: 0.6;
  }
}

.status-near-limit {
  color: #ff9800;

  .badge-dot {
    background-color: #ff9800;
    opacity: 0.6;
  }
}

.status-no-storage {
  color: #f44336;

  .badge-dot {
    background-color: #f44336;
    opacity: 0.6;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
