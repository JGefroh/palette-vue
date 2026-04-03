<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Color Themes</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-content">
        <div v-for="theme in themes" :key="theme.name" class="theme-option" @click="selectTheme(theme)">
          <h3>{{ theme.name }}</h3>
          <div class="color-preview">
            <div
              v-for="color in theme.colors"
              :key="color.hex"
              class="preview-swatch"
              :style="{ backgroundColor: color.hex }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['theme-selected', 'close'],
  data() {
    return {
      themes: [
        {
          name: 'Classic',
          colors: [
            { label: 'Pure Black', hex: '#000000' },
            { label: 'Pure White', hex: '#FFFFFF' },
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
            { label: 'Abestos', hex: '#7f8c8d' }
          ]
        },
        {
          name: 'Pastels',
          colors: [
            { label: 'Light Pink', hex: '#FFB3BA' },
            { label: 'Light Red', hex: '#FFCCCB' },
            { label: 'Light Coral', hex: '#F08080' },
            { label: 'Light Salmon', hex: '#FFA07A' },
            { label: 'Peach Puff', hex: '#FFDAB9' },
            { label: 'Navajo White', hex: '#FFDEAD' },
            { label: 'Moccasin', hex: '#FFE4B5' },
            { label: 'Khaki', hex: '#F0E68C' },
            { label: 'Light Yellow', hex: '#FFFFE0' },
            { label: 'Light Green', hex: '#90EE90' },
            { label: 'Light Sea Green', hex: '#20B2AA' },
            { label: 'Light Cyan', hex: '#E0FFFF' },
            { label: 'Light Blue', hex: '#ADD8E6' },
            { label: 'Light Sky Blue', hex: '#87CEEB' },
            { label: 'Light Steel Blue', hex: '#B0C4DE' },
            { label: 'Light Slate Gray', hex: '#778899' },
            { label: 'Plum', hex: '#DDA0DD' },
            { label: 'Thistle', hex: '#D8BFD8' },
            { label: 'Lavender', hex: '#E6E6FA' },
            { label: 'Misty Rose', hex: '#FFE4E1' },
            { label: 'Honeydew', hex: '#F0FFF0' },
            { label: 'Alice Blue', hex: '#F0F8FF' },
            { label: 'Ghost White', hex: '#F8F8FF' },
            { label: 'White Smoke', hex: '#F5F5F5' }
          ]
        },
        {
          name: 'Dark',
          colors: [
            { label: 'Black', hex: '#000000' },
            { label: 'Very Dark Gray', hex: '#111111' },
            { label: 'Dark Gray', hex: '#222222' },
            { label: 'Dim Gray', hex: '#333333' },
            { label: 'Dark Slate Gray', hex: '#2F4F4F' },
            { label: 'Slate Gray', hex: '#708090' },
            { label: 'Dark Red', hex: '#8B0000' },
            { label: 'Crimson', hex: '#DC143C' },
            { label: 'Dark Orange', hex: '#FF8C00' },
            { label: 'Dark Goldenrod', hex: '#B8860B' },
            { label: 'Dark Green', hex: '#006400' },
            { label: 'Dark Cyan', hex: '#008B8B' },
            { label: 'Dark Blue', hex: '#00008B' },
            { label: 'Dark Magenta', hex: '#8B008B' },
            { label: 'Dark Violet', hex: '#9400D3' },
            { label: 'Indigo', hex: '#4B0082' },
            { label: 'Firebrick', hex: '#B22222' },
            { label: 'Indian Red', hex: '#CD5C5C' },
            { label: 'Saddle Brown', hex: '#8B4513' },
            { label: 'Sienna', hex: '#A0522D' },
            { label: 'Dark Khaki', hex: '#BDB76B' },
            { label: 'Olive Drab', hex: '#556B2F' },
            { label: 'Dark Sea Green', hex: '#8FBC8F' },
            { label: 'Teal', hex: '#008080' }
          ]
        },
        {
          name: 'Vibrant',
          colors: [
            { label: 'Red', hex: '#FF0000' },
            { label: 'Deep Pink', hex: '#FF1493' },
            { label: 'Hot Pink', hex: '#FF69B4' },
            { label: 'Lime', hex: '#00FF00' },
            { label: 'Spring Green', hex: '#00FF7F' },
            { label: 'Cyan', hex: '#00FFFF' },
            { label: 'Blue', hex: '#0000FF' },
            { label: 'Electric Blue', hex: '#0080FF' },
            { label: 'Blue Violet', hex: '#8A2BE2' },
            { label: 'Purple', hex: '#FF00FF' },
            { label: 'Orange Red', hex: '#FF4500' },
            { label: 'Gold', hex: '#FFD700' },
            { label: 'Yellow', hex: '#FFFF00' },
            { label: 'Lime Green', hex: '#32CD32' },
            { label: 'Sea Green', hex: '#2E8B57' },
            { label: 'Aquamarine', hex: '#7FFFD4' },
            { label: 'Dodger Blue', hex: '#1E90FF' },
            { label: 'Dark Slate Blue', hex: '#483D8B' },
            { label: 'Medium Orchid', hex: '#BA55D3' },
            { label: 'Tomato', hex: '#FF6347' },
            { label: 'Salmon', hex: '#FA8072' },
            { label: 'Coral', hex: '#FF7F50' },
            { label: 'Green', hex: '#008000' },
            { label: 'White', hex: '#FFFFFF' }
          ]
        },
        {
          name: 'Sunset',
          colors: [
            { label: 'Deep Orange', hex: '#FF5722' },
            { label: 'Dark Orange', hex: '#FF6F00' },
            { label: 'Orange', hex: '#FFA500' },
            { label: 'Light Orange', hex: '#FFB74D' },
            { label: 'Yellow Orange', hex: '#FFCA28' },
            { label: 'Golden Yellow', hex: '#FFD54F' },
            { label: 'Light Yellow', hex: '#FFEB3B' },
            { label: 'Light Pink', hex: '#F48FB1' },
            { label: 'Pink', hex: '#EC407A' },
            { label: 'Deep Pink', hex: '#E91E63' },
            { label: 'Hot Pink', hex: '#FF1493' },
            { label: 'Red', hex: '#FF0000' },
            { label: 'Dark Red', hex: '#D32F2F' },
            { label: 'Very Dark Red', hex: '#B71C1C' },
            { label: 'Deep Purple', hex: '#512DA8' },
            { label: 'Purple', hex: '#7B1FA2' },
            { label: 'Dark Blue', hex: '#1A237E' },
            { label: 'Dark Navy', hex: '#0D47A1' },
            { label: 'Navy', hex: '#1976D2' },
            { label: 'Blue', hex: '#2196F3' },
            { label: 'Light Blue', hex: '#42A5F5' },
            { label: 'Very Light Blue', hex: '#90CAF9' },
            { label: 'Gray', hex: '#757575' },
            { label: 'Light Gray', hex: '#BDBDBD' }
          ]
        },
        {
          name: 'Nature',
          colors: [
            { label: 'Forest Green', hex: '#228B22' },
            { label: 'Dark Green', hex: '#006400' },
            { label: 'Green', hex: '#008000' },
            { label: 'Light Green', hex: '#90EE90' },
            { label: 'Pale Green', hex: '#98FB98' },
            { label: 'Mint Green', hex: '#98FF98' },
            { label: 'Olive', hex: '#808000' },
            { label: 'Olive Drab', hex: '#6B8E23' },
            { label: 'Yellow Green', hex: '#9ACD32' },
            { label: 'Khaki', hex: '#F0E68C' },
            { label: 'Yellow', hex: '#FFFF00' },
            { label: 'Brown', hex: '#8B4513' },
            { label: 'Saddle Brown', hex: '#A0522D' },
            { label: 'Sienna', hex: '#A0522D' },
            { label: 'Peru', hex: '#CD853F' },
            { label: 'Tan', hex: '#D2B48C' },
            { label: 'Dark Turquoise', hex: '#00CED1' },
            { label: 'Turquoise', hex: '#40E0D0' },
            { label: 'Cyan', hex: '#00FFFF' },
            { label: 'Light Cyan', hex: '#E0FFFF' },
            { label: 'Dark Sea Green', hex: '#8FBC8F' },
            { label: 'Sea Green', hex: '#2E8B57' },
            { label: 'Black', hex: '#000000' },
            { label: 'White', hex: '#FFFFFF' }
          ]
        }
      ]
    }
  },
  methods: {
    selectTheme(theme) {
      this.$emit('theme-selected', theme.colors)
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ecf0f1;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #34495e;
  font-family: 'Montserrat', sans-serif;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #34495e;
}

.modal-content {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.theme-option {
  padding: 12px;
  margin-bottom: 12px;
  border: 2px solid #ecf0f1;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Montserrat', sans-serif;
}

.theme-option:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.theme-option h3 {
  margin: 0 0 8px 0;
  color: #34495e;
  font-size: 14px;
  font-weight: 600;
}

.color-preview {
  display: flex;
  gap: 2px;
  height: 20px;
}

.preview-swatch {
  flex: 1;
  border-radius: 2px;
  border: 1px solid #ecf0f1;
}
</style>
