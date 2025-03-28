// src/main.js
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
// In main.js
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


import '@/assets/styles/generalStyle.css';

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);
app.mount('#app');



