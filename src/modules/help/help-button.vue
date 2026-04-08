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

<style scoped lang="scss">
.tab {
  padding: $space-sm $space-xl;
  border: none;
  border-bottom: 2px solid transparent;
  background-color: transparent;
  color: $color-secondary;
  cursor: pointer;
  font-family: $font-primary;
  font-size: 12px;
  position: relative;
  transition: $transition-default;
}

.tab:hover {
  color: $color-primary;
  border-bottom-color: rgba($color-primary, 0.3);
}

.help-wrapper {
  margin-left: auto;
}
</style>
