# Nexus Suite — Nexus Suite Marketing System

## Guía operativa para humanos y agentes de IA

---

## 0. Propósito de este documento

Este archivo es la guía principal de contexto para cualquier persona o agente de IA que trabaje en este repositorio.

Debe leerse antes de hacer cambios en código, estructura, prompts, integraciones, documentación, generación de contenido o automatizaciones.

Nexus Suite es el proyecto oficial actual. No debe mezclarse con repositorios, nombres, estructuras o decisiones anteriores salvo que exista una instrucción explícita y documentada en este repositorio.

---

## 1. Qué es Nexus Suite

Nexus Suite significa **Nexus Suite Marketing System**.

Es una plataforma de marketing inmobiliario con IA para Nexus Suite.

Su objetivo es automatizar y mejorar la producción de contenido diferenciado para desarrollos inmobiliarios en México.

El sistema debe ayudar a producir, organizar y eventualmente publicar:

- copy para redes sociales
- captions
- blogs
- emails
- anuncios
- parrillas de contenido
- briefs creativos
- imágenes basadas en fotos reales
- videos basados en assets reales
- contenido segmentado por desarrollo, región, audiencia y etapa comercial

Nexus Suite no debe producir contenido genérico.

El objetivo es convertir materia prima inmobiliaria validada en campañas de marketing accionables, medibles y diferenciadas por desarrollo.

---

## 2. Problema que resuelve

Nexus Suite opera múltiples desarrollos inmobiliarios en diferentes regiones.

Cada desarrollo tiene:

- características propias
- ubicación específica
- ventajas competitivas
- audiencia distinta
- etapa comercial diferente
- contexto regional
- necesidades de comunicación particulares

El problema es que producir contenido diferenciado para todos los desarrollos requiere mucho tiempo, coordinación y criterio estratégico.

Nexus Suite busca centralizar la materia prima, activar agentes de IA especializados y convertir esa información en contenido útil para marketing, ventas, social media, paid media, conversión y analytics.

---

## 3. Regla principal

**No asumir. Verificar primero.**

Si algo no está confirmado en el repositorio, documentación, issue, PR aprobado o instrucción explícita del equipo, debe marcarse como:

**Requiere verificación.**

---

## 4. Principios no negociables

### 4.1 Materia prima primero

No generar contenido final para un desarrollo sin validar su materia prima.

Materia prima mínima recomendada:

- `ficha.md`
- `storytelling.md`

Materia prima complementaria:

- `competencia.md`
- `audiencias.md`
- fotos reales del desarrollo
- campañas previas
- insights comerciales
- datos de performance

Si falta `storytelling.md`, el agente puede ayudar a estructurarlo o proponer preguntas, pero no debe generar contenido final como si la identidad del desarrollo estuviera completa.

---

### 4.2 Un desarrollo = una carpeta

Cada desarrollo debe tener su propia carpeta dentro de:

```txt
desarrollos/<slug>/
```

Toda la información relevante de ese desarrollo debe vivir ahí.

---

### 4.3 Imágenes reales, no inventadas

Las fotos deben ser reales del desarrollo.

La IA puede:

- adaptar
- editar
- transformar
- extender
- mejorar
- animar
- versionar
- componer a partir de fotos reales

La IA no debe inventar desde cero una propiedad, fachada, amenidad, ubicación o espacio que pueda confundirse con una representación real del desarrollo.

---

### 4.4 Separar implementado vs planeado

No asumir que una integración, API, ruta, módulo o funcionalidad existe solo porque aparece en esta guía.

Cada elemento debe clasificarse como:

- Implementado
- Parcial
- Pendiente
- Planeado
- Requiere verificación

---

### 4.5 Seguridad primero

Nunca commitear:

- API keys
- tokens
- llaves privadas
- archivos JSON de service account
- credenciales de Supabase
- credenciales de HubSpot
- credenciales de Meta
- credenciales de TikTok
- credenciales de OpenAI, Anthropic, fal.ai, Google o ElevenLabs
- archivos `.env` reales

Las credenciales deben vivir únicamente en variables de entorno.

---

## 5. Fuentes de verdad

