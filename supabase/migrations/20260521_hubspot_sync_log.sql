-- Tabla de control para el sync incremental de HubSpot
-- Fila única (id = 1) que guarda el estado del último sync

CREATE TABLE IF NOT EXISTS hubspot_sync_log (
  id               INT PRIMARY KEY DEFAULT 1,
  last_sync_at     TIMESTAMPTZ,
  total_contacts   INT DEFAULT 0,
  status           TEXT DEFAULT 'idle', -- 'idle' | 'syncing' | 'done' | 'error'
  error_message    TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO hubspot_sync_log (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Agregar lastmodifieddate a contactos si no existe (necesaria para sync incremental)
ALTER TABLE hubspot_contactos ADD COLUMN IF NOT EXISTS lastmodifieddate TIMESTAMPTZ;

-- RLS: solo service_role escribe, autenticados leen
ALTER TABLE hubspot_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_log" ON hubspot_sync_log;
CREATE POLICY "service_role_all_log" ON hubspot_sync_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_log" ON hubspot_sync_log;
CREATE POLICY "authenticated_read_log" ON hubspot_sync_log
  FOR SELECT TO authenticated USING (true);
