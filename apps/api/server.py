#!/usr/bin/env python3
import json
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse

HOST = "0.0.0.0"
PORT = 8080

DEVICES = [
    {"id": "d-001", "name": "Pixel-Cloud-01", "status": "running", "region": "ap-southeast-1"},
    {"id": "d-002", "name": "Pixel-Cloud-02", "status": "stopped", "region": "ap-southeast-1"},
    {"id": "d-003", "name": "Pixel-Cloud-03", "status": "running", "region": "cn-hangzhou"},
]

SESSIONS = []


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Handler(BaseHTTPRequestHandler):
    def _json(self, code: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._json(200, {"ok": True})

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            return self._json(200, {"status": "ok", "time": utc_now_iso()})

        if path == "/api/devices":
            return self._json(200, {"items": DEVICES, "total": len(DEVICES)})

        return self._json(404, {"error": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/sessions":
            return self._json(404, {"error": "Not found"})

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length > 0 else b"{}"
            payload = json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, ValueError):
            return self._json(400, {"error": "Invalid JSON body"})

        device_id = payload.get("deviceId")
        target = next((d for d in DEVICES if d["id"] == device_id), None)
        if not target:
            return self._json(400, {"error": "deviceId is invalid"})
        if target["status"] != "running":
            return self._json(409, {"error": "Device is not running"})

        session_id = f"s-{len(SESSIONS) + 1:03d}"
        session = {
            "id": session_id,
            "deviceId": device_id,
            "status": "active",
            "createdAt": utc_now_iso(),
            "webrtc": {
                "signalUrl": "ws://localhost:8080/ws/signal",
                "note": "TODO: implement signaling and ICE exchange"
            }
        }
        SESSIONS.append(session)
        return self._json(201, session)


def main():
    server = HTTPServer((HOST, PORT), Handler)
    print(f"API server running on http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
