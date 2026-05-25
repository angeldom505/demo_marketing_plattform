# AUKENA Copy Workflow V1

## 1. Purpose

This workflow defines how HUMS should generate Instagram/Facebook captions for AUKENA in Spanish through a specialized agentic sequence with structured JSON output.

This document covers **Step 1 only** of the AUKENA agentic system roadmap:
- Copy first
- Images later
- FAL.AI later
- Ads/WhatsApp/Reels later
- Publishing later

## 2. Strategic principle

- AUKENA copy must never default to generic real estate language.
- Every caption must be grounded in validated AUKENA source material.
- The workflow must convert validated project knowledge into differentiated marketing content.
- The system must optimize for clarity, specificity, brand voice consistency, and lead generation readiness.

## 3. Canonical source material

The canonical source location for this workflow is `desarrollos/aukena/`.

- `desarrollos/aukena/ficha.md`  
  Technical and commercial facts: location, models, prices, amenities, links, and Matterport tours.
- `desarrollos/aukena/storytelling.md`  
  Brand identity: PUV, tone, narrative territories, concept, and emotional positioning.
- `desarrollos/aukena/competencia.md`  
  Competitive strategy: market context, competitors, differentiators, and saturated messages to avoid.
- `desarrollos/aukena/audiencias.md`  
  HubSpot audience intelligence: real segments, model traction, and funnel insights.

> Note: `data/desarrollos/` and `storytellings/` can be referenced only as legacy context, not as canonical inputs for V1.

## 4. Workflow scope V1

### In scope
- Spanish captions for Instagram/Facebook
- Organic social captions
- Structured JSON output
- Audience-aware copy
- Model-aware copy
- QA before final response

### Out of scope
- Image generation
- FAL.AI
- Reels scripts
- Meta Ads copy
- WhatsApp follow-up
- Campaign calendars
- Publishing
- HubSpot live sync
- Runtime implementation

## 5. Priority audiences V1

Only these audiences are in scope for V1:

### 1) CDMX executive / quality-of-life investor
- **Core motivation:** improve lifestyle while preserving capital discipline.
- **Emotional trigger:** certainty in a strategic decision with tangible upside.
- **Recommended message angle:** decision quality, Caribbean access, and premium practicality.
- **What to avoid:** speculative promises, exaggerated luxury, and “escape fantasy” language.

### 2) Interior Republic / patrimonial family buyer
- **Core motivation:** build family patrimony with a long-term, usable asset.
- **Emotional trigger:** security, legacy, and family enjoyment with structure.
- **Recommended message angle:** patrimony lived, utility + family wellbeing.
- **What to avoid:** pressure tactics, technical jargon overload, and generic investment clichés.

### 3) USA diaspora / Mexican abroad
- **Core motivation:** reconnect with Mexico through a strategic and emotionally meaningful asset.
- **Emotional trigger:** belonging, identity, and confidence in cross-border decision making.
- **Recommended message angle:** lifestyle + patrimonial positioning with clear, grounded facts.
- **What to avoid:** legal/tax assumptions, overpromised returns, and ambiguous claims.

Use conservative, non-invasive wording at all times and never expose personal data.

## 6. Priority models V1

### 1) RECINTO
- **Role:** strongest traction / sweet spot.
- **Use for:** CDMX and Interior Republic priority audiences.

### 2) BENOA
- **Role:** entry point / digital traffic driver.
- **Use for:** early-stage leads and accessible entry messaging.

### 3) CROZET
- **Role:** aspirational / higher-ticket / foreign or diaspora interest.
- **Use for:** lifestyle + investment positioning.

### Future model handling
- **MÓNACO:** mark as future scope (V1.5 / premium workflow), not core V1.

## 7. Agentic architecture

Minimal V1 sequence:

AUKENA Orchestrator  
↓  
AUKENA Context Agent  
↓  
AUKENA Strategy Agent  
↓  
AUKENA Copy Agent  
↓  
AUKENA QA Agent  
↓  
Structured JSON Output

