#!/bin/bash
# Carga inicial HubSpot — reanuda desde checkpoint de Supabase.
# Se auto-elimina del crontab al terminar.

LOG="/tmp/hubspot-sync-$(date +%Y%m%d-%H%M).log"

echo "[$(date)] Iniciando sync nocturno..." >> "$LOG"

cd /Users/adominguezs/Proyectos/hums

/usr/local/bin/npx tsx scripts/hubspot-sync.ts >> "$LOG" 2>&1

echo "[$(date)] Sync terminado. Ver log: $LOG"

# Auto-eliminar del crontab
crontab -l 2>/dev/null | grep -v "sync-madrugada.sh" | crontab -
