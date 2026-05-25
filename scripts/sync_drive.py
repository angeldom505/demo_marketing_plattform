#!/usr/bin/env python3
"""
Sincroniza los archivos de conocimiento de Hogares Unión desde Google Drive.
Genera desarrollos/<slug>/ficha.md por cada desarrollo.
"""

import io
import json
import os
import re
import warnings
from pathlib import Path

warnings.filterwarnings('ignore')

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from docx import Document

# ── Configuración ─────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent.parent   # raíz del proyecto (scripts/../)
CREDENTIALS_FILE = BASE_DIR / 'content-os-493218-f8263f3f2789.json'
FOLDER_ID = '1N_GDJoVyKbakPL_iWVcRoi9PVlAL7T43'
DESARROLLOS_DIR = BASE_DIR / 'desarrollos'
STATE_FILE = BASE_DIR / 'scripts' / '.sync_state.json'

# Archivos a ignorar (no son por región)
SKIP_FILES = {'kb_compra_facil_v5.docx'}

# ── Google Drive ──────────────────────────────────────────────────────────────

def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(
        str(CREDENTIALS_FILE),
        scopes=['https://www.googleapis.com/auth/drive.readonly']
    )
    return build('drive', 'v3', credentials=creds)


def list_region_files(service):
    results = service.files().list(
        q=f"'{FOLDER_ID}' in parents and trashed=false",
        fields="files(id, name, mimeType, modifiedTime)",
        orderBy="name"
    ).execute()
    return [f for f in results.get('files', []) if f['name'] not in SKIP_FILES]


