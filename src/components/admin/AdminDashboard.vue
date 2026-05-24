<template>
  <div class="a-layout">
    <aside class="sidebar">
      <div class="sb-brand">
        <div class="sb-logo-wrap">
          <img src="/food-random/favicon.png" alt="logo" class="sb-logo-img"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <span class="sb-logo-fb">🍽️</span>
        </div>
        <div>
          <div class="sb-name">กินไรดี</div>
          <div class="sb-role">Admin Panel</div>
        </div>
      </div>
      <div class="sb-section-label">เมนูหลัก</div>
      <nav class="sb-nav">
        <router-link to="/admin/dashboard" class="sb-item"><span class="sb-icon"><i class="bi bi-grid"></i></span> Dashboard</router-link>
        <router-link to="/admin/menus"     class="sb-item"><span class="sb-icon"><i class="bi bi-egg-fried"></i></span> จัดการเมนู</router-link>
        <router-link to="/admin/reference" class="sb-item"><span class="sb-icon"><i class="bi bi-archive"></i></span> ข้อมูลอ้างอิง</router-link>
        <router-link to="/admin/reports"   class="sb-item">
          <span class="sb-icon"><i class="bi bi-flag"></i></span> รายการ Report
          <span v-if="stats.pendingReports>0" class="sb-badge">{{ stats.pendingReports }}</span>
        </router-link>
      </nav>
      <div class="sb-bottom">
        <div class="sb-user">
          <div class="sb-avatar">A</div>
          <div><div class="sb-uname">Administrator</div><div class="sb-uemail">admin@kinraidee</div></div>
        </div>
        <button class="sb-logout" @click="logout">⏻</button>
      </div>
    </aside>

    <div class="a-main">
      <header class="topbar">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">ภาพรวมระบบกินไรดี</p>
        </div>
        <router-link to="/admin/menus" class="btn-primary">+ เพิ่มเมนูใหม่</router-link>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"/>
        <p>กำลังโหลด...</p>
      </div>

      <template v-else>
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🍽️</div>
            <div class="stat-num">{{ stats.total }}</div>
            <div class="stat-lbl">เมนูทั้งหมด</div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">✅</div>
            <div class="stat-num">{{ stats.normal }}</div>
            <div class="stat-lbl">ใช้งานได้</div>
          </div>
          <div class="stat-card red">
            <div class="stat-icon">⚑</div>
            <div class="stat-num">{{ stats.flagged }}</div>
            <div class="stat-lbl">ถูก Report</div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon">☪️</div>
            <div class="stat-num">{{ stats.halal }}</div>
            <div class="stat-lbl">ฮาลาล</div>
          </div>
          <div class="stat-card teal">
            <div class="stat-icon">🌿</div>
            <div class="stat-num">{{ stats.vegan }}</div>
            <div class="stat-lbl">เจ</div>
          </div>
          <div class="stat-card pink">
            <div class="stat-icon">🌶️</div>
            <div class="stat-num">{{ stats.spicy }}</div>
            <div class="stat-lbl">เผ็ด</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <!-- By Cuisine -->
          <div class="chart-card">
            <h3 class="chart-title">🍚 เมนูตามประเภทอาหาร</h3>
            <div class="bar-list">
              <div v-for="c in stats.byCuisine" :key="c.name" class="bar-item">
                <div class="bar-label">{{ c.name }}</div>
                <div class="bar-track">
                  <div class="bar-fill" :style="{width: (c.cnt/stats.total*100)+'%'}"/>
                </div>
                <div class="bar-num">{{ c.cnt }}</div>
              </div>
            </div>
          </div>

          <!-- By Health Tag -->
          <div class="chart-card">
            <h3 class="chart-title">⚕️ เมนูตาม Tag สุขภาพ</h3>
            <div v-if="!stats.byHealth?.length" class="empty-chart">ยังไม่มีข้อมูล</div>
            <div class="bar-list" v-else>
              <div v-for="h in stats.byHealth" :key="h.label" class="bar-item">
                <div class="bar-label">{{ h.label }}</div>
                <div class="bar-track">
                  <div class="bar-fill green-fill" :style="{width: (h.cnt/stats.total*100)+'%'}"/>
                </div>
                <div class="bar-num">{{ h.cnt }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3 class="section-title">⚡ Quick Actions</h3>
          <div class="action-grid">
            <router-link to="/admin/menus" class="action-card">
              <span class="action-icon">➕</span>
              <span class="action-lbl">เพิ่มเมนูใหม่</span>
            </router-link>
            <router-link to="/admin/reference" class="action-card">
              <span class="action-icon">🏷️</span>
              <span class="action-lbl">Bulk Assign Tags</span>
            </router-link>
            <router-link to="/admin/reports" class="action-card">
              <span class="action-icon">⚑</span>
              <span class="action-lbl">ดู Reports
                <span v-if="stats.pendingReports>0" class="action-badge">{{ stats.pendingReports }}</span>
              </span>
            </router-link>
            <router-link to="/admin/reference" class="action-card">
              <span class="action-icon">⚕️</span>
              <span class="action-lbl">จัดการ Health Tags</span>
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
const API = process.env.VUE_APP_API_URL || 'http://localhost:3000'
const HEADERS = () => ({ 'x-admin-token': localStorage.getItem('adminToken') })

export default {
  name: 'AdminDashboard',
  data() {
    return {
      loading: true,
      stats: { total:0, normal:0, flagged:0, halal:0, vegan:0, spicy:0, pendingReports:0, byCuisine:[], byHealth:[] }
    }
  },
  async created() {
    try {
      const { data } = await axios.get(`${API}/api/admin/stats`, { headers: HEADERS() })
      if (data.success) this.stats = data.data
    } catch(e) { console.error(e) }
    finally { this.loading = false }
  },
  methods: {
    logout() { localStorage.removeItem('adminToken'); this.$router.push('/admin/login') }
  }
}
</script>

<style scoped>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.a-layout{display:flex;min-height:100vh;font-family:'Sarabun','Prompt',sans-serif;background:#F7F8FA}
.sidebar{width:240px;background:#1A1D23;display:flex;flex-direction:column;padding:20px 0;flex-shrink:0;position:sticky;top:0;height:100vh}
.sb-brand{display:flex;align-items:center;gap:12px;padding:0 20px 24px;border-bottom:1px solid rgba(255,255,255,.06)}
.sb-logo-wrap{width:38px;height:38px;border-radius:10px;background:rgba(242,103,34,.2);border:1px solid rgba(242,103,34,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}
.sb-logo-img{width:100%;height:100%;object-fit:contain;padding:3px}
.sb-logo-fb{font-size:1.4rem;display:none}
.sb-name{font-size:1rem;font-weight:800;color:white}
.sb-role{font-size:.7rem;color:#6B7280;margin-top:1px}
.sb-section-label{font-size:.68rem;font-weight:700;color:#4B5563;letter-spacing:1.5px;text-transform:uppercase;padding:16px 20px 8px}
.sb-nav{display:flex;flex-direction:column;gap:2px;padding:0 10px}
.sb-item{display:flex;align-items:center;gap:10px;color:#9CA3AF;text-decoration:none;padding:10px 12px;border-radius:10px;font-size:.88rem;font-weight:600;transition:all .18s;position:relative}
.sb-item:hover{background:rgba(255,255,255,.06);color:white}
.sb-item.router-link-active{background:rgba(242,103,34,.15);color:#F26722}
.sb-icon{font-size:1rem;width:20px;text-align:center}
.sb-badge{margin-left:auto;background:#EF4444;color:white;border-radius:50px;font-size:.68rem;font-weight:700;padding:2px 7px}
.sb-bottom{margin-top:auto;padding:16px 10px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:10px}
.sb-user{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:0 10px}
.sb-avatar{width:32px;height:32px;border-radius:50%;background:#F26722;color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.9rem;flex-shrink:0}
.sb-uname{font-size:.82rem;font-weight:700;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-uemail{font-size:.72rem;color:#6B7280}
.sb-logout{background:none;border:1px solid rgba(255,255,255,.1);color:#6B7280;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:.9rem;transition:all .18s;flex-shrink:0}
.sb-logout:hover{background:rgba(239,68,68,.15);border-color:#EF4444;color:#EF4444}

.a-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.topbar{display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px 0}
.page-title{font-size:1.5rem;font-weight:800;color:#1A1D23}
.page-sub{font-size:.8rem;color:#6B7280;margin-top:3px}
.btn-primary{background:#F26722;color:white;border:none;border-radius:10px;padding:10px 22px;font-family:inherit;font-weight:700;font-size:.88rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px;transition:background .18s}
.btn-primary:hover{background:#D95A1A}

.loading-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:80px;color:#9CA3AF}
.spinner{width:36px;height:36px;border:4px solid #E5E7EB;border-top-color:#F26722;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.stats-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;padding:20px 28px}
.stat-card{background:white;border:1px solid #E5E7EB;border-radius:14px;padding:16px;text-align:center;transition:transform .18s}
.stat-card:hover{transform:translateY(-2px)}
.stat-icon{font-size:1.4rem;margin-bottom:6px}
.stat-num{font-size:1.8rem;font-weight:900;color:#1A1D23;line-height:1}
.stat-lbl{font-size:.74rem;color:#6B7280;margin-top:4px}
.stat-card.green .stat-num{color:#10B981}
.stat-card.red .stat-num{color:#EF4444}
.stat-card.orange .stat-num{color:#F26722}
.stat-card.teal .stat-num{color:#0EA5E9}
.stat-card.pink .stat-num{color:#EC4899}

.charts-row{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:0 28px 20px}
.chart-card{background:white;border:1px solid #E5E7EB;border-radius:14px;padding:20px}
.chart-title{font-size:.95rem;font-weight:800;color:#1A1D23;margin-bottom:16px}
.bar-list{display:flex;flex-direction:column;gap:10px}
.bar-item{display:grid;grid-template-columns:100px 1fr 36px;align-items:center;gap:10px}
.bar-label{font-size:.78rem;color:#374151;font-weight:600;text-align:right}
.bar-track{height:10px;background:#F3F4F6;border-radius:50px;overflow:hidden}
.bar-fill{height:100%;background:#F26722;border-radius:50px;transition:width .6s ease}
.bar-fill.green-fill{background:#10B981}
.bar-num{font-size:.78rem;font-weight:700;color:#6B7280}
.empty-chart{text-align:center;color:#D1D5DB;padding:20px;font-size:.85rem}

.quick-actions{padding:0 28px 40px}
.section-title{font-size:1rem;font-weight:800;color:#1A1D23;margin-bottom:14px}
.action-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.action-card{background:white;border:1.5px solid #E5E7EB;border-radius:14px;padding:20px;display:flex;flex-direction:column;align-items:center;gap:8px;text-decoration:none;transition:all .18s;cursor:pointer}
.action-card:hover{border-color:#F26722;transform:translateY(-2px);box-shadow:0 4px 16px rgba(242,103,34,.15)}
.action-icon{font-size:1.6rem}
.action-lbl{font-size:.82rem;font-weight:700;color:#374151;text-align:center;display:flex;align-items:center;gap:6px}
.action-badge{background:#EF4444;color:white;border-radius:50px;font-size:.68rem;font-weight:700;padding:2px 7px}

@media(max-width:900px){
  .stats-grid{grid-template-columns:repeat(3,1fr)}
  .charts-row{grid-template-columns:1fr}
  .action-grid{grid-template-columns:repeat(2,1fr)}
}
</style>