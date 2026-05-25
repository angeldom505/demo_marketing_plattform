-- Optimización de get_hubspot_analytics():
-- • SET LOCAL statement_timeout = 55s (override Supabase default ~8s)
-- • Un solo CTE MATERIALIZED scan sobre hubspot_contactos en lugar de 13 subqueries
-- • Cada agregación toca la materialización en memoria, no el disco

CREATE OR REPLACE FUNCTION get_hubspot_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
VOLATILE
AS $$
DECLARE
  result jsonb;
BEGIN
  SET LOCAL statement_timeout = '55000';

  WITH c AS MATERIALIZED (
    SELECT
      lifecyclestage,
      canal_de_captacion,
      canal_de_captacion_v2,
      subcanales_de_captacion,
      desarrollo_interes,
      desarrollo,
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
  ),

  -- Funnel
  lc AS MATERIALIZED (
    SELECT COALESCE(NULLIF(lifecyclestage,''),'sin_etapa') AS k, count(*) AS cnt
    FROM c GROUP BY k ORDER BY cnt DESC
  ),

  -- Canal
  canal AS MATERIALIZED (
    SELECT COALESCE(NULLIF(canal_de_captacion_v2,''), NULLIF(canal_de_captacion,''), 'Sin canal') AS k, count(*) AS cnt
    FROM c GROUP BY k ORDER BY cnt DESC LIMIT 20
  ),

  -- Subcanal
  subcanal AS MATERIALIZED (
    SELECT COALESCE(NULLIF(subcanales_de_captacion,''),'Sin subcanal') AS k, count(*) AS cnt
    FROM c WHERE subcanales_de_captacion IS NOT NULL AND subcanales_de_captacion != ''
    GROUP BY k ORDER BY cnt DESC LIMIT 15
  ),

  -- Desarrollo
  des AS MATERIALIZED (
    SELECT COALESCE(NULLIF(desarrollo_interes,''), NULLIF(desarrollo,''), 'Sin asignar') AS k, count(*) AS cnt
    FROM c GROUP BY k ORDER BY cnt DESC LIMIT 25
  ),

  -- Modelo
  mod AS MATERIALIZED (
    SELECT COALESCE(NULLIF(modelo_comercial,''), NULLIF(modelo,''), 'Sin modelo') AS k, count(*) AS cnt
    FROM c WHERE modelo IS NOT NULL OR modelo_comercial IS NOT NULL
    GROUP BY k ORDER BY cnt DESC LIMIT 20
  ),

  -- Generación
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

  -- UTM source
  utms AS MATERIALIZED (
    SELECT utm_source AS k, count(*) AS cnt
    FROM c WHERE utm_source IS NOT NULL AND utm_source != ''
    GROUP BY k ORDER BY cnt DESC LIMIT 15
  ),

  -- UTM campaign
  utmc AS MATERIALIZED (
    SELECT utm_campaign AS k, count(*) AS cnt
    FROM c WHERE utm_campaign IS NOT NULL AND utm_campaign != ''
    GROUP BY k ORDER BY cnt DESC LIMIT 15
  ),

  -- Source label
  src AS MATERIALIZED (
    SELECT COALESCE(NULLIF(hs_object_source_label,''),'Otro') AS k, count(*) AS cnt
    FROM c GROUP BY k ORDER BY cnt DESC LIMIT 15
  ),

  -- Capacidad bancaria
  cap_stats AS MATERIALIZED (
    SELECT
      round(avg(capacidad_maxima_bancaria))                                      AS promedio,
      percentile_cont(0.5)  WITHIN GROUP (ORDER BY capacidad_maxima_bancaria)    AS mediana,
      percentile_cont(0.25) WITHIN GROUP (ORDER BY capacidad_maxima_bancaria)    AS p25,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY capacidad_maxima_bancaria)    AS p75,
      count(capacidad_maxima_bancaria)                                            AS con_dato
    FROM c WHERE capacidad_maxima_bancaria IS NOT NULL AND capacidad_maxima_bancaria > 0
  ),

  cap_rangos AS MATERIALIZED (
    SELECT
      CASE
        WHEN capacidad_maxima_bancaria < 500000   THEN '< $500K'
        WHEN capacidad_maxima_bancaria < 1000000  THEN '$500K–$1M'
        WHEN capacidad_maxima_bancaria < 2000000  THEN '$1M–$2M'
        WHEN capacidad_maxima_bancaria < 3000000  THEN '$2M–$3M'
        WHEN capacidad_maxima_bancaria < 5000000  THEN '$3M–$5M'
        ELSE '> $5M'
      END AS rango,
      CASE
        WHEN capacidad_maxima_bancaria < 500000   THEN 1
        WHEN capacidad_maxima_bancaria < 1000000  THEN 2
        WHEN capacidad_maxima_bancaria < 2000000  THEN 3
        WHEN capacidad_maxima_bancaria < 3000000  THEN 4
        WHEN capacidad_maxima_bancaria < 5000000  THEN 5
        ELSE 6
      END AS orden,
      count(*) AS cnt
    FROM c WHERE capacidad_maxima_bancaria IS NOT NULL AND capacidad_maxima_bancaria > 0
    GROUP BY rango, orden
  ),

  -- Timeline
  timeline AS MATERIALIZED (
    SELECT to_char(date_trunc('month', createdate),'YYYY-MM') AS mes, count(*) AS cnt
    FROM c WHERE createdate >= '2021-01-01'
    GROUP BY mes ORDER BY mes
  ),

  -- Municipios
  mun AS MATERIALIZED (
    SELECT COALESCE(NULLIF(municipio,''), NULLIF(city,''), 'Sin dato') AS k, count(*) AS cnt
    FROM c WHERE municipio IS NOT NULL OR city IS NOT NULL
    GROUP BY k ORDER BY cnt DESC LIMIT 20
  )

  SELECT jsonb_build_object(
    'total_contactos', (SELECT count(*) FROM c),
    'total_negocios',  (SELECT count(*) FROM hubspot_negocios),

    'by_lifecycle', (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM lc),
    'by_canal',     (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM canal),
    'by_subcanal',  (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM subcanal),
    'by_desarrollo',(SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM des),
    'by_modelo',    (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM mod),
    'by_generacion',(SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM gen),
    'by_utm_source',(SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM utms),
    'by_utm_campaign',(SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM utmc),
    'by_source_label',(SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM src),
    'by_municipio', (SELECT jsonb_agg(jsonb_build_object('label',k,'count',cnt) ORDER BY cnt DESC) FROM mun),

    'contactos_por_mes', (
      SELECT jsonb_agg(jsonb_build_object('mes',mes,'count',cnt) ORDER BY mes) FROM timeline
    ),

    'capacidad', (
      SELECT jsonb_build_object(
        'promedio', s.promedio, 'mediana', s.mediana,
        'p25', s.p25, 'p75', s.p75, 'con_dato', s.con_dato,
        'rangos', (SELECT jsonb_agg(jsonb_build_object('label',rango,'count',cnt,'orden',orden) ORDER BY orden) FROM cap_rangos)
      )
      FROM cap_stats s
    ),

    'negocios_by_stage', (
      SELECT jsonb_agg(jsonb_build_object('label',stage,'count',cnt,'amount',amt) ORDER BY cnt DESC)
      FROM (
        SELECT COALESCE(NULLIF(dealstage,''),'Sin etapa') AS stage, count(*) AS cnt, round(sum(COALESCE(amount,0))) AS amt
        FROM hubspot_negocios GROUP BY stage ORDER BY cnt DESC LIMIT 15
      ) t
    ),

    'negocios_by_desarrollo', (
      SELECT jsonb_agg(jsonb_build_object('label',d,'count',cnt,'amount',amt) ORDER BY amt DESC)
      FROM (
        SELECT COALESCE(NULLIF(desarrollo_negocio,''),'Sin asignar') AS d, count(*) AS cnt, round(sum(COALESCE(amount,0))) AS amt
        FROM hubspot_negocios GROUP BY d ORDER BY amt DESC LIMIT 20
      ) t
    ),

    'pipeline_total',   (SELECT round(sum(COALESCE(amount,0))) FROM hubspot_negocios),
    'pipeline_cerrado', (
      SELECT round(sum(COALESCE(amount,0))) FROM hubspot_negocios
      WHERE lower(dealstage) IN ('closedwon','cerrado','ganado','cliente','closed won')
    )
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION get_hubspot_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_hubspot_analytics() TO service_role;
GRANT EXECUTE ON FUNCTION get_hubspot_analytics() TO authenticated;
