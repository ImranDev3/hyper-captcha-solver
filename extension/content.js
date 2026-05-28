const SOLVE_KEY = 'hcs_solveCount';
let solveCount = 0;

(async () => {
  const d = await chrome.storage.local.get([SOLVE_KEY]);
  solveCount = d[SOLVE_KEY] || 0;
})();

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
function randomBetween(min, ms) {
  return Math.floor(Math.random() * (ms - min + 1)) + min;
}

async function incrementSolve() {
  solveCount++;
  await chrome.storage.local.set({ [SOLVE_KEY]: solveCount });
}

function simulateCurvedMouseClick(element) {
  const rect = element.getBoundingClientRect();
  const tx = rect.left + randomBetween(1, Math.max(1, rect.width - 1));
  const ty = rect.top + randomBetween(1, Math.max(1, rect.height - 1));
  const sx = tx - randomBetween(50, 150);
  const sy = ty - randomBetween(50, 150);
  const steps = randomBetween(8, 16);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1-t)*(1-t)*(1-t)*sx + 3*(1-t)*(1-t)*t*(sx+randomBetween(80,200)) + 3*(1-t)*t*t*(tx-randomBetween(50,120)) + t*t*t*tx;
    const y = (1-t)*(1-t)*(1-t)*sy + 3*(1-t)*(1-t)*t*(sy-randomBetween(30,80)) + 3*(1-t)*t*t*(ty+randomBetween(30,80)) + t*t*t*ty;
    element.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }
  element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, clientX: tx, clientY: ty }));
  element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: tx, clientY: ty }));
  element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: tx, clientY: ty }));
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: tx, clientY: ty }));
}

async function typeHumanlike(input, text) {
  input.focus();
  input.value = '';
  for (const char of text) {
    input.value += char;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('keyup', { bubbles: true }));
    await sleep(randomBetween(150, 300));
  }
}

function canvasToDataUrl(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  c.getContext('2d').drawImage(img, 0, 0);
  return c.toDataURL('image/png');
}

async function ocrText(dataUrl) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    s.onload = async () => {
      while (!window.Tesseract) await sleep(100);
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = async () => {
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        try {
          const { data } = await Tesseract.recognize(canvas, 'eng', {
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
          });
          const text = data.text.replace(/[^a-zA-Z0-9]/g, '').trim();
          resolve(text);
        } catch (e) { reject(e.message); }
      };
      img.onerror = () => reject('Image load failed');
      img.src = dataUrl;
    };
    s.onerror = () => reject('CDN blocked by CSP');
    document.head.appendChild(s);
  });
}

// ──────────────────── TEXT CAPTCHA ────────────────────

async function solveTextCaptcha(img) {
  console.log('[HCS] [TEXT] Processing...');
  try {
    const dataUrl = canvasToDataUrl(img);
    const text = await ocrText(dataUrl);
    if (!text) return console.warn('[HCS] [TEXT] OCR returned empty');
    console.log(`[HCS] [TEXT] Solved: ${text}`);
    await typeResultAndSubmit(text);
    await incrementSolve();
    ipCheck();
  } catch (e) {
    console.error('[HCS] [TEXT] Error:', e);
  }
}

async function typeResultAndSubmit(text) {
  const input = document.querySelector('input[name="captcha"], input[id*="captcha"], input[type="text"]');
  if (!input) return;
  await typeHumanlike(input, text);
  const think = randomBetween(2000, 7000);
  console.log(`[HCS] Thinking: ${think}ms`);
  await sleep(think);
  const btn = document.querySelector('button[type="submit"], input[type="submit"]');
  if (btn) simulateCurvedMouseClick(btn);
}

// ──────────────────── AUDIO (reCAPTCHA) ────────────────────

async function solveAudioCaptcha() {
  console.log('[HCS] [AUDIO] Processing...');
  try {
    const audioEl = document.querySelector('audio[src*="recaptcha"], audio[src*="audio"]');
    if (!audioEl || !audioEl.src) return;

    const resp = await fetch(audioEl.src);
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const au = new Audio(url);
    au.volume = 1;

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    if (!recognition) {
      console.warn('[HCS] [AUDIO] SpeechRecognition not supported');
      return;
    }

    recognition.lang = 'en-US';
    recognition.interimResults = false;

    const text = await new Promise((resolve, reject) => {
      recognition.onresult = e => resolve(e.results[0][0].transcript.trim());
      recognition.onerror = () => reject('Speech recognition failed');
      au.play().then(() => {
        setTimeout(() => {
          recognition.start();
          setTimeout(() => { recognition.stop(); au.pause(); }, 6000);
        }, 500);
      }).catch(reject);
    });

    if (!text) return;
    console.log(`[HCS] [AUDIO] Solved: ${text}`);

    const input = document.querySelector('input[name="captcha-response"], input[id*="audio-response"]');
    if (input) {
      await typeHumanlike(input, text);
      await sleep(randomBetween(500, 1500));
      const btn = document.querySelector('button:has(svg), button.rc-button-default, #recaptcha-verify-button');
      if (btn) simulateCurvedMouseClick(btn);
    }
    await incrementSolve();
    ipCheck();
  } catch (e) {
    console.error('[HCS] [AUDIO] Error:', e);
  }
}