def download_docx(service, file_id) -> Document:
    request = service.files().get_media(fileId=file_id)
    buffer = io.BytesIO()
    downloader = MediaIoBaseDownload(buffer, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    buffer.seek(0)
    return Document(buffer)


# ── Parser ────────────────────────────────────────────────────────────────────

def slug(text: str) -> str:
    """Convierte un nombre a slug para nombre de archivo."""
    text = text.lower().strip()
    text = re.sub(r'[áàä]', 'a', text)
    text = re.sub(r'[éèë]', 'e', text)
    text = re.sub(r'[íìï]', 'i', text)
    text = re.sub(r'[óòö]', 'o', text)
    text = re.sub(r'[úùü]', 'u', text)
    text = re.sub(r'ñ', 'n', text)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


def region_from_filename(filename: str) -> str:
    """Extrae el nombre de región del nombre del archivo."""
    name = filename.replace('kb_', '').replace('_2026_v6.docx', '').replace('_v5.docx', '').replace('_v6.docx', '')
    return name.replace('_', ' ').title()


def _looks_like_desarrollo_name(text: str) -> bool:
    """Detecta si un texto en normal style parece nombre de desarrollo (todo mayúsculas)."""
    clean = re.sub(r'[^A-ZÁÉÍÓÚÑÜA-Z\s]', '', text.upper())
    if len(clean) < 4:
        return False
    upper_ratio = sum(1 for c in text if c.isupper()) / max(len([c for c in text if c.isalpha()]), 1)
    return upper_ratio > 0.7 and len(text) > 5


def parse_docx_to_desarrollos(doc: Document, region: str) -> list[dict]:
    """
    Parsea un documento DOCX regional y devuelve una lista de desarrollos.
    Soporta documentos con Heading 1 (formato estándar) y con normal en mayúsculas (ej. Mérida).
    """
    desarrollos = []
    current = None
    current_lines = []
    pending_name_lines = []   # acumula normal lines antes de encontrar el primer H2

    def save_current():
        if current:
            desarrollos.append({
                'nombre': current['nombre'],
                'region': region,
                'content': '\n'.join(current_lines).strip()
            })

    def flush_pending_as_new(name: str):
        nonlocal current, current_lines, pending_name_lines
        save_current()
        current = {'nombre': name}
        current_lines = [f"# {name}\n", f"**Región:** {region}\n"]
        pending_name_lines = []

    in_header = True   # antes del primer H2

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        style = para.style.name

        # ── Formato con Heading 1 (mayoría de regiones) ──────────────────────
        if style == 'Heading 1':
            in_header = True
            if text.lower().startswith('precio'):
                if current:
                    current_lines.append(f"\n**{text}**\n")
            else:
                flush_pending_as_new(text.rstrip())

        elif style == 'Heading 2':
            in_header = False
            # Si llegamos a un H2 sin haber encontrado un H1, revisar pending_name_lines
            if current is None and pending_name_lines:
                # Buscar la primera línea que parezca nombre de desarrollo:
                # preferir líneas en MAYÚSCULAS que no sean headers de región ni URLs
                skip_prefixes = ('contenido', 'desarrollo residencial en', 'link', 'http',
                                 'ubicación', 'precio', 'tel', 'correo', 'email')
                name_candidate = None
                for ln in pending_name_lines:
                    lower = ln.lower()
                    if any(lower.startswith(p) for p in skip_prefixes):
                        continue
                    if _looks_like_desarrollo_name(ln):
                        name_candidate = ln
                        break
                # Fallback: primera línea no vacía que no sea un skip
                if not name_candidate:
                    for ln in pending_name_lines:
                        lower = ln.lower()
                        if not any(lower.startswith(p) for p in skip_prefixes) and len(ln) > 4:
                            name_candidate = ln
                            break
                flush_pending_as_new(name_candidate or pending_name_lines[0])
            if current is not None:
                current_lines.append(f"\n## {text}\n")

        elif style == 'Heading 3':
            in_header = False
            if current is not None:
                current_lines.append(f"\n### {text}\n")

        elif style in ('normal', 'Normal', 'List Paragraph'):
            # Puede ser multi-línea dentro de un mismo párrafo
            for line in text.split('\n'):
                line = line.strip()
                if not line:
                    continue
                if current is None:
                    # Detectar nombre de desarrollo en formato normal (ej. Mérida)
                    if _looks_like_desarrollo_name(line) and not line.lower().startswith('contenido'):
                        pending_name_lines.append(line)
                    else:
                        pending_name_lines.append(line)
                else:
                    current_lines.append(line)

    save_current()
    return desarrollos


def write_desarrollo_md(desarrollo: dict) -> Path:
    """Escribe desarrollos/<slug>/ficha.md y retorna la ruta."""
    nombre_slug = slug(desarrollo['nombre'])
    folder = DESARROLLOS_DIR / nombre_slug
    folder.mkdir(parents=True, exist_ok=True)
    filepath = folder / 'ficha.md'

    content = f"""---
nombre: {desarrollo['nombre']}
region: {desarrollo['region']}
slug: {nombre_slug}
---

{desarrollo['content']}
"""
    filepath.write_text(content, encoding='utf-8')
    return filepath


# ── Sync state ────────────────────────────────────────────────────────────────

def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {}


def save_state(state: dict):
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


# ── Main ──────────────────────────────────────────────────────────────────────

def sync(force: bool = False):
    DESARROLLOS_DIR.mkdir(parents=True, exist_ok=True)

    print("Conectando a Google Drive...")
    service = get_drive_service()
    files = list_region_files(service)
    state = load_state()

    total_created = 0
    total_updated = 0
    total_skipped = 0

    for file_info in files:
        file_id = file_info['id']
        filename = file_info['name']
        modified = file_info['modifiedTime']
        region = region_from_filename(filename)

        prev_modified = state.get(file_id, {}).get('modifiedTime')

        if not force and prev_modified == modified:
            print(f"  ⏭  {filename} sin cambios")
            total_skipped += 1
            continue

        print(f"  ↓  Descargando {filename} ({region})...")
        doc = download_docx(service, file_id)
        desarrollos = parse_docx_to_desarrollos(doc, region)

        prev_files = state.get(file_id, {}).get('files', [])
        new_files = []

        for d in desarrollos:
            path = write_desarrollo_md(d)
            new_files.append(path.name)
            is_new = path.name not in prev_files
            status = "✅ creado" if is_new else "🔄 actualizado"
            print(f"      {status}: {path.name}")
            if is_new:
                total_created += 1
            else:
                total_updated += 1

        state[file_id] = {'modifiedTime': modified, 'files': new_files, 'region': region}

    save_state(state)

    print(f"\nSync completo: {total_created} creados, {total_updated} actualizados, {total_skipped} sin cambios.")
    return total_created + total_updated


if __name__ == '__main__':
    import sys
    force = '--force' in sys.argv
    sync(force=force)
