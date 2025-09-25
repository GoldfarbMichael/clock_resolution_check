# server.py
from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/CyberCyber": {"origins": ["http://127.0.0.1:8080", "http://localhost:8080"]},
                     r"/set-metadata": {"origins": ["http://127.0.0.1:8080", "http://localhost:8080"]}})

current_log_dir = "data"  # default fallback
current_filename = "cache_traces.jsonl"  # default fallback


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

@app.route("/set-metadata", methods=["POST"])
def set_metadata():
    global current_log_dir, current_filename
    data = request.get_json(force=True, silent=True) or {}
    
    filename = data.get("filename", "cache_traces.jsonl")
    log_dir = data.get("log_dir", "data")
    
    current_filename = filename
    current_log_dir = log_dir
    
    # Ensure the log directory exists
    os.makedirs(current_log_dir, exist_ok=True)
    
    print(f"Metadata set - Log dir: {current_log_dir}, Filename: {current_filename}")
    return jsonify(status="ok", filename=filename, log_dir=log_dir), 200

@app.route("/CyberCyber", methods=["POST"])
def collect():
    data = request.get_json(force=True, silent=True) or {}
    
    # Use current log directory and filename (instead of LOG_FILE)
    log_file = os.path.join(current_log_dir, current_filename)
    
    # Ensure directory exists before writing
    os.makedirs(current_log_dir, exist_ok=True)
    
    # append as JSON line
    with open(log_file, "a") as f:
        f.write(json.dumps(data) + "\n")
    
    print(f"Data written to: {log_file}")
    return jsonify(status="ok"), 200

if __name__ == "__main__":
    # run on http://localhost:8080
    app.run(host="0.0.0.0", port=8080, debug=True)
