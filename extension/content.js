const SOLVER_API = 'http://localhost:5000/solve';
let solveCount = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, ms) {
  return Math.floor(Math.random() * (ms - min + 1)) + min;
}

function randomDecimal(min, max) {
  return Math.random() * (max - min) + min;
}

function simulateCurvedMouseClick(element) {
  const rect = element.getBoundingClientRect();
  const targetX = rect.left + randomBetween(1, rect.width - 1);
  const targetY = rect.top + randomBetween(1, rect.height - 1);
  const startX = targetX - randomBetween(50, 150);
  const startY = targetY - randomBetween(50, 150);
  const cp1x = startX + randomBetween(80, 200);
  const cp1y = startY - randomBetween(30, 80);
  const cp2x = targetX - randomBetween(50, 120);
  const cp2y = targetY + randomBetween(30, 80);
  const steps = randomBetween(8, 16);

  function bezierPoint(t, p0, p1, p2, p3) {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  }

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = bezierPoint(t, startX, cp1x, cp2x, targetX);
    const y = bezierPoint(t, startY, cp1y, cp2y, targetY);
    element.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true, cancelable: true, clientX: x, clientY: y
    }));
  }
  element.dispatchEvent(new MouseEvent('mouseover', {
    bubbles: true, cancelable: true, clientX: targetX, clientY: targetY
  }));
  element.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true, cancelable: true, clientX: targetX, clientY: targetY
  }));
  element.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true, cancelable: true, clientX: targetX, clientY: targetY
  }));
  element.dispatchEvent(new MouseEvent('click', {
    bubbles: true, cancelable: true, clientX: targetX, clientY: targetY
  }));
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

async function solveTextCaptcha(imgElement) {
  console.log('[HCS] Detected TEXT captcha');
  try {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth || imgElement.width;
    canvas.height = imgElement.naturalHeight || imgElement.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
    const base64Image = canvas.toDataURL('image/png');

    const response = await fetch(SOLVER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'text', image: base64Image })
    });
    const data = await response.json();
    solveCount++;

    if (data.success && data.text) {
      console.log(`[HCS] [TEXT] Solved: ${data.text}`);
      await typeResultAndSubmit(data.text);
    } else {
      console.warn('[HCS] [TEXT] Failed to solve');
    }
  } catch (err) {
    console.error('[HCS] [TEXT] Error:', err);
  }
}

async function solveRecaptchaV2() {
  console.log('[HCS] Detected reCAPTCHA v2 widget');
  try {
    const frame = document.querySelector('iframe[src*="recaptcha/api2"]');
    if (!frame) return;

    const grecaptcha = window.grecaptcha;
    if (grecaptcha && grecaptcha.execute) {
      const siteKey = frame.src.match(/[?&]k=([^&]+)/);
      if (!siteKey) return;

      await sleep(randomBetween(500, 1500));
      const response = await fetch(SOLVER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'recaptcha_v2',
          site_key: siteKey[1],
          page_url: window.location.href,
          sub_type: 'recaptcha_v2'
        })
      });
      const data = await response.json();
      solveCount++;

      if (data.success && data.text) {
        console.log(`[HCS] [RECAPTCHAv2] Solved: ${data.text}`);
        const textarea = document.querySelector('#g-recaptcha-response');
        if (textarea) {
          textarea.innerHTML = data.text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
        await sleep(randomBetween(2000, 7000));
        const submitBtn = document.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) simulateCurvedMouseClick(submitBtn);
      }
    }
  } catch (err) {
    console.error('[HCS] [RECAPTCHAv2] Error:', err);
  }
}

