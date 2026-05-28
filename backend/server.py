import base64
import cv2
import numpy as np
import pytesseract
import re
import random
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)
CORS(app)

SOLVE_COUNT = 0
IP_REFRESH_LIMIT = 25


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


@app.route('/solve', methods=['POST'])
def solve_captcha():
    global SOLVE_COUNT
    start = time.time()

    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'success': False, 'error': 'No image data'}), 400

        image_data = re.sub(r'^data:image/\w+;base64,', '', data['image'])
        image_bytes = base64.b64decode(image_data)

        processed = preprocess_image(image_bytes)
        solved = extract_text(processed)

        SOLVE_COUNT += 1

        elapsed = round(time.time() - start, 3)

        if solved:
            print(f"[+] SOLVED: '{solved}' | Time: {elapsed}s | Total: {SOLVE_COUNT}")
        else:
            print(f"[-] FAILED to solve captcha | Time: {elapsed}s | Total: {SOLVE_COUNT}")

        response = {'success': bool(solved), 'text': solved, 'solves': SOLVE_COUNT}

        if SOLVE_COUNT > 0 and SOLVE_COUNT % IP_REFRESH_LIMIT == 0:
            response['ip_alert'] = True
            print("[!] ALERT: 25 solves reached. Change your VPN IP now!")

        return jsonify(response)

    except Exception as e:
        print(f"[!] ERROR: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("  Hyper Captcha Solver - Backend Running")
    print("  Endpoint: http://localhost:5000/solve")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=False)
