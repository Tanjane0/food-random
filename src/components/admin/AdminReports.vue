<template>
  <div class="a-layout">
    <aside class="sidebar">
      <div class="sb-brand"><span class="sb-logo"><img src="../../assets/logo.png" alt="logo"></span><div><div class="sb-role">Admin Panel</div></div></div>
      <div class="sb-section-label">เมนูหลัก</div>
      <nav class="sb-nav">
        <router-link to="/admin/menus"     class="sb-item"><span><i class="bi bi-egg-fried"></i></span> จัดการเมนู</router-link>
        <router-link to="/admin/reference" class="sb-item"><span><i class="bi bi-archive"></i></span> ประเภท / วิธีปรุง</router-link>
        <router-link to="/admin/reports"   class="sb-item"><span><i class="bi bi-flag"></i></span> รายการ Report <span v-if="pendingCount>0" class="sb-badge">{{ pendingCount }}</span></router-link>
      </nav>
      <div class="sb-bottom">
        <div class="sb-user"><div class="sb-avatar">A</div><div><div class="sb-uname">Administrator</div><div class="sb-uemail">admin@kinraidee</div></div></div>
        <button class="sb-logout" @click="logout" title="ออกจากระบบ">⏻</button>
      </div>
    </aside>

    <div class="a-main">
      <header class="topbar">
        <div>
          <h1 class="page-title">รายการ Report</h1>
          <p class="page-sub">{{ pendingCount }} รายการรอดำเนินการ · {{ reports.length }} รายการทั้งหมด</p>
        </div>
      </header>

      <div class="stats-bar">
        <div class="stat-card"><div class="stat-num">{{ reports.length }}</div><div class="stat-lbl">ทั้งหมด</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#F59E0B">{{ pendingCount }}</div><div class="stat-lbl">รอดำเนินการ</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#10B981">{{ reports.filter(r=>r.status==='resolved').length }}</div><div class="stat-lbl">แก้ไขแล้ว</div></div>
        <div class="stat-card"><div class="stat-num" style="color:#EF4444">{{ reports.filter(r=>r.reason==='wrong_health_tag').length }}</div><div class="stat-lbl">tag สุขภาพผิด</div></div>
      </div>

      <div class="toolbar">
        <div class="filter-tabs">
          <button class="ftab" :class="{active:statusFilter===''}"         @click="statusFilter=''">ทั้งหมด ({{ reports.length }})</button>
          <button class="ftab" :class="{active:statusFilter==='pending'}"  @click="statusFilter='pending'"><i class="bi bi-hourglass-split"></i> รอดำเนินการ ({{ pendingCount }})</button>
          <button class="ftab" :class="{active:statusFilter==='resolved'}" @click="statusFilter='resolved'"><i class="bi bi-check"></i> แก้ไขแล้ว</button>
        </div>
      </div>

      <transition name="toast">
        <div v-if="toast.show" class="toast success">{{ toast.msg }}</div>
      </transition>

      <div class="table-wrap">
        <div v-if="loading" class="t-state"><div class="spinner"/><p>กำลังโหลด...</p></div>
        <div v-else-if="filteredReports.length===0" class="t-state">
          <p style="font-size:2rem">🎉</p>
          <p>{{ statusFilter==='pending' ? 'ไม่มี report รอดำเนินการ' : 'ไม่มีรายการ' }}</p>
        </div>
        <table v-else class="data-table">
          <thead>
            <tr><th>เมนู</th><th>สาเหตุ</th><th>รายละเอียด</th><th>วันที่</th><th>สถานะ</th><th style="width:120px"/></tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredReports" :key="r.id" :class="{'row-resolved':r.status==='resolved'}">
              <td><span class="t-name">{{ r.menu_name }}</span></td>
              <td><span class="reason-tag">{{ reasonLabel(r.reason) }}</span></td>
              <td class="t-detail">{{ r.detail||'—' }}</td>
              <td class="t-muted t-date">{{ formatDate(r.created_at) }}</td>
              <td>
                <span class="status-pill" :class="r.status">
                  {{ r.status==='resolved' ? '✓ แก้ไขแล้ว' : '<i class="bi bi-hourglass-split"></i> รอดำเนินการ' }}
                </span>
              </td>
              <td>
                <button v-if="r.status==='pending'" class="btn-resolve" @click="resolve(r)">✓ แก้ไขแล้ว</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">แสดง {{ filteredReports.length }} จาก {{ reports.length }} รายการ</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