Cuando un humano o agente de IA necesite contexto, debe consultar las fuentes en este orden:

1. Código real del repositorio actual
2. `CLAUDE.md`
3. `README.md`
4. Archivos dentro de `docs/`
5. Archivos dentro de `desarrollos/<slug>/`
6. Issues aprobados
7. Pull Requests aprobados
8. Decisiones explícitas del equipo

Si dos fuentes se contradicen, no resolver por intuición.

Debe marcarse como:

**Contradicción detectada — requiere decisión humana.**

---

## 6. Directorio canónico

Directorio local de referencia:

```txt
/Users/demo/Projects/nexus-suite
```

Regla:

No mezclar con OneDrive, otros proyectos, carpetas antiguas o codebases previos.

---

## 7. Stack técnico objetivo

Esta tabla describe el stack objetivo del proyecto.

Importante: algunos elementos pueden estar implementados, otros pendientes o planeados. Verificar contra el repositorio antes de asumir disponibilidad.

| Capa | Tecnología |
|---|---|
| Frontend + API | Next.js 15 App Router |
| Base de datos + Auth + Storage | Supabase |
| Deploy | Vercel |
| Repositorio | GitHub |
| IA texto | Claude Sonnet 4 para generación + Claude Haiku para clasificación |
| IA imagen fotorrealista | Flux 2 Pro vía fal.ai |
| IA imagen con texto/ads | GPT Image / OpenAI |
| IA imagen producción diaria | Nano Banana / Google |
| IA video cinematográfico | Kling |
| IA video motion dramático | Seedance |
| IA voz/narración | ElevenLabs |
| Hub imagen/video | fal.ai |
| CRM + audiencias | HubSpot API |
| Sync documentos | Google Drive API con service account |
| Analytics social | Meta Graph API + TikTok Business API |

---

## 8. Estado real del sistema

Esta sección debe actualizarse después de cada auditoría relevante del repositorio.

| Módulo / área | Estado actual | Evidencia / nota |
|---|---|---|
| Fichas técnicas | Implementado según documentación actual | `desarrollos/` |
| Storytelling por desarrollo | Parcial | Zenith Residences completo; otros pendientes |
| Competencia por desarrollo | Parcial | Zenith Residences completo; otros requieren verificación |
| Audiencias HubSpot | Parcial | Zenith Residences extraído manualmente; integración automática pendiente |
| Fotos reales por desarrollo | Pendiente / parcial | Integración formal pendiente |
| Claude Code agents | Implementado según documentación actual | `.claude/agents/` |
| App web Next.js | Fase 1 / en construcción | Verificar contra repo |
| Supabase Auth | Pendiente / Fase 1 | Verificar contra repo |
| CRUD desarrollos | Pendiente / Fase 1 | Verificar contra repo |
| Generación de copy | Pendiente / Fase 1 | Verificar contra repo |
| Generación de imagen | Pendiente / Fase 1 | Debe basarse en fotos reales |
| Historial de contenido | Pendiente / Fase 1 | Verificar modelo de datos |
| HubSpot API | Pendiente / Fase 2 | API route pendiente |
| Meta Graph API | Pendiente / Fase 2 | Integración pendiente |
| TikTok Business API | Pendiente / Fase 2 | Integración pendiente |
| Video + voz | Planeado / Fase 3 | No construir antes de Fase 1 y Fase 2 |
| Publicación automática | Planeado / Fase 4 | No construir antes de aprobación y permisos |
| Parrilla + aprobación | Planeado / Fase 5 | Requiere flujo editorial definido |

---

## 9. Prioridad estratégica vs fase técnica

Analytics es prioridad estratégica del producto porque Nexus Suite debe ayudar a medir desempeño, leads, campañas, CPL, engagement, ROAS y resultados comerciales.

Eso no significa que todas las integraciones de analytics deban construirse en Fase 1.

### En Fase 1 sí debe existir arquitectura preparada para analytics

Esto incluye:

- modelos de datos compatibles con campañas, desarrollos, contenido e historial
- estructura futura para KPIs
- rutas o carpetas placeholder si son útiles
- nomenclatura consistente de campañas
- historial de contenido generado
- relación entre contenido, desarrollo, canal y objetivo

