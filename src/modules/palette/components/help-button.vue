<template>
  <div>
    <button class="tool" @click="showModal = true" title="Help">
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
.tool {
  padding: 8px 12px;
  border: 1px solid rgba(185, 185, 185, 0.5);
  background-color: transparent;
  color: #34495e;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 12px;
  transition: all 0.2s ease;
}

.tool:hover {
  background-color: rgba(52, 73, 94, 0.1);
  border-color: rgba(185, 185, 185, 0.7);
}

.tool.active {
  background-color: rgba(52, 73, 94, 0.15);
  border-color: rgba(52, 73, 94, 0.5);
  color: #34495e;
}
</style>
