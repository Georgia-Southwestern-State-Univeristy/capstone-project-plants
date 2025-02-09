import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/styles/generalStyle.css'
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

const app = createApp(App)

app.use(router)
app.use(store)

app.mount('#app')