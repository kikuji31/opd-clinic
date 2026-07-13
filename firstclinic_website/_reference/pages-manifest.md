# First Clinic Website — Page Manifest & Content Source of Truth

Read `partials.html` first (shared head/nav/footer/floating-buttons — copy verbatim into
every page, only swap `PAGE_SEO_TITLE`, `PAGE_META_DESCRIPTION`, `CURRENT_PAGE_NAME`, and
drop the breadcrumb block on `index.html`). Every page links `assets/style.css` and
`assets/script.js` with a plain relative path (`assets/...`) — all HTML files live flat in
the project root, do not nest into subfolders.

Use component classes already defined in `assets/style.css`: `.hero`, `.card`, `.grid-3`,
`.steps`, `.faq-item`, `.promo-card`, `.doctor-card`, `.notice`, `.tag-sample`,
`.img-placeholder`, `.breadcrumb`, `.btn-primary` etc. Don't invent new component CSS unless
truly needed — reuse what's there so all 20 pages look like one system.

## Real clinic data (verified from firstclinic.co.th — use as-is)
- **Name:** First Clinic (เฟิสท์ คลินิก) — specializes in **eye-area fillers**, performed by
  an ophthalmologist. Not a general botox/laser clinic — do not invent botox or laser hair
  removal services.
- **Doctor:** นพ.ลัทธพล ม้าลายทอง (Dr. Lattapol Malaitong), nicknamed "หมอเฟิสท์" (Doctor First).
  Credentials: แพทยศาสตร์บัณฑิต รพ.พระมงกุฎเกล้า, วุฒิบัตรจักษุวิทยา, อนุสาขากระจกตาและเลสิก,
  ประกาศนียบัตรเวชศาสตร์ความงาม, Advanced Filler Injection certification, AMI Trainer (2017–2021).
- **Tagline:** "ให้คุณได้เป็นตัวเองในแบบที่สวยที่สุด"
- **Phones:** 094-409-4449, 092-808-8088. **IG:** @firstclinic49. FB/YouTube/LINE exist, exact
  handles/URLs not confirmed — link placeholders (`href="#"` or best-guess) are fine.
- **Services confirmed real:** double-layer eye filler, under-eye filler (tear trough), filler
  correction (fixing lumpy/stiff prior results), forehead/cheek-line/sunken-cheek/temple/chin
  filler, non-invasive eye bag "surgery" (blepharoplasty-alternative), Ulthera, Meso therapy
  (whitening), BE1st eyewear product line.
- **NOT confirmed / do not fabricate:** exact clinic address, business hours, LINE ID, medical
  license number, number of branches, real patient testimonial text, real before/after photos,
  real promotion prices, real blog article bodies. For all of these, use clearly marked
  placeholder content (Thai bracket notes like `[ใส่ที่อยู่จริง]`) or generic/sample content
  labelled with `<span class="tag-sample">ตัวอย่าง</span>` — never invent a license number or a
  specific real address.

## Page list (20 files) — build in this order, keep nav/footer identical across all

