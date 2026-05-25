"""
sync_fotos.py — Sincronización de fotos reales desde Google Drive
Descarga fotos por desarrollo y modelo a desarrollos/<slug>/fotos/<modelo>/

CONFIGURACIÓN PENDIENTE:
  FOTOS_FOLDER_ID → reemplazar con el Folder ID real de Drive cuando esté listo
"""

import os
import json
import argparse
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# ─── CONFIGURAR AQUÍ ──────────────────────────────────────────────────────────
FOTOS_FOLDER_ID = "PENDIENTE_AGREGAR_FOLDER_ID"  # ← reemplazar con ID real de Drive
SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
LOCAL_BASE = Path(__file__).parent.parent / "desarrollos"  # → desarrollos/<slug>/fotos/
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".mp4", ".mov"}
# ──────────────────────────────────────────────────────────────────────────────


def get_drive_service():
    creds_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if creds_json:
        info = json.loads(creds_json)
        creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
    else:
        creds = service_account.Credentials.from_service_account_file(
            "content-os-493218-f8263f3f2789.json", scopes=SCOPES
        )
    return build("drive", "v3", credentials=creds)


def list_subfolders(service, parent_id):
    """Devuelve {nombre: id} de subcarpetas directas."""
    result = service.files().list(
        q=f"'{parent_id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields="files(id, name)",
    ).execute()
    return {f["name"]: f["id"] for f in result.get("files", [])}


def list_files(service, folder_id):
    """Devuelve lista de archivos en una carpeta."""
    result = service.files().list(
        q=f"'{folder_id}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false",
        fields="files(id, name, size, modifiedTime)",
        pageSize=200,
    ).execute()
    return result.get("files", [])


def download_file(service, file_id, dest_path):
    request = service.files().get_media(fileId=file_id)
    with open(dest_path, "wb") as f:
        downloader = MediaIoBaseDownload(f, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()


def sync_desarrollo(service, desarrollo_name, desarrollo_folder_id, force=False):
    """Sincroniza todas las fotos de un desarrollo (organizado por modelo/subcarpeta)."""
    local_desarrollo = LOCAL_BASE / desarrollo_name
    modelos = list_subfolders(service, desarrollo_folder_id)

    if not modelos:
        # Si no hay subcarpetas, descargar todo plano
        modelos = {"_general": desarrollo_folder_id}

    for modelo_name, modelo_id in modelos.items():
        local_modelo = local_desarrollo / modelo_name
        local_modelo.mkdir(parents=True, exist_ok=True)

        archivos = list_files(service, modelo_id)
        for archivo in archivos:
            ext = Path(archivo["name"]).suffix.lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            dest = local_modelo / archivo["name"]
            if dest.exists() and not force:
                print(f"  ✓ {desarrollo_name}/{modelo_name}/{archivo['name']} (ya existe)")
                continue

            print(f"  ↓ Descargando {desarrollo_name}/{modelo_name}/{archivo['name']}...")
            download_file(service, archivo["id"], dest)
            print(f"  ✅ {archivo['name']}")


def main():
    if FOTOS_FOLDER_ID == "PENDIENTE_AGREGAR_FOLDER_ID":
        print("⚠️  FOTOS_FOLDER_ID no configurado. Edita sync_fotos.py y agrega el Folder ID de Drive.")
        return

    parser = argparse.ArgumentParser(description="Sync fotos desde Google Drive")
    parser.add_argument("--force", action="store_true", help="Re-descargar aunque ya existan")
    parser.add_argument("--desarrollo", help="Sincronizar solo un desarrollo (nombre de carpeta en Drive)")
    args = parser.parse_args()

    print("🔗 Conectando a Google Drive...")
    service = get_drive_service()

    desarrollos = list_subfolders(service, FOTOS_FOLDER_ID)

    if not desarrollos:
        print("⚠️  No se encontraron carpetas de desarrollos en el folder configurado.")
        return

    print(f"📁 Desarrollos encontrados: {list(desarrollos.keys())}")

    for nombre, folder_id in desarrollos.items():
        if args.desarrollo and args.desarrollo.lower() not in nombre.lower():
            continue
        print(f"\n📂 Sincronizando: {nombre}")
        sync_desarrollo(service, nombre.lower().replace(" ", "-"), folder_id, force=args.force)

    print("\n✅ Sync de fotos completado.")


if __name__ == "__main__":
    main()
