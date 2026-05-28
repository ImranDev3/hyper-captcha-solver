# Hyper Captcha Solver

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.1.1-black?logo=flask)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen?logo=googlechrome)
![License](https://img.shields.io/badge/License-MIT-green)

**Automated OCR-based captcha solving system** for `kolotibablo.com` — Flask backend + Chrome Extension with human-like stealth behavior.

---

## Architecture

```
┌─────────────────────┐       POST /solve        ┌──────────────────┐
│  Chrome Extension   │ ──── base64 image ────→   │  Flask Backend   │
│  (content.js)       │ ←─── solved text ────     │  (server.py)     │
└─────────────────────┘                           └──────┬───────────┘
                                                          │
                                                    ┌─────▼──────┐
                                                    │  Tesseract  │
                                                    │  + OpenCV   │
                                                    └────────────┘
```

---

## Features

| Feature | Description |
|---|---|
| **OCR Engine** | Base64 image → Grayscale → Thresholding → Tesseract extraction |
| **Human-like Typing** | Per-character delay 150-300ms jitter |
| **Mouse Simulation** | Random hover offset before click events |
| **Auto Submit** | 1-3s randomized delay before form submission |
| **IP Refresh Alert** | Notification every 25 solves to change VPN |
| **MutationObserver** | Auto-detects captcha images on dynamic page loads |
| **CORS Enabled** | Secure communication between extension and backend |

---

## Installation

### 1. Install Tesseract OCR

Download & install from [UB-Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki)

Default path: `C:\Program Files\Tesseract-OCR\`

### 2. Install Python Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Start Backend Server

```powershell
python backend/server.py
```

```
==================================================
  Hyper Captcha Solver - Backend Running
  Endpoint: http://localhost:5000/solve
==================================================
```

### 4. Load Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## File Structure

```
hyper-captcha-solver/
├── backend/
│   └── server.py              # Flask OCR API (port 5000)
├── extension/
│   ├── manifest.json          # Chrome Extension V3 manifest
│   └── content.js             # Auto-solve + stealth logic
├── requirements.txt           # Python dependencies
├── .gitignore
└── README.md
```

---

## API Reference

### `POST /solve`

**Request:**
```json
{
  "image": "data:image/png;base64,iVBORw0..."
}
```

**Response:**
```json
{
  "success": true,
  "text": "aB3xY",
  "solves": 1,
  "ip_alert": false
}
```

| Field | Type | Description |
|---|---|---|
| `success` | bool | OCR extraction result |
| `text` | string | Solved captcha text (alphanumeric) |
| `solves` | int | Total captchas solved since server start |
| `ip_alert` | bool | Triggers every 25 solves |

---

## Stealth & Anti-Ban

- Random key press intervals (150-300ms)
- Randomized mouse coordinates on click
- Submit delay 1-3 seconds (randomized)
- VPN/IP change reminder at 25 solve intervals

---

## Notes

- Tesseract path in `backend/server.py:9` — update if installed elsewhere
- Only compatible with **text-based** captchas
- For production, consider deploying backend behind a reverse proxy

---

## License

MIT
