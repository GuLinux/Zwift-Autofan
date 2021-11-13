from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/api/status")
def get_status():
    return jsonify({'status': 'ok'})
