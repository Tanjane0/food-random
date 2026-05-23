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
        <h1 class="page-title">🏆 ประวัติการสุ่ม</h1>
        <span v-if="history.length" class="page-count">{{ history.length }} รายการ</span>
      </div>
      <nav class="header-nav">
        <router-link to="/" class="nav-pill nav-primary">🎲 สุ่มเมนู</router-link>
        <router-link to="/browse" class="nav-pill nav-outline">☰ ดูเมนูทั้งหมด</router-link>
      </nav>
    </header>

    <!-- CONTENT -->
    <div class="content">

      <!-- Loading -->
      <div v-if="loading" class="state-center">
        <div class="spin-ring"></div>
        <p class="state-txt">กำลังโหลด...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="history.length===0" class="state-center">
        <div class="empty-icon">🎲</div>
        <p class="empty-title">ยังไม่มีประวัติการสุ่ม</p>
        <p class="empty-sub">กดปุ่มสุ่มเมนูแล้วมาดูผลที่นี่ได้เลยค่ะ!</p>
        <router-link to="/" class="btn-orange">ไปสุ่มเมนูเลย! 🎲</router-link>
      </div>

      <!-- History list -->
      <div v-else>
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <span class="toolbar-txt">สุ่มไปแล้ว <strong>{{ history.length }}</strong> เมนูในเซสชันนี้</span>
            <span class="toolbar-note">(หายเมื่อปิดเว็บ)</span>
          </div>
          <button class="btn-clear" @click="clearHistory">🗑️ ล้างประวัติ</button>
        </div>

        <div class="history-list">
          <div v-for="(item, index) in history" :key="item.id" class="history-card">
            <!-- Number badge -->
            <div class="item-num">
              <span>{{ index + 1 }}</span>
            </div>

            <!-- Image -->
            <div class="item-img-wrap">
              <img v-if="item.image_url" :src="item.image_url && item.image_url.startsWith('http') ? item.image_url : apiBase + item.image_url" :alt="item.name" class="item-img"/>
              <div v-else class="item-img-ph">🍜</div>
            </div>

            <!-- Info -->
            <div class="item-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-meta">
                <span class="item-cuisine">{{ item.cuisine_name }}</span>
                <span v-if="item.calories" class="item-cal">🔥 {{ item.calories }} kcal</span>
              </div>
            </div>

            <!-- Time -->
            <div class="item-time">
              <span class="time-icon">🕐</span>
              <span>{{ formatTime(item.spun_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Bottom CTA -->
        <div class="bottom-cta">
          <router-link to="/" class="btn-orange">สุ่มเมนูใหม่อีกครั้ง 🎲</router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'
const API = process.env.VUE_APP_API_URL || 'http://localhost:3000'

export default {
  name: 'HistoryPage',
  data() {
    return {
      apiBase: API,
      history: [],
      loading: true,
      sessionId: sessionStorage.getItem('spinSessionId') || '',
    }
  },
  async created() {
    await this.loadHistory()
  },
  methods: {
    async loadHistory() {
      if (!this.sessionId) { this.loading = false; return }
      try {
        const { data } = await axios.get(`${API}/api/history/${this.sessionId}`)
        this.history = data.data || []
      } catch(e) { console.error(e) }
      finally { this.loading = false }
    },
    async clearHistory() {
      if (!confirm('ล้างประวัติการสุ่มทั้งหมดใช่ไหมคะ?')) return
      try {
        await axios.delete(`${API}/api/history/${this.sessionId}`)
        this.history = []
      } catch(e) { console.error(e) }
    },
    formatTime(ts) {
      if (!ts) return ''
      return new Date(ts).toLocaleString('th-TH', {
        hour: '2-digit', minute: '2-digit',
        day: 'numeric', month: 'short'
      })
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
  display: flex; flex-direction: column;
}

/* ── HEADER ── */
.header {
  background: #FFFFFF;
  border-bottom: 1.5px solid #EDE0CC;
  padding: 11px 28px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  position: sticky; top: 0; z-index: 100;
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
.header-center { display: flex; align-items: center; gap: 10px; flex: 1; justify-content: center; }
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
.nav-primary { background: #F0622A; color: white; border-color: #F0622A; }
.nav-primary:hover { background: #D4511E; border-color: #D4511E; color: white; }

/* ── CONTENT ── */
.content {
  max-width: 860px;
  margin: 0 auto;
  padding: 36px 28px 60px;
  width: 100%;
}

/* States */
.state-center { text-align: center; padding: 80px 20px; }
.spin-ring {
  width: 44px; height: 44px;
  border: 4px solid #F5EDD6; border-top-color: #F0622A;
  border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.state-txt { font-size: 1rem; color: #9A7A60; font-weight: 600; }
.empty-icon { font-size: 4rem; margin-bottom: 14px; }
.empty-title { font-size: 1.25rem; font-weight: 800; color: #3D2800; margin-bottom: 8px; }
.empty-sub { font-size: .9rem; color: #9A7A60; margin-bottom: 24px; }

.btn-orange {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #F0622A 0%, #FF8244 100%);
  color: white; border: none; border-radius: 999px;
  padding: 12px 28px; font-family: inherit; font-size: .95rem;
  font-weight: 700; cursor: pointer; text-decoration: none;
  box-shadow: 0 4px 16px rgba(240,98,42,.35); transition: all .2s;
}
.btn-orange:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(240,98,42,.45); }

/* ── TOOLBAR ── */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; flex-wrap: wrap; gap: 10px;
}
.toolbar-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.toolbar-txt { font-size: .9rem; color: #6B4A20; font-weight: 600; }
.toolbar-txt strong { color: #F0622A; }
.toolbar-note { font-size: .78rem; color: #B0906A; }
.btn-clear {
  background: none; border: 1.5px solid #EDE0CC; border-radius: 999px;
  padding: 7px 16px; color: #9A7A60; font-family: inherit;
  font-size: .82rem; font-weight: 600; cursor: pointer; transition: all .18s;
  display: flex; align-items: center; gap: 5px;
}
.btn-clear:hover { border-color: #F0622A; color: #F0622A; background: #FFF5F0; }

/* ── HISTORY LIST ── */
.history-list { display: flex; flex-direction: column; gap: 10px; }

.history-card {
  background: #FFFFFF;
  border-radius: 16px;
  border: 1.5px solid #EDE0CC;
  padding: 14px 18px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 10px rgba(61,43,0,.06);
  transition: all .2s;
}
.history-card:hover {
  border-color: #FFCC00;
  box-shadow: 0 4px 18px rgba(61,43,0,.10);
  transform: translateX(3px);
}

.item-num {
  width: 32px; height: 32px;
  background: #FFF5DC; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: .88rem; font-weight: 900; color: #C88A00;
  border: 1.5px solid #EDE0CC;
}

.item-img-wrap {
  width: 58px; height: 58px; border-radius: 50%; overflow: hidden;
  flex-shrink: 0;
  border: 3px solid #FFFFFF;
  box-shadow: 0 0 0 3px #FFCC00;
}
.item-img { width: 100%; height: 100%; object-fit: cover; }
.item-img-ph {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; background: #FFF5DC;
}

.item-info { flex: 1; min-width: 0; }
.item-name {
  font-size: 1rem; font-weight: 800; color: #3D2800;
  margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.item-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.item-cuisine {
  background: #F0622A; color: white;
  border-radius: 999px; padding: 2px 10px;
  font-size: .74rem; font-weight: 700;
}
.item-cal { font-size: .78rem; color: #9A7A60; font-weight: 500; }

.item-time {
  display: flex; align-items: center; gap: 4px;
  font-size: .76rem; color: #B0906A; white-space: nowrap; flex-shrink: 0;
}
.time-icon { font-size: .8rem; }

/* Bottom CTA */
.bottom-cta { text-align: center; margin-top: 36px; }

/* ── RESPONSIVE ── */
@media(max-width:640px) {
  .header { padding: 10px 16px; }
  .header-center { display: none; }
  .header-nav { display: none; }
  .content { padding: 20px 16px 48px; }
  .history-card { padding: 12px 14px; gap: 12px; }
  .item-time { display: none; }
  .item-img-wrap { width: 48px; height: 48px; }
}
</style>