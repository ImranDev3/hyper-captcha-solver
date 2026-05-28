# Hyper Captcha Solver

> **Next-Gen Stealth Automation for Captcha Solving** — Fully Self-Contained Chrome Extension

[![Chrome](https://img.shields.io/badge/Chrome_Extension-V3-4285F4?logo=googlechrome)](https://developer.chrome.com/docs/extensions)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-5-5C3EE8?logo=tesseract)](https://tesseract.projectnaptha.com)
[![License](https://img.shields.io/badge/License-MIT-5E5E5E)](#license)

> 🚀 **No backend. No Python. No Flask. Just load the extension and it works.**

---

## 📖 Introduction

**Hyper Captcha Solver** is a fully self-contained Chrome Extension that automatically solves captchas on `kolotibablo.com`. It supports **Text captchas** (via Tesseract.js OCR in-browser), **reCAPTCHA v2 Audio challenges** (via Web Speech API), and **hCaptcha** (via optional 2Captcha API).

Everything runs **inside your browser** — no server, no installation, no Python.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **In-Browser OCR** | Tesseract.js runs directly in the page — no backend needed |
| 🔊 **Audio Challenge Solver** | reCAPTCHA v2 audio → Web Speech API → auto-fill |
| 🔌 **hCaptcha Support** | Optional 2Captcha API key for hCaptcha challenges |
| 🖱️ **Bezier Mouse Paths** | Curved mouse trajectories instead of direct clicks |
| ⌨️ **Human-like Typing** | 150–300ms jitter per keystroke |
| ⏱️ **Variable Thinking Time** | 2–7 seconds random delay before submit |
| 🔄 **IP Refresh Alert** | Popup reminder every 25 solves to rotate VPN |
| 📟 **Solve Counter** | Tracks total solves in extension popup |
| 👁️ **Auto-Detection** | MutationObserver watches DOM for all captcha types |

---

## 📁 File Structure

```
hyper-captcha-solver/
└── extension/
    ├── manifest.json      # Chrome Extension V3
    ├── content.js         # All detection + solving + stealth logic
    ├── background.js      # Service worker (keepalive)
    └── popup.html         # Status + 2Captcha key config
```

**Only `extension/` folder matters.** Everything else is documentation.

---

## 🚀 How to Use

### Step 1: Load the Extension

1. Open Google Chrome → go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the **`extension/`** folder

### Step 2: Go to Kolotibablo

1. Open a new tab → go to `https://kolotibablo.com`
2. Log in and start a captcha task

### Step 3: Watch It Auto-Solve

The extension automatically:

1. 🔍 **Detects** the captcha image on the page
2. 🧠 **Loads Tesseract.js** from CDN (cached after first use)
3. 📝 **Extracts text** using in-browser OCR
4. ⌨️ **Types result** with human-like keystroke jitter
5. ⏳ **Waits 2–7 seconds** (variable thinking time)
6. 🖱️ **Clicks submit** with curved mouse path simulation

### Terminal / Console Logs

Open **Chrome DevTools Console** (`F12`) to see real-time logs:

```
[HCS] [TEXT] Processing...
[HCS] [TEXT] Solved: aB3xY
[HCS] Thinking: 4523ms
```

### Extension Popup

Click the extension icon to view:
- Current solve count
- Status indicator
- 2Captcha API key input (for hCaptcha)

---

## 🔧 Optional: 2Captcha for hCaptcha

Text and Audio captchas work automatically. For **hCaptcha**, you need a 2Captcha API key:

1. Sign up at [2captcha.com](https://2captcha.com)
2. Get your API key
3. Click the extension icon → paste key → click **Save**

---

## 🧰 Tech Stack

| Technology | Purpose | Where |
|---|---|---|
| **JavaScript** | Core extension logic | `content.js` |
| **Tesseract.js** | In-browser OCR engine | Loaded from CDN |
| **Web Speech API** | Audio captcha → text | Browser built-in |
| **2Captcha API** | hCaptcha fallback solution | Optional |
| **Chrome Extension V3** | Extension framework | `manifest.json` |

---

## ⚠️ Disclaimer

> This project is intended **for educational purposes only**. The author does not condone or encourage any violation of terms of service, abuse of automated systems, or any illegal activity. Users are solely responsible for ensuring their use complies with all applicable laws and platform policies. Use at your own risk.

---

## 📄 License

MIT
