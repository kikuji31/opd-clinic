require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { renderCardHtml } = require('./lib/renderCardPdf');
const { htmlToPdf } = require('./lib/generatePdf');
const { uploadPdf } = require('./lib/uploadToDrive');

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
    find_us,
    reason_for_visit,
    underlying_disease,
    regular_medication,
    drug_allergy,
    allergy_symptom,
    specific_allergy,
    lifestyle,
    facial_surgery,
    facial_accident,
    botox_history,
    filler_history,
    thread_lift_history,
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
    const patient = insertResult.rows[0];

    // Must run before responding: Vercel serverless functions freeze right
    // after the response is sent, so "fire and forget" work here would not
    // reliably finish. Registration itself must not fail because of this,
    // so a Drive/PDF error is logged rather than surfaced to the patient.
    try {
      const html = renderCardHtml({
        ...patient,
        find_us,
        reason_for_visit,
        underlying_disease,
        regular_medication,
        drug_allergy,
        allergy_symptom,
        specific_allergy,
        lifestyle,
        facial_surgery,
        facial_accident,
        botox_history,
        filler_history,
        thread_lift_history,
      });
      const pdf = await htmlToPdf(html);
      const safeName = `${patient.first_name}_${patient.last_name}`.replace(/[\\/:*?"<>|]/g, '');
      await uploadPdf(pdf, `${patient.hn_code}_${safeName}.pdf`);
    } catch (uploadErr) {
      console.error('Google Drive upload failed:', uploadErr);
    }

    res.status(201).json({ patient });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' });
  } finally {
    client.release();
  }
});

module.exports = app;
