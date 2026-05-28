# Hyper Captcha Solver

> **Next-Gen Stealth Automation for Captcha Solving**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=fff)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.1-000?logo=flask)](https://flask.palletsprojects.com)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.11-5C3EE8?logo=opencv)](https://opencv.org)
[![Chrome](https://img.shields.io/badge/Chrome_Extension-V3-4285F4?logo=googlechrome)](https://developer.chrome.com/docs/extensions)
[![License](https://img.shields.io/badge/License-MIT-5E5E5E)](#license)

---

## 📖 Introduction

**Hyper Captcha Solver** is a lightweight, stealth-focused automation tool designed to solve multiple captcha types automatically — **Text**, **reCAPTCHA v2**, **hCaptcha**, and **Audio challenges**. It combines a **Python backend** (Flask + OpenCV + Tesseract + SpeechRecognition) with a **Chrome Extension (Manifest V3)** to deliver human-like, undetectable captcha solving.

The system is optimized for **stealth** — every keystroke follows bezier-curved mouse paths, typing jitter, and randomized thinking delays to mimic genuine human behavior.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **Multi-Type Support** | Text OCR, reCAPTCHA v2 (audio challenge), hCaptcha, GeeTest — all in one pipeline |
| 🔊 **Audio Challenge Solver** | reCAPTCHA v2 audio → SpeechRecognition → text, with full automation |
| 🔌 **API Fallback** | Optional 2Captcha/Anti-Captcha integration for complex hCaptcha & GeeTest |
| 🧮 **Smart Image Processing** | Grayscale → OTSU thresholding → median blur → Tesseract OCR with whitelist |
| ⌨️ **Human-like Typing** | 150–300ms jitter per keystroke |
| 🖱️ **Bezier Mouse Paths** | Curved mouse movements instead of direct clicks |
| ⏱️ **Variable Thinking Time** | 2–7 second random delay after solving before submission |
| 🔄 **Smart IP Refresh** | Alert every 25 solves to rotate VPN |
| 📟 **Real-time CLI Logging** | Per-solve logging with type tag — `[TEXT]`, `[AUDIO]`, `[RECAPTCHAv2]`, `[HCAPTCHA]` |
| 👁️ **Dynamic Detection** | MutationObserver watches DOM for all captcha types and solves on appearance |

---

## 🛠️ Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/ImranDev3/hyper-captcha-solver.git
cd hyper-captcha-solver
```

### Step 2: Install Python Dependencies

```powershell
pip install -r requirements.txt
```

### Step 3: Install Tesseract-OCR

Download and install **Tesseract-OCR** from the official repository:

👉 [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)

Default path:
```
C:\Program Files\Tesseract-OCR\tesseract.exe
```

> ⚠️ Update the path in `backend/server.py` if installed elsewhere.

### Step 4 (Optional): 2Captcha API Key

Set environment variable for API fallback mode:

```powershell
$env:TWOCAPTCHA_KEY = "your_api_key_here"
```

---

## 🚀 How to Run

### 1. Start the Flask Backend

```powershell
python backend/server.py
```

```
=======================================================
  Hyper Captcha Solver - Backend Running
  Endpoint: http://localhost:5000/solve
  Support: [TEXT] [AUDIO] [RECAPTCHAv2] [HCAPTCHA] [GEETEST]
=======================================================
```

### 2. Load the Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `extension/` folder

---

## 🎯 How to Use (Step-by-Step)

### Step 1: Start the Backend Server
Open **VS Code Terminal** (or any terminal) and run:
```powershell
python backend/server.py
```
Keep this terminal window open — the server must stay running.

### Step 2: Load the Extension in Chrome
1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle **Developer mode** ON (top-right)
4. Click **Load unpacked**
5. Browse and select the `extension/` folder
6. You should see **Hyper Captcha Solver** in your extensions list

### Step 3: Go to Kolotibablo
1. Open a new tab
2. Go to `https://kolotibablo.com`
3. Log in to your account
4. Start a captcha task

### Step 4: Watch It Work Automatically
- The extension **auto-detects** the captcha image on the page
- It captures the image → sends to your local Flask server
- Flask processes it with OpenCV + Tesseract → returns the solved text
- The extension **auto-types** the result into the input box (with human-like jitter)
- After a random 2-7 second wait, it **auto-clicks** the submit button
- Check your terminal — you'll see real-time logs like:
```
[+] [TEXT] SOLVED: 'aB3xY' | Time: 0.842s | Total: 1
[+] [TEXT] SOLVED: '9kM2p' | Time: 0.651s | Total: 2
```

### Step 5: IP Rotation (Every 25 Solves)
- After 25 solves, a popup will alert you: **"IP Refresh Required! Change your VPN now."**
- Change your VPN IP address
- Click **OK** on the popup
- The counter resets automatically

### Troubleshooting
| Issue | Fix |
|---|---|
| Server won't start | Run `pip install -r requirements.txt` |
| "Tesseract not found" | Install Tesseract OCR from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki) and update path in `server.py` |
| Extension not detecting | Refresh the page, check `chrome://extensions/` is enabled |
| Wrong captcha text | Check the image quality — better lighting = better OCR

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| **Python** | Core backend logic |
| **Flask** | REST API with CORS |
| **OpenCV** | Image preprocessing (grayscale, threshold, denoise) |
| **Tesseract OCR** | Text captcha character extraction |
| **SpeechRecognition** | reCAPTCHA v2 audio challenge → text |
| **2Captcha API** | Fallback for hCaptcha / GeeTest |
| **JavaScript** | Chrome Extension content script |
| **Chrome Extension V3** | Browser DOM manipulation & API calls |

---

## 📁 File Structure

```
hyper-captcha-solver/
├── backend/
│   └── server.py              # Multi-type solver (TEXT / AUDIO / RECAPTCHAv2 / HCAPTCHA / GEETEST)
├── extension/
│   ├── manifest.json          # Chrome Extension V3 manifest
│   └── content.js             # Dynamic detection + bezier mouse paths + variable thinking
├── requirements.txt
├── .gitignore
└── README.md
```

---

## ⚠️ Disclaimer

> This project is intended **for educational purposes only**. The author does not condone or encourage any violation of terms of service, abuse of automated systems, or any illegal activity. Users are solely responsible for ensuring their use complies with all applicable laws and platform policies. Use at your own risk.

---

## 📄 License

MIT
