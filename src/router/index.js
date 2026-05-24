import { createRouter, createWebHistory } from 'vue-router'
import HomePage       from '../components/HomePage.vue'
import BrowsePage     from '../components/BrowsePage.vue'
import HistoryPage    from '../components/HistoryPage.vue'
import MenuDetail     from '../components/MenuDetail.vue'
import AdminLogin     from '../components/admin/AdminLogin.vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import AdminMenus     from '../components/admin/AdminMenus.vue'
import AdminReports   from '../components/admin/AdminReports.vue'
import AdminReference from '../components/admin/AdminReference.vue'

const adminGuard = (to, from, next) => {
  localStorage.getItem('adminToken') ? next() : next('/admin/login')
}

const routes = [
  { path: '/',                  component: HomePage },
  { path: '/browse',            component: BrowsePage },
  { path: '/history',           component: HistoryPage },
  { path: '/menu/:id',          component: MenuDetail },
  { path: '/admin/login',       component: AdminLogin },
  { path: '/admin/dashboard',   component: AdminDashboard,  beforeEnter: adminGuard },
  { path: '/admin/menus',       component: AdminMenus,      beforeEnter: adminGuard },
  { path: '/admin/reports',     component: AdminReports,    beforeEnter: adminGuard },
  { path: '/admin/reference',   component: AdminReference,  beforeEnter: adminGuard },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

export default router