### En Fase 1 no se debe asumir como obligatorio

- HubSpot sync automático completo
- Meta Graph API completa
- TikTok Business API completa
- dashboard final de KPIs
- cálculo real de CPL / ROAS si no hay datos conectados
- reportes ejecutivos finales

Las integraciones completas de analytics pertenecen a Fase 2, salvo decisión explícita del equipo.

---

## 10. Estructura objetivo del proyecto

La estructura objetivo es:

```txt
nexus-suite/
│
├── desarrollos/
│   ├── _template/
│   │   ├── ficha.md
│   │   ├── storytelling.md
│   │   ├── competencia.md
│   │   ├── audiencias.md
│   │   ├── fotos/
│   │   └── campanas/
│   │
│   ├── aukena/
│   │   ├── ficha.md
│   │   ├── storytelling.md
│   │   ├── competencia.md
│   │   ├── audiencias.md
│   │   ├── fotos/
│   │   └── campanas/
│   │
│   └── <otros-desarrollos>/
│       └── ficha.md
│
├── areas/
│   ├── analytics/
│   ├── creativo/
│   ├── contenido/
│   ├── social-media/
│   ├── paid-media/
│   ├── diseno/
│   ├── conversion/
│   └── atraccion/
│
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
│
├── .claude/
│   └── agents/
│
├── supabase/
│   └── migrations/
│
├── public/
├── docs/
├── .env.example
├── .gitignore
├── CLAUDE.md
└── README.md
```

---

## 11. Propósito de carpetas principales

| Carpeta / archivo | Propósito |
|---|---|
| `desarrollos/` | Materia prima por desarrollo. Es la base del sistema. |
| `desarrollos/_template/` | Estructura base para crear nuevos desarrollos. |
| `desarrollos/<slug>/ficha.md` | Especificaciones técnicas y comerciales del desarrollo. |
| `desarrollos/<slug>/storytelling.md` | Identidad, narrativa, tono y diferenciadores del desarrollo. |
| `desarrollos/<slug>/competencia.md` | Inteligencia competitiva por zona o segmento. |
| `desarrollos/<slug>/audiencias.md` | Audiencias reales o estratégicas del desarrollo. |
| `desarrollos/<slug>/fotos/` | Fotos reales del desarrollo. |
| `desarrollos/<slug>/campanas/` | Campañas y piezas generadas para ese desarrollo. |
| `areas/` | Organización funcional de marketing. |
| `src/` | Aplicación Next.js. |
| `scripts/` | Scripts temporales o de soporte (no incluidos en distribución). |
| `.claude/agents/` | Agentes especializados para Claude Code CLI. |
| `supabase/` | Migraciones, schema y configuración relacionada a base de datos. |
| `docs/` | Documentación operativa, técnica y de producto. |
| `.env.example` | Variables de entorno esperadas sin secretos reales. |

---

## 12. Desarrollos activos conocidos

Esta tabla debe mantenerse actualizada.

Nota: existe una posible inconsistencia entre “18 desarrollos activos” y la lista actualmente documentada. Hasta auditar el repositorio completo, tratar esta lista como estado actual documentado, no como verdad final absoluta.

| Slug | Desarrollo | Región | Materia prima conocida |
|---|---|---|---|
| `aukena` | Zenith Residences | Quintana Roo | ficha, storytelling, competencia, audiencias |
| `turquesa` | Coral Bay | Playa del Carmen, Q. Roo | ficha |
| `meriden` | Altamira | Mérida Norte, Yucatán | ficha |
| `bonza` | Cumbres | Querétaro | ficha |
| `trojes` | Los Claros | Puebla | ficha |
| `santa-fe-xochitepec` | Vista Sol | Morelos | ficha |
| `aquasol-ayala` | Brisa | Morelos | ficha |
| `abeto-tizayuca` | Cedro Norte | Hidalgo | ficha |
| `basalto-pachuca` | Granito | Hidalgo | ficha |
| `ciudad-natura-ii` | Eco Reserva | Hidalgo | ficha |
| `privadas-del-bosque` | Arboledas | Estado de México | ficha |
| `solares-zumpango` | Los Solares | Estado de México | ficha |
| `sauz-toluca` | Arrayán | Estado de México | ficha |
| `cosmopol-coacalco` | Urbania | Estado de México | ficha |
| `central-park-bosque-real` | Parque Central | Estado de México | ficha |

