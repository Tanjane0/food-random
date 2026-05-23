<template>
  <div class="page">

    <!-- HEADER -->
    <header class="header">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <span class="logo-icon">🍽️</span>
          <div>
            <div class="logo-main">กินไรดี</div>
            <div class="logo-bubble">หิวววว~</div>
          </div>
        </router-link>
      </div>
      <div class="header-center">
        <h1 class="page-title">รายการเมนูทั้งหมด</h1>
        <span class="page-count">{{ filteredMenus.length }} เมนู</span>
      </div>
      <nav class="header-nav">
        <router-link to="/" class="nav-pill nav-outline">🎲 สุ่มเมนู</router-link>
        <router-link to="/history" class="nav-pill nav-outline">🏆 ประวัติ</router-link>
      </nav>
    </header>

    <!-- FILTER BAR -->
    <div class="filter-bar">
      <div class="filter-inner">
        <!-- Search -->
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input v-model="search" class="search-input" placeholder="ค้นหาชื่อเมนู..." />
          <button v-if="search" class="search-clear" @click="search=''">✕</button>
        </div>

        <!-- Cuisine pills -->
        <div class="filter-pills">
          <button
            v-for="c in cuisineOptions" :key="c.id ?? 'all'"
            class="fpill" :class="{ active: selectedCuisine===c.id }"
            @click="selectedCuisine=c.id"
          >{{ c.name }}</button>
        </div>

        <!-- Tag pills -->
        <div class="filter-pills">
          <button class="fpill" :class="{ active: onlyVegan  }" @click="onlyVegan=!onlyVegan">🌿 เจ</button>
          <button class="fpill" :class="{ active: onlyHalal  }" @click="onlyHalal=!onlyHalal">☪️ ฮาลาล</button>
          <button class="fpill" :class="{ active: onlySpicy  }" @click="onlySpicy=!onlySpicy">🌶️ เผ็ด</button>
        </div>

        <!-- Clear -->
        <button v-if="hasFilter" class="btn-clear-filter" @click="resetFilters">↺ ล้าง</button>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <!-- Loading -->
      <div v-if="loading" class="state-center">
        <div class="spin-ring"></div>
        <p class="state-txt">กำลังโหลด...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredMenus.length===0" class="state-center">
        <p class="empty-emoji">😅</p>
        <p class="state-txt">ไม่พบเมนูที่ตรงกัน</p>
        <button class="btn-orange" @click="resetFilters">ล้างตัวกรอง</button>
      </div>

      <!-- Grid -->
      <div v-else class="menu-grid">
        <div v-for="m in filteredMenus" :key="m.id" class="menu-card">
          <div class="card-img-wrap">
            <img v-if="m.image_url" :src="apiBase+m.image_url" :alt="m.name" class="card-img"/>
            <div v-else class="card-img-ph">🍜</div>
          </div>
          <div class="card-body">
            <div class="card-badges">
              <span class="badge-cuisine">{{ m.cuisine_name }}</span>
              <span v-if="m.is_spicy" class="badge-tag">🌶️</span>
              <span v-if="m.is_vegan" class="badge-tag">🌿</span>
              <span v-if="m.is_halal" class="badge-tag">☪️</span>
            </div>
            <h3 class="card-name">{{ m.name }}</h3>
            <p v-if="m.calories" class="card-cal">🔥 {{ m.calories }} kcal</p>
            <router-link :to="'/menu/'+m.id" class="btn-detail">ดูรายละเอียด →</router-link>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default {
  name: 'BrowsePage',
  data() {
    return {
      apiBase: API, menus: [], cuisines: [], loading: true,
      search: '', selectedCuisine: null,
      onlyVegan: false, onlyHalal: false, onlySpicy: false,
    }
  },
  computed: {
    cuisineOptions() {
      return [{ id: null, name: '🍽️ ทั้งหมด' }, ...this.cuisines.map(c => ({ id: c.id, name: c.name }))]
    },
    filteredMenus() {
      return this.menus.filter(m => {
        if (this.search && !m.name.includes(this.search)) return false
        if (this.selectedCuisine && m.cuisine_id !== this.selectedCuisine) return false
        if (this.onlyVegan && !m.is_vegan) return false
        if (this.onlyHalal && !m.is_halal) return false
        if (this.onlySpicy && !m.is_spicy) return false
        return true
      })
    },
    hasFilter() {
      return this.search || this.selectedCuisine || this.onlyVegan || this.onlyHalal || this.onlySpicy
    },
  },
  async created() {
    try {
      const [menus, cuisines] = await Promise.all([
        axios.get(`${API}/api/menus`),
        axios.get(`${API}/api/cuisines`),
      ])
      this.menus    = menus.data.data    || []
      this.cuisines = cuisines.data.data || []
    } catch(e) { console.error(e) }
    finally { this.loading = false }
  },
  methods: {
    resetFilters() {
      this.search=''; this.selectedCuisine=null
      this.onlyVegan=false; this.onlyHalal=false; this.onlySpicy=false
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800;900&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: #FFF8EE;
  font-family: 'Noto Sans Thai', 'Sarabun', sans-serif;
  display: flex;
  flex-direction: column;
}

/* ── HEADER ── */
.header {
  background: #FFFFFF;
  border-bottom: 1.5px solid #EDE0CC;
  padding: 11px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(61,43,0,.06);
}
.header-left { display: flex; align-items: center; }
.logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { font-size: 1.9rem; }
.logo-main {
  font-size: 1.55rem; font-weight: 900;
  background: linear-gradient(135deg, #E8600A 0%, #F5A800 55%, #FFD700 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  letter-spacing: -0.5px; line-height: 1;
}
.logo-bubble {
  font-size: .7rem; color: #9A7A50;
  background: #FFF5DC; border-radius: 999px;
  padding: 2px 9px; width: fit-content; margin-top: 2px; border: 1px solid #EDE0CC;
}
.header-center {
  display: flex; align-items: center; gap: 10px; flex: 1; justify-content: center;
}
.page-title { font-size: 1.1rem; font-weight: 800; color: #3D2800; }
.page-count {
  background: #FFCC00; color: #6B4A10;
  border-radius: 999px; padding: 3px 12px;
  font-size: .78rem; font-weight: 700;
}
.header-nav { display: flex; gap: 8px; }
.nav-pill {
  padding: 7px 16px; border-radius: 999px;
  font-family: inherit; font-size: .84rem; font-weight: 700;
  text-decoration: none; cursor: pointer; transition: all .18s;
  display: flex; align-items: center; gap: 6px;
  border: 1.5px solid #EDE0CC; color: #4A3300; background: #FFFFFF;
}
.nav-pill:hover { border-color: #F0622A; color: #F0622A; background: #FFF5F0; }

/* ── FILTER BAR ── */
.filter-bar {
  background: #FFFFFF;
  border-bottom: 1.5px solid #EDE0CC;
  padding: 12px 28px;
  position: sticky;
  top: 58px;
  z-index: 90;
  box-shadow: 0 2px 8px rgba(61,43,0,.04);
}
.filter-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
}
.search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: #FFF8EE; border: 1.5px solid #EDE0CC;
  border-radius: 999px; padding: 7px 16px;
  min-width: 200px; transition: border-color .18s;
}
.search-wrap:focus-within { border-color: #F0622A; }
.search-icon { font-size: .9rem; }
.search-input {
  border: none; background: none; outline: none;
  font-family: inherit; font-size: .88rem; flex: 1; color: #3D2800;
}
.search-clear {
  background: none; border: none; cursor: pointer;
  color: #B0906A; font-size: .8rem; transition: color .18s;
}
.search-clear:hover { color: #F0622A; }
.filter-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.fpill {
  padding: 5px 13px; border-radius: 999px;
  border: 1.5px solid #EDE0CC; color: #6B4A20; background: #FAFAFA;
  font-size: .78rem; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: all .15s; white-space: nowrap;
}
.fpill:hover { border-color: #F0622A; color: #F0622A; background: #FFF5F0; }
.fpill.active {
  background: #FFCC00; border-color: #FFCC00;
  color: #3D2800; font-weight: 700;
  box-shadow: 0 2px 8px rgba(255,204,0,.3);
}
.btn-clear-filter {
  background: none; border: none; color: #B0906A;
  font-family: inherit; font-size: .8rem; font-weight: 600;
  cursor: pointer; transition: color .18s;
}
.btn-clear-filter:hover { color: #F0622A; }

/* ── CONTENT ── */
.content { max-width: 1200px; margin: 0 auto; padding: 32px 28px; width: 100%; }

/* States */
.state-center { text-align: center; padding: 80px 20px; }
.spin-ring {
  width: 44px; height: 44px;
  border: 4px solid #F5EDD6; border-top-color: #F0622A;
  border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.state-txt { font-size: 1rem; color: #9A7A60; font-weight: 600; margin-bottom: 16px; }
.empty-emoji { font-size: 3.5rem; margin-bottom: 10px; }
.btn-orange {
  background: linear-gradient(135deg, #F0622A 0%, #FF8244 100%);
  color: white; border: none; border-radius: 999px;
  padding: 10px 26px; font-family: inherit; font-size: .9rem;
  font-weight: 700; cursor: pointer;
  box-shadow: 0 4px 16px rgba(240,98,42,.35); transition: all .2s;
}
.btn-orange:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(240,98,42,.45); }

/* ── MENU GRID ── */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 20px;
}
.menu-card {
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid #EDE0CC;
  box-shadow: 0 2px 12px rgba(61,43,0,.07);
  transition: all .2s;
  display: flex; flex-direction: column;
}
.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(61,43,0,.13);
  border-color: #FFCC00;
}
.card-img-wrap { height: 155px; overflow: hidden; flex-shrink: 0; position: relative; }
.card-img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.menu-card:hover .card-img { transform: scale(1.04); }
.card-img-ph {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 3.5rem;
  background: linear-gradient(135deg, #FFF5DC 0%, #FFF8EE 100%);
}
.card-body { padding: 14px 16px 16px; display: flex; flex-direction: column; flex: 1; }
.card-badges { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; flex-wrap: wrap; }
.badge-cuisine {
  background: #F0622A; color: white;
  border-radius: 999px; padding: 3px 10px;
  font-size: .74rem; font-weight: 700;
}
.badge-tag { font-size: .88rem; }
.card-name { font-size: 1rem; font-weight: 800; color: #3D2800; margin-bottom: 4px; line-height: 1.3; }
.card-cal { font-size: .78rem; color: #9A7A60; margin-bottom: 12px; font-weight: 500; }
.btn-detail {
  margin-top: auto;
  color: #3D2800; font-size: .82rem; font-weight: 700;
  text-decoration: none; border-bottom: 2px solid #FFCC00;
  padding-bottom: 1px; width: fit-content; transition: all .18s;
}
.btn-detail:hover { color: #F0622A; border-color: #F0622A; }

/* ── RESPONSIVE ── */
@media(max-width:768px) {
  .header { padding: 10px 16px; }
  .header-center { display: none; }
  .filter-bar { top: 52px; padding: 10px 16px; }
  .content { padding: 20px 16px; }
  .menu-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
}
@media(max-width:480px) {
  .header-nav { display: none; }
}
</style>