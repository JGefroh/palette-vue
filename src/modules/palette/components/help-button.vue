<template>
  <div>
    <button class="tool" @click="showModal = true" title="Help">
      <span class="fa fa-fw fa-question"></span>
    </button>
    <HelpModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script>
import HelpModal from './help-modal.vue'

export default {
  components: {
    HelpModal
  },
  data() {
    return {
      showModal: false
    }
  }
}
</script>

<style scoped>
.tool {
  padding: 8px 12px;
  border: 1px solid #95a5a6;
  background-color: white;
  color: #34495e;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tool:hover {
  background-color: #34495e;
  color: white;
}

.tool.active {
  background-color: #34495e;
  color: white;
}
</style>
