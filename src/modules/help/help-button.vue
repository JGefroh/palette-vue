<template>
  <div class="help-wrapper">
    <button class="tab" @click="showModal = true" title="Help">
      <span class="fa fa-fw fa-question"></span>
    </button>
    <Teleport to="body">
      <HelpModal v-if="showModal" @close="showModal = false" />
    </Teleport>
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
.tab {
  padding: 8px 20px;
  border: none;
  border-bottom: 2px solid transparent;
  background-color: transparent;
  color: #7f8c8d;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  position: relative;
  transition: all 0.2s ease;
}

.tab:hover {
  color: #34495e;
  border-bottom-color: rgba(52, 73, 94, 0.3);
}

.help-wrapper {
  margin-left: auto;
}
</style>