---

## 13. Áreas funcionales de marketing

| Área | Propósito | Fuentes / dependencias |
|---|---|---|
| `analytics` | Dashboard de métricas y performance | HubSpot, Meta, TikTok |
| `creativo` | Conceptos, identidad visual, lineamientos | storytelling, competencia |
| `contenido` | Copy, blogs, captions, scripts | Claude API, fichas, storytelling |
| `social-media` | Parrilla, calendario, publicación | Meta API, TikTok API |
| `paid-media` | Ads, targeting, campañas pagadas | Meta Ads, TikTok Ads |
| `diseno` | Briefs visuales, assets, specs | fotos reales, fal.ai |
| `conversion` | Landing pages, email, nurturing, WhatsApp | HubSpot, ElevenLabs |
| `atraccion` | SEO, orgánico, portales, lead magnets | analytics, portales, insights |

---

## 14. Agentes disponibles

Los agentes de Claude Code CLI viven en:

```txt
.claude/agents/
```

Agentes documentados:

| Agente | Función | Área |
|---|---|---|
| `coordinador` | Orquesta campañas completas | Todas |
| `investigador-mercado` | Competencia, SEO, tendencias | Atracción, Analytics |
| `redactor-contenido` | Copy, blogs, posts, landing pages, scripts | Contenido |
| `especialista-formatos-sociales` | Specs y optimización por plataforma | Social Media |
| `creador-anuncios` | Copy de ads y briefs creativos | Paid Media, Creativo |
| `email-marketer` | Emails, nurturing, newsletters | Conversión |

---

## 15. Protocolo obligatorio para agentes de IA

Antes de responder, generar contenido, modificar archivos o proponer arquitectura, todo agente debe seguir este protocolo.

### 15.1 Lectura mínima del proyecto

1. Leer `CLAUDE.md`
2. Leer `README.md`
3. Identificar la fase actual del trabajo
4. Verificar si el cambio solicitado pertenece a Fase 1, 2, 3, 4 o 5
5. Revisar archivos relevantes en el repositorio
6. Separar hechos de suposiciones
7. Marcar cualquier duda como “Requiere verificación”

### 15.2 Lectura mínima por desarrollo

Para trabajar con un desarrollo específico:

1. Leer `desarrollos/<slug>/ficha.md`
2. Leer `desarrollos/<slug>/storytelling.md`, si existe
3. Leer `desarrollos/<slug>/competencia.md`, si existe
4. Leer `desarrollos/<slug>/audiencias.md`, si existe
5. Revisar `desarrollos/<slug>/fotos/`, si se trabajará con imagen o video
6. Revisar campañas previas en `desarrollos/<slug>/campanas/`, si existen

### 15.3 Si falta información

Si falta `ficha.md`:

- no generar contenido
- pedir o proponer estructura de ficha
- marcar bloqueo

Si falta `storytelling.md`:

- no generar contenido final
- se puede generar borrador provisional
- se debe marcar como provisional
- se deben proponer preguntas para completar identidad

Si faltan fotos reales:

- no generar imagen final
- se puede generar brief visual
- se puede indicar qué foto o ángulo se necesita

Si falta `audiencias.md`:

- usar audiencia inferida solo como hipótesis
- marcarla como provisional
- sugerir validación con HubSpot o fuente comercial

---

## 16. Protocolo para generar contenido

Todo contenido debe partir de materia prima validada.

### Input mínimo recomendado

- desarrollo
- `ficha.md`
- `storytelling.md`
- objetivo de campaña
- canal
- formato
- audiencia
- etapa del funnel
- CTA
- restricciones legales/comerciales
- tono deseado
- fecha o contexto de publicación

### Output esperado

Dependiendo del tipo de contenido, el agente debe entregar:

