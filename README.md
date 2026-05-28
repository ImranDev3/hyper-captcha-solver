# Hyper Captcha Solver

> **Next-Gen Stealth Automation for Captcha Solving**

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=fff)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.1.1-000?logo=flask)](https://flask.palletsprojects.com)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.11-5C3EE8?logo=opencv)](https://opencv.org)
[![Chrome](https://img.shields.io/badge/Chrome_Extension-V3-4285F4?logo=googlechrome)](https://developer.chrome.com/docs/extensions)
[![License](https://img.shields.io/badge/License-MIT-5E5E5E)](#license)

---

## 📖 Introduction

**Hyper Captcha Solver** is a lightweight, stealth-focused automation tool designed to solve text-based captchas automatically. It combines a **Python OCR backend** (Flask + OpenCV + Tesseract) with a **Chrome Extension (Manifest V3)** to deliver human-like, undetectable captcha solving on supported platforms.

The system is optimized for **stealth** — every keystroke, mouse movement, and timing delay mimics real human behavior to reduce detection risk.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **Automated Image Processing** | Captcha images are preprocessed using OpenCV — grayscale conversion, adaptive thresholding, and noise reduction for maximum OCR accuracy |
| ⌨️ **Human-like Typing Simulation** | Each character is typed with a random 150–300ms jitter delay, simulating real keystroke intervals |
| 🔄 **Smart IP Refresh System** | Built-in alert triggers every 25 solves reminding you to rotate your VPN IP address |
| 🖱️ **Mouse Movement Emulation** | Randomized hover coordinates simulate genuine cursor behavior before clicking |
| 📟 **Real-time CLI Logging** | Every solve attempt is logged to the terminal with success/fail status, elapsed time, and total count |

---

## 🛠️ Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/ImranDev3/hyper-captcha-solver.git
cd hyper-captcha-solver
```

### Step 2: Install Python Dependencies

```powershell
pip install flask flask-cors pytesseract opencv-python pillow
```

Or install via the bundled `requirements.txt`:

```powershell
pip install -r requirements.txt
```

### Step 3: Install Tesseract-OCR

Download and install **Tesseract-OCR** from the official repository:

👉 [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)

**Default installation path:**

```
C:\Program Files\Tesseract-OCR\tesseract.exe
```

> ⚠️ If you install Tesseract to a different location, update the path in `backend/server.py` (line 9).

---

## 🚀 How to Run

### 1. Start the Flask Backend

```powershell
python backend/server.py
```

**Expected output:**

```
==================================================
  Hyper Captcha Solver - Backend Running
  Endpoint: http://localhost:5000/solve
==================================================
```

The server listens on `http://localhost:5000` and accepts POST requests with base64-encoded captcha images.

### 2. Load the Chrome Extension

1. Open Google Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `extension/` folder from the project directory

Once loaded, the extension will automatically activate on `kolotibablo.com` and begin solving captchas.

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| **Python** | Core programming language |
| **Flask** | Lightweight REST API server with CORS support |
| **OpenCV** | Image preprocessing (grayscale, thresholding, denoising) |
| **Tesseract OCR** | Optical character recognition for captcha text extraction |
| **JavaScript** | Chrome Extension content script logic |
| **Chrome Extension V3** | Browser integration for DOM manipulation and API communication |

---

## ⚠️ Disclaimer

> This project is intended **for educational purposes only**. The author does not condone or encourage any violation of terms of service, abuse of automated systems, or any illegal activity. Users are solely responsible for ensuring their use complies with all applicable laws and platform policies. Use at your own risk.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
