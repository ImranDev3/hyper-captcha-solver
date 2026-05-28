import base64
import cv2
import numpy as np
import pytesseract
import re
import random
import time
import io
import json
import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)
CORS(app)

SOLVE_COUNT = 0
IP_REFRESH_LIMIT = 25

TC_KEY = os.getenv('TWOCAPTCHA_KEY', '')
AC_KEY = os.getenv('ANTICAPTCHA_KEY', '')

def preprocess_image(image_bytes):
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)
    _, thresh = cv2.threshold(img, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    denoised = cv2.medianBlur(thresh, 3)
    return denoised

def extract_text(image):
    custom_config = r'--oem 3 --psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    text = pytesseract.image_to_string(image, config=custom_config)
    return re.sub(r'[^a-zA-Z0-9]', '', text).strip()

def solve_text(data):
    image_data = re.sub(r'^data:image/\w+;base64,', '', data['image'])
    image_bytes = base64.b64decode(image_data)
    processed = preprocess_image(image_bytes)
    solved = extract_text(processed)
    return solved

def solve_audio(data):
    try:
        import speech_recognition as sr
        audio_data = re.sub(r'^data:audio/\w+;base64,', '', data['image'])
        audio_bytes = base64.b64decode(audio_data)
        audio_file = io.BytesIO(audio_bytes)
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_file) as source:
            audio = recognizer.record(source)
        text = recognizer.recognize_google(audio)
        return text.strip()
    except ImportError:
        return None
    except Exception as e:
        print(f"[!] Audio recognition error: {e}")
        return None

def solve_via_2captcha(data):
    if not TC_KEY:
        return None
    try:
        site_key = data.get('site_key', '')
        page_url = data.get('page_url', '')
        captcha_type = data.get('sub_type', 'hcaptcha')

        captcha_map = {
            'hcaptcha': 'hcaptcha',
            'recaptcha_v2': 'recaptchav2',
            'recaptcha_v3': 'recaptchav3',
            'geetest': 'geetest',
        }
        method = captcha_map.get(captcha_type, 'hcaptcha')

        resp = requests.post('https://2captcha.com/in.php', data={
            'key': TC_KEY,
            'method': 'userrecaptcha',
            'googlekey': site_key,
            'pageurl': page_url,
            'json': 1,
        }, timeout=30)
        result = resp.json()
        if result.get('status') != 1:
            return None

        captcha_id = result['request']
        for _ in range(30):
            time.sleep(5)
            poll = requests.get('https://2captcha.com/res.php', params={
                'key': TC_KEY,
                'action': 'get',
                'id': captcha_id,
                'json': 1,
            }, timeout=15)
            poll_data = poll.json()
            if poll_data.get('status') == 1:
                return poll_data['request']
        return None
    except Exception as e:
        print(f"[!] 2Captcha error: {e}")
        return None

@app.route('/solve', methods=['POST'])
def solve_captcha():
    global SOLVE_COUNT
    start = time.time()

    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data'}), 400

        captcha_type = data.get('type', 'text')
        solved = None
        method_used = captcha_type.upper()

        if captcha_type == 'audio':
            solved = solve_audio(data)
            if solved is None:
                return jsonify({'success': False, 'error': 'Audio recognition failed'}), 500
        elif captcha_type in ('recaptcha_v2', 'hcaptcha', 'geetest'):
            solved = solve_via_2captcha(data)
            if solved is None:
                return jsonify({'success': False, 'error': f'{captcha_type} solving failed'}), 500
            method_used = captcha_type.upper()
        else:
            if 'image' not in data:
                return jsonify({'success': False, 'error': 'No image data'}), 400
            solved = solve_text(data)

        SOLVE_COUNT += 1
        elapsed = round(time.time() - start, 3)

        if solved:
            print(f"[+] [{method_used}] SOLVED: '{solved}' | Time: {elapsed}s | Total: {SOLVE_COUNT}")
        else:
            print(f"[-] [{method_used}] FAILED | Time: {elapsed}s | Total: {SOLVE_COUNT}")

        response = {
            'success': bool(solved),
            'text': solved or '',
            'solves': SOLVE_COUNT,
            'type': captcha_type,
        }

        if SOLVE_COUNT > 0 and SOLVE_COUNT % IP_REFRESH_LIMIT == 0:
            response['ip_alert'] = True
            print("[!] ALERT: 25 solves reached. Change your VPN IP now!")

        return jsonify(response)

    except Exception as e:
        print(f"[!] ERROR: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 55)
    print("  Hyper Captcha Solver - Backend Running")
    print("  Endpoint: http://localhost:5000/solve")
    print("  Support: [TEXT] [AUDIO] [RECAPTCHAv2] [HCAPTCHA] [GEETEST]")
    print("=" * 55)
    app.run(host='0.0.0.0', port=5000, debug=False)
