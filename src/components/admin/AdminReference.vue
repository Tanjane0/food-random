<template>
  <div class="a-layout">
    <aside class="sidebar">
      <div class="sb-brand">
        <div class="sb-logo-wrap">
          <img src="../../assets/logo.png" alt="logo" class="sb-logo-img"
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
        <router-link to="/admin/menus"     class="sb-item"><i class="bi bi-egg-fried sb-icon"></i> จัดการเมนู</router-link>
        <router-link to="/admin/reference" class="sb-item"><i class="bi bi-archive sb-icon"></i> ประเภท / วิธีปรุง</router-link>
        <router-link to="/admin/reports"   class="sb-item"><i class="bi bi-flag sb-icon"></i> รายการ Report</router-link>
      </nav>
      <div class="sb-bottom">
        <div class="sb-user">
          <div class="sb-avatar">A</div>
          <div><div class="sb-uname">Administrator</div><div class="sb-uemail">admin@kinraidee</div></div>
        </div>
        <button class="sb-logout" @click="logout" title="ออกจากระบบ">⏻</button>
      </div>
    </aside>

    <div class="a-main">
      <header class="topbar">
        <div>
          <h1 class="page-title">จัดการข้อมูลอ้างอิง</h1>
          <p class="page-sub">ประเภทอาหาร · วิธีปรุง · เนื้อสัตว์ · tag สุขภาพ</p>
        </div>
      </header>

      <!-- Toast -->
      <transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>
      </transition>

      <div class="ref-grid">

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
          <div class="ref-list">
            <div v-if="!meatTypes.length" class="ref-empty">ยังไม่มีข้อมูล</div>
            <div v-for="m in meatTypes" :key="m.id" class="ref-item">
              <span class="ref-name">{{ m.name }}</span>
            </div>
          </div>
          <p class="ref-note">* จัดการผ่าน phpMyAdmin โดยตรง</p>
        </div>

        <!-- health tags -->
        <div class="a-card">
          <div class="card-head">
            <h2 class="card-title">⚕️ Tag สุขภาพ</h2>
            <span class="count-badge">{{ healthTags.length }}</span>
          </div>
          <div class="ref-list">
            <div v-for="t in healthTags" :key="t.id" class="ref-item">
              <div>
                <span class="ref-name">{{ t.label }}</span>
                <span class="ref-key">{{ t.name }}</span>
              </div>
            </div>
          </div>
          <p class="ref-note">* จัดการผ่าน phpMyAdmin โดยตรง</p>
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
      cuisines:[], cookMethods:[], meatTypes:[], healthTags:[],
      newCuisine:'', newMethod:'',
      editingCuisine:null, editCuisineName:'',
      editingMethod:null,  editMethodName:'',
      toast:{ show:false, msg:'', type:'success' },
    }
  },
  async created() {
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
  methods: {
    showToast(msg, type='success') {
      this.toast={ show:true, msg, type }
      setTimeout(()=>this.toast.show=false, 2500)
    },
    // Cuisines
    async addCuisine() {
      const name=this.newCuisine.trim(); if(!name) return
      try {
        const { data } = await axios.post(`${API}/api/admin/cuisines`, { name }, { headers:HEADERS() })
        if (data.success) { this.cuisines.push({ id:data.id, name }); this.newCuisine=''; this.showToast('เพิ่มประเภทอาหารแล้ว ✓') }
      } catch(e) { this.showToast(e.response?.data?.message||'เกิดข้อผิดพลาด','error') }
    },
    startEditCuisine(c) { this.editingCuisine=c.id; this.editCuisineName=c.name },
    async saveCuisine(c) {
      const name=this.editCuisineName.trim(); if(!name) return
      try {
        await axios.put(`${API}/api/admin/cuisines/${c.id}`, { name }, { headers:HEADERS() })
        c.name=name; this.editingCuisine=null; this.showToast('แก้ไขแล้ว ✓')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด','error') }
    },
    async deleteCuisine(c) {
      if (!confirm(`ลบประเภท "${c.name}" ใช่ไหมคะ?`)) return
      try {
        await axios.delete(`${API}/api/admin/cuisines/${c.id}`, { headers:HEADERS() })
        this.cuisines=this.cuisines.filter(x=>x.id!==c.id); this.showToast('ลบแล้ว','warn')
      } catch(e) { this.showToast(e.response?.data?.message||'เกิดข้อผิดพลาด','error') }
    },
    // Cook methods
    async addMethod() {
      const name=this.newMethod.trim(); if(!name) return
      try {
        const { data } = await axios.post(`${API}/api/admin/cook-methods`, { name }, { headers:HEADERS() })
        if (data.success) { this.cookMethods.push({ id:data.id, name }); this.newMethod=''; this.showToast('เพิ่มวิธีปรุงแล้ว ✓') }
      } catch(e) { this.showToast('เกิดข้อผิดพลาด','error') }
    },
    startEditMethod(m) { this.editingMethod=m.id; this.editMethodName=m.name },
    async saveMethod(m) {
      const name=this.editMethodName.trim(); if(!name) return
      try {
        await axios.put(`${API}/api/admin/cook-methods/${m.id}`, { name }, { headers:HEADERS() })
        m.name=name; this.editingMethod=null; this.showToast('แก้ไขแล้ว ✓')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด','error') }
    },
    async deleteMethod(m) {
      if (!confirm(`ลบวิธีปรุง "${m.name}" ใช่ไหมคะ?`)) return
      try {
        await axios.delete(`${API}/api/admin/cook-methods/${m.id}`, { headers:HEADERS() })
        this.cookMethods=this.cookMethods.filter(x=>x.id!==m.id); this.showToast('ลบแล้ว','warn')
      } catch(e) { this.showToast('เกิดข้อผิดพลาด','error') }
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
.sb-nav{display:flex;flex-direction:column;gap:2px;padding:0 10px;flex:1}
.sb-item{display:flex;align-items:center;gap:10px;color:#9CA3AF;text-decoration:none;padding:10px 12px;border-radius:10px;font-size:.88rem;font-weight:600;transition:all .18s}
.sb-item:hover{background:rgba(255,255,255,.06);color:white}
.sb-item.router-link-active{background:rgba(242,103,34,.15);color:#F26722}
.sb-icon{font-size:.9rem;width:18px}
.sb-bottom{padding:16px 10px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:10px}
.sb-user{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:0 10px}
.sb-avatar{width:32px;height:32px;border-radius:50%;background:#F26722;color:white;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0}
.sb-uname{font-size:.82rem;font-weight:700;color:white}.sb-uemail{font-size:.72rem;color:#6B7280}
.sb-logout{background:none;border:1px solid rgba(255,255,255,.1);color:#6B7280;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:.9rem;transition:all .18s;flex-shrink:0}
.sb-logout:hover{background:rgba(239,68,68,.15);border-color:#EF4444;color:#EF4444}

/* MAIN */
.a-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
.topbar{padding:24px 28px 0}
.page-title{font-size:1.5rem;font-weight:800;color:#1A1D23}
.page-sub{font-size:.8rem;color:#6B7280;margin-top:3px}

/* Toast */
.toast{position:fixed;top:20px;right:24px;z-index:999;padding:12px 20px;border-radius:12px;font-weight:700;font-size:.85rem;box-shadow:0 4px 20px rgba(0,0,0,.12)}
.toast.success{background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0}
.toast.warn{background:#FFFBEB;color:#92400E;border:1px solid #FDE68A}
.toast.error{background:#FEF2F2;color:#991B1B;border:1px solid #FECACA}
.toast-enter-active,.toast-leave-active{transition:all .3s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translateX(20px)}

/* Grid */
.ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;padding:20px 28px 40px}

/* Card */
.a-card{background:white;border-radius:16px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,.05);border:1px solid #E5E7EB;display:flex;flex-direction:column;gap:14px}
.card-head{display:flex;align-items:center;justify-content:space-between}
.card-title{font-weight:800;color:#1A1D23;font-size:1rem}
.count-badge{background:#F26722;color:white;border-radius:50px;padding:2px 10px;font-size:.74rem;font-weight:700}

/* Add row */
.add-row{display:flex;gap:8px}
.ref-inp{flex:1;border:1.5px solid #E5E7EB;border-radius:10px;padding:8px 12px;font-family:inherit;font-size:.88rem;outline:none;background:#FAFAFA;transition:border .2s}
.ref-inp:focus{border-color:#F26722;background:white;box-shadow:0 0 0 3px rgba(242,103,34,.1)}
.btn-add{background:#F26722;color:white;border:none;border-radius:10px;padding:8px 16px;font-family:inherit;font-weight:700;font-size:.85rem;cursor:pointer;white-space:nowrap;transition:background .18s}
.btn-add:hover{background:#D95A1A}

/* List */
.ref-list{display:flex;flex-direction:column;gap:6px;max-height:320px;overflow-y:auto}
.ref-empty{text-align:center;color:#D1D5DB;font-size:.85rem;padding:16px}
.ref-item{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;background:#F9FAFB;border-radius:10px;border:1px solid #F3F4F6;transition:background .15s}
.ref-item:hover{background:#F3F4F6}
.ref-name{font-size:.88rem;font-weight:600;color:#1A1D23;flex:1}
.ref-key{font-size:.72rem;color:#9CA3AF;font-family:monospace;margin-left:8px}
.ref-inp-edit{flex:1;border:1.5px solid #F26722;border-radius:8px;padding:6px 10px;font-family:inherit;font-size:.86rem;outline:none}
.ref-note{font-size:.74rem;color:#D1D5DB;font-style:italic;text-align:center}

/* Buttons */
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
</style>