- pieza final
- racional estratégico breve
- fuente de insights usada
- supuestos aplicados
- restricciones consideradas
- variantes si aplica
- estado: final, borrador o provisional

### Prohibido

No generar:

- afirmaciones no verificadas
- precios inventados
- ubicaciones inventadas
- amenidades no confirmadas
- disponibilidad no confirmada
- promesas comerciales no validadas
- imágenes que aparenten ser reales si no parten de foto real
- claims de inversión, plusvalía o retorno sin fuente validada

---

## 17. Protocolo para cambios técnicos

Antes de modificar código, un agente debe responder internamente o documentar:

1. Qué archivo se va a modificar
2. Por qué se modifica
3. Qué problema resuelve
4. Qué riesgo introduce
5. Qué alternativa conservadora existe
6. Cómo se valida que funciona
7. Qué parte de la fase actual impacta

### No hacer cambios técnicos si:

- no se conoce el objetivo
- no se sabe si pertenece a la fase actual
- faltan variables de entorno
- faltan dependencias
- no se ha leído el archivo afectado
- el cambio mezcla módulos no relacionados
- el cambio introduce una integración no aprobada

---

## 18. Fases de construcción del producto

### Fase 1 — Fundación

Objetivo: construir la base funcional del sistema.

Incluye:

- scaffold Next.js 15 + GitHub + Vercel
- Supabase Auth con email y contraseña
- roles básicos: admin/editor
- CRUD de desarrollos
- lectura de materia prima por desarrollo
- generación de copy con Claude
- generación de imagen basada en fotos reales
- historial de contenido generado
- estructura preparada para analytics

No incluye:

- HubSpot sync completo
- Meta Graph API completa
- TikTok Business API completa
- publicación automática
- video
- voz
- parrilla editorial completa con aprobación avanzada

### Criterios de terminado Fase 1

La Fase 1 se considera terminada cuando:

- el usuario puede iniciar sesión
- el usuario puede ver desarrollos
- el usuario puede crear/editar información básica de un desarrollo
- el usuario puede generar copy desde materia prima
- el usuario puede generar o solicitar una imagen basada en foto real
- el sistema guarda historial de contenido
- las variables de entorno están documentadas en `.env.example`
- el flujo principal está deployado en Vercel
- no hay secretos commiteados

---

### Fase 2 — Analytics Dashboard

Objetivo: conectar fuentes de datos y medir performance.

Incluye:

- HubSpot sync automático
- Meta Graph API
- TikTok Business API
- dashboard de KPIs por desarrollo
- métricas por campaña, canal y contenido
- modelo de datos para leads y performance

No construir Fase 2 sin tener una base funcional clara de Fase 1.

---

### Fase 3 — Video + Voz

Objetivo: generar contenido audiovisual avanzado.

Incluye:

- generación de video basado en assets reales
- motion visual
- narración con voz
- scripts
- versiones por formato

No generar video que invente propiedades, espacios o amenidades no confirmadas.

---

### Fase 4 — Publicación automática

Objetivo: publicar contenido en canales conectados.

Incluye:

- publicación en redes
- permisos
- tokens
- programación
- validación de formatos
- manejo de errores

No construir publicación automática sin flujo de aprobación.

---

### Fase 5 — Parrilla + Aprobación

Objetivo: operar calendario editorial completo.

Incluye:

- parrillas por desarrollo
- aprobaciones
- estados editoriales
- asignación de responsables
- historial de cambios
- publicación programada
- reportes

---

## 19. Estados editoriales recomendados

Para contenido y campañas, usar estados claros.

| Estado | Significado |
|---|---|
| `draft` | Borrador inicial |
| `needs_context` | Falta materia prima o decisión |
| `ready_for_review` | Listo para revisión humana |
| `approved` | Aprobado |
| `scheduled` | Programado |
| `published` | Publicado |
| `archived` | Archivado |
| `rejected` | Rechazado |

---

## 20. Integraciones

### Google Drive

Uso esperado:

- sincronizar fichas técnicas
- sincronizar fotos reales
- detectar cambios en documentos fuente

