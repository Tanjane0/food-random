<template>
  <div class="page">
    
    <!-- GRID -->
    <div class="main-grid">
      <!-- LEFT: โหมด -->
      <aside class="col-left">
        <div class="col-head-label">เลือกโหมด</div>
        <div class="mode-list">
          <button v-for="m in modes" :key="m.key"
            class="mode-card" :class="{ active: mode===m.key }"
            @click="switchMode(m.key)">
            <span class="mc-icon">{{ m.icon }}</span>
            <div>
              <div class="mc-name">{{ m.label }}</div>
              <div class="mc-sub">{{ m.sub }}</div>
            </div>
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="left-stats">
          <div class="stat-item">
            <span class="stat-num">50+</span>
            <span class="stat-lbl">เมนูในระบบ</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ spinCount }}</span>
            <span class="stat-lbl">สุ่มวันนี้</span>
          </div>
        </div>

        <!-- Tip card -->
        <div class="left-tip">
          <div class="tip-title">💡 เคล็ดลับ</div>
          <div class="tip-text">{{ currentTip }}</div>
        </div>

        <!-- Quick links -->
        <div class="left-links">
          <router-link to="/browse" class="left-link">
            <span class="ll-icon">📋</span>
            <span>ดูเมนูทั้งหมด</span>
            <span class="ll-arrow">›</span>
          </router-link>
          <router-link to="/history" class="left-link">
            <span class="ll-icon">🕐</span>
            <span>ประวัติการสุ่ม</span>
            <span class="ll-arrow">›</span>
          </router-link>
        </div>
      </aside>

      <!-- CENTER -->
      <main class="col-center">

        <!-- ── MODE 1: สุ่มเลย ── -->
        <template v-if="mode==='random'">
          <div class="tagline-row">
            <span class="tagline-chip">เฮ้!</span>
          </div>
          <h1 class="hero-title">กินไรดี</h1>

          <transition name="fade" mode="out-in">
            <div v-if="!result&&!customResult&&!loading" key="idle" class="stage">
              <div class="cloche-wrap">
                <img src="../assets/ฝาครอบ.png" alt="ฝาชี" class="cloche-img"
                  @error="e=>e.target.outerHTML='<div class=cloche-fb>🍽️</div>'"/>
                <span class="dk dk1">✦</span><span class="dk dk2">✦</span>
                <span class="dk dk3">◇</span><span class="dk dk4">✦</span>
              </div>
            </div>
            <div v-else-if="loading" key="loading" class="stage stage-load">
              <div class="spin-ring"></div><p class="load-txt">กำลังสุ่ม...</p>
            </div>
            <div v-else key="result" class="result-area">
              <div class="r-img-wrap">
                <div class="r-ring">
                  <img v-if="result && result.image_url" :src="apiBase+result.image_url" class="r-photo"/>
                  <div v-else class="r-ph">🍜</div>
                </div>
                <span class="r-badge">⭐ แนะนำ</span>
              </div>
              <div class="r-card">
                <h2 class="r-name">{{ result ? result.name : customResult }}</h2>
                <p v-if="result && result.calories" class="r-cal">🔥 {{ result.calories }} kcal / จาน</p>
                <div class="r-tags" v-if="result">
                  <span v-if="result.cuisine_name" class="rt rc">🍚 {{ result.cuisine_name }}</span>
                  <span v-if="result.is_spicy"     class="rt rs">🌶️ เผ็ด</span>
                  <span v-if="result.is_vegan"     class="rt rv">🌿 เจ</span>
                  <span v-if="result.is_halal"     class="rt rh">☪️ ฮาลาล</span>
                </div>
                <div class="r-actions">
                  <router-link v-if="result" :to="'/menu/'+result.id" class="btn-link">ดูเพิ่มเติม →</router-link>
                  <button v-if="result" class="btn-map" @click="findNearby(result.name)">📍 ร้านใกล้ฉัน</button>
                  <button v-if="result" class="btn-flag" @click="showReport=true">⚑ รายงาน</button>
                </div>
              </div>
            </div>
          </transition>

          <p v-if="noResult" class="no-result">ไม่มีเมนูที่ตรงเงื่อนไข <button class="txt-btn" @click="clearFilters">ล้าง filter</button></p>

          <button class="big-spin-btn" :disabled="loading" @click="spin">
            <span class="bsb-icon">🎲</span>
            <div>
              <div class="bsb-main">{{ loading ? 'กำลังสุ่ม...' : result||customResult ? 'ไม่เอาอะ สุ่มใหม่!' : 'อะไรก็ได้' }}</div>
             <!-- <div class="bsb-sub">{{ loading ? '' : 'พร้อมลุยกับเมนูอร่อยๆ' }}</div> -->
            </div>
          </button>
          <button class="restart-btn" @click="resetSession">↺ เริ่มรอบใหม่</button>
        </template>

        <!-- ── MODE 2: สายสุขภาพ ── -->
        <template v-if="mode==='health'">
          <div class="tagline-row">
            <span class="tagline-chip">🥗</span>
            <span class="tagline-text">เลือกเป้าหมายสุขภาพ</span>
          </div>
          <h1 class="hero-title" style="font-size:clamp(2.2rem,6vw,3.6rem)">สายสุขภาพ</h1>

          <!-- disclaimer -->
          <div class="health-disclaimer">
            ⚠️ <strong>ข้อมูลนี้เป็นแนวทางเบื้องต้นเท่านั้น</strong> ไม่ใช่คำแนะนำทางการแพทย์
            ควรปรึกษาแพทย์หรือนักโภชนาการก่อนเปลี่ยนแปลงอาหารของคุณ
          </div>
          <div class="health-goals">
            <button v-for="g in healthGoals" :key="g.id"
              class="goal-btn" :class="{ active: selectedGoal===g.id }"
              @click="selectedGoal=g.id">
              <span>{{ g.icon }}</span><span>{{ g.label }}</span>
            </button>
          </div>
          <button class="big-spin-btn" style="margin-top:8px" :disabled="hLoading||!selectedGoal" @click="spinHealth">
            <span class="bsb-icon">🥗</span>
            <div><div class="bsb-main">{{ hLoading ? 'กำลังหาเมนู...' : 'หาเมนูที่เหมาะกับฉัน' }}</div></div>
          </button>
          <transition name="fade">
            <div v-if="healthResult" class="r-card" style="width:100%;max-width:440px">
              <div class="h-top">
                <div class="h-thumb">
                  <img v-if="healthResult.image_url" :src="apiBase+healthResult.image_url" class="r-photo"/>
                  <div v-else class="r-ph" style="font-size:1.8rem">🥗</div>
                </div>
                <div>
                  <span class="cuisine-pill">{{ healthResult.cuisine_name }}</span>
                  <h2 class="r-name" style="margin-top:6px">{{ healthResult.name }}</h2>
                  <p v-if="healthResult.calories" class="r-cal">🔥 {{ healthResult.calories }} kcal</p>
                </div>
              </div>
              <div class="r-actions" style="margin-top:12px">
                <router-link :to="'/menu/'+healthResult.id" class="btn-link">ดูเพิ่มเติม →</router-link>
                <button class="btn-map" @click="findNearby(healthResult.name)">📍 ร้านใกล้ฉัน</button>
                <button class="btn-map" @click="spinHealth">สุ่มใหม่ 🎲</button>
              </div>
            </div>
          </transition>
          <p v-if="noResult&&mode==='health'" class="no-result">ไม่พบเมนูสำหรับเป้าหมายนี้</p>
        </template>

        <!-- ── MODE 3: เปิดตู้เย็น ── -->
        <template v-if="mode==='fridge'">
          <div class="tagline-row">
            <span class="tagline-chip">🧊</span>
            <span class="tagline-text">มีอะไรในตู้เย็น?</span>
          </div>
          <h1 class="hero-title" style="font-size:clamp(2.2rem,6vw,3.6rem)">เปิดตู้เย็น</h1>
          <div class="fridge-box">
            <div class="ing-row">
              <span v-for="(g,i) in ingredients" :key="i" class="ing-tag">{{ g }}<button class="rm-btn" @click="ingredients.splice(i,1)">✕</button></span>
              <span v-if="!ingredients.length" class="ing-hint">ยังไม่มีวัตถุดิบ...</span>
            </div>
            <div class="fridge-row">
              <input v-model="ingInput" class="fridge-inp" placeholder="เช่น ไข่, หมูสับ, ผักบุ้ง..." @keyup.enter="addIngredient"/>
              <button class="btn-add-ing" @click="addIngredient">+ เพิ่ม</button>
            </div>
          </div>
          <button class="big-spin-btn" style="margin-top:8px" :disabled="fLoading||!ingredients.length" @click="askFridge">
            <span class="bsb-icon">🤖</span>
            <div><div class="bsb-main">{{ fLoading ? 'AI กำลังคิด...' : 'แนะนำเมนูให้หน่อย!' }}</div></div>
          </button>
          <transition name="fade">
            <div v-if="fridgeHtml" class="r-card" style="width:100%;max-width:440px">
              <b style="display:block;margin-bottom:8px;color:#3D2B1F;font-size:.95rem">🍳 เมนูที่ทำได้จากวัตถุดิบของคุณ</b>
              <div class="fridge-content" v-html="fridgeHtml"/>
            </div>
          </transition>
        </template>

      </main>

      <!-- RIGHT: filter -->
      <aside class="col-right" :class="{ open: filterOpen }">
        <div class="col-head-row">
          <span class="col-head">ปรับสเปกหน่อยมั้ย?</span>
          <button v-if="activeFilterCount>0" class="btn-clear-all" @click="clearFilters">↺ ล้างทั้งหมด</button>
        </div>

        <div class="fg">
          <div class="fg-lbl">🍽️ ประเภทอาหาร</div>
          <div class="fpills">
            <button v-for="c in categories" :key="c.key" class="fpill" :class="{ active: selectedCatKey===c.key }" @click="selectCat(c)">{{ c.emoji }} {{ c.name }}</button>
          </div>
        </div>

        <div v-if="cookMethods.length" class="fg">
          <div class="fg-lbl">🍳 วิธีปรุง</div>
          <div class="fpills">
            <button v-for="m in cookMethods" :key="m.id" class="fpill" :class="{ active: filters.cook_method_id===m.id }" @click="toggleFilter('cook_method_id',m.id)">{{ m.name }}</button>
          </div>
        </div>

        <div v-if="meatTypes.length" class="fg">
          <div class="fg-lbl">🥩 เนื้อสัตว์ / โปรตีน</div>
          <div class="fpills">
            <button v-for="m in meatTypes" :key="m.id" class="fpill" :class="{ active: filters.meat_type_id===m.id }" @click="toggleFilter('meat_type_id',m.id)">{{ meatEmoji(m.name) }} {{ m.name }}</button>
          </div>
        </div>

        <div class="fg">
          <div class="fg-lbl">✅ ข้อจำกัด</div>
          <div class="fpills">
            <button class="fpill" :class="{ active: filters.is_vegan }"         @click="filters.is_vegan=!filters.is_vegan">🌿 เจ</button>
            <button class="fpill" :class="{ active: filters.is_halal }"         @click="filters.is_halal=!filters.is_halal">☪️ ฮาลาล</button>
            <button class="fpill" :class="{ active: filters.is_spicy===true }"  @click="toggleSpicy(true)">🌶️ เผ็ด</button>
            <button class="fpill" :class="{ active: filters.is_spicy===false }" @click="toggleSpicy(false)">🧊 ไม่เผ็ด</button>
          </div>
        </div>

        <div class="fg">
          <div class="fg-lbl">🔥 แคลอรี่สูงสุด <strong class="hl">{{ filters.max_calories ? filters.max_calories+' kcal' : 'ไม่จำกัด' }}</strong></div>
          <input type="range" class="cal-range" min="100" max="1000" step="50"
            :value="filters.max_calories||1000"
            @input="e=>filters.max_calories=+e.target.value===1000?null:+e.target.value"/>
          <div class="cal-marks"><span>100</span><span>1,000+</span></div>
        </div>
      </aside>
    </div>

    <!-- footer -->
    <footer class="footer">
      <svg class="footer-wave" viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,40 C300,80 600,10 900,50 C1100,75 1300,20 1440,45 L1440,80 L0,80 Z" fill="#F5C518" opacity=".45"/>
        <path d="M0,60 C400,20 800,70 1200,45 C1320,38 1400,55 1440,60 L1440,80 L0,80 Z" fill="#F5C518" opacity=".75"/>
      </svg>
      <p class="footer-txt">พัฒนาโดยคนหิวเหมือนกัน 🧡</p>
    </footer>

    <!-- FAB: mobile filter -->
    <button class="fab" @click="filterOpen=!filterOpen" :class="{'fab-on':activeFilterCount>0}">
      <span class="fab-icon"><i class="bi bi-sliders2-vertical"></i></span>
      <span class="fab-label">{{ filterOpen ? 'ปิด' : 'filter' }}</span>
      <span v-if="activeFilterCount>0" class="fab-dot">{{ activeFilterCount }}</span>
    </button>

    <!-- REPORT MODAL -->
    <transition name="fade">
      <div v-if="showReport" class="modal-bg" @click.self="showReport=false">
        <div class="modal-box">
          <h5 class="modal-title">⚑ รายงานข้อมูลที่ไม่ถูกต้อง</h5>
          <div class="report-opts">
            <label v-for="r in reportReasons" :key="r.value" class="r-opt"><input type="radio" v-model="reportForm.reason" :value="r.value"/> {{ r.label }}</label>
          </div>
          <textarea v-model="reportForm.detail" class="r-textarea" rows="2" placeholder="รายละเอียดเพิ่มเติม..."/>
          <div style="display:flex;gap:10px;align-items:center">
            <button class="big-spin-btn" style="padding:10px 24px;font-size:.9rem" @click="submitReport">ส่ง</button>
            <button class="txt-btn" @click="showReport=false">ยกเลิก</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700;800;900&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

