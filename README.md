# Nexus Suite — Nexus Suite Marketing System

Plataforma de marketing inmobiliario con IA. Produce contenido diferenciado para 18 desarrollos en 7 regiones de México — copy, imagen, video, email, ads y parrillas completas con publicación automática a redes sociales.

---

## Estado actual

| Componente | Estado |
|-----------|--------|
| Fichas técnicas (15 desarrollos) | ✅ Disponibles |
| Storytelling de marca | ⚠️ Solo Zenith Residences — 14 pendientes |
| Agentes de IA (Claude Code) | ✅ 6 agentes operativos |
| Fotos reales por desarrollo | ❌ Pendiente integración |
| Audiencias HubSpot | ❌ Pendiente |
| App web (Next.js + Vercel) | 🔜 Fase 1 en construcción |

---

## Estructura del proyecto

```
nexus-suite/
├── CLAUDE.md                    ← Guía completa del proyecto (leer primero)
├── data/
│   └── desarrollos/             ← Fichas técnicas auto-generadas desde Drive
├── storytellings/               ← Identidad de marca por desarrollo
├── campanas/                    ← Ejemplos de contenido generado (temporal)
├── .claude/
│   └── agents/                  ← Agentes especializados de marketing
└── .env.example                 ← Variables de entorno esperadas
```

---

## Desarrollos activos

| Región | Desarrollos | Storytelling |
|--------|-------------|-------------|
| Estado de México | Arboledas, Los Solares, Arrayán, Urbania, Parque Central | ❌ |
| Hidalgo | Cedro Norte, Granito, Eco Reserva | ❌ |
| Yucatán | Altamira | ❌ |
| Morelos | Vista Sol, Brisa | ❌ |
| Puebla | Los Claros | ❌ |
| Querétaro | Cumbres | ❌ |
| Quintana Roo | Zenith Residences ✅, Coral Bay | ❌ |

---

## Agentes disponibles (Claude Code)

Usar con `/agents` en Claude Code o invocando directamente:

| Agente | Función |
|--------|---------|
| `coordinador-marketing` | Planifica campañas completas |
| `investigador-mercado` | Análisis de competencia, SEO, tendencias |
| `redactor-contenido` | Copy para blogs, posts, landing pages |
| `especialista-formatos-sociales` | Specs y optimización por plataforma |
| `creador-anuncios` | Copy de ads + briefs creativos |
| `email-marketer` | Campañas de email y nurturing |

---

Ver `CLAUDE.md` para documentación técnica completa.