// ──────────────────── RECAPTCHA V2 ────────────────────

async function solveRecaptchaV2() {
  console.log('[HCS] [RECAPTCHAv2] Processing...');
  try {
    const frame = document.querySelector('iframe[src*="recaptcha/api2"]');
    if (!frame) return;
    const siteKey = frame.src.match(/[?&]k=([^&]+)/);
    if (!siteKey) return;

    // Try audio challenge first (free method)
    const gc = window.grecaptcha;
    if (gc && gc.execute) {
      await sleep(1000);
      // Trigger checkbox click
      const checkbox = document.querySelector('.recaptcha-checkbox-border');
      if (checkbox) {
        simulateCurvedMouseClick(checkbox);
        await sleep(3000);
        // Try audio fallback
        solveAudioCaptcha();
      }
    }
  } catch (e) {
    console.error('[HCS] [RECAPTCHAv2] Error:', e);
  }
}

// ──────────────────── HCAPTCHA ────────────────────

async function solveHcaptcha() {
  console.log('[HCS] [HCAPTCHA] Processing...');
  try {
    const frame = document.querySelector('iframe[src*="hcaptcha.com"]');
    if (!frame) return;
    const siteKey = frame.src.match(/[?&]sitekey=([^&]+)/);
    if (!siteKey) return;

    // Use 2Captcha if API key is stored
    const { tcKey } = await chrome.storage.local.get(['tcKey']);
    if (!tcKey) {
      console.log('[HCS] [HCAPTCHA] No 2Captcha key. Set in popup.');
      return;
    }

    const apiKey = tcKey;
    const inResp = await fetch('https://2captcha.com/in.php', {
      method: 'POST',
      body: new URLSearchParams({
        key: apiKey, method: 'hcaptcha', sitekey: siteKey[1],
        pageurl: window.location.href, json: '1'
      })
    });
    const inData = await inResp.json();
    if (inData.status !== 1) return;

    for (let i = 0; i < 30; i++) {
      await sleep(5000);
      const pollResp = await fetch('https://2captcha.com/res.php', {
        method: 'POST',
        body: new URLSearchParams({
          key: apiKey, action: 'get', id: inData.request, json: '1'
        })
      });
      const pollData = await pollResp.json();
      if (pollData.status === 1) {
        const ta = document.querySelector('[name="h-captcha-response"]');
        if (ta) {
          ta.innerHTML = pollData.request;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
        await sleep(randomBetween(2000, 7000));
        const btn = document.querySelector('button[type="submit"], input[type="submit"]');
        if (btn) simulateCurvedMouseClick(btn);
        await incrementSolve();
        ipCheck();
        return;
      }
    }
  } catch (e) {
    console.error('[HCS] [HCAPTCHA] Error:', e);
  }
}

// ──────────────────── DETECTION ────────────────────

function ipCheck() {
  if (solveCount > 0 && solveCount % 25 === 0) {
    alert('[HCS] IP Refresh Required! Change your VPN now.');
  }
}

async function smartWait(sel, maxMs = 10000) {
  for (let w = 0; w < maxMs; w += 300) {
    const el = document.querySelector(sel);
    if (el) return el;
    await sleep(300);
  }
  return null;
}

async function detectAndSolve() {
  const img = document.querySelector('img[src*="captcha"], img[alt*="captcha"], img[id*="captcha"], img[class*="captcha"]');
  if (img && !img.dataset.hcsDone) {
    img.dataset.hcsDone = '1';
    setTimeout(() => solveTextCaptcha(img), randomBetween(500, 1500));
    return;
  }

  const rf = await smartWait('iframe[src*="recaptcha/api2"]');
  if (rf && !rf.dataset.hcsDone) {
    rf.dataset.hcsDone = '1';
    await sleep(randomBetween(1000, 2000));
    solveRecaptchaV2();
    return;
  }

  const af = document.querySelector('audio[src*="recaptcha"], audio[src*="audio"]');
  if (af && !af.dataset.hcsDone) {
    af.dataset.hcsDone = '1';
    solveAudioCaptcha();
    return;
  }

  const hf = await smartWait('iframe[src*="hcaptcha.com"]');
  if (hf && !hf.dataset.hcsDone) {
    hf.dataset.hcsDone = '1';
    await sleep(randomBetween(1000, 2000));
    solveHcaptcha();
    return;
  }
}

const obs = new MutationObserver(() => detectAndSolve());
obs.observe(document.body, { childList: true, subtree: true });
detectAndSolve();