const API=process.env.VUE_APP_API_URL||'http://localhost:3000'
const HEADERS=()=>({'x-admin-token':localStorage.getItem('adminToken')})
export default {
  name:'AdminReports',
  data(){return{reports:[],loading:true,statusFilter:'pending',toast:{show:false,msg:''}}},
  computed:{
    pendingCount(){return this.reports.filter(r=>r.status==='pending').length},
    filteredReports(){return this.statusFilter?this.reports.filter(r=>r.status===this.statusFilter):this.reports},
  },
  async created(){
    try{const{data}=await axios.get(`${API}/api/admin/reports`,{headers:HEADERS()});this.reports=data.data||[]}
    catch(e){console.error(e)}finally{this.loading=false}
  },
  methods:{
    async resolve(r){
      try{
        await axios.patch(`${API}/api/admin/reports/${r.id}/resolve`,{},{headers:HEADERS()})
        r.status='resolved';this.toast={show:true,msg:'แก้ไข report แล้ว ✓'}
        setTimeout(()=>this.toast.show=false,3000)
      }catch{alert('เกิดข้อผิดพลาด')}
    },
    reasonLabel(r){return{wrong_calories:'🔢 แคลอรี่ผิด',wrong_image:'🖼️ รูปไม่ตรง',wrong_health_tag:'⚕️ tag โรคผิด',other:'📝 อื่นๆ'}[r]||r},
    formatDate(ts){return ts?new Date(ts).toLocaleString('th-TH',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):''},
    logout(){localStorage.removeItem('adminToken');this.$router.push('/admin/login')},
  },
}
</script>

