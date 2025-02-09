import { Buffer } from 'buffer'
window.Buffer = Buffer // Use window instead of globalThis for better browser compatibility

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/styles/generalStyle.css'

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')