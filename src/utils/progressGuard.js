const LOCAL_PROGRESS_KEY = 'khusboo_unlocked_step';

/**
 * Validates guest step progression locally using the same sequential rules as the server.
 * Used as a fallback when /api/progress/* endpoints are unavailable (e.g. static deployments).
 */
export function validateStepLocally(targetStep, proof = {}, currentMaxUnlocked = 1) {
  const step = parseInt(targetStep, 10);
  if (isNaN(step) || step < 1 || step > 9) {
    return { allowed: false, error: 'Invalid step number' };
  }

  if (step > currentMaxUnlocked + 1) {
    return {
      allowed: false,
      error: `Access denied to step ${step}. Complete previous steps first.`
    };
  }

  let allowed = false;
  switch (step) {
    case 1:
      allowed = true;
      break;
    case 2:
      allowed = Boolean(proof && (proof.countdownComplete === true || proof.forceComplete === true));
      break;
    case 3:
      allowed = Boolean(proof && String(proof.password ?? '').trim() === '2006');
      break;
    case 4:
      allowed = Boolean(proof && Number(proof.poppedCount) >= 10);
      break;
    case 5:
      allowed = Boolean(proof && proof.bouquetComplete === true);
      break;
    case 6:
      allowed = Boolean(proof && proof.memoriesViewed === true);
      break;
    case 7:
      allowed = Boolean(proof && proof.messageRead === true);
      break;
    case 8:
      allowed = Boolean(proof && proof.cakeCut === true);
      break;
    case 9:
      allowed = Boolean(proof && proof.celebrationComplete === true);
      break;
    default:
      allowed = false;
  }

  if (!allowed) {
    return {
      allowed: false,
      error: `Access denied to step ${step}. Completed requirements not met.`
    };
  }

  return {
    allowed: true,
    maxUnlocked: Math.max(currentMaxUnlocked, step)
  };
}

export function getSavedLocalProgress() {
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      return Math.min(Math.max(parsed, 1), 9);
    }
  } catch (e) {
    // Ignore storage access errors
  }
  return 1;
}

export function saveLocalProgress(step) {
  try {
    const clamped = Math.min(Math.max(parseInt(step, 10) || 1, 1), 9);
    localStorage.setItem(LOCAL_PROGRESS_KEY, String(clamped));
  } catch (e) {
    // Ignore storage access errors
  }
}

export function clearLocalProgress() {
  try {
    localStorage.removeItem(LOCAL_PROGRESS_KEY);
    localStorage.removeItem('khusboo_progress_token');
  } catch (e) {
    // Ignore storage access errors
  }
}

/**
 * Safely parses JSON only when the server actually returns an application/json response.
 * Returns null for 404/405/HTML fallback responses in static hosting environments.
 */
export async function tryParseJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await res.json();
  } catch {
    return null;
  }
}