<style scoped>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.a-layout{display:flex;min-height:100vh;font-family:'Sarabun','Prompt',sans-serif;background:#F7F8FA}
.sidebar{width:240px;background:#1A1D23;display:flex;flex-direction:column;padding:20px 0;flex-shrink:0;position:sticky;top:0;height:100vh}
.sb-brand{display:flex;align-items:center;gap:12px;padding:0 20px 24px;border-bottom:1px solid rgba(255,255,255,.06)}
.sb-logo-wrap{width:38px;height:38px;border-radius:10px;background:rgba(242,103,34,.2);border:1px solid rgba(242,103,34,.3);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden}.sb-logo-img{width:100%;height:100%;object-fit:contain;padding:3px}.sb-logo-fb{font-size:1.4rem;display:none}.sb-name{font-size:1rem;font-weight:800;color:white}.sb-role{font-size:.7rem;color:#6B7280;margin-top:1px}
.sb-section-label{font-size:.68rem;font-weight:700;color:#4B5563;letter-spacing:1.5px;text-transform:uppercase;padding:16px 20px 8px}
.sb-nav{display:flex;flex-direction:column;gap:2px;padding:0 10px}
.sb-item{display:flex;align-items:center;gap:10px;color:#9CA3AF;text-decoration:none;padding:10px 12px;border-radius:10px;font-size:.88rem;font-weight:600;transition:all .18s;position:relative}
.sb-item:hover{background:rgba(255,255,255,.06);color:white}
.sb-item.router-link-active{background:rgba(242,103,34,.15);color:#F26722}
.sb-badge{margin-left:auto;background:#EF4444;color:white;border-radius:50px;font-size:.68rem;font-weight:700;padding:2px 7px}
.sb-bottom{margin-top:auto;padding:16px 10px;border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:10px}
.sb-user{display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:0 10px}
.sb-avatar{width:32px;height:32px;border-radius:50%;background:#F26722;color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.9rem;flex-shrink:0}
.sb-uname{font-size:.82rem;font-weight:700;color:white}.sb-uemail{font-size:.72rem;color:#6B7280}
.sb-logout{background:none;border:1px solid rgba(255,255,255,.1);color:#6B7280;border-radius:8px;width:32px;height:32px;cursor:pointer;font-size:.9rem;transition:all .18s;flex-shrink:0}
.sb-logout:hover{background:rgba(239,68,68,.15);border-color:#EF4444;color:#EF4444}
.a-main{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{display:flex;justify-content:space-between;align-items:flex-start;padding:24px 28px 0}
.page-title{font-size:1.5rem;font-weight:800;color:#1A1D23}.page-sub{font-size:.8rem;color:#6B7280;margin-top:3px}
.stats-bar{display:flex;gap:14px;padding:16px 28px}
.stat-card{background:white;border:1px solid #E5E7EB;border-radius:12px;padding:14px 20px;flex:1;text-align:center}
.stat-num{font-size:1.6rem;font-weight:900;color:#1A1D23;line-height:1}.stat-lbl{font-size:.74rem;color:#6B7280;margin-top:4px}
.toolbar{padding:0 28px 14px}
.filter-tabs{display:flex;background:white;border:1.5px solid #E5E7EB;border-radius:10px;overflow:hidden;width:fit-content}
.ftab{padding:8px 18px;border:none;background:none;cursor:pointer;font-family:inherit;font-size:.82rem;font-weight:600;color:#6B7280;transition:all .15s}
.ftab:hover{background:#F9FAFB}.ftab.active{background:#F26722;color:white}
.toast{position:fixed;top:20px;right:24px;z-index:999;padding:12px 20px;border-radius:12px;font-weight:700;font-size:.85rem;background:#ECFDF5;color:#065F46;border:1px solid #A7F3D0;box-shadow:0 4px 20px rgba(0,0,0,.1)}
.toast-enter-active,.toast-leave-active{transition:all .3s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translateX(20px)}
.table-wrap{flex:1;margin:0 28px;background:white;border-radius:14px;border:1px solid #E5E7EB;overflow:hidden}
.t-state{text-align:center;padding:60px 20px;color:#9CA3AF;display:flex;flex-direction:column;align-items:center;gap:10px}
.spinner{width:32px;height:32px;border:3px solid #E5E7EB;border-top-color:#F26722;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}
.data-table{width:100%;border-collapse:collapse;font-size:.86rem}
.data-table thead th{background:#F9FAFB;padding:11px 16px;text-align:left;font-weight:700;font-size:.76rem;color:#374151;letter-spacing:.3px;border-bottom:1px solid #E5E7EB}
.data-table tbody td{padding:12px 16px;border-bottom:1px solid #F3F4F6;vertical-align:middle}
.data-table tbody tr:last-child td{border-bottom:none}
.data-table tbody tr:hover td{background:#FAFAFA}
.row-resolved td{opacity:.5}
.t-name{font-weight:700;color:#1A1D23}.t-detail{color:#6B7280;font-size:.82rem;max-width:200px}.t-muted{color:#9CA3AF}.t-date{font-size:.78rem;white-space:nowrap}
.reason-tag{background:#F3F4F6;color:#374151;border-radius:6px;padding:3px 9px;font-size:.76rem;font-weight:600;white-space:nowrap}
.status-pill{border-radius:50px;padding:4px 11px;font-size:.74rem;font-weight:700;white-space:nowrap}
.status-pill.pending{background:#FFFBEB;color:#92400E}.status-pill.resolved{background:#ECFDF5;color:#065F46}
.btn-resolve{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46;border-radius:8px;padding:5px 12px;cursor:pointer;font-size:.8rem;font-family:inherit;font-weight:700;white-space:nowrap;transition:all .18s}
.btn-resolve:hover{background:#059669;color:white;border-color:#059669}
.table-footer{padding:12px 28px;font-size:.78rem;color:#9CA3AF}
</style>