<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Color Themes</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-content">
        <div v-for="theme in themes" :key="theme.name" class="theme-option" @click="selectTheme(theme)">
          <div class="theme-header">
            <h3>{{ theme.name }}<span v-if="theme.name === 'Primary Shades'" class="primary-label">{{ currentPrimary }}</span></h3>
            <button
              v-if="theme.name === 'Random'"
              class="reroll-btn"
              @click.stop="rerollTheme"
              title="Generate new random colors"
            >↻</button>
            <button
              v-if="theme.name === 'Primary Shades'"
              class="reroll-btn"
              @click.stop="togglePrimaryColor"
              title="Toggle primary color"
            >↻</button>
          </div>
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
      currentPrimary: 'Green',
      primaryColorPalettes: {
        Red: [
          { label: 'Very Dark Red', hex: '#330000' },
          { label: 'Dark Red', hex: '#660000' },
          { label: 'Deep Red', hex: '#8B0000' },
          { label: 'Dark Crimson', hex: '#A00000' },
          { label: 'Crimson', hex: '#DC143C' },
          { label: 'Red', hex: '#FF0000' },
          { label: 'Indian Red', hex: '#CD5C5C' },
          { label: 'Light Coral', hex: '#F08080' },
          { label: 'Salmon', hex: '#FA8072' },
          { label: 'Light Salmon', hex: '#FFA07A' },
          { label: 'Rose', hex: '#FF007F' },
          { label: 'Hot Pink', hex: '#FF1493' },
          { label: 'Deep Pink', hex: '#FF1493' },
          { label: 'Pink', hex: '#FFC0CB' },
          { label: 'Light Pink', hex: '#FFB6C1' },
          { label: 'Very Light Pink', hex: '#FFE4E1' },
          { label: 'Maroon', hex: '#800000' },
          { label: 'Firebrick', hex: '#B22222' },
          { label: 'Tomato', hex: '#FF6347' },
          { label: 'Coral', hex: '#FF7F50' },
          { label: 'Orange Red', hex: '#FF4500' },
          { label: 'Red Orange', hex: '#FF5722' },
          { label: 'Misty Rose', hex: '#FFE4E1' },
          { label: 'Snow', hex: '#FFFAFA' }
        ],
        Blue: [
          { label: 'Very Dark Blue', hex: '#000033' },
          { label: 'Dark Blue', hex: '#000066' },
          { label: 'Navy', hex: '#000080' },
          { label: 'Dark Navy', hex: '#000099' },
          { label: 'Midnight Blue', hex: '#191970' },
          { label: 'Deep Blue', hex: '#00008B' },
          { label: 'Blue', hex: '#0000FF' },
          { label: 'Royal Blue', hex: '#4169E1' },
          { label: 'Steel Blue', hex: '#4682B4' },
          { label: 'Dodger Blue', hex: '#1E90FF' },
          { label: 'Cornflower Blue', hex: '#6495ED' },
          { label: 'Sky Blue', hex: '#87CEEB' },
          { label: 'Light Sky Blue', hex: '#87CEFA' },
          { label: 'Deep Sky Blue', hex: '#00BFFF' },
          { label: 'Cyan', hex: '#00FFFF' },
          { label: 'Light Cyan', hex: '#E0FFFF' },
          { label: 'Slate Blue', hex: '#6A5ACD' },
          { label: 'Medium Blue', hex: '#0000CD' },
          { label: 'Light Blue', hex: '#ADD8E6' },
          { label: 'Powder Blue', hex: '#B0E0E6' },
          { label: 'Light Slate Blue', hex: '#8470D8' },
          { label: 'Periwinkle', hex: '#CCCCFF' },
          { label: 'Alice Blue', hex: '#F0F8FF' },
          { label: 'Ghost White', hex: '#F8F8FF' }
        ],
        Yellow: [
          { label: 'Dark Olive', hex: '#556B2F' },
          { label: 'Olive Drab', hex: '#6B8E23' },
          { label: 'Dark Yellow', hex: '#808000' },
          { label: 'Brown', hex: '#8B4513' },
          { label: 'Goldenrod', hex: '#DAA520' },
          { label: 'Dark Goldenrod', hex: '#B8860B' },
          { label: 'Gold', hex: '#FFD700' },
          { label: 'Yellow', hex: '#FFFF00' },
          { label: 'Light Yellow', hex: '#FFFFE0' },
          { label: 'Pale Goldenrod', hex: '#EEE8AA' },
          { label: 'Khaki', hex: '#F0E68C' },
          { label: 'Dark Khaki', hex: '#BDB76B' },
          { label: 'Olive', hex: '#808000' },
          { label: 'Yellow Green', hex: '#9ACD32' },
          { label: 'Green Yellow', hex: '#ADFF2F' },
          { label: 'Lawn Green', hex: '#7CFC00' },
          { label: 'Chartreuse', hex: '#7FFF00' },
          { label: 'Moccasin', hex: '#FFE4B5' },
          { label: 'Peach Puff', hex: '#FFDAB9' },
          { label: 'Navajo White', hex: '#FFDEAD' },
          { label: 'Tan', hex: '#D2B48C' },
          { label: 'Bisque', hex: '#FFE4C4' },
          { label: 'Cornsilk', hex: '#FFF8DC' },
          { label: 'Linen', hex: '#FAF0E6' }
        ],
        Orange: [
          { label: 'Very Dark Orange', hex: '#664400' },
          { label: 'Dark Orange', hex: '#996600' },
          { label: 'Brown', hex: '#A52A2A' },
          { label: 'Saddle Brown', hex: '#8B4513' },
          { label: 'Sienna', hex: '#A0522D' },
          { label: 'Peru', hex: '#CD853F' },
          { label: 'Chocolate', hex: '#D2691E' },
          { label: 'Dark Orange', hex: '#FF8C00' },
          { label: 'Orange', hex: '#FFA500' },
          { label: 'Light Orange', hex: '#FFB347' },
          { label: 'Orange Red', hex: '#FF4500' },
          { label: 'Red Orange', hex: '#FF5722' },
          { label: 'Coral', hex: '#FF7F50' },
          { label: 'Light Coral', hex: '#F08080' },
          { label: 'Salmon', hex: '#FA8072' },
          { label: 'Light Salmon', hex: '#FFA07A' },
          { label: 'Tomato', hex: '#FF6347' },
          { label: 'Pumpkin', hex: '#D35400' },
          { label: 'Carrot', hex: '#E67E22' },
          { label: 'Papaya Whip', hex: '#FFEFD5' },
          { label: 'Wheat', hex: '#F5DEB3' },
          { label: 'Antique White', hex: '#FAEBD7' },
          { label: 'Floral White', hex: '#FFFAF0' },
          { label: 'Light Goldenrod', hex: '#FAFAD2' }
        ],
        Green: [
          { label: 'Very Dark Green', hex: '#001000' },
          { label: 'Deep Green', hex: '#003300' },
          { label: 'Dark Forest Green', hex: '#004000' },
          { label: 'Forest Green', hex: '#228B22' },
          { label: 'Dark Green', hex: '#006400' },
          { label: 'Green', hex: '#008000' },
          { label: 'Sea Green', hex: '#2E8B57' },
          { label: 'Medium Sea Green', hex: '#3CB371' },
          { label: 'Dark Sea Green', hex: '#8FBC8F' },
          { label: 'Olive Green', hex: '#6B8E23' },
          { label: 'Olive Drab', hex: '#556B2F' },
          { label: 'Yellow Green', hex: '#9ACD32' },
          { label: 'Spring Green', hex: '#00FF7F' },
          { label: 'Green Yellow', hex: '#ADFF2F' },
          { label: 'Lawn Green', hex: '#7CFC00' },
          { label: 'Lime', hex: '#00FF00' },
          { label: 'Lime Green', hex: '#32CD32' },
          { label: 'Light Green', hex: '#90EE90' },
          { label: 'Pale Green', hex: '#98FB98' },
          { label: 'Mint Green', hex: '#98FF98' },
          { label: 'Chartreuse', hex: '#7FFF00' },
          { label: 'Medium Green', hex: '#004C00' },
          { label: 'Dark Spring Green', hex: '#00A86B' },
          { label: 'Pure Green', hex: '#00FF00' }
        ]
      },
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
          name: 'Random',
          colors: []
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
        },
        {
          name: 'Primary Shades',
          colors: []
        },
        {
          name: 'Paint',
          colors: [
            { label: 'Black', hex: '#000000' },
            { label: 'Gray', hex: '#808080' },
            { label: 'Maroon', hex: '#800000' },
            { label: 'Olive', hex: '#808000' },
            { label: 'Dark Green', hex: '#008000' },
            { label: 'Teal', hex: '#008080' },
            { label: 'Navy', hex: '#000080' },
            { label: 'Purple', hex: '#800080' },
            { label: 'Khaki', hex: '#C0C000' },
            { label: 'Dark Teal', hex: '#004080' },
            { label: 'Blue', hex: '#0080FF' },
            { label: 'Dark Blue', hex: '#000040' },
            { label: 'Magenta', hex: '#FF00FF' },
            { label: 'Brown', hex: '#804000' },
            { label: 'White', hex: '#FFFFFF' },
            { label: 'Light Gray', hex: '#C0C0C0' },
            { label: 'Red', hex: '#FF0000' },
            { label: 'Yellow', hex: '#FFFF00' },
            { label: 'Lime', hex: '#00FF00' },
            { label: 'Cyan', hex: '#00FFFF' },
            { label: 'Bright Blue', hex: '#0000FF' },
            { label: 'Hot Pink', hex: '#FF00FF' },
            { label: 'Light Yellow', hex: '#FFFF80' },
            { label: 'Light Green', hex: '#80FF80' },
            { label: 'Light Cyan', hex: '#80FFFF' },
            { label: 'Light Blue', hex: '#8080FF' },
            { label: 'Pink', hex: '#FF80FF' },
            { label: 'Orange', hex: '#FF8000' }
          ]
        }
      ]
    }
  },
  methods: {
    generateRandomColor() {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    },
    generateRandomTheme() {
      const colors = []
      for (let i = 0; i < 24; i++) {
        colors.push({
          label: `Color ${i + 1}`,
          hex: this.generateRandomColor()
        })
      }
      return colors
    },
    selectTheme(theme) {
      this.$emit('theme-selected', theme.colors)
    },
    rerollTheme() {
      const randomTheme = this.themes.find(t => t.name === 'Random')
      if (randomTheme) {
        randomTheme.colors = this.generateRandomTheme()
      }
    },
    togglePrimaryColor() {
      const primaryColors = ['Green', 'Red', 'Blue', 'Yellow', 'Orange']
      const currentIndex = primaryColors.indexOf(this.currentPrimary)
      this.currentPrimary = primaryColors[(currentIndex + 1) % primaryColors.length]

      const primaryShadesTheme = this.themes.find(t => t.name === 'Primary Shades')
      if (primaryShadesTheme) {
        primaryShadesTheme.colors = this.primaryColorPalettes[this.currentPrimary]
      }
    }
  },
  mounted() {
    // Initialize random theme with colors
    const randomTheme = this.themes.find(t => t.name === 'Random')
    if (randomTheme) {
      randomTheme.colors = this.generateRandomTheme()
    }

    // Initialize primary shades theme with green colors
    const primaryShadesTheme = this.themes.find(t => t.name === 'Primary Shades')
    if (primaryShadesTheme) {
      primaryShadesTheme.colors = this.primaryColorPalettes['Green']
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
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(15px);
  font-family: 'Montserrat', sans-serif;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(185, 185, 185, 0.3);
  flex-shrink: 0;
  background-color: transparent;
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
  color: #34495e;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #95a5a6;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #34495e;
}

.modal-content {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  background-color: transparent;
}

.theme-option {
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(185, 185, 185, 0.5);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  background-color: rgba(52, 73, 94, 0.05);
  border-color: rgba(185, 185, 185, 0.7);
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-family: 'Montserrat', sans-serif;
}

.theme-option h3 {
  margin: 0;
  color: #34495e;
  font-size: 12px;
  font-weight: 600;
}

.reroll-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #95a5a6;
  padding: 2px 6px;
  transition: transform 0.2s ease;
}

.reroll-btn:hover {
  transform: rotate(180deg);
  color: #34495e;
}

.primary-label {
  font-size: 11px;
  color: #95a5a6;
  margin-left: 6px;
  font-weight: normal;
}

.color-preview {
  display: flex;
  gap: 2px;
  height: 20px;
}

.preview-swatch {
  flex: 1;
  border-radius: 2px;
  border: 1px solid rgba(185, 185, 185, 0.3);
}
</style>
