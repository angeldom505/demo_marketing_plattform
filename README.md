# HUMS — Hogares Unión Marketing System

Plataforma de marketing inmobiliario con IA. Produce contenido diferenciado para 18 desarrollos en 7 regiones de México — copy, imagen, video, email, ads y parrillas completas con publicación automática a redes sociales.

---

## Estado actual

| Componente | Estado |
|-----------|--------|
| Fichas técnicas (14 desarrollos) | ✅ Funcionando — sync automático desde Drive |
| Storytelling de marca | ⚠️ Solo AUKENA — 13 pendientes |
| Agentes de IA (Claude Code) | ✅ 6 agentes operativos |
| Fotos reales por desarrollo | ❌ Pendiente integración |
| Audiencias HubSpot | ❌ Pendiente |
| App web (Next.js + Vercel) | 🔜 Fase 1 en construcción |

---

## Estructura del proyecto

```
hums/
├── CLAUDE.md                    ← Guía completa del proyecto (leer primero)
├── data/
│   └── desarrollos/             ← Fichas técnicas auto-generadas desde Drive
├── storytellings/               ← Identidad de marca por desarrollo
├── campanas/                    ← Ejemplos de contenido generado (temporal)
├── .claude/
│   └── agents/                  ← Agentes especializados de marketing
├── sync_drive.py                ← Sincronización con Google Drive
├── register_webhook.py          ← Registro de webhook en Drive
└── webhook_server.py            ← Servidor local temporal (se reemplaza con Vercel)
```

---

## Sincronizar datos desde Drive

```bash
# Solo descarga lo que cambió
python3 sync_drive.py

# Forzar re-sync completo
python3 sync_drive.py --force
```

---

## Desarrollos activos

| Región | Desarrollos | Storytelling |
|--------|-------------|-------------|
| Estado de México | Privadas del Bosque, Solares Zumpango, Sauz Valle de Toluca, Cosmopol Coacalco, Central Park Bosque Real | ❌ |
| Hidalgo | Abeto Tizayuca, Basalto Pachuca, Ciudad Natura II | ❌ |
| Mérida | Meriden Cabo Norte | ❌ |
| Morelos | Santa Fe Xochitepec, Aquasol Ayala | ❌ |
| Puebla | Trojes Residencial | ❌ |
| Querétaro | Bonza Querétaro | ❌ |
| Quintana Roo | AUKENA Residences ✅, Nuevo Residencial Turquesa | ❌ |

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
