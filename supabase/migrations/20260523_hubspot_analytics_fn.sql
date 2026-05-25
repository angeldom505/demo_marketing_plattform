-- Función de analytics consolidada: contactos + negocios en una sola llamada.
-- Usa agregaciones en base de datos (no en JS) → eficiente para 1.5M registros.
-- Llamar desde la app: supabase.rpc('get_hubspot_analytics')

CREATE OR REPLACE FUNCTION get_hubspot_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(

    -- ── Totales ──────────────────────────────────────────────────
    'total_contactos', (SELECT count(*) FROM hubspot_contactos),
    'total_negocios',  (SELECT count(*) FROM hubspot_negocios),

    -- ── Funnel: ciclo de vida ─────────────────────────────────────
    'by_lifecycle', (
      SELECT jsonb_agg(jsonb_build_object('label', lifecyclestage, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(lifecyclestage, ''), 'sin_etapa') AS lifecyclestage,
          count(*) AS cnt
        FROM hubspot_contactos
        GROUP BY lifecyclestage
        ORDER BY cnt DESC
      ) t
    ),

    -- ── Canal de captación ────────────────────────────────────────
    'by_canal', (
      SELECT jsonb_agg(jsonb_build_object('label', canal, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(canal_de_captacion_v2,''), NULLIF(canal_de_captacion,''), 'Sin canal') AS canal,
          count(*) AS cnt
        FROM hubspot_contactos
        GROUP BY canal
        ORDER BY cnt DESC
        LIMIT 20
      ) t
    ),

    -- ── Subcanalales ──────────────────────────────────────────────
    'by_subcanal', (
      SELECT jsonb_agg(jsonb_build_object('label', sub, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(subcanales_de_captacion,''), 'Sin subcanal') AS sub,
          count(*) AS cnt
        FROM hubspot_contactos
        WHERE subcanales_de_captacion IS NOT NULL AND subcanales_de_captacion != ''
        GROUP BY sub
        ORDER BY cnt DESC
        LIMIT 15
      ) t
    ),

    -- ── Desarrollo de interés ─────────────────────────────────────
    'by_desarrollo', (
      SELECT jsonb_agg(jsonb_build_object('label', d, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(desarrollo_interes,''), NULLIF(desarrollo,''), 'Sin asignar') AS d,
          count(*) AS cnt
        FROM hubspot_contactos
        GROUP BY d
        ORDER BY cnt DESC
        LIMIT 25
      ) t
    ),

    -- ── Modelo de interés ─────────────────────────────────────────
    'by_modelo', (
      SELECT jsonb_agg(jsonb_build_object('label', m, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(modelo_comercial,''), NULLIF(modelo,''), 'Sin modelo') AS m,
          count(*) AS cnt
        FROM hubspot_contactos
        WHERE modelo IS NOT NULL OR modelo_comercial IS NOT NULL
        GROUP BY m
        ORDER BY cnt DESC
        LIMIT 20
      ) t
    ),

    -- ── Generación (de fecha_de_nacimiento) ───────────────────────
    'by_generacion', (
      SELECT jsonb_agg(jsonb_build_object('label', gen, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT
          CASE
            WHEN EXTRACT(YEAR FROM fecha_de_nacimiento) >= 1997 THEN 'Gen Z'
            WHEN EXTRACT(YEAR FROM fecha_de_nacimiento) >= 1981 THEN 'Millennial'
            WHEN EXTRACT(YEAR FROM fecha_de_nacimiento) >= 1965 THEN 'Gen X'
            WHEN EXTRACT(YEAR FROM fecha_de_nacimiento) >= 1946 THEN 'Boomer'
            ELSE 'Sin dato'
          END AS gen,
          count(*) AS cnt
        FROM hubspot_contactos
        GROUP BY gen
        ORDER BY cnt DESC
      ) t
    ),

    -- ── UTM Source ────────────────────────────────────────────────
    'by_utm_source', (
      SELECT jsonb_agg(jsonb_build_object('label', src, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT NULLIF(utm_source,'') AS src, count(*) AS cnt
        FROM hubspot_contactos
        WHERE utm_source IS NOT NULL AND utm_source != ''
        GROUP BY src
        ORDER BY cnt DESC
        LIMIT 15
      ) t
    ),

    -- ── UTM Campaign ──────────────────────────────────────────────
    'by_utm_campaign', (
      SELECT jsonb_agg(jsonb_build_object('label', c, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT NULLIF(utm_campaign,'') AS c, count(*) AS cnt
        FROM hubspot_contactos
        WHERE utm_campaign IS NOT NULL AND utm_campaign != ''
        GROUP BY c
        ORDER BY cnt DESC
        LIMIT 15
      ) t
    ),

    -- ── Fuente de origen (hs_object_source_label) ─────────────────
    'by_source_label', (
      SELECT jsonb_agg(jsonb_build_object('label', src, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(hs_object_source_label,''), 'Otro') AS src,
          count(*) AS cnt
        FROM hubspot_contactos
        GROUP BY src
        ORDER BY cnt DESC
        LIMIT 15
      ) t
    ),

    -- ── Capacidad bancaria ────────────────────────────────────────
    'capacidad', (
      SELECT jsonb_build_object(
        'promedio',   round(avg(capacidad_maxima_bancaria)),
        'mediana',    percentile_cont(0.5) WITHIN GROUP (ORDER BY capacidad_maxima_bancaria),
        'p25',        percentile_cont(0.25) WITHIN GROUP (ORDER BY capacidad_maxima_bancaria),
        'p75',        percentile_cont(0.75) WITHIN GROUP (ORDER BY capacidad_maxima_bancaria),
        'con_dato',   count(capacidad_maxima_bancaria),
        'rangos', (
          SELECT jsonb_agg(jsonb_build_object('label', rango, 'count', cnt, 'orden', orden) ORDER BY orden)
          FROM (
            SELECT
              CASE
                WHEN capacidad_maxima_bancaria < 500000    THEN '< $500K'
                WHEN capacidad_maxima_bancaria < 1000000   THEN '$500K–$1M'
                WHEN capacidad_maxima_bancaria < 2000000   THEN '$1M–$2M'
                WHEN capacidad_maxima_bancaria < 3000000   THEN '$2M–$3M'
                WHEN capacidad_maxima_bancaria < 5000000   THEN '$3M–$5M'
                ELSE '> $5M'
              END AS rango,
              CASE
                WHEN capacidad_maxima_bancaria < 500000    THEN 1
                WHEN capacidad_maxima_bancaria < 1000000   THEN 2
                WHEN capacidad_maxima_bancaria < 2000000   THEN 3
                WHEN capacidad_maxima_bancaria < 3000000   THEN 4
                WHEN capacidad_maxima_bancaria < 5000000   THEN 5
                ELSE 6
              END AS orden,
              count(*) AS cnt
            FROM hubspot_contactos
            WHERE capacidad_maxima_bancaria IS NOT NULL AND capacidad_maxima_bancaria > 0
            GROUP BY rango, orden
          ) r
        )
      )
      FROM hubspot_contactos
      WHERE capacidad_maxima_bancaria IS NOT NULL AND capacidad_maxima_bancaria > 0
    ),

    -- ── Contactos por mes (2021–hoy) ──────────────────────────────
    'contactos_por_mes', (
      SELECT jsonb_agg(jsonb_build_object('mes', mes, 'count', cnt) ORDER BY mes)
      FROM (
        SELECT
          to_char(date_trunc('month', createdate), 'YYYY-MM') AS mes,
          count(*) AS cnt
        FROM hubspot_contactos
        WHERE createdate >= '2021-01-01'
        GROUP BY mes
        ORDER BY mes
      ) t
    ),

    -- ── Top municipios ────────────────────────────────────────────
    'by_municipio', (
      SELECT jsonb_agg(jsonb_build_object('label', m, 'count', cnt) ORDER BY cnt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(municipio,''), NULLIF(city,''), 'Sin dato') AS m,
          count(*) AS cnt
        FROM hubspot_contactos
        WHERE municipio IS NOT NULL OR city IS NOT NULL
        GROUP BY m
        ORDER BY cnt DESC
        LIMIT 20
      ) t
    ),

    -- ── Negocios: por etapa ───────────────────────────────────────
    'negocios_by_stage', (
      SELECT jsonb_agg(jsonb_build_object('label', stage, 'count', cnt, 'amount', amt) ORDER BY cnt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(dealstage,''), 'Sin etapa') AS stage,
          count(*) AS cnt,
          round(sum(COALESCE(amount, 0))) AS amt
        FROM hubspot_negocios
        GROUP BY stage
        ORDER BY cnt DESC
        LIMIT 15
      ) t
    ),

    -- ── Negocios: por desarrollo ──────────────────────────────────
    'negocios_by_desarrollo', (
      SELECT jsonb_agg(jsonb_build_object('label', d, 'count', cnt, 'amount', amt) ORDER BY amt DESC)
      FROM (
        SELECT
          COALESCE(NULLIF(desarrollo_negocio,''), 'Sin asignar') AS d,
          count(*) AS cnt,
          round(sum(COALESCE(amount, 0))) AS amt
        FROM hubspot_negocios
        GROUP BY d
        ORDER BY amt DESC
        LIMIT 20
      ) t
    ),

    -- ── Pipeline total ────────────────────────────────────────────
    'pipeline_total', (SELECT round(sum(COALESCE(amount, 0))) FROM hubspot_negocios),
    'pipeline_cerrado', (
      SELECT round(sum(COALESCE(amount, 0)))
      FROM hubspot_negocios
      WHERE lower(dealstage) IN ('closedwon', 'cerrado', 'ganado', 'cliente', 'closed won')
    )

  ) INTO result;

  RETURN result;
END;
$$;

-- Permiso: solo service_role y authenticated pueden llamar la función
REVOKE ALL ON FUNCTION get_hubspot_analytics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_hubspot_analytics() TO service_role;
GRANT EXECUTE ON FUNCTION get_hubspot_analytics() TO authenticated;
