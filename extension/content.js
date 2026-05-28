const SOLVER_API = 'http://localhost:5000/solve';
let solveCount = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, ms) {
  return Math.floor(Math.random() * (ms - min + 1)) + min;
}

function simulateHumanClick(element) {
  const rect = element.getBoundingClientRect();
  const offsetX = randomBetween(1, rect.width - 1);
  const offsetY = randomBetween(1, rect.height - 1);
  const events = ['mouseover', 'mousemove', 'mousedown', 'mouseup', 'click'];
  events.forEach(type => {
    element.dispatchEvent(new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + offsetX,
      clientY: rect.top + offsetY
    }));
  });
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

async function solveCaptcha(imgElement) {
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
      body: JSON.stringify({ image: base64Image })
    });

    const data = await response.json();
    solveCount++;

    if (data.success && data.text) {
      console.log(`[HCS] Solved: ${data.text}`);

      const input = document.querySelector('input[name="captcha"], input[id*="captcha"], input[type="text"]');
      if (input) {
        await typeHumanlike(input, data.text);
        await sleep(randomBetween(1000, 3000));

        const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], button:has(span)');
        if (submitBtn) {
          simulateHumanClick(submitBtn);
        }
      }

      if (data.ip_alert) {
        alert('[HCS] IP Refresh Required! Change your VPN now.');
      }
    } else {
      console.warn('[HCS] Failed to solve captcha');
    }
  } catch (err) {
    console.error('[HCS] Error:', err);
  }
}

const observer = new MutationObserver(() => {
  const captchaImg = document.querySelector(
    'img[src*="captcha"], img[alt*="captcha"], img[id*="captcha"], img[class*="captcha"]'
  );
  if (captchaImg && !captchaImg.dataset.hcsProcessed) {
    captchaImg.dataset.hcsProcessed = '1';
    setTimeout(() => solveCaptcha(captchaImg), randomBetween(500, 1500));
  }
});

observer.observe(document.body, { childList: true, subtree: true });
