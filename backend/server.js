//server.js


const express = require('express')
const mysql   = require('mysql2/promise')
const cors    = require('cors')
const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')
require('dotenv').config()

const app  = express()
const PORT = process.env.PORT || 3000

// ------------------------------------------------------------
//  Middleware
// ------------------------------------------------------------
app.use(cors({
  origin: '*'
}))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ------------------------------------------------------------
//  MySQL Connection Pool
// ------------------------------------------------------------
const db = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || 'rootpassword',
  database: process.env.DB_NAME     || 'food_db',
  waitForConnections: true,
  connectionLimit: 10,
})

// ------------------------------------------------------------
//  Multer — รับ upload รูปภาพ
// ------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}${ext}`)
  }
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    allowed.includes(ext) ? cb(null, true) : cb(new Error('ไฟล์รูปภาพเท่านั้น'))
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

// ============================================================
//  ROUTES — Health check
// ============================================================
app.get('/', (req, res) => {
  res.json({ success: true, message: 'กินไรดี API is running 🍽️' })
})

// ============================================================
//  ROUTES — เมนู (User)
// ============================================================

// GET /api/menus — ดูเมนูทั้งหมด (พร้อม filter)
app.get('/api/menus', async (req, res) => {
  try {
    const { cuisine_id, is_spicy, is_vegan, is_halal, max_calories, health_tag_id, cook_method_id } = req.query

    let sql = `SELECT DISTINCT m.*, c.name AS cuisine_name FROM menus m JOIN cuisines c ON m.cuisine_id = c.id`
    const params = []

    if (health_tag_id)  sql += ` JOIN menu_health_tags mht ON m.id = mht.menu_id`
    if (cook_method_id) sql += ` JOIN menu_cook_methods mcm ON m.id = mcm.menu_id`
    if (req.query.meat_type_id) sql += ` JOIN menu_meat_types mmt ON m.id = mmt.menu_id`

    sql += ` WHERE m.status = 'normal'`

    if (cuisine_id != null && cuisine_id !== '')  { sql += ` AND m.cuisine_id = ?`;       params.push(Number(cuisine_id)) }
    if (is_spicy === 'true'  ) { sql += ` AND m.is_spicy = 1` }
    if (is_spicy === 'false' ) { sql += ` AND m.is_spicy = 0` }
    if (is_vegan === 'true'  ) { sql += ` AND m.is_vegan = 1` }
    if (is_halal === 'true'  ) { sql += ` AND m.is_halal = 1` }
    if (max_calories)          { sql += ` AND m.calories <= ?`;        params.push(Number(max_calories)) }
    if (health_tag_id)         { sql += ` AND mht.health_tag_id = ?`;  params.push(Number(health_tag_id)) }
    if (cook_method_id)        { sql += ` AND mcm.cook_method_id = ?`; params.push(Number(cook_method_id)) }
    if (req.query.meat_type_id){ sql += ` AND mmt.meat_type_id = ?`;   params.push(Number(req.query.meat_type_id)) }

    const [rows] = await db.query(sql, params)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/menus/spin — สุ่มเมนู 1 รายการ (ไม่ซ้ำ session)
app.get('/api/menus/spin', async (req, res) => {
  try {
    const { session_id, cuisine_id, is_spicy, is_vegan, is_halal, max_calories, health_tag_id, cook_method_id } = req.query

    if (!session_id) return res.status(400).json({ success: false, message: 'ต้องการ session_id' })

    const [history] = await db.query(`SELECT menu_id FROM spin_history WHERE session_id = ?`, [session_id])
    const excludeIds = history.map(r => r.menu_id)

    let sql = `SELECT DISTINCT m.*, c.name AS cuisine_name FROM menus m JOIN cuisines c ON m.cuisine_id = c.id`
    const params = []

    if (health_tag_id)  sql += ` JOIN menu_health_tags mht ON m.id = mht.menu_id`
    if (cook_method_id) sql += ` JOIN menu_cook_methods mcm ON m.id = mcm.menu_id`
    if (req.query.meat_type_id) sql += ` JOIN menu_meat_types mmt ON m.id = mmt.menu_id`

    sql += ` WHERE m.status = 'normal'`

    if (cuisine_id != null && cuisine_id !== '') { sql += ` AND m.cuisine_id = ?`;       params.push(Number(cuisine_id)) }
    if (is_spicy === 'true'  ) { sql += ` AND m.is_spicy = 1` }
    if (is_spicy === 'false' ) { sql += ` AND m.is_spicy = 0` }
    if (is_vegan === 'true'  ) { sql += ` AND m.is_vegan = 1` }
    if (is_halal === 'true'  ) { sql += ` AND m.is_halal = 1` }
    if (max_calories)          { sql += ` AND m.calories <= ?`;        params.push(Number(max_calories)) }
    if (health_tag_id)         { sql += ` AND mht.health_tag_id = ?`;  params.push(Number(health_tag_id)) }
    if (cook_method_id)        { sql += ` AND mcm.cook_method_id = ?`; params.push(Number(cook_method_id)) }
    if (req.query.meat_type_id){ sql += ` AND mmt.meat_type_id = ?`;   params.push(Number(req.query.meat_type_id)) }

    if (excludeIds.length > 0) {
      sql += ` AND m.id NOT IN (${excludeIds.map(() => '?').join(',')})`
      params.push(...excludeIds)
    }

    sql += ` ORDER BY RAND() LIMIT 1`

    const [rows] = await db.query(sql, params)

    if (rows.length === 0) {
      return res.json({ success: false, message: 'สุ่มครบทุกเมนูแล้ว' })
    }

    const menu = rows[0]

    await db.query(`INSERT INTO spin_history (session_id, menu_id) VALUES (?, ?)`, [session_id, menu.id])

    const [tags] = await db.query(`
      SELECT ht.name, ht.label FROM menu_health_tags mht
      JOIN health_tags ht ON mht.health_tag_id = ht.id
      WHERE mht.menu_id = ?
    `, [menu.id])

    menu.health_tags = tags
    res.json({ success: true, data: menu })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/menus/:id — ดูเมนูรายการเดียว (สำหรับแชร์ลิงก์)
app.get('/api/menus/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name AS cuisine_name
      FROM menus m
      JOIN cuisines c ON m.cuisine_id = c.id
      WHERE m.id = ?
    `, [req.params.id])

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบเมนู' })

    const menu = rows[0]

    const [tags] = await db.query(`
      SELECT ht.name, ht.label FROM menu_health_tags mht
      JOIN health_tags ht ON mht.health_tag_id = ht.id
      WHERE mht.menu_id = ?
    `, [menu.id])

    const [methods] = await db.query(`
      SELECT cm.name FROM menu_cook_methods mcm
      JOIN cook_methods cm ON mcm.cook_method_id = cm.id
      WHERE mcm.menu_id = ?
    `, [menu.id])

    const [meats] = await db.query(`
      SELECT mt.name FROM menu_meat_types mmt
      JOIN meat_types mt ON mmt.meat_type_id = mt.id
      WHERE mmt.menu_id = ?
    `, [menu.id])

    menu.health_tags  = tags
    menu.cook_methods = methods
    menu.meat_types   = meats
    res.json({ success: true, data: menu })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================================
//  ROUTES — ประวัติการสุ่ม (User)
// ============================================================

// GET /api/history/:session_id — ดูประวัติการสุ่ม
app.get('/api/history/:session_id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sh.spun_at, m.id, m.name, m.image_url, m.calories, c.name AS cuisine_name
      FROM spin_history sh
      JOIN menus m ON sh.menu_id = m.id
      JOIN cuisines c ON m.cuisine_id = c.id
      WHERE sh.session_id = ?
      ORDER BY sh.spun_at DESC
    `, [req.params.session_id])
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/history/:session_id — ล้างประวัติ (เริ่มสุ่มรอบใหม่)
app.delete('/api/history/:session_id', async (req, res) => {
  try {
    await db.query(`DELETE FROM spin_history WHERE session_id = ?`, [req.params.session_id])
    res.json({ success: true, message: 'ล้างประวัติแล้ว' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================================
//  ROUTES — Report (User)
// ============================================================

// POST /api/reports — ส่ง report
app.post('/api/reports', async (req, res) => {
  try {
    const { menu_id, session_id, reason, detail } = req.body
    if (!menu_id || !session_id || !reason) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบ' })
    }
    await db.query(
      `INSERT INTO reports (menu_id, session_id, reason, detail) VALUES (?, ?, ?, ?)`,
      [menu_id, session_id, reason, detail || null]
    )
    // Flag เมนูนั้นว่าถูก report
    await db.query(`UPDATE menus SET status = 'flagged' WHERE id = ?`, [menu_id])
    res.json({ success: true, message: 'ส่ง report แล้ว ขอบคุณครับ' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================================
//  ROUTES — Reference Data
// ============================================================

// GET /api/cuisines — ดึงประเภทอาหารทั้งหมด
app.get('/api/cuisines', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM cuisines ORDER BY id`)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/health-tags — ดึง tag โรคทั้งหมด
app.get('/api/health-tags', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM health_tags ORDER BY id`)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/cook-methods — ดึงวิธีปรุงทั้งหมด
app.get('/api/cook-methods', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM cook_methods ORDER BY id`)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/meat-types — ดึงประเภทเนื้อสัตว์ทั้งหมด
app.get('/api/meat-types', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM meat_types ORDER BY id`)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================================
//  ROUTES — Admin
// ============================================================

// POST /api/admin/login — เข้าสู่ระบบ admin
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    res.json({ success: true, token: 'admin-authenticated' })
  } else {
    res.status(401).json({ success: false, message: 'username หรือ password ไม่ถูกต้อง' })
  }
})

// Middleware ตรวจสอบ admin token
const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token']
  if (token === 'admin-authenticated') return next()
  res.status(401).json({ success: false, message: 'กรุณา login ก่อน' })
}

// GET /api/admin/menus — ดูเมนูทั้งหมด (admin เห็นที่ flagged ด้วย)
app.get('/api/admin/menus', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, c.name AS cuisine_name
      FROM menus m
      JOIN cuisines c ON m.cuisine_id = c.id
      ORDER BY m.created_at DESC
    `)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/admin/menus — เพิ่มเมนูใหม่ (พร้อม upload รูป)
app.post('/api/admin/menus', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, cuisine_id, calories, is_spicy, is_vegan, is_halal, health_tag_ids, cook_method_ids } = req.body
    if (!name || !cuisine_id) {
      return res.status(400).json({ success: false, message: 'ต้องการชื่อเมนูและประเภทอาหาร' })
    }

    const image_url = req.body.image_url || (req.file ? `/uploads/${req.file.filename}` : null)

    const [result] = await db.query(
      `INSERT INTO menus (name, cuisine_id, calories, image_url, is_spicy, is_vegan, is_halal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name, cuisine_id, calories || null, image_url,
        is_spicy  === 'true' ? 1 : 0,
        is_vegan  === 'true' ? 1 : 0,
        is_halal  === 'true' ? 1 : 0,
      ]
    )

    const menuId = result.insertId

    // เพิ่ม health tags
    if (health_tag_ids) {
      const ids = Array.isArray(health_tag_ids) ? health_tag_ids : [health_tag_ids]
      for (const tagId of ids) {
        await db.query(`INSERT INTO menu_health_tags (menu_id, health_tag_id) VALUES (?, ?)`, [menuId, tagId])
      }
    }

    // เพิ่ม cook methods
    if (cook_method_ids) {
      const ids = Array.isArray(cook_method_ids) ? cook_method_ids : [cook_method_ids]
      for (const methodId of ids) {
        await db.query(`INSERT INTO menu_cook_methods (menu_id, cook_method_id) VALUES (?, ?)`, [menuId, methodId])
      }
    }

    res.json({ success: true, message: 'เพิ่มเมนูสำเร็จ', id: menuId })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})



// GET /api/admin/reports — ดูรายการ report ทั้งหมด
app.get('/api/admin/reports', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, m.name AS menu_name
      FROM reports r
      JOIN menus m ON r.menu_id = m.id
      ORDER BY r.created_at DESC
    `)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PATCH /api/admin/reports/:id/resolve — mark report ว่าแก้ไขแล้ว
app.patch('/api/admin/reports/:id/resolve', adminAuth, async (req, res) => {
  try {
    await db.query(`UPDATE reports SET status = 'resolved' WHERE id = ?`, [req.params.id])
    // คืน status เมนูกลับเป็น normal
    const [report] = await db.query(`SELECT menu_id FROM reports WHERE id = ?`, [req.params.id])
    if (report.length > 0) {
      await db.query(`UPDATE menus SET status = 'normal' WHERE id = ?`, [report[0].menu_id])
    }
    res.json({ success: true, message: 'แก้ไขแล้ว' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================================
//  ROUTES — AI (Groq ผ่าน backend)
// ============================================================
app.post('/api/ai/fridge', async (req, res) => {
  try {
    const { ingredients } = req.body
    if (!ingredients || !ingredients.length) {
      return res.status(400).json({ success: false, message: 'ต้องการวัตถุดิบอย่างน้อย 1 อย่าง' })
    }

    const key = process.env.GROQ_KEY
    if (!key) {
      return res.status(500).json({ success: false, message: 'ไม่ได้ตั้งค่า GROQ_KEY ใน .env' })
    }

    const prompt = `วัตถุดิบในตู้เย็น: ${ingredients.join(', ')}
แนะนำเมนูที่ทำได้ 3 เมนู แต่ละเมนูบอก:
- ชื่อเมนู (ตัวหนา)
- วิธีทำสั้นๆ 1-2 ประโยค
- เวลาทำโดยประมาณ
ตอบเป็นภาษาไทย สนุก เป็นกันเอง`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.7,
      })
    })

    const data = await groqRes.json()

    if (!groqRes.ok) {
      const errMsg = data?.error?.message || 'Groq API error'
      return res.status(groqRes.status).json({ success: false, message: errMsg })
    }

    const text = data.choices?.[0]?.message?.content || ''
    res.json({ success: true, text })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ============================================================
//  Start Server
// ============================================================
app.listen(PORT, () => {
  console.log(`✅ กินไรดี API running at http://localhost:${PORT}`)
})


// ---- health_tags ----
app.get('/api/admin/health-tags', adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM health_tags ORDER BY id`)
    res.json({ success: true, data: rows })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

app.post('/api/admin/health-tags', adminAuth, async (req, res) => {
  try {
    const { name, label } = req.body
    if (!name || !label) return res.status(400).json({ success: false, message: 'ต้องการ name และ label' })
    const [r] = await db.query(`INSERT INTO health_tags (name, label) VALUES (?, ?)`, [name, label])
    res.json({ success: true, id: r.insertId })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

app.put('/api/admin/health-tags/:id', adminAuth, async (req, res) => {
  try {
    const { name, label } = req.body
    if (!name || !label) return res.status(400).json({ success: false, message: 'ต้องการ name และ label' })
    await db.query(`UPDATE health_tags SET name=?, label=? WHERE id=?`, [name, label, req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

app.delete('/api/admin/health-tags/:id', adminAuth, async (req, res) => {
  try {
    await db.query(`DELETE FROM menu_health_tags WHERE health_tag_id=?`, [req.params.id])
    await db.query(`DELETE FROM health_tags WHERE id=?`, [req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// ---- meat_types ----
app.post('/api/admin/meat-types', adminAuth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'ต้องการชื่อ' })
    const [r] = await db.query(`INSERT INTO meat_types (name) VALUES (?)`, [name])
    res.json({ success: true, id: r.insertId })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

app.put('/api/admin/meat-types/:id', adminAuth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'ต้องการชื่อ' })
    await db.query(`UPDATE meat_types SET name=? WHERE id=?`, [name, req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

app.delete('/api/admin/meat-types/:id', adminAuth, async (req, res) => {
  try {
    await db.query(`DELETE FROM menu_meat_types WHERE meat_type_id=?`, [req.params.id])
    await db.query(`DELETE FROM meat_types WHERE id=?`, [req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// ---- bulk assign health tags ----
app.post('/api/admin/bulk-health-tags', adminAuth, async (req, res) => {
  try {
    const { menu_ids, health_tag_id, action } = req.body
    if (!menu_ids?.length || !health_tag_id) return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบ' })
    for (const menuId of menu_ids) {
      if (action === 'remove') {
        await db.query(`DELETE FROM menu_health_tags WHERE menu_id=? AND health_tag_id=?`, [menuId, health_tag_id])
      } else {
        await db.query(`INSERT IGNORE INTO menu_health_tags (menu_id, health_tag_id) VALUES (?, ?)`, [menuId, health_tag_id])
      }
    }
    res.json({ success: true, message: `${action === 'remove' ? 'ลบ' : 'เพิ่ม'} tag สำเร็จ` })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// ---- dashboard stats ----
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const [[total]]   = await db.query(`SELECT COUNT(*) as cnt FROM menus`)
    const [[normal]]  = await db.query(`SELECT COUNT(*) as cnt FROM menus WHERE status='normal'`)
    const [[flagged]] = await db.query(`SELECT COUNT(*) as cnt FROM menus WHERE status='flagged'`)
    const [[halal]]   = await db.query(`SELECT COUNT(*) as cnt FROM menus WHERE is_halal=1`)
    const [[vegan]]   = await db.query(`SELECT COUNT(*) as cnt FROM menus WHERE is_vegan=1`)
    const [[spicy]]   = await db.query(`SELECT COUNT(*) as cnt FROM menus WHERE is_spicy=1`)
    const [[reports]] = await db.query(`SELECT COUNT(*) as cnt FROM reports WHERE status='pending'`)
    const [byCuisine] = await db.query(`SELECT c.name, COUNT(*) as cnt FROM menus m JOIN cuisines c ON m.cuisine_id=c.id GROUP BY c.id ORDER BY cnt DESC`)
    const [byHealth]  = await db.query(`SELECT ht.label, COUNT(*) as cnt FROM menu_health_tags mht JOIN health_tags ht ON mht.health_tag_id=ht.id GROUP BY ht.id ORDER BY cnt DESC`)
    res.json({ success: true, data: {
      total: total.cnt, normal: normal.cnt, flagged: flagged.cnt,
      halal: halal.cnt, vegan: vegan.cnt, spicy: spicy.cnt,
      pendingReports: reports.cnt, byCuisine, byHealth
    }})
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
// ============================================================
//  ROUTES — Admin แก้ไขเมนู + จัดการ cuisines/cook_methods
// ============================================================

// PUT /api/admin/menus/:id — แก้ไขเมนู
app.put('/api/admin/menus/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, cuisine_id, calories, is_spicy, is_vegan, is_halal, health_tag_ids, cook_method_ids } = req.body
    const id = req.params.id
    if (!name || !cuisine_id) return res.status(400).json({ success: false, message: 'ต้องการชื่อเมนูและประเภทอาหาร' })

    let sql = `UPDATE menus SET name=?, cuisine_id=?, calories=?, is_spicy=?, is_vegan=?, is_halal=?`
    const params = [name, cuisine_id, calories || null,
      is_spicy === 'true' ? 1 : 0, is_vegan === 'true' ? 1 : 0, is_halal === 'true' ? 1 : 0]
      if (req.body.image_url) { sql += `, image_url=?`; params.push(req.body.image_url) }
      else if (req.file) { sql += `, image_url=?`; params.push(`/uploads/${req.file.filename}`) }
    sql += ` WHERE id=?`; params.push(id)
    await db.query(sql, params)

    await db.query(`DELETE FROM menu_health_tags WHERE menu_id = ?`, [id])
    if (health_tag_ids) {
      const ids = Array.isArray(health_tag_ids) ? health_tag_ids : [health_tag_ids]
      for (const tagId of ids) await db.query(`INSERT INTO menu_health_tags (menu_id, health_tag_id) VALUES (?, ?)`, [id, tagId])
    }
    await db.query(`DELETE FROM menu_cook_methods WHERE menu_id = ?`, [id])
    if (cook_method_ids) {
      const ids = Array.isArray(cook_method_ids) ? cook_method_ids : [cook_method_ids]
      for (const m of ids) await db.query(`INSERT INTO menu_cook_methods (menu_id, cook_method_id) VALUES (?, ?)`, [id, m])
    }
    // อัปเดต meat types
    await db.query(`DELETE FROM menu_meat_types WHERE menu_id = ?`, [id])
    const { meat_type_ids } = req.body
    if (meat_type_ids) {
      const ids = Array.isArray(meat_type_ids) ? meat_type_ids : [meat_type_ids]
      for (const m of ids) await db.query(`INSERT INTO menu_meat_types (menu_id, meat_type_id) VALUES (?, ?)`, [id, m])
    }
    res.json({ success: true, message: 'แก้ไขเมนูสำเร็จ' })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// GET /api/admin/menus/:id/tags — ดึง health_tags, cook_methods และ meat_types ของเมนู
app.get('/api/admin/menus/:id/tags', adminAuth, async (req, res) => {
  try {
    const [tags]    = await db.query(`SELECT health_tag_id  as id FROM menu_health_tags  WHERE menu_id=?`, [req.params.id])
    const [methods] = await db.query(`SELECT cook_method_id as id FROM menu_cook_methods WHERE menu_id=?`, [req.params.id])
    const [meats]   = await db.query(`SELECT meat_type_id   as id FROM menu_meat_types   WHERE menu_id=?`, [req.params.id])
    res.json({ success:true, health_tag_ids:tags.map(r=>r.id), cook_method_ids:methods.map(r=>r.id), meat_type_ids:meats.map(r=>r.id) })
  } catch (err) { res.status(500).json({ success:false, message:err.message }) }
})

// ---- cuisines ----
app.post('/api/admin/cuisines', adminAuth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'ต้องการชื่อประเภท' })
    const [r] = await db.query(`INSERT INTO cuisines (name) VALUES (?)`, [name])
    res.json({ success: true, id: r.insertId })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
app.put('/api/admin/cuisines/:id', adminAuth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'ต้องการชื่อประเภท' })
    await db.query(`UPDATE cuisines SET name=? WHERE id=?`, [name, req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
app.delete('/api/admin/cuisines/:id', adminAuth, async (req, res) => {
  try {
    const [used] = await db.query(`SELECT COUNT(*) as cnt FROM menus WHERE cuisine_id=?`, [req.params.id])
    if (used[0].cnt > 0) return res.status(400).json({ success: false, message: `มีเมนู ${used[0].cnt} รายการที่ใช้ประเภทนี้อยู่` })
    await db.query(`DELETE FROM cuisines WHERE id=?`, [req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// ---- cook_methods ----
app.post('/api/admin/cook-methods', adminAuth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'ต้องการชื่อวิธีปรุง' })
    const [r] = await db.query(`INSERT INTO cook_methods (name) VALUES (?)`, [name])
    res.json({ success: true, id: r.insertId })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
app.put('/api/admin/cook-methods/:id', adminAuth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'ต้องการชื่อวิธีปรุง' })
    await db.query(`UPDATE cook_methods SET name=? WHERE id=?`, [name, req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})
app.delete('/api/admin/cook-methods/:id', adminAuth, async (req, res) => {
  try {
    await db.query(`DELETE FROM cook_methods WHERE id=?`, [req.params.id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})