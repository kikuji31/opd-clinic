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

async function htmlToPdf(html) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    return await page.pdf({ printBackground: true, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}

module.exports = { htmlToPdf };
