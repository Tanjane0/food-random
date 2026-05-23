<template>
  <div class="login-page">
    <div class="login-left">
      <div class="brand-area">
        <div class="brand-logo-wrap">
          <span class="brand-logo">🍽️</span>
        </div>
        <h1 class="brand-name">กินไรดี</h1>
        <p class="brand-tag">ระบบจัดการหลังบ้าน</p>
        <div class="brand-stats">
          <div class="bstat"><span class="bstat-num">51+</span><span class="bstat-lbl">เมนูอาหาร</span></div>
          <div class="bstat-div"/>
          <div class="bstat"><span class="bstat-num">3</span><span class="bstat-lbl">โหมดสุ่ม</span></div>
          <div class="bstat-div"/>
          <div class="bstat"><span class="bstat-num">AI</span><span class="bstat-lbl">Powered</span></div>
        </div>
      </div>
      <div class="brand-deco">
        <div class="deco-circle c1"/>
        <div class="deco-circle c2"/>
        <div class="deco-circle c3"/>
      </div>
    </div>

    <div class="login-right">
      <div class="login-card">
        <h2 class="card-title">ยินดีต้อนรับ 👋</h2>
        <p class="card-sub">เข้าสู่ระบบเพื่อจัดการเว็บไซต์</p>

        <form @submit.prevent="login">
          <div class="field">
            <label>Username</label>
            <div class="input-wrap">
              <span class="input-icon">👤</span>
              <input v-model="form.username" type="text" placeholder="admin" autocomplete="username"/>
            </div>
          </div>
          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <span class="input-icon">🔒</span>
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" autocomplete="current-password"/>
              <button type="button" class="eye-btn" @click="showPass=!showPass">{{ showPass ? '🙈' : '👁️' }}</button>
            </div>
          </div>

          <p v-if="error" class="error-msg">{{ error }}</p>

          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="loading" class="loading-dot"/>
            {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
const API = process.env.VUE_APP_API_URL || 'http://localhost:3000'

export default {
  name: 'AdminLogin',
  data() { return { form:{ username:'', password:'' }, loading:false, error:'', showPass:false } },
  created() { if (localStorage.getItem('adminToken')) this.$router.push('/admin/menus') },
  methods: {
    async login() {
      this.loading=true; this.error=''
      try {
        const { data } = await axios.post(`${API}/api/admin/login`, this.form)
        if (data.success) { localStorage.setItem('adminToken', data.token); this.$router.push('/admin/menus') }
      } catch { this.error='Username หรือ Password ไม่ถูกต้อง' } finally { this.loading=false }
    },
  },
}
</script>

<style scoped>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.login-page{
  min-height:100vh; display:flex;
  font-family:'Sarabun','Prompt',sans-serif;
}

/* LEFT */
.login-left{
  width:42%; background:linear-gradient(145deg,#1A1D23 0%,#2D3142 100%);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  padding:40px; position:relative; overflow:hidden;
}
.brand-area{ text-align:center; position:relative; z-index:2; }
.brand-logo-wrap{
  width:90px; height:90px; border-radius:24px;
  background:linear-gradient(135deg,rgba(242,103,34,.3),rgba(242,103,34,.1));
  border:1.5px solid rgba(242,103,34,.4);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 16px; backdrop-filter:blur(8px);
}
.brand-logo{ font-size:3.2rem; filter:drop-shadow(0 4px 12px rgba(242,103,34,.5)); }
.brand-name{ font-size:2.8rem; font-weight:900; color:#FFFFFF; letter-spacing:-1.5px; }
.brand-tag{ font-size:.9rem; color:#9CA3AF; margin-top:6px; margin-bottom:28px; }
.brand-stats{ display:flex; align-items:center; gap:16px; justify-content:center; margin-top:8px; }
.bstat{ display:flex; flex-direction:column; align-items:center; gap:2px; }
.bstat-num{ font-size:1.2rem; font-weight:800; color:#F26722; }
.bstat-lbl{ font-size:.7rem; color:#6B7280; }
.bstat-div{ width:1px; height:32px; background:rgba(255,255,255,.1); }
.deco-circle{ position:absolute; border-radius:50%; }
.c1{ width:300px; height:300px; background:rgba(242,103,34,.08); top:-80px; right:-80px; }
.c2{ width:200px; height:200px; background:rgba(242,103,34,.06); bottom:-60px; left:-60px; }
.c3{ width:120px; height:120px; background:rgba(255,255,255,.03); top:50%; left:10%; }

/* RIGHT */
.login-right{
  flex:1; background:#F7F8FA;
  display:flex; align-items:center; justify-content:center;
  padding:40px 32px;
}
.login-card{
  background:white; border-radius:20px;
  padding:40px 36px; width:100%; max-width:420px;
  box-shadow:0 4px 24px rgba(0,0,0,.08);
  border:1px solid #E5E7EB;
}
.card-title{ font-size:1.6rem; font-weight:800; color:#1A1D23; margin-bottom:4px; }
.card-sub{ font-size:.88rem; color:#6B7280; margin-bottom:28px; }

.field{ margin-bottom:18px; }
.field label{ display:block; font-size:.8rem; font-weight:700; color:#374151; margin-bottom:6px; letter-spacing:.3px; }
.input-wrap{ display:flex; align-items:center; border:1.5px solid #E5E7EB; border-radius:12px; background:#F9FAFB; transition:border .2s,box-shadow .2s; overflow:hidden; }
.input-wrap:focus-within{ border-color:#F26722; box-shadow:0 0 0 3px rgba(242,103,34,.12); background:white; }
.input-icon{ padding:0 12px; font-size:1rem; user-select:none; }
.input-wrap input{ flex:1; border:none; outline:none; padding:11px 8px 11px 0; font-family:inherit; font-size:.92rem; background:transparent; color:#1A1D23; }
.eye-btn{ background:none; border:none; cursor:pointer; padding:0 12px; font-size:.9rem; }

.error-msg{ background:#FEF2F2; color:#DC2626; border:1px solid #FECACA; border-radius:8px; padding:10px 14px; font-size:.84rem; margin-bottom:14px; }

.btn-login{
  width:100%; background:#F26722; color:white; border:none;
  border-radius:12px; padding:13px; font-size:.95rem; font-weight:700;
  cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px;
  transition:background .2s, transform .1s; margin-top:4px;
}
.btn-login:hover:not(:disabled){ background:#D95A1A; transform:translateY(-1px); }
.btn-login:active{ transform:translateY(0); }
.btn-login:disabled{ opacity:.65; cursor:not-allowed; }
.loading-dot{ width:14px; height:14px; border:2px solid rgba(255,255,255,.4); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin{ to{ transform:rotate(360deg) } }

@media(max-width:700px){
  .login-left{ display:none }
  .login-right{ background:white }
}
</style>