# server.py
from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/CyberCyber": {"origins": ["http://127.0.0.1:8080", "http://localhost:8080"]},
                     r"/set-filename": {"origins": ["http://127.0.0.1:8080", "http://localhost:8080"]}})

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "cache_traces.jsonl")

@app.route("/favicon.ico")
def favicon():
    return "", 204  # Return empty response with "No Content" status

# serve the HTML
@app.get("/")
def index():
    # assumes: shustermans_code/
    #          ├─ CyberCyber/
    #          ├─ index.html
    #          └─ server.py
    return send_from_directory("", "index.html")

# (optional) serve other static assets from CyberCyber/ if you add any later
@app.get("/<path:filename>")
def static_files(filename):
    return send_from_directory("", filename)

@app.route("/set-filename", methods=["POST"])
def set_filename():
    global LOG_FILE
    data = request.get_json(force=True, silent=True) or {}
    filename = data.get("filename", "cache_traces.jsonl")
    LOG_FILE = os.path.join(LOG_DIR, filename)
    print(f"Log file set to: {LOG_FILE}")
    return jsonify(status="ok", filename=filename), 200

@app.route("/CyberCyber", methods=["POST"])
def collect():
    data = request.get_json(force=True, silent=True) or {}
    # append as JSON line
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(data) + "\n")
    return jsonify(status="ok"), 200


if __name__ == "__main__":
    # run on http://localhost:8080
    app.run(host="0.0.0.0", port=8080, debug=True)
