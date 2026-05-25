#!/usr/bin/env python3
"""
Servidor webhook para recibir notificaciones de cambios en Google Drive.
Google Drive llama a este endpoint cada vez que un documento del folder cambia.
"""

import json
import logging
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

PORT = 8765


class DriveWebhookHandler(BaseHTTPRequestHandler):

    def do_POST(self):
        # Google Drive envía headers X-Goog-* para identificar el cambio
        channel_id = self.headers.get('X-Goog-Channel-ID', '')
        resource_state = self.headers.get('X-Goog-Resource-State', '')
        changed = self.headers.get('X-Goog-Changed', '')

        log.info(f"Notificación recibida — state: {resource_state}, changed: {changed}")

        # 'sync' es la notificación inicial de registro; ignorar
        if resource_state == 'sync':
            self.send_response(200)
            self.end_headers()
            return

        # Cualquier otro state (update, add, remove) dispara el sync
        if resource_state in ('update', 'add', 'remove', 'trash'):
            log.info("Cambio detectado en Drive — ejecutando sync...")
            try:
                result = subprocess.run(
                    [sys.executable, 'sync_drive.py'],
                    capture_output=True, text=True, timeout=120
                )
                log.info(result.stdout)
                if result.returncode != 0:
                    log.error(result.stderr)
            except subprocess.TimeoutExpired:
                log.error("Sync expiró (timeout 120s)")
            except Exception as e:
                log.error(f"Error ejecutando sync: {e}")

        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Health check
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status': 'ok', 'service': 'drive-webhook'}).encode())

    def log_message(self, format, *args):
        pass  # silenciar logs de HTTP por defecto


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), DriveWebhookHandler)
    log.info(f"Webhook server escuchando en puerto {PORT}")
    log.info("Para exponerlo al exterior: ngrok http 8765")
    server.serve_forever()
