import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Automatically load .env if available
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {}

// Secret keys from environment or secure defaults
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'khusboo_admin_2026';
const SESSION_SECRET = process.env.SESSION_SECRET || 'khusboo_birthday_surprise_secret_key_2026';

function sign(payloadStr) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payloadStr).digest('hex');
}

export function createOwnerToken() {
  const payload = JSON.stringify({ role: 'owner', timestamp: Date.now() });
  const b64 = Buffer.from(payload).toString('base64');
  const signature = sign(b64);
  return `own_${b64}.${signature}`;
}

export function verifyOwnerToken(token) {
  if (!token || typeof token !== 'string' || !token.startsWith('own_')) {
    return false;
  }
  try {
    const raw = token.slice(4);
    const [b64, signature] = raw.split('.');
    if (!b64 || !signature) return false;
    const expectedSig = sign(b64);
    if (signature !== expectedSig) return false;
    const data = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    return data.role === 'owner';
  } catch (e) {
    return false;
  }
}

export function createProgressToken(maxUnlocked) {
  const payload = JSON.stringify({ maxUnlocked, timestamp: Date.now() });
  const b64 = Buffer.from(payload).toString('base64');
  const signature = sign(b64);
  return `prg_${b64}.${signature}`;
}

export function verifyProgressToken(token) {
  if (!token || typeof token !== 'string' || !token.startsWith('prg_')) {
    return { valid: false, maxUnlocked: 1 };
  }
  try {
    const raw = token.slice(4);
    const [b64, signature] = raw.split('.');
    if (!b64 || !signature) return { valid: false, maxUnlocked: 1 };
    const expectedSig = sign(b64);
    if (signature !== expectedSig) return { valid: false, maxUnlocked: 1 };
    const data = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    const step = parseInt(data.maxUnlocked, 10);
    return { valid: true, maxUnlocked: isNaN(step) ? 1 : Math.min(Math.max(step, 1), 9) };
  } catch (e) {
    return { valid: false, maxUnlocked: 1 };
  }
}

export function validateStepAdvance(targetStep, proof, ownerToken) {
  // If owner, grant immediate access to any step (1 to 9)
  if (ownerToken && verifyOwnerToken(ownerToken)) {
    return {
      allowed: true,
      maxUnlocked: targetStep,
      progressToken: createProgressToken(targetStep)
    };
  }

  // Guest validation rules
  let allowed = false;

  switch (targetStep) {
    case 1:
      allowed = true;
      break;
    case 2:
      // Countdown finished
      if (proof && (proof.countdownComplete === true || proof.forceComplete === true)) {
        allowed = true;
      }
      break;
    case 3:
      // Password must match '2006' exactly
      if (proof && String(proof.password).trim() === '2006') {
        allowed = true;
      }
      break;
    case 4:
      // Must pop all 10 balloons
      if (proof && proof.poppedCount >= 10) {
        allowed = true;
      }
      break;
    case 5:
      // Bouquet animation completed
      if (proof && proof.bouquetComplete === true) {
        allowed = true;
      }
      break;
    case 6:
      // Memory gallery viewed
      if (proof && proof.memoriesViewed === true) {
        allowed = true;
      }
      break;
    case 7:
      // Special letter read
      if (proof && proof.messageRead === true) {
        allowed = true;
      }
      break;
    case 8:
      // Cake sliced successfully
      if (proof && proof.cakeCut === true) {
        allowed = true;
      }
      break;
    case 9:
      // Grand celebration viewed
      if (proof && proof.celebrationComplete === true) {
        allowed = true;
      }
      break;
    default:
      allowed = false;
  }

  if (allowed) {
    return {
      allowed: true,
      maxUnlocked: targetStep,
      progressToken: createProgressToken(targetStep)
    };
  } else {
    return {
      allowed: false,
      error: `Access denied to step ${targetStep}. Completed requirements not met.`
    };
  }
}

// HTTP Request Middleware Handler for Vite / Express
export function handleApiRequests(req, res, next) {
  const url = req.url ? req.url.split('?')[0] : '';

  if (!url.startsWith('/api/')) {
    return next();
  }

  const sendJson = (status, data) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // Helper to read JSON request body
  const readBody = (callback) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {};
        callback(null, json);
      } catch (err) {
        callback(err, null);
      }
    });
  };

  // 1. Owner Login
  if (url === '/api/auth/owner-login' && req.method === 'POST') {
    readBody((err, data) => {
      if (err || !data) return sendJson(400, { success: false, error: 'Invalid JSON body' });
      const enteredPassword = String(data.password || '').trim();
      
      // Khusboo's birthday password is STRICTLY NOT the owner password
      if (enteredPassword === '2006') {
        return sendJson(401, {
          success: false,
          error: "That is Khusboo's birthday password, not the Owner Master Password!"
        });
      }

      if (enteredPassword === OWNER_PASSWORD) {
        const token = createOwnerToken();
        return sendJson(200, {
          success: true,
          token,
          role: 'owner',
          message: 'Owner Mode Authenticated Successfully'
        });
      } else {
        return sendJson(401, {
          success: false,
          error: 'Incorrect Owner Password. Access denied.'
        });
      }
    });
    return;
  }

  // 2. Owner Verify Token
  if (url === '/api/auth/owner-verify' && req.method === 'POST') {
    readBody((err, data) => {
      if (err || !data) return sendJson(400, { success: false, error: 'Invalid JSON body' });
      const isValid = verifyOwnerToken(data.token);
      return sendJson(200, { success: true, isValid, role: isValid ? 'owner' : 'guest' });
    });
    return;
  }

  // 3. Step Advance Validation
  if (url === '/api/progress/advance-step' && req.method === 'POST') {
    readBody((err, data) => {
      if (err || !data) return sendJson(400, { success: false, error: 'Invalid JSON body' });
      const targetStep = parseInt(data.targetStep, 10);
      if (isNaN(targetStep) || targetStep < 1 || targetStep > 9) {
        return sendJson(400, { success: false, error: 'Invalid step number' });
      }

      const result = validateStepAdvance(targetStep, data.proof, data.ownerToken);
      if (result.allowed) {
        return sendJson(200, {
          success: true,
          maxUnlocked: result.maxUnlocked,
          progressToken: result.progressToken
        });
      } else {
        return sendJson(403, {
          success: false,
          error: result.error
        });
      }
    });
    return;
  }

  // 4. Verify Progress Token
  if (url === '/api/progress/verify-token' && req.method === 'POST') {
    readBody((err, data) => {
      if (err || !data) return sendJson(400, { success: false, error: 'Invalid JSON body' });
      const verified = verifyProgressToken(data.progressToken);
      return sendJson(200, {
        success: true,
        isValid: verified.valid,
        maxUnlocked: verified.maxUnlocked
      });
    });
    return;
  }

  // 5. Reset Guest Progress
  if (url === '/api/progress/reset' && req.method === 'POST') {
    const initialToken = createProgressToken(1);
    return sendJson(200, {
      success: true,
      maxUnlocked: 1,
      progressToken: initialToken,
      message: 'Guest progress reset to Step 1'
    });
  }

  // Default API 404
  sendJson(404, { error: 'API route not found' });
}