Estado actual documentado:

- sync de fichas con `scripts/sync_drive.py`
- sync de fotos pendiente o parcial
- webhook local temporal con `webhook_server.py`
- migración futura a API route en Vercel

Reglas:

- no commitear archivo JSON de service account
- usar `GOOGLE_SERVICE_ACCOUNT_JSON` como variable de entorno
- no imprimir credenciales en logs
- no subir credenciales a GitHub

---

### HubSpot

Uso esperado:

- contactos
- deals
- lifecycle stage
- modelo de interés
- audiencias
- nurturing
- conversión

Estado:

- pendiente para integración automática
- audiencias de AUKENA documentadas manualmente

Pertenece principalmente a Fase 2.

---

### Meta Graph API

Uso esperado:

- alcance
- engagement
- publicaciones
- métricas sociales
- campañas

Estado:

- pendiente

Pertenece principalmente a Fase 2 y Fase 4.

---

### TikTok Business API

Uso esperado:

- views
- followers
- CPM
- performance orgánico/pagado

Estado:

- pendiente

Pertenece principalmente a Fase 2 y Fase 4.

---

### fal.ai

Uso esperado:

- generación o transformación visual
- adaptación de imágenes
- posibles flujos de imagen/video

Regla:

Siempre partir de fotos reales cuando el output represente un desarrollo específico.

---

### OpenAI / GPT Image

Uso esperado:

- imágenes con texto
- ads
- composiciones visuales
- piezas con copy embebido

Regla:

No inventar características visuales del desarrollo si no están sustentadas en fotos reales o materia prima validada.

---

### ElevenLabs

Uso esperado:

- voz
- narración
- piezas audiovisuales

Pertenece principalmente a Fase 3.

---

## 21. Variables de entorno

Todas las variables reales deben vivir fuera del repositorio.

`.env.example` debe documentar nombres esperados sin valores reales.

Ejemplo:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic / Claude
ANTHROPIC_API_KEY=

# OpenAI
OPENAI_API_KEY=

# fal.ai
FAL_KEY=

# Google Drive
GOOGLE_SERVICE_ACCOUNT_JSON=
GOOGLE_DRIVE_FICHAS_FOLDER_ID=
GOOGLE_DRIVE_FOTOS_FOLDER_ID=

# HubSpot
HUBSPOT_ACCESS_TOKEN=

# Meta
META_ACCESS_TOKEN=
META_APP_ID=
META_APP_SECRET=

# TikTok
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=

# ElevenLabs
ELEVENLABS_API_KEY=
```

Nunca incluir valores reales en este archivo.

---

## 22. Reglas de seguridad

### Prohibido commitear

- `.env`
- `.env.local`
- `.env.production`
- service account JSON
- tokens
- API keys
- secretos de Vercel
- secretos de Supabase
- dumps de base de datos con datos sensibles
- audiencias exportadas con datos personales sensibles sin protección

### Datos de clientes y audiencias

Cualquier dato proveniente de HubSpot debe tratarse como información sensible.

No exponer:

- emails
- teléfonos
- nombres completos
- identificadores personales
- datos comerciales privados
- información individual de leads

Para documentación y ejemplos, usar datos anonimizados.

---

## 23. Manejo de contradicciones

Si existe contradicción entre `README.md`, `CLAUDE.md`, código, issues o instrucciones humanas:

1. No asumir.
2. Identificar la contradicción.
3. Citar los archivos o ubicaciones afectadas.
4. Marcar como “Requiere decisión humana”.
5. No implementar cambios definitivos hasta resolverla.

Ejemplo:

```txt
Contradicción detectada:
README menciona data/desarrollos/, pero CLAUDE.md menciona desarrollos/.
Requiere verificar estructura real del repositorio antes de modificar scripts.
```

---

## 24. Criterio de calidad para agentes

Todo agente debe priorizar:

1. Precisión sobre velocidad
2. Contexto sobre improvisación
3. Materia prima sobre creatividad genérica
4. Claridad sobre complejidad
5. Seguridad sobre conveniencia
6. Fases sobre acumulación de features
7. Evidencia sobre intuición

---

## 25. Reglas de respuesta para agentes

Cuando un agente responda sobre el proyecto, debe evitar respuestas vagas.

Debe usar este formato cuando aplique:

```txt
Estado:
- Implementado / Pendiente / Planeado / Requiere verificación

