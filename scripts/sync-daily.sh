#!/bin/bash
# Sync diario HubSpot → Supabase (delta) + refresh de cache de analytics.
# Se ejecuta cada día a las 7am vía crontab.
# Logs en /tmp/hubspot-daily-YYYYMMDD.log

set -euo pipefail

export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"

PROJECT="/Users/adominguezs/Proyectos/hums"
LOG="/tmp/hubspot-daily-$(date +%Y%m%d).log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ▶ Iniciando sync delta HubSpot..." >> "$LOG"

cd "$PROJECT"

# 1. Delta sync: contactos + negocios modificados desde la última sync
if npx tsx scripts/hubspot-sync.ts --delta >> "$LOG" 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Sync delta completado." >> "$LOG"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✗ Error en sync delta. Revisa el log." >> "$LOG"
  exit 1
fi

# 2. Refresh cache de analytics con los datos actualizados
echo "[$(date '+%Y-%m-%d %H:%M:%S')] ▶ Refrescando cache de analytics..." >> "$LOG"
if supabase db query --linked "SELECT refresh_hubspot_analytics();" >> "$LOG" 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Cache de analytics actualizado." >> "$LOG"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✗ Error al refrescar cache. Sync fue exitoso pero analytics puede estar desactualizado." >> "$LOG"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✓ Proceso diario terminado. Log: $LOG"
