-- Tabla para contactos sincronizados desde HubSpot
-- Ejecutar en Supabase SQL Editor: dashboard.supabase.com → SQL Editor → New query

CREATE TABLE IF NOT EXISTS hubspot_contactos (
  id                        TEXT PRIMARY KEY,
  firstname                 TEXT,
  lastname                  TEXT,
  apellido_materno          TEXT,
  gender                    TEXT,
  fecha_de_nacimiento       DATE,
  marital_status            TEXT,
  city                      TEXT,
  municipio                 TEXT,
  colonia                   TEXT,
  country                   TEXT,
  canal_de_captacion        TEXT,
  canal_de_captacion_v2     TEXT,
  subcanales_de_captacion   TEXT,
  capacidad_compra          NUMERIC,
  capacidad_maxima_bancaria NUMERIC,
  desarrollo                TEXT,
  desarrollo_interes        TEXT,
  modelo                    TEXT,
  modelo_comercial          TEXT,
  lifecyclestage            TEXT,
  createdate                TIMESTAMPTZ,
  hs_analytics_source       TEXT,
  utm_source                TEXT,
  utm_medium                TEXT,
  utm_campaign              TEXT,
  synced_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_hc_desarrollo ON hubspot_contactos (desarrollo_interes);
CREATE INDEX IF NOT EXISTS idx_hc_lifecyclestage ON hubspot_contactos (lifecyclestage);
CREATE INDEX IF NOT EXISTS idx_hc_synced ON hubspot_contactos (synced_at DESC);

-- RLS: autenticados pueden leer, solo service_role puede escribir
ALTER TABLE hubspot_contactos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON hubspot_contactos;
CREATE POLICY "service_role_all" ON hubspot_contactos
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read" ON hubspot_contactos;
CREATE POLICY "authenticated_read" ON hubspot_contactos
  FOR SELECT TO authenticated USING (true);