async function solveRecaptchaAudio() {
  console.log('[HCS] Attempting reCAPTCHA v2 Audio Challenge');
  try {
    const audioEl = document.querySelector('iframe[src*="recaptcha/api2"]')?.contentDocument?.querySelector('audio');
    if (!audioEl || !audioEl.src) return;

    const audioResp = await fetch(audioEl.src);
    const audioBlob = await audioResp.blob();
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    await new Promise(r => { reader.onload = r; });

    const response = await fetch(SOLVER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'audio', image: reader.result })
    });
    const data = await response.json();
    solveCount++;

    if (data.success && data.text) {
      console.log(`[HCS] [AUDIO] Solved: ${data.text}`);
      const input = document.querySelector('input[name="captcha-response"], input[id*="audio-response"]');
      if (input) {
        await typeHumanlike(input, data.text);
        const verifyBtn = document.querySelector('button:has(svg), button:has(.rc-button-default)');
        if (verifyBtn) {
          await sleep(randomBetween(500, 1500));
          simulateCurvedMouseClick(verifyBtn);
        }
      }
    }
  } catch (err) {
    console.error('[HCS] [AUDIO] Error (cross-origin limit):', err);
  }
}

async function solveHcaptcha() {
  console.log('[HCS] Detected hCaptcha widget');
  try {
    const frame = document.querySelector('iframe[src*="hcaptcha.com"]');
    if (!frame) return;

    const siteKey = frame.src.match(/[?&]sitekey=([^&]+)/);
    if (!siteKey) return;

    const response = await fetch(SOLVER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'hcaptcha',
        site_key: siteKey[1],
        page_url: window.location.href,
        sub_type: 'hcaptcha'
      })
    });
    const data = await response.json();
    solveCount++;

    if (data.success && data.text) {
      console.log(`[HCS] [HCAPTCHA] Solved: ${data.text}`);
      const textarea = document.querySelector('[name="h-captcha-response"]');
      if (textarea) {
        textarea.innerHTML = data.text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      await sleep(randomBetween(2000, 7000));
      const submitBtn = document.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) simulateCurvedMouseClick(submitBtn);
    }
  } catch (err) {
    console.error('[HCS] [HCAPTCHA] Error:', err);
  }
}

async function typeResultAndSubmit(text) {
  const input = document.querySelector('input[name="captcha"], input[id*="captcha"], input[type="text"]');
  if (!input) return;

  await typeHumanlike(input, text);
  const thinkingTime = randomBetween(2000, 7000);
  console.log(`[HCS] Variable thinking: ${thinkingTime}ms`);
  await sleep(thinkingTime);

  const submitBtn = document.querySelector('button[type="submit"], input[type="submit"]');
  if (submitBtn) {
    simulateCurvedMouseClick(submitBtn);
  }
}

async function smartWaitForFrame(selector, maxWaitMs = 10000) {
  const pollMs = 300;
  let waited = 0;
  while (waited < maxWaitMs) {
    const el = document.querySelector(selector);
    if (el) return el;
    await sleep(pollMs);
    waited += pollMs;
  }
  return null;
}

async function detectAndSolve() {
  const captchaImg = document.querySelector(
    'img[src*="captcha"], img[alt*="captcha"], img[id*="captcha"], img[class*="captcha"]'
  );

  if (captchaImg && !captchaImg.dataset.hcsProcessed) {
    captchaImg.dataset.hcsProcessed = '1';
    setTimeout(() => solveTextCaptcha(captchaImg), randomBetween(500, 1500));
    return;
  }

  const recaptchaFrame = await smartWaitForFrame('iframe[src*="recaptcha/api2"]');
  if (recaptchaFrame && !recaptchaFrame.dataset.hcsProcessed) {
    recaptchaFrame.dataset.hcsProcessed = '1';
    await sleep(randomBetween(1000, 2000));
    solveRecaptchaV2();
    return;
  }

  const audioFrame = await smartWaitForFrame('iframe[src*="recaptcha/api2/bf"]');
  if (audioFrame && !audioFrame.dataset.hcsProcessed) {
    audioFrame.dataset.hcsProcessed = '1';
    solveRecaptchaAudio();
    return;
  }

  const hcaptchaFrame = await smartWaitForFrame('iframe[src*="hcaptcha.com"]');
  if (hcaptchaFrame && !hcaptchaFrame.dataset.hcsProcessed) {
    hcaptchaFrame.dataset.hcsProcessed = '1';
    await sleep(randomBetween(1000, 2000));
    solveHcaptcha();
    return;
  }
}

const observer = new MutationObserver(() => {
  detectAndSolve();
});

observer.observe(document.body, { childList: true, subtree: true });

detectAndSolve();
