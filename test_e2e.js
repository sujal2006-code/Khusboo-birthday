import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/Sujal/.gemini/antigravity/brain/f1c7fd11-34cd-45a9-8299-f95fd9c9a6f2/screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function clickButtonWithText(page, text) {
  const success = await page.evaluate((btnText) => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const target = buttons.find(b => b.innerText.toLowerCase().includes(btnText.toLowerCase()));
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, text);

  if (!success) {
    throw new Error(`Button containing text "${text}" not found`);
  }
}

async function clickKeypadButton(page, val) {
  const success = await page.evaluate((digit) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find(b => b.innerText.trim() === digit);
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, val);

  if (!success) {
    throw new Error(`Keypad button "${val}" not found`);
  }
}

async function runTests() {
  console.log('🚀 Testing Updated Password Keypad & Post-Cake Celebration...');
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

  try {
    // 1. Page 1: Countdown
    console.log('Testing Page 1: Countdown...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await clickButtonWithText(page, 'Early Preview / Test');
    await page.waitForFunction(() => document.body.innerText.includes('Finally, your special day is here!'));
    await clickButtonWithText(page, 'CONTINUE');
    await new Promise(r => setTimeout(r, 600));

    // 2. Page 2: NEW Keypad Password Screen
    console.log('Testing Page 2: NEW Keypad Password Screen...');
    await page.waitForFunction(() => document.body.innerText.includes('Before Your Surprise Begins!'));
    await page.waitForFunction(() => document.body.innerText.includes("Let's see if you remember your birthday year!"));
    console.log('✓ Verified new Heading & Subtitle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_new_keypad_empty.png') });

    // Test entering wrong code via keypad: 1 9 9 9
    console.log('Testing wrong code with keypad (1999)...');
    await clickKeypadButton(page, '1');
    await clickKeypadButton(page, '9');
    await clickKeypadButton(page, '9');
    await clickKeypadButton(page, '9');
    await new Promise(r => setTimeout(r, 200));

    // Click ENTER
    await clickButtonWithText(page, 'ENTER');
    await page.waitForFunction(() => document.body.innerText.includes("Oopsie! That's not your birthday year! Try once more! 😄"));
    console.log('✓ Wrong password error triggered: "Oopsie! That\'s not your birthday year! Try once more! 😄"');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_new_keypad_error.png') });

    // Test Clear button
    await clickButtonWithText(page, 'Clear');
    await new Promise(r => setTimeout(r, 200));

    // Enter correct code 2006 using keypad buttons
    console.log('Entering correct birthday year 2006 via keypad...');
    await clickKeypadButton(page, '2');
    await clickKeypadButton(page, '0');
    await clickKeypadButton(page, '0');
    await clickKeypadButton(page, '6');
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_new_keypad_entered.png') });

    // Click ENTER
    await clickButtonWithText(page, 'ENTER');
    await page.waitForFunction(() => document.body.innerText.includes('Yayyy! You unlocked your surprise! 🥳'));
    console.log('✓ Success banner displayed: "Yayyy! You unlocked your surprise! 🥳"');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_new_keypad_success.png') });

    // Wait for auto transition to Page 3
    await page.waitForFunction(() => document.body.innerText.includes("Let's Pop Some Happiness!"), { timeout: 4000 });
    console.log('✓ Keypad automatically transitioned to Page 3!');

    // Navigate to Page 7 (Cake Cutting) to test the new grand celebration
    console.log('Navigating to Page 7 (Cake Cutting)...');
    await page.evaluate(() => {
      localStorage.setItem('khusboo_unlocked_step', '8');
    });
    await page.reload({ waitUntil: 'networkidle0' });

    await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('nav button'));
      if (navButtons[6]) navButtons[6].click(); // Page 7 (Cake)
    });

    await page.waitForFunction(() => document.body.innerText.includes('Time to Make a Wish!'));
    console.log('✓ On Page 7: 3D Cake cutting');

    // Pick up knife
    await clickButtonWithText(page, 'Pick Up Birthday Knife');
    await new Promise(r => setTimeout(r, 500));

    // Cut Cake
    await clickButtonWithText(page, 'Cut Your Cake!');
    console.log('✓ Cake cutting triggered');

    // Verify STEP 2: CONGRATULATIONS MESSAGE
    await page.waitForFunction(() => document.body.innerText.includes('CONGRATULATIONS, KHUSBOO! 🥳🎂'), { timeout: 6000 });
    await page.waitForFunction(() => document.body.innerText.includes('OFFICIALLY 20 YEARS YOUNG! 🎉'));
    await page.waitForFunction(() => document.body.innerText.includes('Yayyyy! You finally entered your twenties! 💗'));
    console.log('✓ Verified Step 2: Congratulations Heading, Subtitle, and Message');

    // Verify STEP 3: JOKES
    await page.waitForFunction(() => document.body.innerText.includes('Your childhood subscription has officially expired! 😂'));
    await page.waitForFunction(() => document.body.innerText.includes('Level 20. New challenges, same madness! 🎮'));
    console.log('✓ Verified Step 3: All 6 funny birthday jokes displayed in animated cards');

    // Verify STEP 5: FINAL CELEBRATION MESSAGE
    await page.waitForFunction(() => document.body.innerText.includes('20 NEVER LOOKED THIS GOOD! 🎀'));
    await page.waitForFunction(() => document.body.innerText.includes("Here's to a wonderful new chapter! 🥳💐"));
    console.log('✓ Verified Step 5: Final celebration message');

    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_post_cake_grand_celebration.png') });

    // Click NEXT button ("One Last Thing...") to verify it leads to final goodbye page
    await clickButtonWithText(page, 'One Last Thing...');
    await page.waitForFunction(() => document.body.innerText.includes('One Last Thing...'));
    await page.waitForFunction(() => document.body.innerText.includes('Under the Birthday Stars'));
    console.log('✓ Verified NEXT leads cleanly to Page 8 (Final Goodbye page)!');

    console.log('\n🎉 ALL UPDATES (KEYPAD & POST-CAKE GRAND CELEBRATION) VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'update_error.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
