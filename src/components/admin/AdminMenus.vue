
<template>
  <div class="a-layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sb-brand">
        <div class="sb-logo-wrap">
          <img src="/food-random/favicon.png" alt="logo" class="sb-logo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
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
        <router-link to="/admin/reference" class="sb-item"><span class="sb-icon"><i class="bi bi-archive"></i></span> ประเภท / วิธีปรุง</router-link>
        <router-link to="/admin/reports"   class="sb-item">
          <span class="sb-icon"><i class="bi bi-flag"></i></span> รายการ Report
          <span v-if="pendingReports>0" class="sb-badge">{{ pendingReports }}</span>
        </router-link>
      </nav>

      <div class="sb-bottom">
        <div class="sb-user">
          <div class="sb-avatar">A</div>
          <div><div class="sb-uname">Administrator</div><div class="sb-uemail">admin@kinraidee</div></div>
        </div>
        <button class="sb-logout" @click="logout" title="ออกจากระบบ">⏻</button>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="a-main">

      <!-- TOP BAR -->
      <header class="topbar">
        <div>
          <h1 class="page-title">จัดการเมนูอาหาร</h1>
          <p class="page-sub">{{ menus.length }} รายการทั้งหมด · {{ flaggedCount }} ถูก report</p>
        </div>
        <button class="btn-primary" @click="openAdd">
          <span>+</span> เพิ่มเมนูใหม่
        </button>
      </header>

      <!-- STATS BAR -->
      <div class="stats-bar">
        <div class="stat-card">
          <div class="stat-num">{{ menus.length }}</div>
          <div class="stat-lbl">เมนูทั้งหมด</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color:#10B981">{{ menus.filter(m=>m.status==='normal').length }}</div>
          <div class="stat-lbl">ใช้งานได้</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color:#EF4444">{{ flaggedCount }}</div>
          <div class="stat-lbl">ถูก report</div>
        </div>
        <div class="stat-card">
          <div class="stat-num" style="color:#F26722">{{ menus.filter(m=>m.is_halal).length }}</div>
          <div class="stat-lbl">ฮาลาล</div>
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="toolbar">
        <div class="search-wrap">
          <span class="search-icon"><i class="bi bi-search"></i></span>
          <input v-model="search" class="search-inp" placeholder="ค้นหาชื่อเมนู..."/>
          <button v-if="search" class="clear-btn" @click="search=''">✕</button>
        </div>
        <div class="filter-tabs">
          <button class="ftab" :class="{active:statusFilter===''}"        @click="statusFilter=''">ทั้งหมด</button>
          <button class="ftab" :class="{active:statusFilter==='normal'}"  @click="statusFilter='normal'">ปกติ</button>
          <button class="ftab" :class="{active:statusFilter==='flagged'}" @click="statusFilter='flagged'"><i class="bi bi-flag"></i> Flagged</button>
        </div>
      </div>

      <!-- Toast -->
      <transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>
      </transition>

      <!-- TABLE -->
      <div class="table-wrap">
        <div v-if="loading" class="t-state"><div class="spinner"/><p>กำลังโหลด...</p></div>
        <div v-else-if="filteredMenus.length===0" class="t-state">
          <p style="font-size:2rem">🍽️</p>
          <p>ไม่พบเมนูที่ตรงกัน</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th style="width:52px"/>
              <th>ชื่อเมนู</th>
              <th>ประเภท</th>
              <th>แคลอรี่</th>
              <th>คุณสมบัติ</th>
              <th>สถานะ</th>
              <th style="width:100px"/>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filteredMenus" :key="m.id" :class="{'row-flag':m.status==='flagged'}">
              <td>
                <div class="t-thumb">
                  <img v-if="m.image_url" :src="m.image_url.startsWith('http') ? m.image_url : apiBase + m.image_url" class="t-img"/>
                  <span v-else class="t-ph">🍜</span>
                </div>
              </td>
              <td><span class="t-name">{{ m.name }}</span></td>
              <td><span class="t-cuisine">{{ m.cuisine_name }}</span></td>
              <td><span class="t-cal" v-if="m.calories">{{ m.calories }} kcal</span><span v-else class="t-muted">—</span></td>
              <td class="t-flags">
                <span v-if="m.is_spicy" class="flag-pill spicy">🌶️ เผ็ด</span>
                <span v-if="m.is_vegan" class="flag-pill vegan">🌿 เจ</span>
                <span v-if="m.is_halal" class="flag-pill halal">☪️ ฮาลาล</span>
              </td>
              <td>
                <span class="status-pill" :class="m.status">
                  {{ m.status==='flagged' ? '⚑ Flagged' : '● Active' }}
                </span>
              </td>
              <td>
                <div class="t-actions">
                  <button class="act-btn edit" @click="openEdit(m)" title="แก้ไข"><i class="bi bi-pen"></i></button>
                  <button class="act-btn del"  @click="deleteMenu(m)" title="ลบ"><i class="bi bi-trash3"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">แสดง {{ filteredMenus.length }} จาก {{ menus.length }} รายการ</div>
    </div>

    <!-- MODAL -->
    <transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-panel">
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ editMode ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่' }}</h3>
              <p class="modal-sub">{{ editMode ? 'แก้ไขข้อมูลเมนูที่เลือก' : 'กรอกข้อมูลเมนูใหม่' }}</p>
            </div>
            <button class="modal-x" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="field">
                <label>ชื่อเมนู <span class="req">*</span></label>
                <input v-model="form.name" placeholder="เช่น ผัดไทย"/>
              </div>
              <div class="field">
                <label>ประเภทอาหาร <span class="req">*</span></label>
                <select v-model="form.cuisine_id">
                  <option value="">— เลือกประเภท —</option>
                  <option v-for="c in cuisines" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="field">
                <label>แคลอรี่ (kcal)</label>
                <input v-model="form.calories" type="number" placeholder="400"/>
              </div>
              <div class="field">
                <label>URL รูปภาพ{{ editMode ? ' (ว่าง = คงรูปเดิม)' : '' }}</label>
                <input v-model="form.image_url" placeholder="https://raw.githubusercontent.com/Tanjane0/food-random/main/backend/uploads/ชื่อไฟล์.png"/>
              </div>
            </div>

            <!-- Flags -->
            <div class="form-section">
              <div class="section-title">คุณสมบัติ</div>
              <div class="toggle-row">
                <label class="toggle-item"><input type="checkbox" v-model="form.is_spicy"/> <span class="toggle-label">🌶️ เผ็ด</span></label>
                <label class="toggle-item"><input type="checkbox" v-model="form.is_vegan"/> <span class="toggle-label">🌿 เจ</span></label>
                <label class="toggle-item"><input type="checkbox" v-model="form.is_halal"/> <span class="toggle-label">☪️ ฮาลาล</span></label>
              </div>
            </div>

            <!-- Cook methods -->
            <div class="form-section">
              <div class="section-title">🍳 วิธีปรุง</div>
              <div class="chip-group">
                <label v-for="m in cookMethods" :key="m.id" class="chip" :class="{selected:form.cook_method_ids.includes(m.id)}">
                  <input type="checkbox" :value="m.id" v-model="form.cook_method_ids" style="display:none"/>
                  {{ m.name }}
                </label>
              </div>
            </div>

            <!-- Meat types -->
            <div class="form-section">
              <div class="section-title">🥩 เนื้อสัตว์ / โปรตีน</div>
              <div class="chip-group">
                <label v-for="m in meatTypes" :key="m.id" class="chip" :class="{selected:form.meat_type_ids.includes(m.id)}">
                  <input type="checkbox" :value="m.id" v-model="form.meat_type_ids" style="display:none"/>
                  {{ m.name }}
                </label>
              </div>
            </div>

            <!-- Health tags -->
            <div class="form-section">
              <div class="section-title">⚕️ เหมาะกับโรค</div>
              <div class="chip-group">
                <label v-for="t in healthTags" :key="t.id" class="chip chip-health" :class="{selected:form.health_tag_ids.includes(t.id)}">
                  <input type="checkbox" :value="t.id" v-model="form.health_tag_ids" style="display:none"/>
                  {{ t.label }}
                </label>
              </div>
            </div>

            <p v-if="formError" class="form-error">⚠️ {{ formError }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn-ghost" @click="closeModal">ยกเลิก</button>
            <button class="btn-primary" @click="saveMenu" :disabled="submitting">
              {{ submitting ? 'กำลังบันทึก...' : editMode ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'
const API     = process.env.VUE_APP_API_URL || 'http://localhost:3000'
const HEADERS = () => ({ 'x-admin-token': localStorage.getItem('adminToken') })
const emptyForm = () => ({
  name:'', cuisine_id:'', calories:'',
  is_spicy:false, is_vegan:false, is_halal:false,
  health_tag_ids:[], cook_method_ids:[], meat_type_ids:[],
  image_url:'',
})

export default {
  name: 'AdminMenus',
  data() {
    return {
      apiBase:API,
      menus:[], cuisines:[], healthTags:[], cookMethods:[], meatTypes:[],
      loading:true, search:'', statusFilter:'',
      showModal:false, editMode:false, submitting:false, formError:'',
      form:emptyForm(), imageFile:null, editId:null,
      toast:{ show:false, msg:'', type:'success' },
      pendingReports:0,
    }
  },
  computed: {
    flaggedCount() { return this.menus.filter(m=>m.status==='flagged').length },
    filteredMenus() {
      return this.menus.filter(m => {
        const s = !this.search || m.name.includes(this.search)
        const st= !this.statusFilter || m.status===this.statusFilter
        return s && st
      })
    },
  },
  async created() { await this.loadAll() },
  methods: {
    async loadAll() {
      this.loading=true
      const [menus,cuisines,ht,cm,mt,reports] = await Promise.all([
        axios.get(`${API}/api/admin/menus`,  { headers:HEADERS() }),
        axios.get(`${API}/api/cuisines`),
        axios.get(`${API}/api/health-tags`),
        axios.get(`${API}/api/cook-methods`),
        axios.get(`${API}/api/meat-types`),
        axios.get(`${API}/api/admin/reports`, { headers:HEADERS() }),
      ])
      this.menus       = menus.data.data    || []
      this.cuisines    = cuisines.data.data || []
      this.healthTags  = ht.data.data       || []
      this.cookMethods = cm.data.data       || []
      this.meatTypes   = mt.data.data       || []
      this.pendingReports = (reports.data.data||[]).filter(r=>r.status==='pending').length
      this.loading=false
    },
    showToast(msg, type='success') {
      this.toast={show:true,msg,type}
      setTimeout(()=>this.toast.show=false,3000)
    },
    openAdd() { this.editMode=false; this.form=emptyForm(); this.imageFile=null; this.formError=''; this.showModal=true },
    async openEdit(menu) {
      this.editMode=true; this.editId=menu.id; this.formError=''
      this.form={ name:menu.name, cuisine_id:menu.cuisine_id, calories:menu.calories||'', 
      is_spicy:!!menu.is_spicy, is_vegan:!!menu.is_vegan, is_halal:!!menu.is_halal, 
      health_tag_ids:[], cook_method_ids:[], meat_type_ids:[],
      image_url: menu.image_url || ''
}
      this.imageFile=null
      try {
        const { data } = await axios.get(`${API}/api/admin/menus/${menu.id}/tags`, { headers:HEADERS() })
        this.form.health_tag_ids  = data.health_tag_ids  || []
        this.form.cook_method_ids = data.cook_method_ids || []
        this.form.meat_type_ids   = data.meat_type_ids   || []
      } catch(e) { console.error(e) }
      this.showModal=true
    },
    closeModal() { this.showModal=false },
    onFile(e) { this.imageFile=e.target.files[0]||null },
    async saveMenu() {
      if (!this.form.name||!this.form.cuisine_id) { this.formError='กรุณากรอกชื่อเมนูและประเภทอาหาร'; return }
      this.submitting=true; this.formError=''
      const fd=new FormData()
      fd.append('name',this.form.name); fd.append('cuisine_id',this.form.cuisine_id)
      fd.append('calories',this.form.calories||'')
      fd.append('is_spicy',String(this.form.is_spicy)); fd.append('is_vegan',String(this.form.is_vegan)); fd.append('is_halal',String(this.form.is_halal))
      this.form.health_tag_ids.forEach(id=>fd.append('health_tag_ids',id))
      this.form.cook_method_ids.forEach(id=>fd.append('cook_method_ids',id))
      this.form.meat_type_ids.forEach(id=>fd.append('meat_type_ids',id))
      if (this.form.image_url) fd.append('image_url', this.form.image_url)
      try {
        const url=this.editMode?`${API}/api/admin/menus/${this.editId}`:`${API}/api/admin/menus`
        const { data }=await axios[this.editMode?'put':'post'](url,fd,{headers:HEADERS()})
        if (data.success) {
          this.showToast(this.editMode?'แก้ไขเมนูสำเร็จ ✓':'เพิ่มเมนูสำเร็จ ✓')
          this.closeModal()
          if (this.editMode) {
            const idx=this.menus.findIndex(m=>m.id===this.editId)
            if (idx>=0) {
              const u={...this.menus[idx],name:this.form.name,cuisine_id:this.form.cuisine_id,calories:this.form.calories||null,is_spicy:this.form.is_spicy?1:0,is_vegan:this.form.is_vegan?1:0,is_halal:this.form.is_halal?1:0}
              const c=this.cuisines.find(c=>c.id==this.form.cuisine_id); if(c) u.cuisine_name=c.name
              this.menus.splice(idx,1,u)
            }
          } else { await this.loadAll() }
        }
      } catch(e) { this.formError=e.response?.data?.message||'เกิดข้อผิดพลาด' } finally { this.submitting=false }
    },
    async deleteMenu(m) {
      if (!confirm(`ลบ "${m.name}" ใช่ไหมคะ?`)) return
      try {
        await axios.delete(`${API}/api/admin/menus/${m.id}`,{headers:HEADERS()})
        this.menus=this.menus.filter(x=>x.id!==m.id); this.showToast(`ลบ "${m.name}" แล้ว`,'warn')
      } catch { this.showToast('เกิดข้อผิดพลาด','error') }
    },
    logout() { localStorage.removeItem('adminToken'); this.$router.push('/admin/login') },
  },
}
</script>

<style scoped>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.a-layout{display:flex;min-height:100vh;font-family:'Sarabun','Prompt',sans-serif;background:#F7F8FA}

/* SIDEBAR */
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

/* MAIN */
.a-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.topbar{display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px 0;background:#F7F8FA}
.page-title{font-size:1.5rem;font-weight:800;color:#1A1D23}
.page-sub{font-size:.8rem;color:#6B7280;margin-top:3px}

/* Stats */
.stats-bar{display:flex;gap:14px;padding:16px 28px}
.stat-card{background:white;border:1px solid #E5E7EB;border-radius:12px;padding:14px 20px;flex:1;text-align:center}
.stat-num{font-size:1.6rem;font-weight:900;color:#1A1D23;line-height:1}
.stat-lbl{font-size:.74rem;color:#6B7280;margin-top:4px}

/* Toolbar */
.toolbar{display:flex;gap:12px;align-items:center;padding:0 28px 14px;flex-wrap:wrap}
.search-wrap{display:flex;align-items:center;gap:8px;background:white;border:1.5px solid #E5E7EB;border-radius:10px;padding:8px 14px;flex:1;min-width:200px;transition:border .2s}
.search-wrap:focus-within{border-color:#F26722}
.search-icon{font-size:.9rem;color:#9CA3AF}
.search-inp{border:none;outline:none;font-family:inherit;font-size:.88rem;flex:1;color:#1A1D23}
.clear-btn{background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:.8rem}
.filter-tabs{display:flex;background:white;border:1.5px solid #E5E7EB;border-radius:10px;overflow:hidden}
.ftab{padding:8px 16px;border:none;background:none;cursor:pointer;font-family:inherit;font-size:.82rem;font-weight:600;color:#6B7280;transition:all .15s}
.ftab:hover{background:#F9FAFB}
.ftab.active{background:#F26722;color:white}

/* Toast */
.toast{position:fixed;top:20px;right:24px;z-index:999;padding:12px 20px;border-radius:12px;font-weight:700;font-size:.85rem;box-shadow:0 4px 20px rgba(0,0,0,.12);display:flex;align-items:center;gap:8px}
.toast.success{background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0}
.toast.warn{background:#FFFBEB;color:#92400E;border:1px solid #FDE68A}
.toast.error{background:#FEF2F2;color:#991B1B;border:1px solid #FECACA}
.toast-enter-active,.toast-leave-active{transition:all .3s}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateX(20px)}

/* Table */
.table-wrap{flex:1;margin:0 28px;background:white;border-radius:14px;border:1px solid #E5E7EB;overflow:hidden}
.t-state{text-align:center;padding:60px 20px;color:#9CA3AF;display:flex;flex-direction:column;align-items:center;gap:10px}
.spinner{width:32px;height:32px;border:3px solid #E5E7EB;border-top-color:#F26722;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.data-table{width:100%;border-collapse:collapse;font-size:.86rem}
.data-table thead th{background:#F9FAFB;padding:11px 16px;text-align:left;font-weight:700;font-size:.76rem;color:#374151;letter-spacing:.3px;border-bottom:1px solid #E5E7EB}
.data-table tbody td{padding:12px 16px;border-bottom:1px solid #F3F4F6;vertical-align:middle}
.data-table tbody tr:last-child td{border-bottom:none}
.data-table tbody tr:hover td{background:#FAFAFA}
.row-flag td{background:#FFF9F5!important}
.t-thumb{width:40px;height:40px;border-radius:8px;overflow:hidden;background:#F3F4F6;display:flex;align-items:center;justify-content:center}
.t-img{width:100%;height:100%;object-fit:cover}
.t-ph{font-size:1.4rem}
.t-name{font-weight:700;color:#1A1D23}
.t-cuisine{background:#F3F4F6;color:#374151;border-radius:6px;padding:3px 9px;font-size:.78rem;font-weight:600}
.t-cal{font-size:.82rem;color:#F26722;font-weight:700}
.t-muted{color:#D1D5DB}
.t-flags{display:flex;gap:5px;flex-wrap:wrap}
.flag-pill{border-radius:50px;padding:3px 9px;font-size:.72rem;font-weight:700}
.flag-pill.spicy{background:#FEF2F2;color:#DC2626}
.flag-pill.vegan{background:#ECFDF5;color:#065F46}
.flag-pill.halal{background:#EFF6FF;color:#1D4ED8}
.status-pill{border-radius:50px;padding:4px 11px;font-size:.74rem;font-weight:700}
.status-pill.normal{background:#ECFDF5;color:#065F46}
.status-pill.flagged{background:#FEF2F2;color:#DC2626}
.t-actions{display:flex;gap:6px}
.act-btn{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;transition:all .15s}
.act-btn.edit{background:#FFFBEB;border:1px solid #FDE68A}
.act-btn.edit:hover{background:#F59E0B;color:white}
.act-btn.del{background:#FEF2F2;border:1px solid #FECACA}
.act-btn.del:hover{background:#EF4444;color:white}
.table-footer{padding:12px 28px;font-size:.78rem;color:#9CA3AF}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:500;padding:20px}
.modal-panel{background:white;border-radius:20px;width:100%;max-width:680px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.modal-header{display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px;border-bottom:1px solid #F3F4F6}
.modal-title{font-size:1.1rem;font-weight:800;color:#1A1D23}
.modal-sub{font-size:.8rem;color:#6B7280;margin-top:2px}
.modal-x{background:none;border:none;width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:1rem;color:#6B7280;transition:all .15s;display:flex;align-items:center;justify-content:center}
.modal-x:hover{background:#F3F4F6;color:#1A1D23}
.modal-body{flex:1;overflow-y:auto;padding:24px 28px;display:flex;flex-direction:column;gap:20px}
.modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 28px;border-top:1px solid #F3F4F6}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field{display:flex;flex-direction:column;gap:5px}
.field label{font-size:.78rem;font-weight:700;color:#374151;letter-spacing:.2px}
.req{color:#EF4444}
.field input,.field select{border:1.5px solid #E5E7EB;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:.9rem;outline:none;color:#1A1D23;background:#FAFAFA;transition:border .2s}
.field input:focus,.field select:focus{border-color:#F26722;background:white;box-shadow:0 0 0 3px rgba(242,103,34,.1)}
.file-inp{padding:8px 10px;font-size:.82rem}
.form-section{display:flex;flex-direction:column;gap:10px}
.section-title{font-size:.78rem;font-weight:700;color:#374151}
.toggle-row{display:flex;gap:12px;flex-wrap:wrap}
.toggle-item{display:flex;align-items:center;gap:8px;cursor:pointer}
.toggle-label{font-size:.85rem;color:#374151;font-weight:600}
.chip-group{display:flex;flex-wrap:wrap;gap:7px}
.chip{padding:6px 14px;border-radius:50px;border:1.5px solid #E5E7EB;font-size:.8rem;font-weight:600;color:#374151;cursor:pointer;transition:all .15s;user-select:none}
.chip:hover{border-color:#F26722;color:#F26722}
.chip.selected{background:#F26722;border-color:#F26722;color:white}
.chip.chip-health.selected{background:#059669;border-color:#059669;color:white}
.chip.chip-health:hover{border-color:#059669;color:#059669}
.form-error{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:8px;padding:10px 14px;font-size:.84rem}
.btn-primary{background:#F26722;color:white;border:none;border-radius:10px;padding:10px 22px;font-family:inherit;font-weight:700;font-size:.88rem;cursor:pointer;display:flex;align-items:center;gap:6px;transition:background .18s}
.btn-primary:hover:not(:disabled){background:#D95A1A}
.btn-primary:disabled{opacity:.65;cursor:not-allowed}
.btn-ghost{background:none;border:1.5px solid #E5E7EB;border-radius:10px;padding:10px 22px;font-family:inherit;font-weight:700;font-size:.88rem;cursor:pointer;color:#374151;transition:all .18s}
.btn-ghost:hover{border-color:#D1D5DB;background:#F9FAFB}
.modal-enter-active,.modal-leave-active{transition:all .25s}
.modal-enter-from,.modal-leave-to{opacity:0}
.modal-enter-from .modal-panel,.modal-leave-to .modal-panel{transform:scale(.96) translateY(10px)}
</style>