### AUKENA Orchestrator
- **Responsibility:** interpret request and coordinate execution.
- **Inputs:** user brief, required input contract.
- **Outputs:** normalized task payload for downstream agents.
- **Must not:** write final copy.

### AUKENA Context Agent
- **Responsibility:** extract relevant validated facts from canonical AUKENA files.
- **Inputs:** normalized payload + canonical source files.
- **Outputs:** selected facts, citations map, uncertainty flags.
- **Must not:** invent claims or fill gaps with assumptions as facts.

### AUKENA Strategy Agent
- **Responsibility:** define angle, funnel intent, and CTA logic.
- **Inputs:** normalized payload + selected facts + audience/model context.
- **Outputs:** strategy block for copy generation.
- **Must not:** write final copy.

### AUKENA Copy Agent
- **Responsibility:** generate caption components (hook/body/CTA/hashtags) aligned with strategy.
- **Inputs:** strategy block + fact block + voice rules.
- **Outputs:** draft caption block in JSON-ready structure.
- **Must not:** invent data, availability, discounts, guarantees, or unsupported urgency.

### AUKENA QA Agent
- **Responsibility:** validate factuality, voice, compliance, and usability.
- **Inputs:** full draft JSON output + source context.
- **Outputs:** approval decision, score, risks, and revision notes.
- **Must not:** bypass validation criteria or approve non-compliant claims.

## 8. Agent responsibilities

### AUKENA Orchestrator
- Interprets the user request.
- Detects audience, model, channel, format, and objective.
- Requests missing critical information if needed.
- Routes the task through the workflow.
- Does not write final copy.

### AUKENA Context Agent
- Reads and extracts relevant facts from AUKENA source material.
- Selects only facts relevant to the requested audience/model.
- Flags missing or uncertain data.
- Does not invent claims.

### AUKENA Strategy Agent
- Chooses the message angle.
- Defines funnel stage.
- Defines primary insight.
- Defines CTA.
- Chooses competitive and/or audience insights to apply.
- Does not write final copy.

### AUKENA Copy Agent
- Writes the caption.
- Produces hook, body, CTA, and hashtags.
- Uses AUKENA voice and tone.
- Avoids generic real estate language.
- Does not invent data, availability, discounts, or guarantees.

### AUKENA QA Agent
- Reviews output against brand, facts, compliance, and usability.
- Flags risks.
- Approves, requests revision, or marks `needs_context`.
- Ensures output is valid and JSON-ready.

## 9. Required input contract

```json
{
  "project": "aukena",
  "content_type": "caption",
  "channel": "instagram_facebook",
  "language": "es",
  "audience": "cdmx_executive | interior_republic_family | usa_diaspora",
  "model": "recinto | benoa | crozet",
  "objective": "awareness | consideration | lead_generation | nurturing",
  "topic": "string",
  "cta": "agenda_asesoria | solicita_informacion | conoce_aukena | descarga_brochure",
  "notes": "optional string"
}
```

### Required fields
`project`, `content_type`, `channel`, `language`, `audience`, `model`, `objective`, `topic`, `cta`.

### Optional fields
`notes`.

If any required field is missing or ambiguous, the workflow should return `needs_context` instead of guessing.

## 10. Required output contract

```json
{
  "project": "aukena",
  "workflow": "aukena-copy-workflow-v1",
  "content_type": "caption",
  "channel": "instagram_facebook",
  "language": "es",
  "audience": "...",
  "model": "...",
  "status": "ready_for_review | needs_context | rejected",
  "strategy": {
    "funnel_stage": "...",
    "angle": "...",
    "audience_insight": "...",
    "model_rationale": "...",
    "cta_strategy": "..."
  },
  "caption": {
    "hook": "...",
    "body": "...",
    "cta": "...",
    "hashtags": []
  },
  "source_context": {
    "files_used": [],
    "facts_used": [],
    "assumptions": []
  },
  "qa": {
    "approved": true,
    "score": 0,
    "risks": [],
    "revision_notes": []
  }
}
```

