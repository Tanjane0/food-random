<template>
  <div class="page">

    <!-- Loading -->
    <div v-if="loading" class="state-center">
      <div class="spinner"/>
    </div>

    <!-- ไม่พบเมนู -->
    <div v-else-if="!menu" class="state-center">
      <p style="font-size:1.2rem;margin-bottom:16px">ไม่พบเมนูนี้ 😢</p>
      <router-link to="/" class="btn-orange">กลับหน้าหลัก</router-link>
    </div>

    <!-- เนื้อหา -->
    <template v-else>

      <!-- HERO รูป -->
      <div class="hero-img">
        <img v-if="menu.image_url" :src="menu.image_url.startsWith('http') ? menu.image_url : apiBase + menu.image_url" class="hero-photo"/>
        <div v-else class="hero-ph">🍜</div>
        <div class="hero-overlay"/>
        <router-link to="/" class="btn-back">← กลับ</router-link>
        <div class="hero-badge">{{ menu.cuisine_name }}</div>
      </div>

      <!-- BODY -->
      <div class="body-wrap">
        <div class="content-grid">

          <!-- LEFT: ข้อมูลหลัก -->
          <div class="col-main">

            <h1 class="menu-name">{{ menu.name }}</h1>

            <!-- แคลอรี่ -->
            <div v-if="menu.calories" class="cal-row">
              <span class="cal-num">{{ menu.calories }}</span>
              <span class="cal-unit">kcal / จาน</span>
              <span class="cal-icon">🔥</span>
            </div>

            <!-- Tag หลัก -->
            <div class="tag-row">
              <span v-if="menu.is_spicy" class="tag tag-spicy">🌶️ เผ็ด</span>
              <span v-if="menu.is_vegan" class="tag tag-vegan">🌿 เจ</span>
              <span v-if="menu.is_halal" class="tag tag-halal">☪️ ฮาลาล</span>
            </div>

            <!-- เนื้อสัตว์ / โปรตีน -->
            <div v-if="menu.meat_types?.length" class="section">
              <h3 class="sec-title">🥩 เนื้อสัตว์ / โปรตีน</h3>
              <div class="tag-row">
                <span v-for="m in menu.meat_types" :key="m.name" class="tag tag-meat">{{ meatEmoji(m.name) }} {{ m.name }}</span>
              </div>
            </div>

            <!-- วิธีปรุง -->
            <div v-if="menu.cook_methods?.length" class="section">
              <h3 class="sec-title">🍳 วิธีปรุง</h3>
              <div class="tag-row">
                <span v-for="m in menu.cook_methods" :key="m.name" class="tag tag-method">{{ m.name }}</span>
              </div>
            </div>

            <!-- เหมาะกับโรค -->
            <div v-if="menu.health_tags?.length" class="section">
              <h3 class="sec-title">⚕️ เหมาะกับ</h3>
              <div class="tag-row">
                <span v-for="t in menu.health_tags" :key="t.name" class="tag tag-health">{{ t.label }}</span>
              </div>
              <div class="disclaimer">⚠️ ข้อมูลนี้เป็นแนวทางเบื้องต้นเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์ ควรปรึกษาแพทย์</div>
            </div>

            <!-- Actions -->
            <div class="actions">
              <button class="btn-orange" @click="copyLink">📋 คัดลอกลิงก์แชร์</button>
              <button class="btn-map" @click="findNearby">📍 ร้านใกล้ฉัน</button>
              <router-link to="/" class="btn-outline">🎲 สุ่มเมนูใหม่</router-link>
            </div>
          </div>

          <!-- RIGHT: ข้อมูลเพิ่มเติม -->
          <div class="col-side">

            <!-- ข้อมูลสรุป -->
            <div class="info-card">
              <div class="info-card-head">📋 ข้อมูลสรุป</div>
              <div class="info-row">
                <span class="info-lbl">ประเภทอาหาร</span>
                <span class="info-val">{{ menu.cuisine_name }}</span>
              </div>
              <div class="info-row" v-if="menu.calories">
                <span class="info-lbl">แคลอรี่</span>
                <span class="info-val">{{ menu.calories }} kcal</span>
              </div>
              <div class="info-row">
                <span class="info-lbl">เผ็ด</span>
                <span class="info-val">{{ menu.is_spicy ? 'ใช่' : 'ไม่เผ็ด' }}</span>
              </div>
              <div class="info-row">
                <span class="info-lbl">เจ</span>
                <span class="info-val">{{ menu.is_vegan ? '✅ ใช่' : '✗ ไม่ใช่' }}</span>
              </div>
              <div class="info-row">
                <span class="info-lbl">ฮาลาล</span>
                <span class="info-val">{{ menu.is_halal ? '✅ ใช่' : '✗ ไม่ใช่' }}</span>
              </div>
              <div class="info-row" v-if="menu.cook_methods?.length">
                <span class="info-lbl">วิธีปรุง</span>
                <span class="info-val">{{ menu.cook_methods.map(m=>m.name).join(', ') }}</span>
              </div>
              <div class="info-row" v-if="menu.meat_types?.length">
                <span class="info-lbl">โปรตีน</span>
                <span class="info-val">{{ menu.meat_types.map(m=>m.name).join(', ') }}</span>
              </div>
            </div>

            <!-- ร้านใกล้เคียง shortcut -->
            <button class="map-card" @click="findNearby">
              <span class="map-icon">🗺️</span>
              <div>
                <div class="map-title">หาร้าน{{ menu.name }}ใกล้ฉัน</div>
                <div class="map-sub">เปิด Google Maps</div>
              </div>
              <span class="map-arrow">→</span>
            </button>

          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script>