| # | File | Nav label | Content brief |
|---|------|-----------|----------------|
| 1 | `index.html` | (logo/Home) | Hero (tagline + 2 CTAs "นัดหมาย"/"ดูบริการ") + trust badges (แพทย์เฉพาะทาง, อย., ประสบการณ์ 10+ปี) + services overview (grid-3: filler/anti-aging/eye-bag) + doctor intro teaser (photo placeholder + credentials + link to doctor-lattapol.html) + reviews teaser (3 cards, sample-labelled) + promotions teaser (2 cards) + latest articles teaser (3 cards) + map/contact strip + 4-item FAQ teaser linking to faq.html. No breadcrumb on this page. |
| 2 | `about.html` | เกี่ยวกับเรา | Clinic story/philosophy (specialist eye-filler positioning) + certifications/approved products (HA fillers ผ่าน อย., placeholder cert badges) + team intro linking to doctors.html + branches teaser linking to locations.html + booking CTA. |
| 3 | `doctors.html` | ทีมแพทย์ | Team intro paragraph + doctor card (Dr. Lattapol, photo placeholder, name, license placeholder, specialties, link to doctor-lattapol.html) + simple schedule table (placeholder days/hours) + booking CTA. |
| 4 | `doctor-lattapol.html` | (linked from doctors.html) | Photo placeholder + full name + `[เลขใบประกอบวิชาชีพเวชกรรม ................]` placeholder + full qualifications list (from manifest above) + procedures offered (linked list to filler pages) + schedule/branches + booking CTA. |
| 5 | `services.html` | บริการ ▾ → บริการทั้งหมด | Overview paragraph + category cards grid (Filler pillar, Anti-aging/Ulthera-Meso, Eye bag surgery, BE1st glasses) each linking out + "เลือกบริการที่ใช่อย่างไร" guide section + consultation CTA. |
| 6 | `filler.html` | บริการ ▾ → ฟิลเลอร์ (ภาพรวม) | Filler pillar: what HA filler is + grid linking to under-eye/double-layer/face-areas subpages + process steps (`.steps`, 4 steps) + duration/aftercare + FAQ accordion (4-5 Q&A) + CTA. Compliance: avoid PRP/growth-factor claims. |
| 7 | `filler-undereye.html` | บริการ ▾ → ฟิลเลอร์ใต้ตา | Definition (tear trough/under-eye hollow) + ideal candidates + benefits + process + duration + care + FAQ + CTA. |
| 8 | `filler-doublelayer.html` | บริการ ▾ → ฟิลเลอร์ตาสองชั้น | Definition (double eyelid crease filler, addresses สายตาสองชั้นไม่ชัด/ตาบุ๋ม) + candidates + benefits + process + FAQ + CTA. |
| 9 | `filler-face-areas.html` | บริการ ▾ → ฟิลเลอร์หน้าผาก/ร่องแก้ม/คาง | ONE page, 5 sections with anchor nav at top: หน้าผาก (forehead), ร่องแก้ม (cheek line), แก้มตอบ (sunken cheek), ขมับ (temple), คาง (chin) — each section: short description + benefit + link back to filler.html + shared FAQ/CTA at bottom. |
| 10 | `anti-aging.html` | บริการ ▾ → Ulthera & Meso Therapy | Pillar page covering the two real anti-aging services: Ulthera (ultrasound skin tightening) + Meso Therapy (whitening/rejuvenation) as two sections, each with what-it-is/candidates/process/aftercare + shared FAQ + CTA. (Replaces generic "Botox" from the sitemap blueprint since First Clinic doesn't offer botox.) |
| 11 | `eye-bag-surgery.html` | บริการ ▾ → ผ่าตัดถุงใต้ตา | Non-invasive eye bag treatment: what it is/how it differs from traditional surgery (no visible scar) + candidates + benefits + process + recovery + FAQ + CTA. |
| 12 | `be1st-glasses.html` | บริการ ▾ → แว่นตา BE1st | Product page for BE1st eyewear line: concept/positioning + product highlight cards (placeholder images) + where to get it (link to contact) — lighter/shorter page than the medical service pages. |
| 13 | `promotions.html` | โปรโมชั่น | 3-4 `.promo-card`s with `<span class="tag-sample">ตัวอย่างโปรโมชั่น</span>` label, price/was-price, conditions, expiry — all clearly sample data — plus `.notice` box stating physician fee inclusion must be confirmed at clinic + booking CTA. |
| 14 | `reviews.html` | รีวิว | Before/after gallery grid using `.img-placeholder` boxes labelled "ตัวอย่างเท่านั้น ไม่ใช่ภาพจริง" + 3-4 text review cards (`.review-card`) marked as samples + consultation CTA. Compliance notice box: real client photos require consent forms before publishing. |
| 15 | `blog.html` | บทความ | Article list grid (6 sample article cards: title/excerpt/category/date, `tag-sample` on each) + category filter row (visual only) + one full linked sample article at `#article-1` anchor or inline section with H2/TOC/body/author-reviewer byline showing "ตรวจสอบโดย นพ.ลัทธพล ม้าลายทอง" pattern for E-E-A-T. |
| 16 | `faq.html` | FAQ | Grouped accordion: "คำถามเกี่ยวกับฟิลเลอร์" (5 Q&A) + "คำถามเกี่ยวกับ Ulthera/Meso" (4 Q&A) using `.faq-item` markup; include a `<script type="application/ld+json">` FAQPage schema block mirroring the visible Q&A. |
| 17 | `contact.html` | ติดต่อ | Two-column: booking form (name/phone/service select/branch select/preferred time + `.form-consent` PDPA checkbox linking to privacy.html) on one side, contact info + `.img-placeholder` map box + hours placeholder + call/LINE buttons on the other. |
| 18 | `locations.html` | (footer link) | Branch card grid — at least 1 branch card with `[ที่อยู่จริง]` / `[เวลาทำการจริง]` placeholders, map placeholder, phone, per-branch "นัดหมายสาขานี้" CTA. Note in a `.notice` box that LocalBusiness schema + Google Business Profile should be added per branch once real data is available. |
| 19 | `privacy.html` | (footer link) | Thai PDPA-compliant privacy policy: data collected, purpose, retention, third-party sharing, data-subject rights, DPO contact placeholder. Plain text sections, no cards needed. |
| 20 | `terms.html` | (footer link) | Terms & conditions: service scope, booking/cancellation policy, payment, general liability language (non-medical-advice disclaimer), governing law (Thailand). Plain text sections. |

## Compliance notes to bake in (from the sitemap blueprint, apply site-wide)
- No superlative/unverifiable claims ("ดีที่สุด", "หายขาด 100%") — use measured language
  ("ช่วยปรับให้ดูสดใสขึ้น", "ผลลัพธ์แตกต่างกันในแต่ละบุคคล").
- Every service page should read as informational/consultative, not a hard sell — CTA is
  "ปรึกษา/นัดหมาย", not "ซื้อเลย".
- Any before/after or testimonial content must carry a sample/consent disclaimer since we don't
  have real signed-consent material.