## 11. Brand voice rules

### Must sound
- Confident
- Calm
- Aspirational
- Grounded in data
- Premium without ostentation
- Emotionally intelligent
- Clear and direct

### Must avoid
- Generic paradise language
- Fake urgency
- Real estate clichés
- Aggressive sales pressure
- Unsupported ROI claims
- Invented availability
- Exaggerated luxury language

## 12. Strategic message territories

Allowed strategic territories:
- The decision that changes everything
- Patrimony lived
- Caribbean as strategic advantage
- Community of criterion
- Sports Club as transformation, not amenity
- Bali sold out as validated precedent (only when contextually relevant)

## 13. Claims policy

### Allowed
- Factual amenities from `ficha.md`
- Confirmed models and starting prices from `ficha.md`
- Brand concepts from `storytelling.md`
- Audience insights from `audiencias.md`
- Competitive insights from `competencia.md`, framed carefully and without overclaiming

### Use with caution
- Plusvalía
- ROI
- Rental yield
- Market growth data
- “Highest growth” claims
- Comparisons against competitors

### Forbidden
- Guaranteed returns
- Guaranteed appreciation
- Guaranteed credit approval
- Invented availability
- Invented discounts
- Invented urgency
- Fake scarcity
- Any claim not supported by canonical source material
- Personal data from HubSpot contacts

## 14. Caption generation rules

Each caption must include:
- Hook
- Body
- CTA
- Optional hashtags
- A clear link to audience + model + topic
- No more than one central idea
- No generic filler
- No unsupported factual claims

## 15. QA checklist

The QA Agent must verify:
- Does it use the correct audience?
- Does it use the correct model?
- Is it grounded in source material?
- Does it avoid prohibited claims?
- Does it avoid generic real estate copy?
- Is the CTA clear?
- Is the tone aligned with AUKENA?
- Is the JSON structure valid?
- Is it ready for human review?

## 16. Example outputs

The following are **illustrative examples only**, not final approved campaign copy.

### Example 1: RECINTO for CDMX executive

```json
{
  "project": "aukena",
  "workflow": "aukena-copy-workflow-v1",
  "content_type": "caption",
  "channel": "instagram_facebook",
  "language": "es",
  "audience": "cdmx_executive",
  "model": "recinto",
  "status": "ready_for_review",
  "strategy": {
    "funnel_stage": "consideration",
    "angle": "Caribbean as strategic quality-of-life decision",
    "audience_insight": "Busca eficiencia patrimonial sin renunciar a estilo de vida.",
    "model_rationale": "RECINTO concentra tracción y equilibrio valor/aspiración.",
    "cta_strategy": "Invitar a asesoría breve con enfoque en fit de perfil"
  },
  "caption": {
    "hook": "No se trata de escapar: se trata de decidir mejor.",
    "body": "RECINTO en AUKENA conecta una vida más estratégica con un activo respaldado por información clara del proyecto.",
    "cta": "Agenda una asesoría y conoce si RECINTO es tu siguiente decisión patrimonial.",
    "hashtags": ["#AUKENA", "#Recinto", "#DecisiónPatrimonial"]
  },
  "source_context": {
    "files_used": [
      "desarrollos/aukena/ficha.md",
      "desarrollos/aukena/storytelling.md",
      "desarrollos/aukena/audiencias.md"
    ],
    "facts_used": [
      "RECINTO como modelo prioritario en tracción",
      "Territorio de decisión estratégica"
    ],
    "assumptions": []
  },
  "qa": {
    "approved": true,
    "score": 88,
    "risks": [],
    "revision_notes": []
  }
}
```

### Example 2: BENOA for Interior Republic family buyer

