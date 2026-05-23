import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import router from './router' 


const app = createApp(App)
app.use(router) // สั่งให้ใช้งาน router
app.mount('#app')