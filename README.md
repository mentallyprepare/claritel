# Clara by Claritel — Homepage

A premium, conversion-focused marketing homepage for **Clara**, Claritel's enterprise AI
conversation platform (voice, WhatsApp, web chat, and conversation-quality analysis).

Positioning: **"AI that becomes part of how your business performs."**

## Run it

It's a static site — no build step.

```bash
# any static server, e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All 16 homepage sections + footer |
| `assets/styles.css` | Design system (tokens, components, responsive, reduced-motion) |
| `assets/script.js` | Interactivity — see below |

## Design system

- **Palette:** navy `#1B1B3C` · purple `#534B82` · lavender `#E6E6FF` · off-white `#FCFCFD` · ink `#181A1B` · muted `#61676B`
- **Type:** Roboto
- **Clara mark:** an abstract metallic orb (CSS `.orb`) with `idle`, `listening`, `thinking`, `speaking`, `muted`, `ended` states — no face/avatar.

## Interactive pieces

1. **Hero voice demo** — four scenario chips (sales / support / booking / automobile).
   Selecting one updates the intro and the "Start a live call" button.
   - Microphone is requested **only after an explicit click**.
   - When granted, the orb reacts to real mic level; the agent's turns show as an
     on-screen transcript (**no audio is ever autoplayed**).
   - Shows listening / thinking / speaking / muted / ended states, call duration,
     mute + end controls, and a live transcript beside the orb (below it on mobile).
   - If mic is denied/unavailable → **"Hear a sample conversation"** fallback.
   - After the call → **Try another scenario** / **Build one for my business**.
2. **ClaraLens demo** — click **Show evidence** on any scorecard checkpoint to highlight
   the exact transcript line; **Override score** appends to the audit trail; **View trail**.
3. **Deployment timeline** — five keyboard-navigable tabs (`role="tablist"`).
4. **FAQ** — native `<details>` accordion.

## Accessibility & motion

- Respects `prefers-reduced-motion` (disables ambient animation, mic-driven visual, smooth scroll).
- Keyboard accessible demo + timeline (arrow keys), visible focus states, skip link.
- Call states are conveyed by text label + icon, not colour alone.
- Targets WCAG 2.2 AA contrast; 44px minimum touch targets.

## ⚠️ Before publishing — verification required

Content follows the v3 brief. Placeholder/unverified facts are tagged in the UI:

- **`[VERIFY]`** (amber tag) — confirm before launch: the 4%→16% renewal result
  (methodology, period, permission), ISO 27001 / SOC 2 artifacts, encryption standards,
  regulatory scope (DPDP, TRAI), supported-language matrix, shipped vs. API integrations,
  the 14-day timeline claim, pricing, and the API code sample.
- **`[PERMISSION]`** (blue tag) — customer approval needed: named logos
  (Panasonic, Rupeek, Zolve, Quick Heal, Atlantic Overseas, Univariety, Flowstack)
  and the Quick Heal case-study attribution. Sector placeholders shown until then.
- **`[LEGAL REVIEW]`** (purple tag) — DPDP / TRAI wording.

No unverified customer results, savings, throughput, latency, or ROI figures are stated.
The site never uses "RBI compliant", "regulator cleared", or "bank-grade".

Full checklist mirrors the content brief's "Content verification checklist".