import axios from 'axios'

const API = process.env.VUE_APP_API_URL || 'http://localhost:3000'

export default {
  name: 'MenuDetail',
  data() {
    return { apiBase: API, menu: null, loading: true }
  },
  async created() {
    try {
      const { data } = await axios.get(`${API}/api/menus/${this.$route.params.id}`)
      this.menu = data.success ? data.data : null
    } catch(e) {
      console.error(e)
    } finally {
      this.loading = false
    }
  },
  methods: {
    copyLink() {
      navigator.clipboard.writeText(location.href)
      alert('คัดลอกลิงก์แล้วค่ะ!')
    },
    findNearby() {
      if (!this.menu) return
      window.open(`https://www.google.com/maps/search/${encodeURIComponent('ร้าน' + this.menu.name + 'ใกล้ฉัน')}`, '_blank')
    },
    meatEmoji(name) {
      return { ไก่:'🐔', หมู:'🐷', เนื้อวัว:'🐄', กุ้ง:'🦐', ปลา:'🐟', ทะเลรวม:'🦑', ไข่:'🥚', เต้าหู้:'🟡', 'ไม่มีเนื้อ':'🌱' }[name] || '🥩'
    },
  }
}
</script>

<style scoped>
*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }

.page { min-height:100vh; background:#FDF8EC; font-family:'Sarabun','Prompt',sans-serif; }

/* State */
.state-center { text-align:center; padding:100px 20px; color:#7A5040; }
.spinner { width:48px; height:48px; border:5px solid #E8D89A; border-top-color:#E8622A; border-radius:50%; animation:spin .8s linear infinite; margin:0 auto 16px; }
@keyframes spin { to { transform:rotate(360deg); } }

/* Hero */
.hero-img { position:relative; height:360px; overflow:hidden; }
.hero-photo { width:100%; height:100%; object-fit:cover; }
.hero-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:8rem; background:#FFF8E0; }
.hero-overlay { position:absolute; inset:0; background:linear-gradient(to bottom, transparent 40%, rgba(61,34,0,.5) 100%); }
.btn-back {
  position:absolute; top:16px; left:16px;
  background:rgba(255,255,255,.9); color:#3D2200;
  padding:8px 16px; border-radius:50px;
  text-decoration:none; font-weight:700; font-size:.88rem;
  backdrop-filter:blur(4px);
}
.hero-badge {
  position:absolute; bottom:20px; left:24px;
  background:#E8622A; color:white;
  border-radius:50px; padding:6px 18px;
  font-size:.9rem; font-weight:700;
}

/* Body */
.body-wrap { max-width:1100px; margin:0 auto; padding:32px 24px 60px; }
.content-grid { display:grid; grid-template-columns:1fr 340px; gap:32px; }

/* Left */
.col-main { display:flex; flex-direction:column; gap:0; }
.menu-name { font-size:clamp(1.8rem,5vw,2.6rem); font-weight:900; color:#3D2200; line-height:1.2; margin-bottom:12px; }
.cal-row { display:flex; align-items:baseline; gap:6px; margin-bottom:14px; }
.cal-num { font-size:2rem; font-weight:900; color:#E8622A; }
.cal-unit { font-size:.9rem; color:#7A5040; }
.cal-icon { font-size:1.2rem; }
.tag-row { display:flex; flex-wrap:wrap; gap:8px; }
.tag { display:inline-flex; align-items:center; gap:4px; padding:5px 14px; border-radius:50px; font-size:.82rem; font-weight:600; border:1.5px solid; }
.tag-spicy  { border-color:#EF9A9A; color:#C62828; background:#FFF5F5; }
.tag-vegan  { border-color:#A5D6A7; color:#2E7D32; background:#F1F8F2; }
.tag-halal  { border-color:#90CAF9; color:#1565C0; background:#F0F6FF; }
.tag-meat   { border-color:#FFCC80; color:#E65100; background:#FFF8E1; }
.tag-method { border-color:#C8A882; color:#6B4226; background:#FDF5E8; }
.tag-health { border-color:#A5D6A7; color:#1B5E20; background:#E8F5E9; }
.section { margin-top:22px; }
.sec-title { font-weight:700; color:#3D2200; margin-bottom:8px; font-size:.95rem; }
.disclaimer {
  margin-top:10px; font-size:.78rem; color:#7A5040;
  background:#FFF8E1; padding:8px 12px;
  border-radius:8px; border-left:3px solid #F5C842;
}
.actions { display:flex; gap:10px; margin-top:28px; flex-wrap:wrap; }
.btn-orange {
  background:#E8622A; color:white; border:none;
  border-radius:50px; padding:12px 24px;
  font-size:.9rem; font-weight:700;
  cursor:pointer; font-family:inherit; text-decoration:none;
  transition:background .2s;
}
.btn-orange:hover { background:#C94F1E; }
.btn-map {
  background:white; color:#3D2200;
  border:2px solid #E8D89A; border-radius:50px;
  padding:10px 20px; font-size:.9rem; font-weight:700;
  cursor:pointer; font-family:inherit;
  transition:all .18s;
}
.btn-map:hover { border-color:#E8622A; color:#E8622A; }
.btn-outline {
  color:#3D2200; border:2px solid #3D2200;
  border-radius:50px; padding:10px 22px;
  font-size:.9rem; font-weight:700;
  text-decoration:none; transition:all .2s;
}
.btn-outline:hover { background:#3D2200; color:#FDF8EC; }

/* Right */
.col-side { display:flex; flex-direction:column; gap:16px; }

.ai-card {
  background:white; border-radius:18px;
  padding:20px; border:1.5px solid #F0E4A0;
  box-shadow:0 2px 12px rgba(61,34,0,.08);
}
.ai-card-head { font-weight:800; color:#C88A00; margin-bottom:10px; font-size:.95rem; }
.ai-loading { color:#9A7060; font-style:italic; font-size:.88rem; animation:pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
.ai-text { font-size:.9rem; color:#3D2200; line-height:1.65; }
.ai-na { color:#C8A882; font-style:italic; }

.info-card {
  background:white; border-radius:18px;
  padding:20px; border:1.5px solid #F0E4A0;
  box-shadow:0 2px 12px rgba(61,34,0,.08);
}
.info-card-head { font-weight:800; color:#3D2200; margin-bottom:12px; font-size:.9rem; }
.info-row { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; padding:8px 0; border-bottom:1px solid #F5EDD0; }
.info-row:last-child { border-bottom:none; }
.info-lbl { font-size:.82rem; color:#9A7060; font-weight:600; flex-shrink:0; }
.info-val { font-size:.82rem; color:#3D2200; font-weight:700; text-align:right; }

.map-card {
  background:#E8622A; color:white; border:none;
  border-radius:18px; padding:18px 20px;
  display:flex; align-items:center; gap:14px;
  cursor:pointer; font-family:inherit;
  box-shadow:0 4px 16px rgba(232,98,42,.35);
  transition:background .2s, transform .15s;
  width:100%;
}
.map-card:hover { background:#C94F1E; transform:translateY(-2px); }
.map-icon { font-size:1.8rem; flex-shrink:0; }
.map-title { font-weight:800; font-size:.9rem; text-align:left; }
.map-sub { font-size:.76rem; opacity:.85; margin-top:2px; }
.map-arrow { font-size:1.2rem; margin-left:auto; opacity:.8; }

/* Responsive */
@media(max-width:860px) {
  .content-grid { grid-template-columns:1fr; }
  .col-side { order:-1; display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .map-card { grid-column:1/-1; }
}
@media(max-width:600px) {
  .hero-img { height:260px; }
  .body-wrap { padding:20px 16px 40px; }
  .col-side { grid-template-columns:1fr; }
}
</style>