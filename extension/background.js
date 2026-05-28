chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'ocr') {
    const tabId = sender.tab?.id;
    if (!tabId) return;
    chrome.scripting.executeScript({
      target: { tabId },
      func: (dataUrl) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.onload = async () => {
              try {
                const { data } = await Tesseract.recognize(imageData, 'eng', {
                  tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                });
                const text = data.text.replace(/[^a-zA-Z0-9]/g, '').trim();
                resolve(text);
              } catch (e) {
                reject(e.message);
              }
            };
            script.onerror = () => reject('Failed to load Tesseract.js');
            document.head.appendChild(script);
          };
          img.onerror = () => reject('Image load failed');
          img.src = dataUrl;
        });
      },
      args: [msg.dataUrl],
    }).then(([result]) => {
      sendResponse({ text: result.result || null });
    }).catch(err => {
      sendResponse({ text: null, error: err.message });
    });
    return true;
  }
});
