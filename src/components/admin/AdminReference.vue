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
        <router-link to="/admin/reports"   class="sb-item"><span class="sb-icon"><i class="bi bi-flag"></i></span> รายการ Report</router-link>
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
          <h1 class="page-title">จัดการข้อมูลอ้างอิง</h1>
          <p class="page-sub">ประเภทอาหาร · วิธีปรุง · เนื้อสัตว์ · tag สุขภาพ · bulk assign</p>
        </div>
      </header>

      <transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>
      </transition>

      <!-- TAB -->
      <div class="tab-bar">
        <button class="tab" :class="{active:tab==='reference'}" @click="tab='reference'">📦 ข้อมูลอ้างอิง</button>
        <button class="tab" :class="{active:tab==='bulk'}"      @click="tab='bulk'">🏷️ Bulk Assign Tags</button>
      </div>

      <!-- ===== TAB: ข้อมูลอ้างอิง ===== -->
      <div v-if="tab==='reference'" class="ref-grid">

        <!-- ประเภทอาหาร -->
        <div class="a-card">
          <div class="card-head">
            <h2 class="card-title">🍚 ประเภทอาหาร</h2>
            <span class="count-badge">{{ cuisines.length }}</span>
          </div>
          <div class="add-row">
            <input v-model="newCuisine" class="ref-inp" placeholder="ชื่อประเภทอาหาร..." @keyup.enter="addCuisine"/>
            <button class="btn-add" @click="addCuisine">+ เพิ่ม</button>
          </div>
          <div class="ref-list">
            <div v-if="!cuisines.length" class="ref-empty">ยังไม่มีข้อมูล</div>
            <div v-for="c in cuisines" :key="c.id" class="ref-item">
              <template v-if="editingCuisine!==c.id">
                <span class="ref-name">{{ c.name }}</span>
                <div class="ref-btns">
                  <button class="btn-sm btn-edit-sm" @click="startEditCuisine(c)"><i class="bi bi-pen"></i></button>
                  <button class="btn-sm btn-del-sm"  @click="deleteCuisine(c)"><i class="bi bi-trash3"></i></button>
                </div>
              </template>
              <template v-else>
                <input v-model="editCuisineName" class="ref-inp-edit" @keyup.enter="saveCuisine(c)" @keyup.esc="editingCuisine=null"/>
                <div class="ref-btns">
                  <button class="btn-sm btn-save-sm" @click="saveCuisine(c)">✓</button>
                  <button class="btn-sm btn-cancel-sm" @click="editingCuisine=null">✕</button>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- วิธีปรุง -->
        <div class="a-card">
          <div class="card-head">
            <h2 class="card-title">🍳 วิธีปรุงอาหาร</h2>
            <span class="count-badge">{{ cookMethods.length }}</span>
          </div>
          <div class="add-row">
            <input v-model="newMethod" class="ref-inp" placeholder="ชื่อวิธีปรุง..." @keyup.enter="addMethod"/>
            <button class="btn-add" @click="addMethod">+ เพิ่ม</button>
          </div>
          <div class="ref-list">
            <div v-if="!cookMethods.length" class="ref-empty">ยังไม่มีข้อมูล</div>
            <div v-for="m in cookMethods" :key="m.id" class="ref-item">
              <template v-if="editingMethod!==m.id">
                <span class="ref-name">{{ m.name }}</span>
                <div class="ref-btns">
                  <button class="btn-sm btn-edit-sm" @click="startEditMethod(m)"><i class="bi bi-pen"></i></button>
                  <button class="btn-sm btn-del-sm"  @click="deleteMethod(m)"><i class="bi bi-trash3"></i></button>
                </div>
              </template>
              <template v-else>
                <input v-model="editMethodName" class="ref-inp-edit" @keyup.enter="saveMethod(m)" @keyup.esc="editingMethod=null"/>
                <div class="ref-btns">
                  <button class="btn-sm btn-save-sm" @click="saveMethod(m)">✓</button>
                  <button class="btn-sm btn-cancel-sm" @click="editingMethod=null">✕</button>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- เนื้อสัตว์ -->
        <div class="a-card">
          <div class="card-head">
            <h2 class="card-title">🥩 เนื้อสัตว์ / โปรตีน</h2>
            <span class="count-badge">{{ meatTypes.length }}</span>
          </div>
          <div class="add-row">
            <input v-model="newMeat" class="ref-inp" placeholder="เช่น ไก่, หมู, ปลา..." @keyup.enter="addMeat"/>
            <button class="btn-add" @click="addMeat">+ เพิ่ม</button>
          </div>
          <div class="ref-list">
            <div v-if="!meatTypes.length" class="ref-empty">ยังไม่มีข้อมูล</div>
            <div v-for="m in meatTypes" :key="m.id" class="ref-item">
              <template v-if="editingMeat!==m.id">
                <span class="ref-name">{{ m.name }}</span>
                <div class="ref-btns">
                  <button class="btn-sm btn-edit-sm" @click="startEditMeat(m)"><i class="bi bi-pen"></i></button>
                  <button class="btn-sm btn-del-sm"  @click="deleteMeat(m)"><i class="bi bi-trash3"></i></button>
                </div>
              </template>
              <template v-else>
                <input v-model="editMeatName" class="ref-inp-edit" @keyup.enter="saveMeat(m)" @keyup.esc="editingMeat=null"/>
                <div class="ref-btns">
                  <button class="btn-sm btn-save-sm" @click="saveMeat(m)">✓</button>
                  <button class="btn-sm btn-cancel-sm" @click="editingMeat=null">✕</button>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Health Tags -->
        <div class="a-card">
          <div class="card-head">
            <h2 class="card-title">⚕️ Tag สุขภาพ</h2>
            <span class="count-badge">{{ healthTags.length }}</span>
          </div>
          <div class="add-row-vertical">
            <div class="add-row">
              <input v-model="newTagName" class="ref-inp" placeholder="ชื่อ key เช่น diabetes_friendly"/>
            </div>
            <div class="add-row">
              <input v-model="newTagLabel" class="ref-inp" placeholder="ป้ายแสดงผล เช่น เหมาะกับผู้ป่วยเบาหวาน" @keyup.enter="addHealthTag"/>
              <button class="btn-add" @click="addHealthTag">+ เพิ่ม</button>
            </div>
          </div>
          <div class="ref-list">
            <div v-if="!healthTags.length" class="ref-empty">ยังไม่มีข้อมูล</div>
            <div v-for="t in healthTags" :key="t.id" class="ref-item">
              <template v-if="editingTag!==t.id">
                <div>
                  <span class="ref-name">{{ t.label }}</span>
                  <span class="ref-key">{{ t.name }}</span>
                </div>
                <div class="ref-btns">
                  <button class="btn-sm btn-edit-sm" @click="startEditTag(t)"><i class="bi bi-pen"></i></button>
                  <button class="btn-sm btn-del-sm"  @click="deleteHealthTag(t)"><i class="bi bi-trash3"></i></button>
                </div>
              </template>
              <template v-else>
                <div style="flex:1;display:flex;flex-direction:column;gap:4px">
                  <input v-model="editTagName"  class="ref-inp-edit" placeholder="key"/>
                  <input v-model="editTagLabel" class="ref-inp-edit" placeholder="label" @keyup.enter="saveHealthTag(t)" @keyup.esc="editingTag=null"/>
                </div>
                <div class="ref-btns">
                  <button class="btn-sm btn-save-sm" @click="saveHealthTag(t)">✓</button>
                  <button class="btn-sm btn-cancel-sm" @click="editingTag=null">✕</button>
                </div>
              </template>
            </div>
          </div>
        </div>

      </div>

      <!-- ===== TAB: Bulk Assign ===== -->
      <div v-if="tab==='bulk'" class="bulk-wrap">
        <div class="bulk-panel">

          <!-- Step 1: เลือก Tag -->
          <div class="bulk-step">
            <div class="step-head"><span class="step-num">1</span> เลือก Health Tag</div>
            <div class="tag-pills">
              <button
                v-for="t in healthTags" :key="t.id"
                class="tag-pill" :class="{active: bulkTagId===t.id}"
                @click="bulkTagId=t.id; loadMenusForBulk()"
              >⚕️ {{ t.label }}</button>
            </div>
          </div>

          <!-- Step 2: เลือกเมนู -->
          <div class="bulk-step" v-if="bulkTagId">
            <div class="step-head">
              <span class="step-num">2</span> เลือกเมนู
              <span class="step-sub">{{ selectedMenus.length }} รายการที่เลือก</span>
            </div>

            <!-- Search -->
            <div class="bulk-search">
              <input v-model="bulkSearch" class="ref-inp" placeholder="ค้นหาชื่อเมนู..."/>
            </div>

            <!-- Select All -->
            <div class="bulk-select-all">
              <label class="check-item">
                <input type="checkbox" :checked="isAllSelected" @change="toggleAll"/>
                <span>เลือกทั้งหมด ({{ filteredBulkMenus.length }} รายการ)</span>
              </label>
            </div>

            <div class="bulk-menu-list">
              <label
                v-for="m in filteredBulkMenus" :key="m.id"
                class="check-item menu-check"
                :class="{has_tag: m.hasTag}"
              >
                <input type="checkbox" :value="m.id" v-model="selectedMenus"/>
                <div class="menu-check-info">
                  <span class="menu-check-name">{{ m.name }}</span>
                  <span class="menu-check-cuisine">{{ m.cuisine_name }}</span>
                </div>
                <span v-if="m.hasTag" class="already-tag">✓ มี tag นี้แล้ว</span>
              </label>
            </div>
          </div>

          <!-- Step 3: Action -->
          <div class="bulk-step" v-if="bulkTagId && selectedMenus.length">
            <div class="step-head"><span class="step-num">3</span> ดำเนินการ</div>
            <div class="bulk-actions">
              <button class="btn-bulk-add" @click="bulkAssign('add')" :disabled="bulkLoading">
                {{ bulkLoading ? 'กำลังดำเนินการ...' : `➕ เพิ่ม tag ให้ ${selectedMenus.length} เมนู` }}
              </button>
              <button class="btn-bulk-remove" @click="bulkAssign('remove')" :disabled="bulkLoading">
                {{ bulkLoading ? 'กำลังดำเนินการ...' : `➖ ลบ tag ออก ${selectedMenus.length} เมนู` }}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'
