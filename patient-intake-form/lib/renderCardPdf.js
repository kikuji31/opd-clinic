const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html');
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo-white.png');
const ASCENT_LOGO_PATH = path.join(__dirname, '..', 'public', 'ascent-logo.png');
const FONT_REGULAR_PATH = path.join(__dirname, 'fonts', 'NotoSansThai-Regular.ttf');
const FONT_BOLD_PATH = path.join(__dirname, 'fonts', 'NotoSansThai-Bold.ttf');

function calcAge(dobStr) {
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function formatThaiDate(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const yearBE = d.getFullYear() + 543;
  return `${day}/${month}/${yearBE}`;
}

// Printed card shows gender as a single letter rather than the full Thai
// word the patient picked in the form.
function genderLabel(g) {
  if (g === 'ชาย') return 'M';
  if (g === 'หญิง') return 'F';
  if (g === 'ไม่ระบุ') return 'L';
  return g;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function fillSpan(html, id, value) {
  // outFindUs is a <div>, the rest are <span> — match either tag by id.
  const text = value && String(value).trim() ? escapeHtml(value) : '—';
  const re = new RegExp(`(<(span|div) class="[^"]*" id="${id}"[^>]*>)([\\s\\S]*?)(</\\2>)`);
  return html.replace(re, `$1${text}$4`);
}

// Builds a standalone HTML document for the printed OPD card, reusing the
// exact same markup/CSS as public/index.html so the PDF matches what
// patients and staff see on screen and via the browser print dialog.
function renderCardHtml(patient) {
  const source = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const styleMatch = source.match(/<style>([\s\S]*?)<\/style>/);
  const style = styleMatch ? styleMatch[1] : '';

  const docStart = source.indexOf('<div id="doc">');
  const scriptStart = source.indexOf('<script>');
  let docHtml = source.slice(docStart, scriptStart);

  const logoBase64 = fs.readFileSync(LOGO_PATH).toString('base64');
  docHtml = docHtml.replace('src="logo-white.png"', `src="data:image/png;base64,${logoBase64}"`);

  const ascentLogoBase64 = fs.readFileSync(ASCENT_LOGO_PATH).toString('base64');
  docHtml = docHtml.replace('src="ascent-logo.png"', `src="data:image/png;base64,${ascentLogoBase64}"`);

  const dobVal = patient.date_of_birth;
  const dobDate = dobVal ? new Date(dobVal) : null;

  docHtml = fillSpan(docHtml, 'outName', `${patient.first_name || ''} ${patient.last_name || ''}`.trim());
  docHtml = fillSpan(docHtml, 'outNickname', patient.nickname);
  docHtml = fillSpan(docHtml, 'outGender', genderLabel(patient.gender));
  docHtml = fillSpan(docHtml, 'outDob', dobDate ? formatThaiDate(dobDate) : '');
  docHtml = fillSpan(docHtml, 'outAge', dobDate ? String(calcAge(dobVal)) : '');
  docHtml = fillSpan(docHtml, 'outAddress', patient.address);
  docHtml = fillSpan(docHtml, 'outCountry', patient.country);
  docHtml = fillSpan(docHtml, 'outPhone', patient.phone);
  docHtml = fillSpan(docHtml, 'outEmail', patient.email);
  docHtml = fillSpan(docHtml, 'outAllergy', patient.allergy_history || 'ไม่มี');
  docHtml = fillSpan(docHtml, 'outFindUs', patient.find_us);
  docHtml = fillSpan(docHtml, 'outVisitDate', formatThaiDate(new Date()));

  docHtml = fillSpan(docHtml, 'outUnderlying', patient.underlying_disease);
  docHtml = fillSpan(docHtml, 'outMedication', patient.regular_medication);
  docHtml = fillSpan(docHtml, 'outAnestheticAllergy', patient.anesthetic_allergy);
  docHtml = fillSpan(docHtml, 'outLifestyle', patient.lifestyle);
  docHtml = fillSpan(docHtml, 'outSurgery', patient.facial_surgery);
  docHtml = fillSpan(docHtml, 'outAccident', patient.facial_accident);
  docHtml = fillSpan(docHtml, 'outBotox', patient.botox_history);
  docHtml = fillSpan(docHtml, 'outFiller', patient.filler_history);

  // The serverless Chromium used to render this on Vercel ships with no
  // Thai-capable fonts at all, so Thai text (most of this card) would
  // silently disappear unless a Thai font is embedded directly as data —
  // no reliance on whatever fonts happen to be installed on the host.
  const fontRegularBase64 = fs.readFileSync(FONT_REGULAR_PATH).toString('base64');
  const fontBoldBase64 = fs.readFileSync(FONT_BOLD_PATH).toString('base64');

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<style>
@font-face {
  font-family: 'PdfThai';
  font-weight: 400;
  src: url(data:font/ttf;base64,${fontRegularBase64}) format('truetype');
}
@font-face {
  font-family: 'PdfThai';
  font-weight: 700 800;
  src: url(data:font/ttf;base64,${fontBoldBase64}) format('truetype');
}
${style}
* { font-family: 'PdfThai', sans-serif !important; }
#doc { display: block !important; }
.handoff, .doc-actions { display: none !important; }
</style>
</head>
<body>
${docHtml}
</body>
</html>`;
}

module.exports = { renderCardHtml };
