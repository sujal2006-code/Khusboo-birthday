import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import os from 'os';

const SCREENSHOT_DIR = 'C:/Users/Sujal/.gemini/antigravity/brain/f1c7fd11-34cd-45a9-8299-f95fd9c9a6f2/screenshots';

const VIEWPORTS = [
  { name: 'small_mobile_360x740', width: 360, height: 740, isMobile: true },
  { name: 'large_mobile_412x915', width: 412, height: 915, isMobile: true },
  { name: 'laptop_1366x768', width: 1366, height: 768, isMobile: false },
  { name: 'desktop_1920x1080', width: 1920, height: 1080, isMobile: false }
];

async function testBouquetViewports() {
  console.log('Testing Page 4 Flower Bouquet across multiple viewports...');

  const uniqueProfileDir = path.join(os.tmpdir(), 'puppeteer_profile_' + Date.now());

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    userDataDir: uniqueProfileDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Testing viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      localStorage.setItem('khusboo_unlocked_step', '8');
    });
    await page.reload({ waitUntil: 'networkidle0' });

    // Click Bouquet nav icon (page 4)
    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('nav button'));
      if (navButtons[3]) navButtons[3].click();
    });

    // Wait for stage 5 completion and NEXT button
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Explore Special Moments'));
    }, { timeout: 6000 });
    await new Promise(r => setTimeout(r, 600));

    // Measure bounding box and check responsiveness
    const imgInfo = await page.evaluate(() => {
      const img = document.querySelector('img[src*="bouquet_transparent"]');
      if (!img) return null;
      const rect = img.getBoundingClientRect();
      const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        hasHorizontalScroll,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth
      };
    });

    console.log(`Viewport ${vp.name} image dimensions:`, imgInfo);
    if (!imgInfo) throw new Error('Bouquet image not found');
    if (imgInfo.hasHorizontalScroll) throw new Error(`Horizontal scroll detected on ${vp.name}`);
    if (imgInfo.naturalWidth === 0) throw new Error('Bouquet image failed to load');

    const screenshotPath = path.join(SCREENSHOT_DIR, `bouquet_${vp.name}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`✓ Screenshot saved: bouquet_${vp.name}.png`);

    await page.close();
  }

  await browser.close();
  console.log('\n🎉 ALL VIEWPORTS TESTED PERFECTLY!');
}

testBouquetViewports();
