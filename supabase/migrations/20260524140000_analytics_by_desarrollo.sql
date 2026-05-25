-- Analytics filtrado por desarrollo: query directa (no cache) sobre un subconjunto.
-- Responde en < 2s porque filtra a ~20-50K filas en lugar de 662K.

CREATE OR REPLACE FUNCTION get_hubspot_analytics_desarrollo(p_desarrollo TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH c AS MATERIALIZED (
    SELECT
      lifecyclestage,
      canal_de_captacion,
      canal_de_captacion_v2,
      subcanales_de_captacion,
      modelo_comercial,
      modelo,
      fecha_de_nacimiento,
      utm_source,
      utm_campaign,
      hs_object_source_label,
      capacidad_maxima_bancaria,
      createdate,
      municipio,
      city
    FROM hubspot_contactos
    WHERE COALESCE(NULLIF(desarrollo_interes,''), NULLIF(desarrollo,''), 'Sin asignar') = p_desarrollo
  ),
  lc AS MATERIALIZED (
    SELECT COALESCE(NULLIF(lifecyclestage,''),'sin_etapa') AS k, count(*) AS cnt
    FROM c GROUP BY k ORDER BY cnt DESC
  ),
  canal AS MATERIALIZED (
    SELECT COALESCE(NULLIF(canal_de_captacion_v2,''), NULLIF(canal_de_captacion,''), 'Sin canal') AS k, count(*) AS cnt
    FROM c GROUP BY k ORDER BY cnt DESC LIMIT 20
  ),
  mod AS MATERIALIZED (
    SELECT COALESCE(NULLIF(modelo_comercial,''), NULLIF(modelo,''), 'Sin modelo') AS k, count(*) AS cnt
    FROM c WHERE modelo IS NOT NULL OR modelo_comercial IS NOT NULL
    GROUP BY k ORDER BY cnt DESC LIMIT 20
  ),
  gen AS MATERIALIZED (
    SELECT
      CASE
        WHEN EXTRACT(YEAR FROM fecha_de_nacimiento) >= 1997 THEN 'Gen Z'
        WHEN EXTRACT(YEAR FROM fecha_de_nacimiento) >= 1981 THEN 'Millennial'
        WHEN EXTRACT(YEAR FROM fecha_de_nacimiento) >= 1965 THEN 'Gen X'
        WHEN EXTRACT(YEAR FROM fecha_de_nacimiento) >= 1946 THEN 'Boomer'
        ELSE 'Sin dato'
      END AS k,
      count(*) AS cnt
    FROM c GROUP BY k ORDER BY cnt DESC
  ),
  utms AS MATERIALIZED (
    SELECT utm_source AS k, count(*) AS cnt
    FROM c WHERE utm_source IS NOT NULL AND utm_source != ''
    GROUP BY k ORDER BY cnt DESC LIMIT 15
  ),
  utmc AS MATERIALIZED (
    SELECT utm_campaign AS k, count(*) AS cnt
    FROM c WHERE utm_campaign IS NOT NULL AND utm_campaign != ''
    GROUP BY k ORDER BY cnt DESC LIMIT 15
  ),
  timeline AS MATERIALIZED (
    SELECT to_char(date_trunc('month', createdate),'YYYY-MM') AS mes, count(*) AS cnt
    FROM c WHERE createdate >= '2021-01-01'
    GROUP BY mes ORDER BY mes
  ),
  mun AS MATERIALIZED (
    SELECT COALESCE(NULLIF(municipio,''), NULLIF(city,''), 'Sin dato') AS k, count(*) AS cnt
    FROM c WHERE municipio IS NOT NULL OR city IS NOT NULL
    GROUP BY k ORDER BY cnt DESC LIMIT 20
  )

  SELECT jsonb_build_object(
    'total_contactos', (SELECT count(*) FROM c),
    'total_negocios',  0,
    'by_lifecycle',   (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM lc),
    'by_canal',       (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM canal),
    'by_subcanal',    '[]'::jsonb,
    'by_desarrollo',  '[]'::jsonb,
    'by_modelo',      (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM mod),
    'by_generacion',  (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM gen),
    'by_utm_source',  (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM utms),
    'by_utm_campaign',(SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM utmc),
    'by_source_label','[]'::jsonb,
    'by_municipio',   (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM mun),
    'contactos_por_mes', (SELECT jsonb_agg(jsonb_build_object('mes',mes,'count',cnt) ORDER BY mes) FROM timeline),
    'capacidad', jsonb_build_object('promedio',null,'mediana',null,'p25',null,'p75',null,'con_dato',0,'rangos','[]'::jsonb),
    'negocios_by_stage', '[]'::jsonb,
    'negocios_by_desarrollo', '[]'::jsonb,
    'pipeline_total', 0,
    'pipeline_cerrado', 0
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION get_hubspot_analytics_desarrollo(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_hubspot_analytics_desarrollo(TEXT) TO service_role, authenticated;
