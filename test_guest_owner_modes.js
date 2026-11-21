import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import os from 'os';

const SCREENSHOT_DIR = 'C:/Users/Sujal/.gemini/antigravity/brain/f1c7fd11-34cd-45a9-8299-f95fd9c9a6f2/screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runGuestAndOwnerTests() {
  console.log('🚀 STARTING COMPREHENSIVE GUEST MODE & OWNER MODE TESTS...');

  const uniqueProfileDir = path.join(os.tmpdir(), 'puppeteer_profile_guest_owner_' + Date.now());

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    userDataDir: uniqueProfileDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // -------------------------------------------------------------
    // TEST 1: Open as guest. Verify only countdown is accessible.
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Open website as Guest ---');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    
    // Clear any prior storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle0' });

    const isCountdownVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasHeading = text.includes('Hey Khusboo!') && text.includes('I have prepared a little birthday surprise for you');
      const hasTimer = text.toLowerCase().includes('days') && text.toLowerCase().includes('hours') && text.toLowerCase().includes('minutes');
      const navTabs = document.querySelectorAll('header nav button');
      const earlyPreviewBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Early Preview'));
      return {
        hasHeading,
        hasTimer,
        hasNavMenu: navTabs.length > 0,
        hasEarlyPreviewBtn: !!earlyPreviewBtn
      };
    });

    console.log('Test 1 Results:', isCountdownVisible);
    if (!isCountdownVisible.hasHeading || !isCountdownVisible.hasTimer) {
      throw new Error('Test 1 Failed: Countdown page not properly displayed');
    }
    if (isCountdownVisible.hasNavMenu) {
      throw new Error('Test 1 Failed: Top navigation menu should be completely hidden for guests');
    }
    if (isCountdownVisible.hasEarlyPreviewBtn) {
      throw new Error('Test 1 Failed: Early preview button should be hidden for guests');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test1_guest_countdown.png') });
    console.log('✓ TEST 1 PASSED: Only countdown is accessible, navigation & test buttons hidden');

    // -------------------------------------------------------------
    // TEST 2: Try opening balloon page directly. Must remain locked.
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Try URL tampering to open balloon page directly ---');
    await page.goto('http://localhost:5173/?page=3', { waitUntil: 'networkidle0' });
    
    // Also try hash #page-3
    await page.evaluate(() => {
      window.location.hash = '#page-3';
    });
    await new Promise(r => setTimeout(r, 600));

    const test2State = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        isOnBalloonPage: text.includes('Pop Some Happiness') || text.includes('Balloons Popped'),
        isOnCountdown: text.includes('Hey Khusboo!') && text.toLowerCase().includes('days')
      };
    });

    console.log('Test 2 Results:', test2State);
    if (test2State.isOnBalloonPage) {
      throw new Error('Test 2 Failed: Guest was able to bypass countdown to balloon page via URL!');
    }
    if (!test2State.isOnCountdown) {
      throw new Error('Test 2 Failed: Guest was not clamped back to countdown page');
    }
    console.log('✓ TEST 2 PASSED: Direct URL jumping to future pages was blocked');

    // -------------------------------------------------------------
    // TEST 3: Complete countdown -> verify password page unlocks.
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: Complete countdown -> unlock Password page ---');
    // Complete countdown on page
    await page.evaluate(async () => {
      const res = await fetch('/api/progress/advance-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStep: 2, proof: { countdownComplete: true } })
      });
      const data = await res.json();
      if (data.success && data.progressToken) {
        localStorage.setItem('khusboo_progress_token', data.progressToken);
      }
    });
    await page.reload({ waitUntil: 'networkidle0' });

    // Wait for password screen keypad
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Before Your Surprise Begins!') ||
             document.body.innerText.includes('birthday year');
    }, { timeout: 5000 });

    const isPasswordScreenVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasKeypad = Array.from(document.querySelectorAll('button')).some(b => b.innerText.trim() === 'ENTER');
      return text.includes('birthday year') && hasKeypad;
    });

    if (!isPasswordScreenVisible) {
      throw new Error('Test 3 Failed: Password screen did not unlock after countdown completion');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test3_password_unlocked.png') });
    console.log('✓ TEST 3 PASSED: Password screen unlocked with interactive numeric keypad');

    // -------------------------------------------------------------
    // TEST 4: Enter correct birthday year (2006) -> balloon unlocks.
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Enter 2006 -> only balloon page unlocks ---');
    // Click keypad digits: 2, 0, 0, 6, ENTER
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const clickBtn = (label) => {
        const b = buttons.find(btn => btn.innerText.trim() === label);
        if (b) b.click();
      };
      clickBtn('2');
      clickBtn('0');
      clickBtn('0');
      clickBtn('6');
      setTimeout(() => clickBtn('ENTER'), 200);
    });

    // Wait for balloon game page to appear
    await page.waitForFunction(() => {
      return document.body.innerText.includes("Let's Pop Some Happiness!") ||
             document.body.innerText.includes('Balloons Popped');
    }, { timeout: 6000 });

    const isBalloonPageActive = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes("Let's Pop Some Happiness!") && text.includes('0 / 10');
    });

    if (!isBalloonPageActive) {
      throw new Error('Test 4 Failed: Balloon page did not activate after password entry');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test4_balloon_active.png') });
    console.log('✓ TEST 4 PASSED: Birthday year 2006 unlocked Balloon page (0/10)');

    // -------------------------------------------------------------
    // TEST 5: Balloon activity locked until all 10 are popped.
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: Verify balloon activity locking & pop completion ---');
    // Ensure Next button does NOT exist yet
    let nextBtnExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.innerText.includes('A Special Bouquet Awaits'));
    });
    if (nextBtnExists) {
      throw new Error('Test 5 Failed: Next button is visible before popping balloons');
    }

    // Pop first 9 balloons
    await page.evaluate(() => {
      const balloons = Array.from(document.querySelectorAll('.cursor-pointer'));
      for (let i = 0; i < 9 && i < balloons.length; i++) {
        balloons[i].click();
      }
    });
    await new Promise(r => setTimeout(r, 600));

    // Check count is 9 / 10 and Next button is still NOT visible
    const partialCount = await page.evaluate(() => {
      const text = document.body.innerText;
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('A Special Bouquet Awaits'));
      return {
        hasNine: text.includes('9 / 10'),
        hasNextBtn: !!nextBtn
      };
    });
    console.log('9 balloons popped state:', partialCount);
    if (!partialCount.hasNine || partialCount.hasNextBtn) {
      throw new Error('Test 5 Failed: Next button appeared before popping the 10th balloon');
    }

    // Now pop 10th balloon
    await page.evaluate(() => {
      const lastBalloon = document.querySelector('.cursor-pointer');
      if (lastBalloon) lastBalloon.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Next button must now be visible
    const finalNextBtn = await page.waitForFunction(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('A Special Bouquet Awaits'));
    }, { timeout: 5000 });

    if (!finalNextBtn) {
      throw new Error('Test 5 Failed: Next button failed to appear after 10th balloon popped');
    }
    console.log('✓ TEST 5 PASSED: Balloon activity locked until all 10 popped');

    // -------------------------------------------------------------
    // TEST 6: Owner Mode Authentication & Direct Access to all 9 pages
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: Owner Mode Authentication & Direct Access to all 9 pages ---');
    // Trigger owner modal via URL ?mode=owner
    await page.goto('http://localhost:5173/?mode=owner', { waitUntil: 'networkidle0' });
    
    // Check owner login modal is displayed
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Owner Authentication') ||
             document.body.innerText.includes('Owner Password');
    }, { timeout: 4000 });

    // Test entering Khusboo's password (2006) -> MUST FAIL
    const inputSelector = 'input[placeholder*="creator"]';
    await page.waitForSelector(inputSelector);
    await page.type(inputSelector, '2006');
    
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Unlock Owner Mode'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const rejectionMsg = await page.evaluate(() => {
      const errBox = document.querySelector('.bg-red-50');
      return errBox ? errBox.innerText : document.body.innerText;
    });
    console.log('Modal error on 2006 attempt:', rejectionMsg);
    if (!rejectionMsg.includes("birthday password, not the Owner Master Password")) {
      throw new Error('Test 6 Failed: Entering Khusboo 2006 password into owner login should be rejected');
    }
    console.log('✓ Rejected 2006 password for Owner Login');

    // Clear input with Ctrl+A and type correct Owner Password
    await page.click(inputSelector);
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type(inputSelector, 'khusboo_admin_2026');
    await page.click('button[type="submit"]');

    // Wait for Owner Control Panel to appear
    await page.waitForFunction(() => {
      return document.body.innerText.includes('OWNER CONTROL PANEL');
    }, { timeout: 5000 });

    console.log('✓ Owner Control Panel active');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test6_owner_control_panel.png') });

    // Test opening all 9 pages directly from Owner Control Panel
    const pagesToVerify = [
      { id: 1, label: 'Countdown', checkText: 'Hey Khusboo!' },
      { id: 2, label: 'Password', checkText: 'birthday year' },
      { id: 3, label: 'Balloons', checkText: 'Balloons Popped' },
      { id: 4, label: 'Bouquet', checkText: 'A Little Bouquet' },
      { id: 5, label: 'Memories', checkText: 'Special Moments' },
      { id: 6, label: 'Special Message', checkText: 'Handwritten Letter' },
      { id: 7, label: 'Cake', checkText: 'Time to Make a Wish' },
      { id: 8, label: 'Celebration', checkText: 'CONGRATULATIONS' },
      { id: 9, label: 'Goodbye', checkText: 'Under the Birthday Stars' }
    ];

    for (const p of pagesToVerify) {
      console.log(`Testing direct Owner navigation to Page ${p.id} (${p.label})...`);
      await page.evaluate((pageLabel) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const targetBtn = buttons.find(b => b.innerText.includes(`Open ${pageLabel}`));
        if (targetBtn) targetBtn.click();
      }, p.label);

      await new Promise(r => setTimeout(r, 600));

      const pageVerified = await page.evaluate((check) => {
        return document.body.innerText.includes(check);
      }, p.checkText);

      if (!pageVerified) {
        throw new Error(`Test 6 Failed: Owner direct navigation to Page ${p.id} (${p.label}) did not render expected text "${p.checkText}"`);
      }
      console.log(`✓ Owner accessed Page ${p.id} (${p.label}) directly`);
    }

    console.log('✓ TEST 6 PASSED: Owner Mode authenticated & all 9 pages accessible directly');

    // -------------------------------------------------------------
    // TEST 7: Return to Guest Mode
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Exit Owner Mode -> Return to Guest Mode ---');
    await page.evaluate(() => {
      const exitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Exit to Guest Mode'));
      if (exitBtn) exitBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const isOwnerPanelGone = await page.evaluate(() => {
      return !document.body.innerText.includes('OWNER CONTROL PANEL');
    });

    if (!isOwnerPanelGone) {
      throw new Error('Test 7 Failed: Owner Control Panel is still visible after exiting');
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'test7_return_to_guest_mode.png') });
    console.log('✓ TEST 7 PASSED: Successfully returned to Guest Mode, Owner panel removed');

    // -------------------------------------------------------------
    // TEST 8: Refresh website and test access restrictions again
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Refresh and test guest restrictions persistence ---');
    await page.reload({ waitUntil: 'networkidle0' });

    const postRefreshState = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasOwnerPanel = text.includes('OWNER CONTROL PANEL');
      const hasNavTabs = document.querySelectorAll('header nav button').length > 0;
      return {
        hasOwnerPanel,
        hasNavTabs
      };
    });

    if (postRefreshState.hasOwnerPanel) {
      throw new Error('Test 8 Failed: Owner Mode persisted into fresh guest view');
    }
    if (postRefreshState.hasNavTabs) {
      throw new Error('Test 8 Failed: Navigation tabs appeared after refresh');
    }

    console.log('✓ TEST 8 PASSED: Access restrictions remain strictly enforced after refresh');

    console.log('\n🎉 ALL 8 TESTS COMPLETED WITH 100% SUCCESS!');
  } finally {
    await browser.close();
  }
}

runGuestAndOwnerTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
