from flask import Flask, send_from_directory, request, jsonify, make_response
from datetime import datetime
import os
import json

app = Flask(__name__, static_folder="public", static_url_path="/")

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# ---- COOP/COEP so crossOriginIsolated === true (needed for SAB + AudioWorklet)
@app.after_request
def add_security_headers(resp):
    resp.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    resp.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
    # Helpful, not strictly required for same-origin static files:
    resp.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    return resp

# ---- Static files (index.html + JS)
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(app.static_folder, path)

# ---- Upload endpoint: receive calibration JSON and save under ./logs/
@app.post("/upload")
def upload():
    try:
        payload = request.get_json(force=True, silent=False)
    except Exception as e:
        return make_response({"ok": False, "error": f"invalid JSON: {e}"}, 400)

    ts = datetime.utcnow().isoformat(timespec="seconds").replace(":", "-")
    fname = f"sab_calibration_{ts}.json"
    fpath = os.path.join(LOG_DIR, fname)

    with open(fpath, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return jsonify({"ok": True, "file": fname, "path": f"/logs/{fname}"})

# ---- Serve saved logs (read-only)
@app.route("/logs/<path:filename>")
def serve_log(filename):
    return send_from_directory(LOG_DIR, filename, as_attachment=True)

if __name__ == "__main__":
    # Run on 127.0.0.1:8080
    app.run(host="127.0.0.1", port=8080, debug=False)
