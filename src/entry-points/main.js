import { createApp } from 'vue'
import PaletteApp from '../modules/palette-app.vue'
import '../style.css'
import '../styles/main.scss'

const app = createApp(PaletteApp)
app.mount('#app')
