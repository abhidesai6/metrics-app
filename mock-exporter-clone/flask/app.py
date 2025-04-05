from flask import Flask, jsonify, request
import requests
import uuid
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})

thresholds = {}


def evaluate_condition(current: float, threshold: float, operator: str) -> bool:
    if operator == ">":
        return current > threshold
    elif operator == "<":
        return current < threshold
    elif operator == ">=":
        return current >= threshold
    elif operator == "<=":
        return current <= threshold
    elif operator == "==":
        return current == threshold
    return False

@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    prometheus_url = "http://prometheus:9090/api/v1/query"
    queries = {
        "cpu_usage": "cpu_usage",
        "memory_usage": "memory_usage",
        "disk_usage": "disk_usage",
        'disk_read_bytes' : 'disk_read_bytes',
        'disk_write_bytes' : 'disk_write_bytes',
        'network_rx_bytes' : 'network_rx_bytes',
        'network_tx_bytes' : 'network_tx_bytes'
    }

    results = {}
    for key, query in queries.items():
        r = requests.get(prometheus_url, params={"query": query})
        data = r.json()
        print(data)
        try:
            print(data["data"]["result"][0])
            value = float(data["data"]["result"][0]["value"][1])
            time = data["data"]["result"][0]["value"][0]
        except (IndexError, KeyError):
            value = None
            time = None
        results[key] = {"value" : value , "timestamp" : time}

    return jsonify(results)

@app.route('/api/metrics/<metric_name>')
def get_metric(metric_name):
    # Optional: read duration and step from query params
    prometheus_url = "http://prometheus:9090/api/v1/query_range"
    duration = int(request.args.get("duration", 1))  # in hours
    step = request.args.get("step", "30s")

    end = datetime.utcnow()
    start = end - timedelta(hours=duration)

    params = {
        "query": metric_name,
        "start": start.isoformat() + "Z",
        "end": end.isoformat() + "Z",
        "step": step
    }

    try:
        response = requests.get(prometheus_url, params=params)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route("/api/thresholds", methods=["GET"])
def list_thresholds():
    return jsonify(list(thresholds.values()))

@app.route("/api/thresholds", methods=["POST"])
def create_threshold():
    data = request.json
    tid = str(uuid.uuid4())
    thresholds[tid] = {"id": tid, **data}
    return jsonify(thresholds[tid]), 201

@app.route("/api/thresholds/<tid>", methods=["PUT"])
def update_threshold(tid):
    if tid not in thresholds:
        return jsonify({"error": "Not found"}), 404
    thresholds[tid].update(request.json)
    return jsonify(thresholds[tid])

@app.route("/api/thresholds/<tid>", methods=["DELETE"])
def delete_threshold(tid):
    if tid in thresholds:
        del thresholds[tid]
        return "", 204
    return jsonify({"error": "Not found"}), 404

@app.route("/api/alerts", methods=["GET"])
def check_alerts():
    prometheus_url = "http://prometheus:9090/api/v1/query"
    active_alerts = []

    for tid, threshold in thresholds.items():
        metric = threshold.get("metric")
        operator = threshold.get("operator")
        value = threshold.get("threshold")

        # Fetch the current value of the metric
        response = requests.get(prometheus_url, params={"query": metric})
        data = response.json()

        try:
            current_value = float(data["data"]["result"][0]["value"][1])
        except (IndexError, KeyError, ValueError):
            continue  # skip if there's no data

        # Apply threshold logic
        if evaluate_condition(current_value, value, operator):
            active_alerts.append({
                "id": tid,
                "metric": metric,
                "threshold": value,
                "operator": operator,
                "current_value": current_value
            })

    return jsonify(active_alerts)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
