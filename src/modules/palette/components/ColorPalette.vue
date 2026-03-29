<template>
  <div class="colors">
    <button
      v-for="color in colors"
      :key="color.hex"
      class="color"
      :style="{
        'background-color': color.hex,
        'color': color.hex === '#FFFFFF' ? '#000000' : ''
      }"
      @click="selectColor(color)"
    >
      <span v-if="color.hex === modelValue.hex">&#10003;</span>
      <span v-else>&nbsp;</span>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Object,
      default: () => ({ label: 'Turquoise', hex: '#1abc9c' })
    }
  },
  data() {
    return {
      colors: [
        { label: 'Turquoise', hex: '#1abc9c' },
        { label: 'Green Sea', hex: '#16a085' },
        { label: 'Emerald', hex: '#2ecc71' },
        { label: 'Nephritis', hex: '#27ae60' },
        { label: 'Lime Green', hex: '#32cd32' },
        { label: 'Peter River', hex: '#3498db' },
        { label: 'Belize Hole', hex: '#2980b9' },
        { label: 'Amethyst', hex: '#9b59b6' },
        { label: 'Wisteria', hex: '#8e44ad' },
        { label: 'Wet Asphalt', hex: '#34495e' },
        { label: 'Midnight Blue', hex: '#2c3e50' },
        { label: 'Yellow', hex: '#ffff00' },
        { label: 'Sun Flower', hex: '#f1c40f' },
        { label: 'Orange', hex: '#f39c12' },
        { label: 'Carrot', hex: '#e67e22' },
        { label: 'Pumpkin', hex: '#d35400' },
        { label: 'Alizarin', hex: '#e74c3c' },
        { label: 'Pomegranate', hex: '#c0392b' },
        { label: 'Clouds', hex: '#ecf0f1' },
        { label: 'Silver', hex: '#bdc3c7' },
        { label: 'Concrete', hex: '#95a5a6' },
        { label: 'Abestos', hex: '#7f8c8d' },
        { label: 'Pure White', hex: '#FFFFFF' },
        { label: 'Pure Black', hex: '#000000' }
      ]
    }
  },
  methods: {
    selectColor(color) {
      this.$emit('update:modelValue', color)
    }
  }
}
</script>

<style scoped>
.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px 20px;
  background-color: #ecf0f1;
  border-bottom: 1px solid #bdc3c7;
}

.color {
  width: 36px;
  height: 36px;
  border: 2px solid #95a5a6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  transition: all 0.2s ease;
}

.color:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
