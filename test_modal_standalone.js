import puppeteer from 'puppeteer-core';

async function testModal() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('http://localhost:5173/?mode=owner', { waitUntil: 'networkidle0' });
  const inputSelector = 'input[placeholder*="creator"]';
  await page.waitForSelector(inputSelector);

  console.log('1. Typing 2006...');
  await page.type(inputSelector, '2006');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 600));

  const errorText = await page.evaluate(() => {
    const errorEl = document.querySelector('.bg-red-50');
    return errorEl ? errorEl.innerText : 'NO RED-50 ELEMENT';
  });
  console.log('Error box content:', errorText);

  console.log('2. Clearing input with Ctrl+A...');
  await page.click(inputSelector);
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');

  console.log('3. Typing correct password...');
  await page.type(inputSelector, 'khusboo_admin_2026');
  const val = await page.evaluate(sel => document.querySelector(sel).value, inputSelector);
  console.log('Input value before submit is:', val);

  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1000));

  const hasOwnerPanel = await page.evaluate(() => document.body.innerText.includes('OWNER CONTROL PANEL'));
  console.log('Is OWNER CONTROL PANEL visible?', hasOwnerPanel);

  await browser.close();
}

testModal();