```json
{
  "project": "aukena",
  "workflow": "aukena-copy-workflow-v1",
  "content_type": "caption",
  "channel": "instagram_facebook",
  "language": "es",
  "audience": "interior_republic_family",
  "model": "benoa",
  "status": "ready_for_review",
  "strategy": {
    "funnel_stage": "awareness",
    "angle": "Patrimony lived with accessible entry",
    "audience_insight": "Quiere construir patrimonio familiar con decisiones realistas.",
    "model_rationale": "BENOA funciona como entrada clara para primeras conversaciones.",
    "cta_strategy": "Solicitar información concreta para siguiente paso"
  },
  "caption": {
    "hook": "Patrimonio también es disfrutar el proceso en familia.",
    "body": "BENOA abre una puerta de entrada a AUKENA para familias que priorizan orden, visión de largo plazo y uso real.",
    "cta": "Solicita información y revisa si BENOA se ajusta a tu etapa actual.",
    "hashtags": ["#AUKENA", "#Benoa", "#PatrimonioFamiliar"]
  },
  "source_context": {
    "files_used": [
      "desarrollos/aukena/ficha.md",
      "desarrollos/aukena/storytelling.md",
      "desarrollos/aukena/audiencias.md"
    ],
    "facts_used": [
      "BENOA como punto de entrada",
      "Narrativa de patrimonio vivido"
    ],
    "assumptions": []
  },
  "qa": {
    "approved": true,
    "score": 86,
    "risks": [],
    "revision_notes": []
  }
}
```

### Example 3: CROZET for USA diaspora

```json
{
  "project": "aukena",
  "workflow": "aukena-copy-workflow-v1",
  "content_type": "caption",
  "channel": "instagram_facebook",
  "language": "es",
  "audience": "usa_diaspora",
  "model": "crozet",
  "status": "ready_for_review",
  "strategy": {
    "funnel_stage": "lead_generation",
    "angle": "Lifestyle + strategic patrimonial reconnection",
    "audience_insight": "Busca reconectar con México mediante una decisión bien sustentada.",
    "model_rationale": "CROZET encaja en posicionamiento aspiracional para perfil internacional.",
    "cta_strategy": "Invitar a conversación 1:1 con contexto de decisión"
  },
  "caption": {
    "hook": "Volver a México también puede ser una estrategia patrimonial.",
    "body": "CROZET en AUKENA integra aspiración, pertenencia y una propuesta respaldada por información verificable del desarrollo.",
    "cta": "Conoce AUKENA y agenda una conversación para evaluar tu perfil.",
    "hashtags": ["#AUKENA", "#Crozet", "#MexicanosEnElExtranjero"]
  },
  "source_context": {
    "files_used": [
      "desarrollos/aukena/ficha.md",
      "desarrollos/aukena/storytelling.md",
      "desarrollos/aukena/audiencias.md",
      "desarrollos/aukena/competencia.md"
    ],
    "facts_used": [
      "CROZET para posicionamiento aspiracional",
      "Territorio de reconexión y decisión estratégica"
    ],
    "assumptions": []
  },
  "qa": {
    "approved": true,
    "score": 90,
    "risks": [],
    "revision_notes": []
  }
}
```

## 17. Future expansion

- **V1.1:** Add Meta Ads copy
- **V1.2:** Add WhatsApp follow-up
- **V1.3:** Add A/B caption variants
- **V1.5:** Add MÓNACO premium workflow
- **V2:** Add Visual Prompt Agent
- **V2.1:** Add FAL.AI adapter
- **V3:** Campaign planner
- **V4:** Calendar and approval workflow
- **V5:** Analytics feedback loop

## 18. Implementation notes

This document should later inform:
- A specialized Claude Code agent: `.claude/agents/aukena-copywriter.md`
- Runtime app prompts under `src/lib/prompts` or `src/lib/agents` if/when runtime generation is implemented
- UI contracts for frontend/backend communication

This V1 document is strategy and contract documentation only. It does not implement runtime behavior.
