-- Función de tendencia temporal por frecuencia.
-- Soporta daily, weekly, monthly, quarterly, yearly.
-- Usa createdate de hubspot_contactos con timezone America/Mexico_City.

CREATE OR REPLACE FUNCTION get_hubspot_trend(
  p_freq TEXT,          -- 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  p_from TIMESTAMPTZ,
  p_to   TIMESTAMPTZ
) RETURNS TABLE(fecha TEXT, count BIGINT)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE p_freq
      WHEN 'daily'     THEN to_char(date_trunc('day',     createdate AT TIME ZONE 'America/Mexico_City'), 'YYYY-MM-DD')
      WHEN 'weekly'    THEN to_char(date_trunc('week',    createdate AT TIME ZONE 'America/Mexico_City'), 'YYYY-MM-DD')
      WHEN 'monthly'   THEN to_char(date_trunc('month',   createdate AT TIME ZONE 'America/Mexico_City'), 'YYYY-MM')
      WHEN 'quarterly' THEN to_char(date_trunc('year',    createdate AT TIME ZONE 'America/Mexico_City'), 'YYYY') || '-T' ||
                            EXTRACT(QUARTER FROM createdate AT TIME ZONE 'America/Mexico_City')::INT::TEXT
      WHEN 'yearly'    THEN to_char(date_trunc('year',    createdate AT TIME ZONE 'America/Mexico_City'), 'YYYY')
      ELSE                  to_char(date_trunc('month',   createdate AT TIME ZONE 'America/Mexico_City'), 'YYYY-MM')
    END AS fecha,
    COUNT(*)::BIGINT
  FROM hubspot_contactos
  WHERE
    createdate IS NOT NULL
    AND createdate >= p_from
    AND createdate <= p_to
  GROUP BY 1
  ORDER BY 1;
END;
$$;
