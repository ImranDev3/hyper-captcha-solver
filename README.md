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

The extension auto-activates, detects captcha type, and solves.

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
