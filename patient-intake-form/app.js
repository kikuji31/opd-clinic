require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Create a new patient record from the intake form and hand back the
// HN code assigned to it, so the OPD card can show a real HN instead of
// leaving it blank for staff to write in by hand.
app.post('/api/patients', async (req, res) => {
  const {
    first_name,
    last_name,
    nickname,
    gender,
    date_of_birth,
    phone,
    email,
    address,
    allergy_history,
  } = req.body;

  if (!first_name || !last_name || !phone) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อ, นามสกุล และเบอร์โทรให้ครบถ้วน' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Same advisory lock name as frontstore — both write to the same
    // patients table, so HN generation must serialize across both.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('patients_hn_seq'))");

    const nextHnResult = await client.query(
      `SELECT COALESCE(MAX(SUBSTRING(hn_code FROM 3)::int), 0) + 1 AS next FROM patients`
    );
    const hnCode = 'HN' + String(nextHnResult.rows[0].next).padStart(5, '0');

    const insertResult = await client.query(
      `INSERT INTO patients (
         hn_code, first_name, last_name, nickname, gender, date_of_birth,
         phone, email, address, allergy_history
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        hnCode,
        first_name,
        last_name,
        nickname || null,
        gender || null,
        date_of_birth || null,
        phone,
        email || null,
        address || null,
        allergy_history || null,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({ patient: insertResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
  } finally {
    client.release();
  }
});

module.exports = app;
