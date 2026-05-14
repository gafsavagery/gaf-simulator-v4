# GAF Sales Simulator v4

Private sales training simulator built on the Itai 18-phase sales framework with Tristan Steckler coaching voice.

## Setup

Open `index.html` in a browser, or deploy to GitHub Pages and visit the URL.

You need:
- **Anthropic API key** — required (get at console.anthropic.com)
- **ElevenLabs API key** — optional, enables prospect voice (get at elevenlabs.io)

Both keys are stored locally in your browser if you check "Remember in this browser."

## Features

- 18-phase Itai sales framework
- A-Type and B-Type prospect behavior engine
- Real call upload — full psychology extraction and replay
- Question Framework panel (Anytime / Situational / Pin) per phase
- Tristan Steckler coaching voice per phase
- Traffic light checkpoints (Clarity group + Leverage Built group)
- Live flags auto-detected from conversation
- Drill mode with pre-loaded context for any phase
- ElevenLabs voice — prospect speaks with emotional tone variation
- Mic input via Web Speech API (Chrome only)
- Full session debrief with Tristan-style coaching notes

## File Structure

```
gaf-simulator-v2/
├── index.html          — HTML screens only
├── styles.css          — All styles
├── js/
│   ├── data.js         — PHASES (18), AVATARS, TYPE_BEHAVIOR
│   ├── state.js        — S state object
│   ├── setup.js        — Setup screen, key handlers, form logic
│   ├── voice.js        — ElevenLabs TTS + Web Speech mic
│   ├── session.js      — Session start, drill brief, transcript analysis
│   ├── phase.js        — Phase list, QF panel, advance phase
│   ├── prospect.js     — buildSysPrompt, callProspect
│   ├── intel.js        — Checkpoints, live flags, metrics
│   ├── scoring.js      — callScoring, endSession
│   └── debrief.js      — buildDebrief, saveSession
└── README.md
```

## Updating

To update any file: navigate to it on GitHub, click the pencil icon, edit, commit.

To add a new phase or modify coaching: edit `js/data.js` — the PHASES array is the source of truth for all phase content, question frameworks, and Tristan notes.

## Voice Notes

Voice requires an ElevenLabs API key. The prospect's emotional state is detected from their message and mapped to ElevenLabs voice parameters — defensive responses sound different from vulnerable ones.

Mic input uses Chrome's Web Speech API. Works in Chrome desktop only — not Safari, not Firefox.