const API     = process.env.VUE_APP_API_URL || 'http://localhost:3000'
const HEADERS = () => ({ 'x-admin-token': localStorage.getItem('adminToken') })

export default {
  name: 'AdminReference',
  data() {
    return {
      tab: 'reference',
      cuisines: [], cookMethods: [], meatTypes: [], healthTags: [],

      newCuisine: '', editingCuisine: null, editCuisineName: '',
      newMethod:  '', editingMethod:  null, editMethodName:  '',
      newMeat:    '', editingMeat:    null, editMeatName:    '',
      newTagName: '', newTagLabel: '',
      editingTag: null, editTagName: '', editTagLabel: '',

      // Bulk
      bulkTagId: null, bulkMenus: [], selectedMenus: [],
      bulkSearch: '', bulkLoading: false,

      toast: { show: false, msg: '', type: 'success' },
    }
  },
  computed: {
    filteredBulkMenus() {
      if (!this.bulkSearch) return this.bulkMenus
      return this.bulkMenus.filter(m => m.name.includes(this.bulkSearch))
    },
    isAllSelected() {
      return this.filteredBulkMenus.length > 0 &&
        this.filteredBulkMenus.every(m => this.selectedMenus.includes(m.id))
    },
  },
  async created() {
    await this.loadAll()
  },
  methods: {
    async loadAll() {
      try {
        const [c, m, mt, ht] = await Promise.all([
          axios.get(`${API}/api/cuisines`),
          axios.get(`${API}/api/cook-methods`),
          axios.get(`${API}/api/meat-types`),
          axios.get(`${API}/api/health-tags`),
        ])
        this.cuisines    = c.data.data  || []
        this.cookMethods = m.data.data  || []
        this.meatTypes   = mt.data.data || []
        this.healthTags  = ht.data.data || []
      } catch(e) { console.error(e) }
    },

    showToast(msg, type='success') {
      this.toast = { show: true, msg, type }
      setTimeout(() => this.toast.show = false, 2500)
    },

    // ---- Cuisines ----
    async addCuisine() {
      const name = this.newCuisine.trim(); if (!name) return
      try {
        const { data } = await axios.post(`${API}/api/admin/cuisines`, { name }, { headers: HEADERS() })
        if (data.success) { this.cuisines.push({ id: data.id, name }); this.newCuisine = ''; this.showToast('เพิ่มประเภทอาหารแล้ว ✓') }
      } catch(e) { this.showToast(e.response?.data?.message || 'เกิดข้อผิดพลาด', 'error') }
    },
    startEditCuisine(c) { this.editingCuisine = c.id; this.editCuisineName = c.name },
    async saveCuisine(c) {
      const name = this.editCuisineName.trim(); if (!name) return
      try {
        await axios.put(`${API}/api/admin/cuisines/${c.id}`, { name }, { headers: HEADERS() })
        c.name = name; this.editingCuisine = null; this.showToast('แก้ไขแล้ว ✓')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },
    async deleteCuisine(c) {
      if (!confirm(`ลบประเภท "${c.name}" ใช่ไหมคะ?`)) return
      try {
        await axios.delete(`${API}/api/admin/cuisines/${c.id}`, { headers: HEADERS() })
        this.cuisines = this.cuisines.filter(x => x.id !== c.id); this.showToast('ลบแล้ว', 'warn')
      } catch(e) { this.showToast(e.response?.data?.message || 'เกิดข้อผิดพลาด', 'error') }
    },

    // ---- Cook Methods ----
    async addMethod() {
      const name = this.newMethod.trim(); if (!name) return
      try {
        const { data } = await axios.post(`${API}/api/admin/cook-methods`, { name }, { headers: HEADERS() })
        if (data.success) { this.cookMethods.push({ id: data.id, name }); this.newMethod = ''; this.showToast('เพิ่มวิธีปรุงแล้ว ✓') }
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },
    startEditMethod(m) { this.editingMethod = m.id; this.editMethodName = m.name },
    async saveMethod(m) {
      const name = this.editMethodName.trim(); if (!name) return
      try {
        await axios.put(`${API}/api/admin/cook-methods/${m.id}`, { name }, { headers: HEADERS() })
        m.name = name; this.editingMethod = null; this.showToast('แก้ไขแล้ว ✓')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },
    async deleteMethod(m) {
      if (!confirm(`ลบวิธีปรุง "${m.name}" ใช่ไหมคะ?`)) return
      try {
        await axios.delete(`${API}/api/admin/cook-methods/${m.id}`, { headers: HEADERS() })
        this.cookMethods = this.cookMethods.filter(x => x.id !== m.id); this.showToast('ลบแล้ว', 'warn')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },

    // ---- Meat Types ----
    async addMeat() {
      const name = this.newMeat.trim(); if (!name) return
      try {
        const { data } = await axios.post(`${API}/api/admin/meat-types`, { name }, { headers: HEADERS() })
        if (data.success) { this.meatTypes.push({ id: data.id, name }); this.newMeat = ''; this.showToast('เพิ่มแล้ว ✓') }
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },
    startEditMeat(m) { this.editingMeat = m.id; this.editMeatName = m.name },
    async saveMeat(m) {
      const name = this.editMeatName.trim(); if (!name) return
      try {
        await axios.put(`${API}/api/admin/meat-types/${m.id}`, { name }, { headers: HEADERS() })
        m.name = name; this.editingMeat = null; this.showToast('แก้ไขแล้ว ✓')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },
    async deleteMeat(m) {
      if (!confirm(`ลบ "${m.name}" ใช่ไหมคะ?`)) return
      try {
        await axios.delete(`${API}/api/admin/meat-types/${m.id}`, { headers: HEADERS() })
        this.meatTypes = this.meatTypes.filter(x => x.id !== m.id); this.showToast('ลบแล้ว', 'warn')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },

    // ---- Health Tags ----
    async addHealthTag() {
      const name = this.newTagName.trim(); const label = this.newTagLabel.trim()
      if (!name || !label) { this.showToast('กรุณากรอก key และ label', 'error'); return }
      try {
        const { data } = await axios.post(`${API}/api/admin/health-tags`, { name, label }, { headers: HEADERS() })
        if (data.success) { this.healthTags.push({ id: data.id, name, label }); this.newTagName = ''; this.newTagLabel = ''; this.showToast('เพิ่ม tag แล้ว ✓') }
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },
    startEditTag(t) { this.editingTag = t.id; this.editTagName = t.name; this.editTagLabel = t.label },
    async saveHealthTag(t) {
      const name = this.editTagName.trim(); const label = this.editTagLabel.trim(); if (!name || !label) return
      try {
        await axios.put(`${API}/api/admin/health-tags/${t.id}`, { name, label }, { headers: HEADERS() })
        t.name = name; t.label = label; this.editingTag = null; this.showToast('แก้ไขแล้ว ✓')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },
    async deleteHealthTag(t) {
      if (!confirm(`ลบ tag "${t.label}" ใช่ไหมคะ? เมนูทุกรายการที่มี tag นี้จะถูกลบออกด้วยค่ะ`)) return
      try {
        await axios.delete(`${API}/api/admin/health-tags/${t.id}`, { headers: HEADERS() })
        this.healthTags = this.healthTags.filter(x => x.id !== t.id); this.showToast('ลบแล้ว', 'warn')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
    },

    // ---- Bulk Assign ----
    async loadMenusForBulk() {
      this.selectedMenus = []
      try {
        const [menusRes, tagMenusRes] = await Promise.all([
          axios.get(`${API}/api/admin/menus`, { headers: HEADERS() }),
          axios.get(`${API}/api/menus?health_tag_id=${this.bulkTagId}`),
        ])
        const allMenus    = menusRes.data.data    || []
        const taggedIds   = new Set((tagMenusRes.data.data || []).map(m => m.id))
        this.bulkMenus    = allMenus.map(m => ({ ...m, hasTag: taggedIds.has(m.id) }))
      } catch(e) { console.error(e) }
    },
    toggleAll(e) {
      if (e.target.checked) {
        this.selectedMenus = this.filteredBulkMenus.map(m => m.id)
      } else {
        this.selectedMenus = []
      }
    },
    async bulkAssign(action) {
      if (!this.selectedMenus.length || !this.bulkTagId) return
      this.bulkLoading = true
      try {
        const { data } = await axios.post(`${API}/api/admin/bulk-health-tags`, {
          menu_ids: this.selectedMenus, health_tag_id: this.bulkTagId, action
        }, { headers: HEADERS() })
        if (data.success) {
          this.showToast(data.message + ' ✓')
          await this.loadMenusForBulk()
          this.selectedMenus = []
        }
      } catch(e) { this.showToast('เกิดข้อผิดพลาด', 'error') }
      finally { this.bulkLoading = false }
    },

    logout() { localStorage.removeItem('adminToken'); this.$router.push('/admin/login') },
  },
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
.sb-bottom{margin-top:auto;padding:16px 10px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:10px}
.sb-user{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:0 10px}
.sb-avatar{width:32px;height:32px;border-radius:50%;background:#F26722;color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.9rem;flex-shrink:0}
.sb-uname{font-size:.82rem;font-weight:700;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-uemail{font-size:.72rem;color:#6B7280}
.sb-logout{background:none;border:1px solid rgba(255,255,255,.1);color:#6B7280;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:.9rem;transition:all .18s;flex-shrink:0}
.sb-logout:hover{background:rgba(239,68,68,.15);border-color:#EF4444;color:#EF4444}

.a-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.topbar{padding:24px 28px 0}
.page-title{font-size:1.5rem;font-weight:800;color:#1A1D23}
.page-sub{font-size:.8rem;color:#6B7280;margin-top:3px}

.tab-bar{display:flex;gap:8px;padding:16px 28px 0}
.tab{padding:9px 20px;border-radius:10px;border:1.5px solid #E5E7EB;background:white;font-family:inherit;font-size:.86rem;font-weight:700;color:#6B7280;cursor:pointer;transition:all .18s}
.tab:hover{border-color:#F26722;color:#F26722}
.tab.active{background:#F26722;border-color:#F26722;color:white}

.toast{position:fixed;top:20px;right:24px;z-index:999;padding:12px 20px;border-radius:12px;font-weight:700;font-size:.85rem;box-shadow:0 4px 20px rgba(0,0,0,.12)}
.toast.success{background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0}
.toast.warn{background:#FFFBEB;color:#92400E;border:1px solid #FDE68A}
.toast.error{background:#FEF2F2;color:#991B1B;border:1px solid #FECACA}
.toast-enter-active,.toast-leave-active{transition:all .3s}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateX(20px)}

.ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;padding:20px 28px 40px}
.a-card{background:white;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.05);border:1px solid #E5E7EB;display:flex;flex-direction:column;gap:14px}
.card-head{display:flex;align-items:center;justify-content:space-between}
.card-title{font-weight:800;color:#1A1D23;font-size:1rem}
.count-badge{background:#F26722;color:white;border-radius:50px;padding:2px 10px;font-size:.74rem;font-weight:700}
.add-row{display:flex;gap:8px}
.add-row-vertical{display:flex;flex-direction:column;gap:6px}
.ref-inp{flex:1;border:1.5px solid #E5E7EB;border-radius:10px;padding:8px 12px;font-family:inherit;font-size:.88rem;outline:none;background:#FAFAFA;transition:border .2s}
.ref-inp:focus{border-color:#F26722;background:white}
.btn-add{background:#F26722;color:white;border:none;border-radius:10px;padding:8px 16px;font-family:inherit;font-weight:700;font-size:.85rem;cursor:pointer;white-space:nowrap;transition:background .18s}
.btn-add:hover{background:#D95A1A}
.ref-list{display:flex;flex-direction:column;gap:6px;max-height:320px;overflow-y:auto}
.ref-empty{text-align:center;color:#D1D5DB;font-size:.85rem;padding:16px}
.ref-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:#F9FAFB;border-radius:10px;border:1px solid #F3F4F6}
.ref-item:hover{background:#F3F4F6}
.ref-name{font-size:.88rem;font-weight:600;color:#1A1D23;flex:1}
.ref-key{font-size:.72rem;color:#9CA3AF;font-family:monospace;margin-left:8px}
.ref-inp-edit{width:100%;border:1.5px solid #F26722;border-radius:8px;padding:6px 10px;font-family:inherit;font-size:.86rem;outline:none;margin-bottom:2px}
.ref-note{font-size:.74rem;color:#D1D5DB;font-style:italic;text-align:center}
.ref-btns{display:flex;gap:5px;flex-shrink:0}
.btn-sm{width:28px;height:28px;border-radius:7px;border:none;cursor:pointer;font-size:.8rem;display:flex;align-items:center;justify-content:center;transition:all .15s}
.btn-edit-sm{background:#FFFBEB;border:1px solid #FDE68A;color:#92400E}
.btn-edit-sm:hover{background:#F59E0B;color:white;border-color:#F59E0B}
.btn-del-sm{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B}
.btn-del-sm:hover{background:#EF4444;color:white;border-color:#EF4444}
.btn-save-sm{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;font-weight:700}
.btn-save-sm:hover{background:#059669;color:white}
.btn-cancel-sm{background:#F3F4F6;border:1px solid #E5E7EB;color:#6B7280}
.btn-cancel-sm:hover{background:#E5E7EB}

/* Bulk */
.bulk-wrap{padding:20px 28px 40px}
.bulk-panel{background:white;border-radius:16px;padding:28px;border:1px solid #E5E7EB;max-width:800px;display:flex;flex-direction:column;gap:28px}
.bulk-step{display:flex;flex-direction:column;gap:14px}
.step-head{display:flex;align-items:center;gap:10px;font-weight:800;color:#1A1D23;font-size:.95rem}
.step-num{width:28px;height:28px;border-radius:50%;background:#F26722;color:white;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:900;flex-shrink:0}
.step-sub{font-size:.78rem;color:#6B7280;font-weight:400;margin-left:4px}
.tag-pills{display:flex;flex-wrap:wrap;gap:8px}
.tag-pill{padding:7px 16px;border-radius:50px;border:1.5px solid #E5E7EB;background:white;font-family:inherit;font-size:.82rem;font-weight:600;color:#374151;cursor:pointer;transition:all .18s}
.tag-pill:hover{border-color:#059669;color:#059669}
.tag-pill.active{background:#059669;border-color:#059669;color:white}
.bulk-search{max-width:400px}
.bulk-select-all{padding:10px 14px;background:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB}
.bulk-menu-list{display:flex;flex-direction:column;gap:6px;max-height:400px;overflow-y:auto}
.check-item{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:.88rem;color:#374151;font-weight:600}
.check-item input[type=checkbox]{width:16px;height:16px;accent-color:#F26722;flex-shrink:0;cursor:pointer}
.menu-check{padding:10px 14px;background:#F9FAFB;border-radius:10px;border:1px solid #F3F4F6;transition:background .15s}
.menu-check:hover{background:#F3F4F6}
.menu-check.has_tag{border-color:#A7F3D0;background:#ECFDF5}
.menu-check-info{display:flex;flex-direction:column;flex:1}
.menu-check-name{font-weight:700;color:#1A1D23;font-size:.88rem}
.menu-check-cuisine{font-size:.74rem;color:#9CA3AF}
.already-tag{font-size:.72rem;font-weight:700;color:#059669;white-space:nowrap}
.bulk-actions{display:flex;gap:12px;flex-wrap:wrap}
.btn-bulk-add{background:#059669;color:white;border:none;border-radius:10px;padding:12px 24px;font-family:inherit;font-weight:700;font-size:.9rem;cursor:pointer;transition:background .18s}
.btn-bulk-add:hover:not(:disabled){background:#047857}
.btn-bulk-add:disabled{opacity:.65;cursor:not-allowed}
.btn-bulk-remove{background:#EF4444;color:white;border:none;border-radius:10px;padding:12px 24px;font-family:inherit;font-weight:700;font-size:.9rem;cursor:pointer;transition:background .18s}
.btn-bulk-remove:hover:not(:disabled){background:#DC2626}
.btn-bulk-remove:disabled{opacity:.65;cursor:not-allowed}
</style>