/* PAGE */
.page {
  min-height: 100vh;
  background: #FFF8EE;
  font-family: 'Noto Sans Thai', 'Sarabun', sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* HEADER */
.header {
  background: #FFFFFF;
  border-bottom: 1.5px solid #EDE0CC;
  padding: 11px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(61,43,0,.06);
}
.header-left { display: flex; align-items: center; gap: 10px; }
.logo-icon { font-size: 1.9rem; }
.logo-main {
  font-size: 1.55rem;
  font-weight: 900;
  background: linear-gradient(135deg, #E8600A 0%, #F5A800 55%, #FFD700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  line-height: 1;
}
.logo-bubble {
  font-size: .7rem;
  color: #9A7A50;
  background: #FFF5DC;
  border-radius: 999px;
  padding: 2px 9px;
  width: fit-content;
  margin-top: 2px;
  border: 1px solid #EDE0CC;
}
.header-nav { display: flex; gap: 8px; }
.nav-pill {
  padding: 7px 16px;
  border-radius: 999px;
  font-family: inherit;
  font-size: .84rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all .18s;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid #EDE0CC;
  color: #4A3300;
  background: #FFFFFF;
}
.nav-pill:hover { border-color: #F0622A; color: #F0622A; background: #FFF5F0; }
.nav-primary { background: #F0622A; color: white; border-color: #F0622A; }
.nav-primary:hover { background: #D4511E; border-color: #D4511E; color: white; }

/* GRID */
.main-grid {
  display: grid;
  grid-template-columns: 230px 1fr 285px;
  flex: 1;
  min-height: 0;
  height: calc(100vh - 58px);
}

/* ──────────── LEFT ──────────── */
.col-left {
  background: #FFFFFF;
  border-right: 1.5px solid #EDE0CC;
  padding: 18px 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}
.col-head-label {
  font-size: .75rem;
  font-weight: 800;
  color: #6B4A10;
  letter-spacing: 1px;
  text-transform: uppercase;
  background: #FFCC00;
  border-radius: 8px;
  padding: 5px 12px;
  display: inline-block;
  width: fit-content;
}
.mode-list { display: flex; flex-direction: column; gap: 8px; }
.mode-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1.5px solid #EDE0CC;
  background: #FFFFFF;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all .2s;
}
.mode-card:hover {
  border-color: #F0622A;
  background: #FFF8F4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(240,98,42,.12);
}
.mode-card.active {
  border-color: #FFCC00;
  background: #FFCC00;
  box-shadow: 0 4px 16px rgba(255,204,0,.35);
}
.mode-card.active .mc-name { color: #3D2800; }
.mode-card.active .mc-sub  { color: #6B4A10; }
.mc-icon  { font-size: 2rem; flex-shrink: 0; }
.mc-name  { font-weight: 800; font-size: .92rem; color: #3D2800; }
.mc-sub   { font-size: .72rem; color: #9A7A60; margin-top: 2px; }

/* Left Stats */
.left-stats {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #FFF8EE 0%, #FFF3DC 100%);
  border: 1.5px solid #EDE0CC;
  border-radius: 12px;
  padding: 12px 10px;
  gap: 0;
}
.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.stat-num {
  font-size: 1.3rem;
  font-weight: 900;
  color: #F0622A;
  line-height: 1;
}
.stat-lbl {
  font-size: .68rem;
  color: #9A7A60;
  font-weight: 600;
  text-align: center;
}
.stat-divider {
  width: 1px;
  height: 32px;
  background: #EDE0CC;
  margin: 0 4px;
}

/* Left Tip */
.left-tip {
  background: #FFFBF0;
  border: 1.5px solid #F5E8C0;
  border-radius: 12px;
  padding: 12px 13px;
  border-left: 3px solid #FFCC00;
}
.tip-title {
  font-size: .72rem;
  font-weight: 800;
  color: #C88A00;
  margin-bottom: 5px;
  letter-spacing: .5px;
}
.tip-text {
  font-size: .78rem;
  color: #6B4A20;
  line-height: 1.55;
}

/* Left Quick Links */
.left-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: auto;
}
.left-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 10px;
  border: 1.5px solid #EDE0CC;
  background: #FAFAFA;
  color: #6B4A20;
  text-decoration: none;
  font-size: .82rem;
  font-weight: 600;
  transition: all .18s;
}
.left-link:hover {
  border-color: #F0622A;
  background: #FFF5F0;
  color: #F0622A;
}
.ll-icon { font-size: 1rem; }
.ll-arrow { margin-left: auto; font-size: 1rem; color: #C8B090; }
.left-link:hover .ll-arrow { color: #F0622A; }

/* ──────────── CENTER ──────────── */
.col-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 32px 48px;
  overflow-y: auto;
  gap: 24px;
  background: radial-gradient(ellipse 70% 60% at 50% 30%, #FFF5DC 0%, #FFF8EE 65%, #FFF3E0 100%);
}

.tagline-row { display: flex; align-items: center; gap: 10px; }
.tagline-chip {
  background: #FFCC00;
  color: #3D2800;
  border-radius: 999px;
  padding: 5px 18px;
  font-weight: 800;
  font-size: .9rem;
  box-shadow: 0 2px 8px rgba(255,204,0,.4);
}
.tagline-text { color: #9A7A60; font-size: .9rem; font-weight: 600; }

.hero-title {
  font-size: clamp(3rem, 7vw, 4.8rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
  background: linear-gradient(170deg, #E85C00 0%, #F5A800 40%, #FFCC00 70%, #FFE566 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(2px 3px 0 rgba(61,43,0,.12));
  margin-bottom: 8px;
}

/* Stage */
.stage {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
  position: relative;
}
.stage::before {
  content: '';
  position: absolute;
  width: 380px; height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,204,0,.18) 0%, transparent 70%);
  pointer-events: none;
}
.stage-load { flex-direction: column; gap: 12px; min-height: 320px; }
.cloche-wrap { position: relative; display: inline-block; }
.cloche-img {
  width: 300px;
  display: block;
  object-fit: contain;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 16px 28px rgba(61,43,0,.12));
}
.cloche-fb { font-size: 9rem; animation: float 3s ease-in-out infinite; display: block; text-align: center; }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
.dk { position: absolute; color: #F5C518; font-size: 1.2rem; animation: sparkle 2.5s ease-in-out infinite; }
.dk1 { top:8%;   left:-8%;  animation-delay:0s; }
.dk2 { top:4%;   right:0%;  animation-delay:.6s; }
.dk3 { bottom:14%; left:0%; font-size:.9rem; animation-delay:1.1s; }
.dk4 { bottom:10%; right:-6%; font-size:.9rem; animation-delay:.8s; }
@keyframes sparkle { 0%,100%{opacity:.25;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
.spin-ring {
  width: 52px; height: 52px;
  border: 4px solid #F5EDD6;
  border-top-color: #F0622A;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to{transform:rotate(360deg)} }
.load-txt { color: #9A7A60; font-size: .95rem; font-weight: 600; }

/* Result */
.result-area {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
  width: 100%;
  max-width: 680px;
  animation: pop .45s cubic-bezier(.34,1.56,.64,1);
}
@keyframes pop { from{opacity:0;transform:scale(.92) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
.r-img-wrap { position: relative; flex-shrink: 0; }
.r-ring {
  width: 210px; height: 210px;
  border-radius: 50%; overflow: hidden;
  border: 5px solid #FFFFFF;
  box-shadow: 0 0 0 4px #FFCC00, 0 8px 28px rgba(61,43,0,.14);
}
.r-photo { width: 100%; height: 100%; object-fit: cover; }
.r-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4rem; background: #FFF5DC; }
.r-badge {
  position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
  background: #F0622A; color: white; border-radius: 999px;
  padding: 4px 14px; font-size: .74rem; font-weight: 700; white-space: nowrap;
  box-shadow: 0 3px 10px rgba(240,98,42,.38);
}
.r-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px 26px;
  box-shadow: 0 2px 16px rgba(61,43,0,.08);
  flex: 1;
  border: 1.5px solid #EDE0CC;
}
.r-name  { font-size: clamp(1.25rem,3vw,1.7rem); font-weight: 900; color: #3D2800; margin-bottom: 4px; line-height: 1.25; }
.r-cal   { color: #9A7A60; font-size: .84rem; margin-bottom: 8px; font-weight: 500; }
.r-tags  { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.rt      { display: inline-flex; align-items: center; gap: 3px; padding: 3px 10px; border-radius: 999px; font-size: .76rem; font-weight: 600; }
.rc { background: #FFF5DC; color: #7A5A20; border: 1px solid #EDE0CC; }
.rs { background: #FFF0ED; color: #C03000; border: 1px solid #FFCEC0; }
.rv { background: #EDFBEE; color: #1B6B24; border: 1px solid #B8EAC0; }
.rh { background: #EEF4FF; color: #1A4DA8; border: 1px solid #C0D4FF; }
.ai-box {
  background: #FFFBF0;
  border-left: 3px solid #FFCC00;
  border-radius: 10px;
  padding: 9px 13px;
  font-size: .84rem; color: #3D2800; line-height: 1.6; margin-bottom: 10px;
}
.ai-box.ai-wait { color: #9A7A60; font-style: italic; }
.ai-box.ai-green { border-color: #4CAF50; background: #F1FBF2; }
.ai-lbl { font-size: .7rem; color: #C88A00; display: block; margin-bottom: 3px; font-weight: 800; letter-spacing: .5px; }
.r-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.btn-link {
  color: #3D2800; font-size: .82rem; font-weight: 700;
  text-decoration: none; border-bottom: 2px solid #FFCC00; padding-bottom: 1px; transition: all .18s;
}
.btn-link:hover { color: #F0622A; border-color: #F0622A; }
.btn-map {
  background: #FFFFFF; border: 1.5px solid #EDE0CC; border-radius: 999px;
  padding: 5px 12px; font-size: .78rem; color: #6B4A20; cursor: pointer;
  font-family: inherit; transition: all .18s; font-weight: 600;
}
.btn-map:hover { border-color: #F0622A; color: #F0622A; background: #FFF5F0; }
.btn-flag { background: none; border: none; color: #C8B090; cursor: pointer; font-size: .82rem; font-family: inherit; transition: color .18s; }
.btn-flag:hover { color: #F0622A; }

/* Big Spin Button */
.big-spin-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #F0622A 0%, #FF8244 100%);
  color: white;
  border: none;
  border-radius: 999px;
  padding: 17px 48px;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 6px 24px rgba(240,98,42,.42), 0 2px 6px rgba(0,0,0,.08);
  transition: all .2s;
}
.big-spin-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #D4511E 0%, #F0622A 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(240,98,42,.5), 0 4px 10px rgba(0,0,0,.1);
}
.big-spin-btn:active:not(:disabled) { transform: translateY(0); box-shadow: 0 4px 12px rgba(240,98,42,.3); }
.big-spin-btn:disabled { opacity: .6; cursor: not-allowed; }
.bsb-icon { font-size: 1.6rem; }
.bsb-main { font-size: 1.05rem; font-weight: 800; text-align: left; }
.bsb-sub  { font-size: .75rem; opacity: .88; margin-top: 1px; }
.restart-btn {
  background: none; border: none; color: #B0906A; font-family: inherit;
  font-size: .82rem; cursor: pointer; text-decoration: underline; transition: color .18s;
}
.restart-btn:hover { color: #F0622A; }
.no-result { color: #9A7A60; font-size: .88rem; }
.txt-btn { background: none; border: none; color: #F0622A; font-size: .88rem; cursor: pointer; text-decoration: underline; font-family: inherit; font-weight: 700; }


.health-inst-title { font-weight: 800; color: #3D2800; font-size: .88rem; margin-bottom: 8px; }
.health-inst-list {
  padding-left: 18px; display: flex; flex-direction: column; gap: 4px;
}
.health-inst-list li { font-size: .84rem; color: #6B4800; line-height: 1.5; }
.health-disclaimer {
  background: #FFF5F5; border: 1.5px solid #EF9A9A;
  border-radius: 14px; padding: 12px 16px;
  font-size: .82rem; color: #7A2020; line-height: 1.6;
  width: 100%; max-width: 440px;
}
.health-disclaimer strong { color: #C62828; }
.health-goals { display: grid; grid-template-columns: repeat(auto-fill,minmax(130px,1fr)); gap: 8px; width: 100%; max-width: 440px; }
.goal-btn {
  display: flex; align-items: center; gap: 8px; padding: 11px 13px; border-radius: 14px;
  border: 1.5px solid #EDE0CC; background: #FFFFFF; cursor: pointer; font-family: inherit;
  transition: all .18s; font-size: .82rem; font-weight: 700; color: #3D2800;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.goal-btn:hover { border-color: #F0622A; background: #FFF8F4; transform: translateY(-1px); }
.goal-btn.active { border-color: #FFCC00; background: #FFCC00; }
.goal-btn span:first-child { font-size: 1.3rem; }
.h-top { display: flex; gap: 14px; align-items: center; margin-bottom: 12px; }
.h-thumb { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid #FFFFFF; box-shadow: 0 0 0 3px #FFCC00; flex-shrink: 0; }
.cuisine-pill { background: #F0622A; color: white; border-radius: 999px; padding: 3px 10px; font-size: .74rem; font-weight: 700; }

/* Fridge */
.fridge-box {
  background: #FFFFFF; border-radius: 16px; padding: 16px; width: 100%; max-width: 440px;
  box-shadow: 0 2px 12px rgba(61,43,0,.08); display: flex; flex-direction: column; gap: 10px;
  border: 1.5px solid #EDE0CC;
}
.ing-row { display: flex; flex-wrap: wrap; gap: 6px; min-height: 28px; align-items: center; }
.ing-tag {
  background: #FFF5DC; color: #3D2800; border-radius: 999px;
  padding: 4px 11px; font-size: .82rem; font-weight: 600;
  display: flex; align-items: center; gap: 4px; border: 1px solid #EDE0CC;
}
.ing-hint { color: #C8B090; font-size: .85rem; }
.fridge-row { display: flex; gap: 8px; }
.fridge-inp {
  flex: 1; border: 1.5px solid #EDE0CC; border-radius: 10px;
  padding: 8px 12px; font-size: .88rem; font-family: inherit; outline: none; background: #FAFAFA;
  transition: border-color .18s;
}
.fridge-inp:focus { border-color: #F0622A; }
.btn-add-ing {
  background: #3D2800; color: white; border: none; border-radius: 10px;
  padding: 8px 16px; font-family: inherit; font-weight: 700; cursor: pointer; font-size: .85rem;
  transition: background .18s;
}
.btn-add-ing:hover { background: #6B4A20; }
.fridge-content { font-size: .88rem; color: #3D2800; line-height: 1.75; }

/* ──────────── RIGHT ──────────── */
.col-right {
  background: #FFFFFF;
  border-left: 1.5px solid #EDE0CC;
  padding: 18px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.col-head-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.col-head {
  font-size: .88rem; font-weight: 800; color: #3D2800;
  display: flex; align-items: center; gap: 6px;
}
.col-head::before {
  content: '';
  display: inline-block;
  width: 4px; height: 18px;
  background: #FFCC00;
  border-radius: 2px;
  margin-right: 2px;
}
.btn-clear-all {
  background: none; border: none; color: #B0906A; font-size: .78rem;
  cursor: pointer; font-family: inherit; font-weight: 600; transition: color .18s;
  display: flex; align-items: center; gap: 3px;
}
.btn-clear-all:hover { color: #F0622A; }
.fg { display: flex; flex-direction: column; gap: 8px; padding: 11px 0; border-bottom: 1px solid #F0E8D8; }
.fg:last-child { border-bottom: none; }
.fg-lbl { font-size: .78rem; font-weight: 700; color: #6B4A20; display: flex; align-items: center; gap: 5px; }
.hl { color: #F0622A; font-weight: 700; font-size: .78rem; }
.fpills { display: flex; flex-wrap: wrap; gap: 5px; }
.fpill {
  padding: 5px 12px; border-radius: 999px;
  border: 1.5px solid #EDE0CC;
  color: #6B4A20; background: #FAFAFA;
  font-size: .76rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all .15s; white-space: nowrap;
}
.fpill:hover { border-color: #F0622A; color: #F0622A; background: #FFF5F0; }
.fpill.active {
  background: #FFCC00; border-color: #FFCC00; color: #3D2800; font-weight: 700;
  box-shadow: 0 2px 8px rgba(255,204,0,.35);
}
.avoid-tag { background: #FFF0ED; border-color: #FFCEC0; color: #C03000; cursor: default; }
.cal-range { width: 100%; accent-color: #F0622A; cursor: pointer; margin: 4px 0; }
.cal-marks { display: flex; justify-content: space-between; font-size: .68rem; color: #B0906A; }
.custom-row { display: flex; gap: 6px; }
.custom-inp {
  flex: 1; border: 1.5px solid #EDE0CC; border-radius: 999px;
  padding: 7px 14px; font-size: .82rem; font-family: inherit; outline: none;
  background: #FFF8EE; transition: border-color .18s; color: #6B4A20;
}
.custom-inp:focus { border-color: #F0622A; }
.btn-add-sm {
  background: #F0622A; color: white; border: none; border-radius: 50%;
  width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer; flex-shrink: 0;
  font-weight: 700; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(240,98,42,.32); transition: background .18s;
}
.btn-add-sm:hover { background: #D4511E; }
.rm-btn { background: none; border: none; cursor: pointer; font-size: .68rem; color: #B0906A; margin-left: 2px; }

/* Footer */
.footer { position: relative; height: 80px; margin-top: auto; overflow: hidden; background: #FFF8EE; }
.footer-wave { position: absolute; bottom: 0; width: 100%; height: 80px; }
.footer-txt {
  position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
  white-space: nowrap; font-size: .82rem; color: #9A7A60; font-weight: 500;
}

/* FAB */
.fab { display: none; }

/* Modal */
.modal-bg { position: fixed; inset: 0; background: rgba(30,15,0,.45); display: flex; align-items: center; justify-content: center; z-index: 500; }
.modal-box {
  background: #FFFFFF; border-radius: 20px; padding: 28px;
  width: 90%; max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  border: 1.5px solid #EDE0CC;
}
.modal-title { font-weight: 800; color: #3D2800; margin-bottom: 14px; font-size: .95rem; }
.report-opts { display: flex; flex-direction: column; gap: 9px; margin-bottom: 12px; }
.r-opt { display: flex; gap: 8px; cursor: pointer; align-items: center; font-size: .9rem; color: #6B4A20; }
.r-textarea {
  width: 100%; border: 1.5px solid #EDE0CC; border-radius: 10px;
  padding: 9px 13px; font-family: inherit; font-size: .88rem; resize: none; outline: none;
  margin-bottom: 14px; color: #3D2800; background: #FFF8EE; transition: border-color .18s;
}
.r-textarea:focus { border-color: #F0622A; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity .28s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* RESPONSIVE */
@media(max-width:960px) {
  .main-grid { grid-template-columns: 210px 1fr; height: auto; }
  .col-right {
    position: fixed; top: 0; right: 0; bottom: 0; width: 285px; z-index: 200;
    transform: translateX(100%); transition: transform .3s ease;
    box-shadow: -6px 0 30px rgba(61,43,0,.1);
  }
  .col-right.open { transform: translateX(0); }
  .fab {
    display: flex; align-items: center; gap: 6px;
    position: fixed; bottom: 20px; right: 20px; z-index: 300;
    background: #3D2800; color: #FFFFFF; border: none; border-radius: 999px;
    padding: 12px 20px; font-family: inherit; font-size: .88rem; font-weight: 700;
    cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,.18); transition: all .2s;
  }
  .fab.fab-on { background: #F0622A; }
  .fab-dot {
    background: #FFCC00; color: #3D2800; border-radius: 50%;
    width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
    font-size: .72rem; font-weight: 800;
  }
}
@media(max-width:640px) {
  /* ── HEADER ── */
  .header {
    padding: 10px 16px;
    padding-right: 64px;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .logo-main { font-size: 1.25rem; }
  .logo-bubble { display: none; }
  .header-nav { display: none; }

  /* ── GRID ── */
  .main-grid { grid-template-columns: 1fr; height: auto; }

  /* ── MODE TAB BAR ── */
  .col-left {
    flex-direction: column;
    padding: 0;
    border-right: none;
    border-bottom: none;
    background: transparent;
    overflow-x: visible;
    gap: 0;
  }
  .col-head-label { display: none; }
  .mode-list {
    flex-direction: row;
    gap: 0;
    flex-wrap: nowrap;
    width: 100%;
    background: #FFFFFF;
    border-bottom: 2px solid #EDE0CC;
  }
  .mode-card {
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 10px 4px 9px;
    border-radius: 0;
    border: none;
    border-bottom: 3px solid transparent;
    background: transparent;
    box-shadow: none;
    min-width: 0;
    white-space: nowrap;
    flex-shrink: 0;
    color: #9A7A60;
    transition: all .2s;
    margin-bottom: -2px;
  }
  .mode-card:hover {
    background: #FFF8F4;
    transform: none;
    box-shadow: none;
    border-color: transparent;
    border-bottom-color: #F0622A;
  }
  .mode-card.active {
    background: transparent;
    border-color: transparent;
    border-bottom-color: #F0622A;
    box-shadow: none;
    color: #F0622A;
  }
  .mode-card.active .mc-name { color: #F0622A; }
  .mode-card.active .mc-icon { filter: none; }
  .mc-icon { font-size: 1.3rem; line-height: 1; }
  .mc-name { font-size: .7rem; font-weight: 700; color: inherit; line-height: 1; }
  .mc-sub { display: none; }
  .left-stats, .left-tip, .left-links { display: none; }

  /* ── CENTER ── */
  .col-center {
    padding: 20px 16px 120px;
    gap: 16px;
    background: radial-gradient(ellipse 90% 50% at 50% 20%, #FFF5DC 0%, #FFF8EE 100%);
    min-height: calc(100vh - 120px);
  }

  /* ── HERO ── */
  .tagline-row { justify-content: center; }
  .tagline-chip { padding: 4px 16px; font-size: .85rem; }
  .tagline-text { font-size: .85rem; }
  .hero-title {
    font-size: clamp(2.6rem, 12vw, 3.5rem);
    text-align: center;
    margin-bottom: 0;
    letter-spacing: -1.5px;
  }

  /* ── CLOCHE STAGE ── */
  .stage { min-height: 220px; }
  .stage::before { width: 260px; height: 260px; }
  .cloche-img { width: 180px; }
  .cloche-fb { font-size: 7rem; }

  /* ── RESULT ── */
  .result-area {
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 100%;
    width: 100%;
  }
  .r-ring { width: 150px; height: 150px; }
  .r-badge { font-size: .7rem; padding: 3px 12px; }
  .r-card {
    width: 100%;
    padding: 18px 16px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(61,43,0,.1);
  }
  .r-name { font-size: 1.35rem; }
  .r-actions {
    gap: 8px;
    margin-top: 14px;
  }
  .btn-map, .btn-link {
    font-size: .8rem;
    padding: 7px 14px;
  }

  /* ── SPIN BUTTON ── */
  .big-spin-btn {
    width: 100%;
    justify-content: center;
    padding: 18px 28px;
    border-radius: 18px;
    box-shadow: 0 8px 28px rgba(240,98,42,.45);
    gap: 10px;
  }
  .bsb-icon { font-size: 1.5rem; }
  .bsb-main { font-size: 1rem; text-align: center; }
  .restart-btn { display: block; width: 100%; text-align: center; padding: 6px 0; }

  /* ── HEALTH GOALS ── */
  .health-disclaimer { max-width: 100%; font-size: .8rem; padding: 10px 13px; }
  .health-goals {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: 100%;
    max-width: 100%;
  }
  .goal-btn {
    padding: 13px 12px;
    border-radius: 16px;
    font-size: .83rem;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    min-height: 68px;
  }
  .goal-btn span:first-child { font-size: 1.6rem; }

  /* ── FRIDGE ── */
  .fridge-box {
    max-width: 100%;
    border-radius: 18px;
    padding: 14px;
  }
  .fridge-inp { font-size: .9rem; padding: 10px 14px; border-radius: 12px; }
  .btn-add-ing { padding: 10px 18px; border-radius: 12px; }
  .ing-tag { font-size: .84rem; padding: 5px 12px; }

  /* ── FAB: filter button ── */
  .fab {
    display: flex;
    position: fixed;
    bottom: 24px;
    right: 16px;
    top: unset;
    left: unset;
    z-index: 400;
    width: auto;
    height: 48px;
    border-radius: 999px;
    padding: 0 20px;
    gap: 8px;
    justify-content: center;
    align-items: center;
    font-size: .88rem;
    font-weight: 700;
    box-shadow: 0 4px 20px rgba(0,0,0,.22);
    background: #3D2800;
  }
  .fab-label { display: block; font-size: .82rem; }
  .fab-icon { font-size: 1rem; }
  .fab.fab-on { background: #F0622A; }
  .fab-dot {
    position: absolute;
    top: -5px; right: -5px;
    width: 18px; height: 18px;
    font-size: .65rem;
    background: #FFCC00;
    color: #3D2800;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800;
  }

  /* ── FILTER PANEL (RIGHT) ── */
  .col-right {
    top: 0; bottom: 0;
    width: 100%;
    max-width: 320px;
  }
  .col-right.open { box-shadow: -8px 0 40px rgba(61,43,0,.15); }

  /* ── MODAL ── */
  .modal-box {
    width: 94%;
    padding: 22px 18px;
    border-radius: 24px;
  }

  /* ── FOOTER ── */
  .footer { height: 64px; }
  .footer-txt { font-size: .78rem; }

  /* ── HEALTH RESULT ── */
  .h-top { align-items: flex-start; }
  .h-thumb { width: 68px; height: 68px; }

  /* ── NO RESULT ── */
  .no-result { text-align: center; font-size: .85rem; }
}
</style>

<script>
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const API = process.env.VUE_APP_API_URL || 'http://localhost:3000'




const TIPS = [
  'กดปุ่มสุ่มซ้ำๆ ได้เลย ระบบจำไว้ว่าเคยเห็นอะไรไปแล้ว',
  'ใช้ filter ด้านขวาเพื่อกรองตามโรคหรือข้อจำกัดด้านอาหาร',
  'โหมด "เปิดตู้เย็น" ให้ AI แนะนำจากวัตถุดิบที่มี',
  'กด "เริ่มรอบใหม่" เมื่ออยากสุ่มตัวเลือกใหม่ทั้งหมด',
  'กรอง "ฮาลาล" หรือ "เจ" เพื่อเมนูที่เหมาะกับคุณ',
]

export default {
  name: 'HomePage',
  data() {
    let sid = sessionStorage.getItem('spinSessionId')
    if (!sid) { sid = uuidv4(); sessionStorage.setItem('spinSessionId', sid) }
    const sc = parseInt(sessionStorage.getItem('spinCount')||'0')
    return {
      apiBase: API, sessionId: sid, filterOpen: false,
      spinCount: sc,
      currentTip: TIPS[Math.floor(Math.random()*TIPS.length)],
      mode: 'random',
      modes: [
        { key:'random', icon:'🎲', label:'ตามใจเธอ',    sub:'ไม่คิดเยอะ เอาที่อร่อย' },
        { key:'health', icon:'🥗', label:'สายสุขภาพ',   sub:'เลือกตามเป้าหมายของคุณ' },
        { key:'fridge', icon:'🧊', label:'เปิดตู้เย็น', sub:'มีอะไร? AI ช่วยแนะนำ' },
      ],
      cookMethods:[], meatTypes:[], healthTags:[],
      categories:[
        {key:'all',  cuisine_id:null,name:'ทั้งหมด',emoji:'☰' },
        {key:'thai', cuisine_id:1,   name:'ไทย',    emoji:'🇹🇭'},
        {key:'isaan',cuisine_id:8,   name:'อีสาน',  emoji:'🌶️'},
        {key:'north',cuisine_id:9,   name:'เหนือ',  emoji:'🫕'},
        {key:'south',cuisine_id:10,  name:'ใต้',    emoji:'🌴'},
        {key:'japan',cuisine_id:2,   name:'ญี่ปุ่น',emoji:'🍱'},
        {key:'korea',cuisine_id:3,   name:'เกาหลี', emoji:'🥘'},
        {key:'china',cuisine_id:4,   name:'จีน',    emoji:'🥟'},
        {key:'india',cuisine_id:5,   name:'อินเดีย',emoji:'🍛'},
        {key:'west', cuisine_id:6,   name:'ฝรั่ง',  emoji:'🍔'},
        {key:'italy',cuisine_id:7,   name:'อิตาลี', emoji:'🍝'},
      ],
      selectedCatKey:'all',
      filters:{cuisine_id:null,is_spicy:null,is_vegan:false,is_halal:false,max_calories:null,cook_method_id:null,meat_type_id:null},
      avoidInput:'', avoidList:[],
      result:null, customResult:null, loading:false, noResult:false,
      healthGoals:[], selectedGoal:null, healthResult:null, hLoading:false,
      ingredients:[], ingInput:'', fLoading:false, fridgeHtml:'',
      showReport:false, reportForm:{reason:'wrong_calories',detail:''},
      reportReasons:[
        {value:'wrong_calories',label:'🔢 แคลอรี่ผิด'},
        {value:'wrong_image',   label:'🖼️ รูปไม่ตรง'},
        {value:'wrong_health_tag',label:'⚕️ tag โรคผิด'},
        {value:'other',         label:'📝 อื่นๆ'},
      ],
    }
  },
  computed: {
    activeFilterCount() {
      const f=this.filters
      return [f.cuisine_id,f.is_spicy!==null?1:null,f.is_vegan||null,
        f.is_halal||null,f.max_calories,f.cook_method_id,f.meat_type_id].filter(Boolean).length + this.avoidList.length
    },
  },
  async created() {
    try {
      const [cm,mt,ht]=await Promise.all([
        axios.get(`${API}/api/cook-methods`),
        axios.get(`${API}/api/meat-types`),
        axios.get(`${API}/api/health-tags`),
      ])
      this.cookMethods=cm.data.data||[]
      this.meatTypes  =mt.data.data||[]
      this.healthTags =ht.data.data||[]
      this.healthGoals=[
        {id:'low_cal', icon:'⚖️', label:'ลดน้ำหนัก',            tag_id:3, max_cal:350},
        ...this.healthTags.map(t=>({
          id:t.id, icon:'⚕️',
          label:t.label.replace('เหมาะกับผู้ป่วย','').replace('เหมาะกับ',''),
          tag_id:t.id, max_cal:null
        }))
      ]
    } catch(e){console.error(e)}
  },
  methods: {
    switchMode(m) {
      if (this.loading || this.hLoading || this.fLoading) {
        alert('กรุณารอระบบประมวลผลซักครู่ค่ะ');
        return;
      }
      this.mode = m;
      this.result = null;
      this.customResult = null;
      this.noResult = false;
      this.healthResult = null;
      this.fridgeHtml = '';
    },
    selectCat(c){this.selectedCatKey=c.key;this.filters.cuisine_id=c.cuisine_id},
    toggleFilter(k,v){this.filters[k]=this.filters[k]===v?null:v},
    toggleSpicy(v){this.filters.is_spicy=this.filters.is_spicy===v?null:v},
    clearFilters(){this.filters={cuisine_id:null,is_spicy:null,is_vegan:false,is_halal:false,max_calories:null,cook_method_id:null,meat_type_id:null};this.selectedCatKey='all';this.avoidList=[]},
    addAvoid(){const n=this.avoidInput.trim();if(!n||this.avoidList.includes(n))return;this.avoidList.push(n);this.avoidInput=''},
    buildParams(){
      const p={session_id:this.sessionId}
      if(this.filters.cuisine_id)      p.cuisine_id    =this.filters.cuisine_id
      if(this.filters.is_spicy!==null) p.is_spicy      =this.filters.is_spicy
      if(this.filters.is_vegan)        p.is_vegan      =true
      if(this.filters.is_halal)        p.is_halal      =true
      if(this.filters.max_calories)    p.max_calories  =this.filters.max_calories
      if(this.filters.cook_method_id)  p.cook_method_id=this.filters.cook_method_id
      if(this.filters.meat_type_id)    p.meat_type_id  =this.filters.meat_type_id
      return p
    },
    async spin(){
      this.loading=true;this.noResult=false;this.result=null;this.customResult=null;this.aiComment=''
      try{
        const{data}=await axios.get(`${API}/api/menus/spin`,{params:this.buildParams()})
        if(data.success){
          this.result=data.data
          this.spinCount++
          sessionStorage.setItem('spinCount', this.spinCount)
          this.currentTip=TIPS[Math.floor(Math.random()*TIPS.length)]
        } else{
          await axios.delete(`${API}/api/history/${this.sessionId}`)
          const r2=await axios.get(`${API}/api/menus/spin`,{params:this.buildParams()})
          if(r2.data.success){this.result=r2.data.data}else this.noResult=true
        }
      }catch(e){console.error(e);this.noResult=true}finally{this.loading=false}
    },
    async spinHealth(){
      this.hLoading=true;this.noResult=false;this.healthResult=null
      const goal=this.healthGoals.find(g=>g.id===this.selectedGoal)
      try{
        const sid=this.sessionId+'_h';const params={session_id:sid}
        if(goal&&goal.tag_id)  params.health_tag_id=goal.tag_id
        if(goal&&goal.max_cal) params.max_calories =goal.max_cal
        const{data}=await axios.get(`${API}/api/menus/spin`,{params})
        if(data.success){this.healthResult=data.data}
        else{
          await axios.delete(`${API}/api/history/${sid}`)
          const r2=await axios.get(`${API}/api/menus/spin`,{params})
          if(r2.data.success){this.healthResult=r2.data.data}else this.noResult=true
        }
      }catch(e){console.error(e);this.noResult=true}finally{this.hLoading=false}
    },
    addIngredient(){const n=this.ingInput.trim();if(!n)return;this.ingredients.push(n);this.ingInput=''},
    async askFridge(){
      if(!this.ingredients.length || this.fLoading) return
      this.fLoading=true
      this.fridgeHtml=''
      try{
        const { data } = await axios.post(`${API}/api/ai/fridge`, {
          ingredients: this.ingredients
        })
        if (data.success && data.text) {
          this.fridgeHtml = data.text
            .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
            .replace(/\n/g,'<br>')
        } else {
          this.fridgeHtml = 'ไม่สามารถแนะนำเมนูได้ในขณะนี้ กรุณาลองใหม่อีกครั้งค่ะ'
        }
      }catch(e){
        console.error(e)
        const status = e.response?.status
        if (status === 429) {
          this.fridgeHtml = 'ขออภัยค่ะ AI ถูกใช้งานหนักชั่วคราว กรุณาลองใหม่อีกครั้งใน 1 นาทีนะคะ 🙏'
        } else {
          this.fridgeHtml = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้งค่ะ'
        }
      }finally{
        this.fLoading=false
      }
    },
    // แก้ไขโครงสร้าง String จากเลข 0 เป็น ${} ให้ถูกต้องเรียบร้อยแล้วค่ะ
    findNearby(name){
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('ร้าน' + name + 'ใกล้ฉัน')}`, '_blank')
    },
    async resetSession(){
      try{await axios.delete(`${API}/api/history/${this.sessionId}`)}catch(e){console.error(e)}
      this.result=null;this.customResult=null;this.noResult=false
    },
    async submitReport(){
      if(!this.result)return
      try{
        await axios.post(`${API}/api/reports`,{menu_id:this.result.id,session_id:this.sessionId,reason:this.reportForm.reason,detail:this.reportForm.detail})
        alert('ส่ง report แล้ว ขอบคุณค่ะ 🙏');this.showReport=false
      }catch(e){console.error(e);alert('เกิดข้อผิดพลาด')}
    },
    meatEmoji(n){return{ไก่:'🐔',หมู:'🐷',เนื้อวัว:'🐄',กุ้ง:'🦐',ปลา:'🐟',ทะเลรวม:'🦑',ไข่:'🥚',เต้าหู้:'🟡','ไม่มีเนื้อ':'🌱'}[n]||'🥩'},
  }
}
</script>