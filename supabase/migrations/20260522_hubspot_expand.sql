-- Expande hubspot_contactos con todos los campos de analytics
-- y crea hubspot_negocios para deals

-- ── 1. Columnas nuevas en hubspot_contactos ───────────────────────
ALTER TABLE hubspot_contactos
  ADD COLUMN IF NOT EXISTS email                      TEXT,
  ADD COLUMN IF NOT EXISTS phone                      TEXT,
  ADD COLUMN IF NOT EXISTS mobilephone                TEXT,
  ADD COLUMN IF NOT EXISTS zip                        TEXT,
  ADD COLUMN IF NOT EXISTS hs_state_code              TEXT,
  ADD COLUMN IF NOT EXISTS hs_country_region_code     TEXT,
  ADD COLUMN IF NOT EXISTS ip_country                 TEXT,
  ADD COLUMN IF NOT EXISTS ip_country_code            TEXT,
  ADD COLUMN IF NOT EXISTS ip_state_code              TEXT,
  ADD COLUMN IF NOT EXISTS hs_analytics_source_data_1 TEXT,
  ADD COLUMN IF NOT EXISTS hs_analytics_source_data_2 TEXT,
  ADD COLUMN IF NOT EXISTS hs_latest_source_data_1    TEXT,
  ADD COLUMN IF NOT EXISTS hs_latest_source_data_2    TEXT,
  ADD COLUMN IF NOT EXISTS utm_content                TEXT,
  ADD COLUMN IF NOT EXISTS utm_term                   TEXT,
  ADD COLUMN IF NOT EXISTS hs_object_source_label     TEXT,
  ADD COLUMN IF NOT EXISTS hs_object_source_detail_1  TEXT,
  ADD COLUMN IF NOT EXISTS hs_object_source_detail_2  TEXT,
  ADD COLUMN IF NOT EXISTS hs_object_source_detail_3  TEXT,
  ADD COLUMN IF NOT EXISTS first_conversion_event_name TEXT,
  ADD COLUMN IF NOT EXISTS hs_analytics_first_url     TEXT;

-- ── 2. Índices (después de agregar las columnas) ──────────────────
CREATE INDEX IF NOT EXISTS idx_hc_canal        ON hubspot_contactos (canal_de_captacion);
CREATE INDEX IF NOT EXISTS idx_hc_canal_v2     ON hubspot_contactos (canal_de_captacion_v2);
CREATE INDEX IF NOT EXISTS idx_hc_createdate   ON hubspot_contactos (createdate DESC);
CREATE INDEX IF NOT EXISTS idx_hc_country      ON hubspot_contactos (country);
CREATE INDEX IF NOT EXISTS idx_hc_city         ON hubspot_contactos (city);
CREATE INDEX IF NOT EXISTS idx_hc_municipio    ON hubspot_contactos (municipio);
CREATE INDEX IF NOT EXISTS idx_hc_modelo       ON hubspot_contactos (modelo);
CREATE INDEX IF NOT EXISTS idx_hc_utm_source   ON hubspot_contactos (utm_source);
CREATE INDEX IF NOT EXISTS idx_hc_utm_campaign ON hubspot_contactos (utm_campaign);
CREATE INDEX IF NOT EXISTS idx_hc_source_label ON hubspot_contactos (hs_object_source_label);

-- ── 3. Tabla hubspot_negocios ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS hubspot_negocios (
  id                     TEXT PRIMARY KEY,
  dealname               TEXT,
  dealstage              TEXT,
  amount                 NUMERIC,
  closedate              TIMESTAMPTZ,
  createdate             TIMESTAMPTZ,
  desarrollo_negocio     TEXT,
  familiamodelo_negocio  TEXT,
  hs_object_source_label TEXT,
  synced_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hn_dealstage   ON hubspot_negocios (dealstage);
CREATE INDEX IF NOT EXISTS idx_hn_desarrollo  ON hubspot_negocios (desarrollo_negocio);
CREATE INDEX IF NOT EXISTS idx_hn_createdate  ON hubspot_negocios (createdate DESC);

ALTER TABLE hubspot_negocios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_neg" ON hubspot_negocios;
CREATE POLICY "service_role_all_neg" ON hubspot_negocios
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_neg" ON hubspot_negocios;
CREATE POLICY "authenticated_read_neg" ON hubspot_negocios
  FOR SELECT TO authenticated USING (true);

-- ── 4. Checkpoint en hubspot_sync_log ────────────────────────────
ALTER TABLE hubspot_sync_log
  ADD COLUMN IF NOT EXISTS last_contact_id  TEXT,
  ADD COLUMN IF NOT EXISTS last_deal_id     TEXT,
  ADD COLUMN IF NOT EXISTS total_deals      INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contacts_status  TEXT DEFAULT 'idle',
  ADD COLUMN IF NOT EXISTS deals_status     TEXT DEFAULT 'idle';
