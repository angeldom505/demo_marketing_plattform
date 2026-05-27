# Zenith Residences Copywriter Test Pack V1

## 1. Purpose

This test pack validates the first specialized Zenith Residences copy agent.

The agent being tested is:

`.claude/agents/zenith-copywriter.md`

The workflow being tested is:

`docs/agents/zenith-copy-workflow-v1.md`

The goal is to verify that the agent can generate Spanish Instagram/Facebook captions as valid JSON for Zenith Residences.

## 2. Scope

In scope:
- Instagram/Facebook captions
- Spanish output
- JSON-only responses
- Zenith Residences source-grounded copy
- Three V1 audience/model combinations
- Manual QA scoring

Out of scope:
- Images
- FAL.AI
- Reels
- Meta Ads
- WhatsApp
- Campaign calendars
- Runtime/API integration
- Automated tests

## 3. Required source material

The agent must use the following sources:

- `docs/agents/zenith-copy-workflow-v1.md`
- `desarrollos/zenith/ficha.md`
- `desarrollos/zenith/storytelling.md`
- `desarrollos/zenith/competencia.md`
- `desarrollos/zenith/audiencias.md`

## 4. Test execution instructions

These tests should be executed in Claude Code or any environment capable of invoking the Claude Code agent.

For each test:
1. Invoke the Zenith Residences Copywriter Agent.
2. Provide the input payload.
3. Capture the full JSON response.
4. Validate JSON structure.
5. Score the response using the rubric.
6. Record issues and recommended fixes.

## 5. Test case 1 — RECINTO + CDMX executive

Input:

```json
{
  "project": "zenith",
  "content_type": "caption",
  "channel": "instagram_facebook",
  "language": "es",
  "audience": "cdmx_executive",
  "model": "recinto",
  "objective": "lead_generation",
  "topic": "calidad de vida y patrimonio en Playa del Carmen",
  "cta": "agenda_asesoria",
  "notes": "Evitar tono de escape o promesas de inversión."
}
```

Expected behavior:
- Should frame RECINTO as a strategic quality-of-life and patrimonial decision.
- Should avoid generic paradise language.
- Should not guarantee ROI or appreciation.
- Should include a clear CTA to agenda asesoría.
- Should return valid JSON only.

## 6. Test case 2 — BENOA + Interior Republic family

Input:

```json
{
  "project": "zenith",
  "content_type": "caption",
  "channel": "instagram_facebook",
  "language": "es",
  "audience": "interior_republic_family",
  "model": "benoa",
  "objective": "awareness",
  "topic": "primer paso accesible hacia Zenith Residences para una familia patrimonial",
  "cta": "solicita_informacion",
  "notes": "Debe sonar familiar, patrimonial y claro; sin presión agresiva."
}
```

Expected behavior:
- Should position BENOA as the accessible entry point into Zenith Residences.
- Should connect family wellbeing with patrimonial logic.
- Should avoid fake urgency.
- Should avoid generic family real estate clichés.
- Should return valid JSON only.

## 7. Test case 3 — CROZET + USA diaspora

Input:

```json
{
  "project": "zenith",
  "content_type": "caption",
  "channel": "instagram_facebook",
  "language": "es",
  "audience": "usa_diaspora",
  "model": "crozet",
  "objective": "consideration",
  "topic": "reconectar con México a través de una decisión patrimonial en Playa del Carmen",
  "cta": "conoce_zenith",
  "notes": "No hacer afirmaciones legales, fiscales o de retorno garantizado."
}
```

Expected behavior:
- Should position CROZET as aspirational and patrimonial.
- Should speak to reconnection with Mexico.
- Should avoid tax/legal assumptions.
- Should avoid guaranteed returns.
- Should return valid JSON only.

## 8. JSON validation checklist

The response must include:

- `project`
- `workflow`
- `agent`
- `content_type`
- `channel`
- `language`
- `audience`
- `model`
- `status`
- `strategy`
- `caption`
- `source_context`
- `qa`

The response must not include:
- Markdown outside JSON
- Explanatory prose outside JSON
- Unsupported fields that break frontend parsing

## 9. Quality scoring rubric

100-point rubric:

- JSON validity: 15
- Audience alignment: 15
- Model alignment: 15
- Source grounding: 15
- Zenith Residences voice: 15
- Claims safety: 15
- CTA clarity: 10

Passing score:
- 85+ = ready for next phase
- 70–84 = usable but agent needs prompt refinement
- below 70 = agent needs revision before use

## 10. Failure signals

- Returns prose instead of JSON
- Uses generic real estate copy
- Uses “vive el paraíso” or similar cliché
- Invents availability
- Invents discounts
- Guarantees ROI or appreciation
- Uses unsupported tax/legal claims
- Ignores audience
- Ignores model
- Omits QA block
- Uses personal HubSpot data

## 11. Test result template

### Test ID:
### Input used:
### JSON valid:
### Score:
### Strengths:
### Issues:
### Required agent changes:
### Ready for next phase:
### Reviewer notes:

## 12. Recommended next steps after testing

If all tests score 85+:
- proceed to V1.1 A/B caption variants or Meta Ads copy

If one or more tests score 70–84:
- update `.claude/agents/zenith-copywriter.md` with targeted refinements

If any test scores below 70:
- revise agent constraints before expanding scope

## 13. Notes for future automation

This manual test pack can later become:
- automated prompt evals
- regression tests for agent outputs
- UI QA cases
- runtime generation acceptance criteria
