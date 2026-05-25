# Área: Analytics
**Propósito:** Centralizar todos los datos estadísticos de las plataformas conectadas para informar decisiones de marketing por desarrollo.

## Fuentes de datos (prioridad de integración)
| Fuente | Objeto | Datos clave | Estado |
|--------|--------|-------------|--------|
| HubSpot | Contactos + Deals | Leads, lifecycle stage, modelo de interés, conversiones | 🔜 Fase 1 |
| Meta (Facebook/Instagram) | Ads + Organic | Alcance, engagement, CTR, ROAS, CPL, CPA | 🔜 Fase 2 |
| TikTok for Business | Ads + Organic | Views, followers, engagement rate, CPM | 🔜 Fase 2 |
| Google Analytics | Web | Sesiones, fuente de tráfico, conversiones web | 🔜 Fase 3 |

## Métricas prioritarias por desarrollo
- **Atracción:** Leads generados por canal, CPL por campaña
- **Conversión:** Leads → Opportunity → Customer, tiempo por etapa
- **Revenue:** Deals cerrados, ticket promedio, modelos más vendidos
- **Contenido:** Posts con mayor engagement, formatos que convierten

## Flujo de datos
```
HubSpot API → sync → Supabase → Dashboard Analytics
Meta Graph API → sync → Supabase → Dashboard Analytics
TikTok Business API → sync → Supabase → Dashboard Analytics
```

## Archivos de este directorio
- `hubspot/` — Queries, schemas y reportes de HubSpot
- `meta/` — Configuración y reportes de Meta
- `tiktok/` — Configuración y reportes de TikTok
- `reportes/` — Reportes consolidados por desarrollo y período