Archivos relevantes:
- ruta/archivo

Qué entiendo:
- resumen breve

Riesgo:
- principal riesgo o ambigüedad

Recomendación:
- siguiente acción concreta
```

---

## 26. Guía para nuevos developers

Antes de tocar código:

1. Leer `README.md`
2. Leer `CLAUDE.md`
3. Revisar estructura del repo
4. Revisar `package.json`
5. Revisar `.env.example`
6. Revisar `src/app`
7. Revisar `src/lib`
8. Revisar `scripts`
9. Revisar `desarrollos`
10. Revisar `.claude/agents`
11. Revisar `supabase/migrations`, si existe
12. Revisar issues o PRs activos

No empezar por construir features.

Primero entender:

- producto
- fase actual
- fuentes de datos
- materia prima
- integraciones
- riesgos
- reglas de seguridad

---

## 27. Glosario

| Término | Definición |
|---|---|
| Desarrollo | Proyecto inmobiliario específico de Nexus Suite. |
| Slug | Identificador único en formato URL/file-system para un desarrollo. |
| Ficha | Documento con especificaciones técnicas, comerciales y descriptivas. |
| Storytelling | Identidad narrativa, tono, diferenciadores y posicionamiento del desarrollo. |
| Competencia | Análisis de competidores y mercado local. |
| Audiencias | Segmentos comerciales o datos de leads asociados a un desarrollo. |
| Campaña | Conjunto de piezas con objetivo, canal, audiencia y mensaje común. |
| Parrilla | Calendario editorial organizado por fechas, canales y piezas. |
| Asset | Recurso visual, textual, sonoro o audiovisual usado en una campaña. |
| Agente | Especialista IA con función específica dentro del flujo de marketing. |
| Analytics | Métricas y datos de desempeño de campañas, contenidos y leads. |
| CRUD | Crear, leer, actualizar y eliminar registros. |
| Fase | Etapa controlada de construcción del producto. |

---

## 28. Preguntas abiertas

Estas preguntas deben resolverse conforme avance la auditoría del repo:

1. ¿Son 15, 18 u otro número los desarrollos activos reales?
2. ¿Cuál es la lista oficial y actualizada de desarrollos?
3. ¿Cuál es la estructura real actual: `desarrollos/` o `data/desarrollos/`?
4. ¿Qué partes de Next.js ya existen realmente?
5. ¿Supabase ya está configurado o sigue pendiente?
6. ¿Hay migraciones reales en `supabase/migrations/`?
7. ¿Qué agentes Claude Code existen realmente en `.claude/agents/`?
8. ¿Qué scripts funcionan hoy y cuáles son temporales?
9. ¿Cuál es el alcance exacto de Fase 1 aprobado por el equipo?
10. ¿Quién aprueba contenido antes de publicación?
11. ¿Qué datos de HubSpot pueden usarse legal y operativamente?
12. ¿Qué permisos existen para Meta y TikTok?
13. ¿Cómo se definirá el flujo de aprobación editorial?
14. ¿Qué contenido se considera final vs provisional?
15. ¿Qué información comercial no debe ser generada por IA?

---

## 29. Resumen ejecutivo para agentes

Nexus Suite es una plataforma de marketing inmobiliario con IA para Nexus Suite.

La unidad principal del sistema es el desarrollo inmobiliario.

Cada desarrollo debe tener materia prima propia en:

```txt
desarrollos/<slug>/
```

La IA debe generar contenido usando esa materia prima, no desde intuición genérica.

Las fotos deben ser reales.

Las integraciones listadas no deben asumirse como implementadas.

La prioridad estratégica es analytics, pero el orden técnico empieza por fundación: app, auth, CRUD, generación de contenido e historial.

Toda acción debe respetar fases, seguridad y evidencia.

Si algo no está claro, no inventar.

Marcar como:

**Requiere verificación.**
