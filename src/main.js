// src/main.js
// KENDRICK CHANGE - added Vuetify dependencies
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
// In main.js
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


import '@/assets/styles/generalStyle.css';

const vuetify = createVuetify({
    components,
    directives,
  })

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);
app.use(vuetify);
app.mount('#app');



