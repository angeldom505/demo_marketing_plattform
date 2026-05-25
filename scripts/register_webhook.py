#!/usr/bin/env python3
"""
Registra (o renueva) el webhook de Google Drive para el folder de Hogares Unión.
Google Drive expira los canales cada 24h — este script los renueva automáticamente.

Uso:
  python3 register_webhook.py --url https://tu-dominio.com/drive-webhook
  python3 register_webhook.py --url https://tu-dominio.com/drive-webhook --renew
"""

import argparse
import json
import uuid
import warnings
from pathlib import Path

warnings.filterwarnings('ignore')

from google.oauth2 import service_account
from googleapiclient.discovery import build

BASE_DIR = Path(__file__).parent
CREDENTIALS_FILE = BASE_DIR / 'content-os-493218-f8263f3f2789.json'
FOLDER_ID = '1N_GDJoVyKbakPL_iWVcRoi9PVlAL7T43'
CHANNEL_FILE = BASE_DIR / 'data' / '.webhook_channel.json'


def get_service():
    creds = service_account.Credentials.from_service_account_file(
        str(CREDENTIALS_FILE),
        scopes=['https://www.googleapis.com/auth/drive']
    )
    return build('drive', 'v3', credentials=creds)


def stop_existing_channel(service):
    if not CHANNEL_FILE.exists():
        return
    channel = json.loads(CHANNEL_FILE.read_text())
    try:
        service.channels().stop(body={
            'id': channel['id'],
            'resourceId': channel['resourceId']
        }).execute()
        print(f"Canal anterior detenido: {channel['id']}")
    except Exception as e:
        print(f"No se pudo detener el canal anterior (puede haber expirado): {e}")


def register_channel(service, webhook_url: str):
    channel_id = str(uuid.uuid4())
    body = {
        'id': channel_id,
        'type': 'web_hook',
        'address': webhook_url,
        'payload': True,
    }
    response = service.files().watch(
        fileId=FOLDER_ID,
        body=body,
        supportsAllDrives=True
    ).execute()

    CHANNEL_FILE.parent.mkdir(parents=True, exist_ok=True)
    CHANNEL_FILE.write_text(json.dumps({
        'id': response['id'],
        'resourceId': response['resourceId'],
        'expiration': response.get('expiration'),
        'webhookUrl': webhook_url
    }, indent=2))

    expiry_ms = int(response.get('expiration', 0))
    expiry_s = expiry_ms // 1000
    import datetime
    expiry_dt = datetime.datetime.utcfromtimestamp(expiry_s).strftime('%Y-%m-%d %H:%M UTC')

    print(f"✅ Canal registrado: {response['id']}")
    print(f"   Expira: {expiry_dt}")
    print(f"   URL webhook: {webhook_url}")
    print()
    print("Para renovar antes de que expire, ejecuta:")
    print(f"  python3 register_webhook.py --url {webhook_url} --renew")
    return response


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--url', required=True, help='URL pública del webhook (ej. https://tu-dominio.com/drive-webhook)')
    parser.add_argument('--renew', action='store_true', help='Detener canal anterior y crear uno nuevo')
    args = parser.parse_args()

    service = get_service()

    if args.renew or CHANNEL_FILE.exists():
        stop_existing_channel(service)

    register_channel(service, args.url)


if __name__ == '__main__':
    main()
