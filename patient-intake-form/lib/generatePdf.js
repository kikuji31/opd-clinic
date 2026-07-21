// puppeteer-core's recent versions ship ESM-only, so it must be loaded via
// dynamic import() even from this CommonJS module.
async function launchBrowser() {
  const { default: puppeteer } = await import('puppeteer-core');
  if (process.env.VERCEL) {
    const { default: chromium } = await import('@sparticuz/chromium');
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }
  return puppeteer.launch({
    executablePath:
      process.env.LOCAL_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
  });
}

// Chromium cold start (launching the browser binary) is the single slowest
// step here — several seconds on a fresh Vercel container, which eats into
// the platform's hard 10s function timeout on the Hobby plan and has been
// causing the PDF step to get killed before it finishes. Keeping one browser
// instance alive across invocations (Vercel reuses warm containers between
// requests) skips that cost on every request after the first, and kicking
// off the launch here at module load — rather than waiting until a request
// needs it — lets it run in parallel with the DB insert even on a cold
// container.
let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((err) => {
      browserPromise = null; // let the next call retry instead of caching the failure
      throw err;
    });
  }
  return browserPromise;
}
getBrowser().catch(() => {}); // pre-warm; htmlToPdf below surfaces any real error to its caller

async function htmlToPdf(html) {
  let browser = await getBrowser();
  if (!browser.isConnected()) {
    browserPromise = null;
    browser = await getBrowser();
  }
  const page = await browser.newPage();
  try {
    // Everything in this HTML (fonts, logos) is inlined as data URIs, so
    // there's no real network activity to wait for — 'networkidle0' just
    // adds a fixed idle-timeout delay for nothing.
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('print');
    return await page.pdf({ printBackground: true, preferCSSPageSize: true });
  } finally {
    await page.close();
  }
}

module.exports = { htmlToPdf };
