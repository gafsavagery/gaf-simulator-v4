// ── SESSION START ──────────────────────────────────────────────────────
async function startSession() {
  S.msgs=[]; S.phTimings={}; S.phIdx=0; S.phase='ph_rapport';
  S.wordCounts={you:0,them:0}; S.checkpoints={}; S.flags=[];
  S.paused=false; S.pausedAt=null; S.totalPaused=0;
  S.sessStart=Date.now(); S.phStart=Date.now();
  S.transcriptAnalysis=null; S.drillBrief=null;

  // V3.4 — Block drill mode entry
  // S.drillStartPhaseIdx and S.drillEndPhaseIdx are set by setup.js block selection
  // Defaults: full call = 0 and PHASES.length-1
  if (S.drillStartPhaseIdx == null) S.drillStartPhaseIdx = 0;
  if (S.drillEndPhaseIdx == null) S.drillEndPhaseIdx = PHASES.length - 1;

  // Jump to drill start phase
  S.phIdx = S.drillStartPhaseIdx;
  S.phase = PHASES[S.phIdx].id;

  // Build drill brief only if starting mid-call (not from phase 1)
  if (S.drillStartPhaseIdx > 0) {
    await buildDrillBrief(S.drillStartPhaseIdx);
  }

  if (S.mode === 'replay') {
    await analyzeTranscript();
  } else {
    const avData = AVATARS[S.avatar];
    S.pName = avData.names[Math.floor(Math.random()*avData.names.length)];
    S.pBio = avData.bios[Math.floor(Math.random()*avData.bios.length)];
    document.getElementById('replayBanner').style.display = 'none';
  }

  showScreen('roleplay');
  buildPhaseList();
  updatePhaseUI();
  document.getElementById('pName').textContent = S.pName;
  document.getElementById('pMeta').textContent = S.pBio?.substring(0,70)+'…';

  // Set type badge
  if (S.prospectType) {
    const tb = document.getElementById('typeBadge');
    tb.textContent = S.prospectType+'-Type';
    tb.className = 'type-badge ' + S.prospectType.toLowerCase();
  }

  // Render drill brief card if present
  renderDrillBriefCard();

  document.getElementById('flagList').innerHTML = '<div class="flag info">Call started — open framework panel 🎧</div>';
  S.timerInt = setInterval(tickTimers, 1000);
  toggleQF(true);

  showLoader('Getting prospect in character...');
  try {
    const r = await callProspect('__OPEN__');
    hideLoader();
    appendMsg('prospect', r);
    if (S.voiceOn) speakProspect(r);
  } catch(e) {
    hideLoader();
    showToast('API error: '+((e.message||'').substring(0,60)));
    console.error('Full API error:', e);
  }
}

// ── DRILL BRIEF (V3.4 — scaled length, visible card) ───────────────────
async function buildDrillBrief(startPhaseIdx) {
  if (startPhaseIdx === 0) return; // No context needed for fresh start

  const av = AVATARS[S.avatar];
  if (!av) return;

  // Pre-pick name and bio so the brief uses real values
  if (!S.pName) S.pName = av.names[Math.floor(Math.random()*av.names.length)];
  if (!S.pBio) S.pBio = av.bios[Math.floor(Math.random()*av.bios.length)];

  // Scale brief detail based on how far into the call we're starting
  // Phase 5+ start → richer brief, Phase 1-2 start → light brief
  let detailLevel = 'short';     // ~150 words
  if (startPhaseIdx >= 4) detailLevel = 'medium';   // ~300 words
  if (startPhaseIdx >= 6) detailLevel = 'long';     // ~500 words
  if (startPhaseIdx >= 10) detailLevel = 'extensive'; // ~700 words

  const detailGuide = {
    short:    '4-6 sentences. Cover goal, current state, timeframe.',
    medium:   '8-12 sentences. Cover goal, current state, timeframe, the limiting beliefs that surfaced, the external excuses they used, the internal admissions they conceded to.',
    long:     '14-18 sentences. Cover everything in the medium brief PLUS: the core fear that was uncovered, how the fear was reframed, what specific costs they admitted the fear caused them, and the emotional temperature throughout — when they got quiet, when they pushed back, when they conceded.',
    extensive:'20-25 sentences. Cover everything in the long brief PLUS: the 2.0 identity they visualized, the future-paced identity they committed to, the pre-pitch teardown, what they said their ideal program would look like, and the pitch they heard. Include specific phrases they used and emotional moments verbatim.'
  };

  const prompt = `You are building context for a sales training drill. The salesperson is drilling Phase ${startPhaseIdx+1}: "${PHASES[startPhaseIdx].name}" of a multi-phase sales call.

Prospect name: ${S.pName}
Prospect type: ${S.prospectType}-Type
Avatar: ${av.full_name}
Bio: ${S.pBio}

Generate a realistic brief of what would have happened in Phases 1-${startPhaseIdx} of this call. ${detailGuide[detailLevel]}

Make the brief specific and vivid — use actual numbers, specific people they mentioned, real phrases they would have used. This brief will be visible to the salesperson so they know what they're picking up from.

Return ONLY a JSON object:
{
"brief": "<detailed narrative summary per the length guide above>",
"prospect_goal": "<their specific stated goal>",
"goal_clarity": "<what their goal actually means to them in concrete terms>",
"timeframe": "<specific duration, e.g. '3 years' not 'a while'>",
"limiting_belief": "<their core limiting belief in their own words>",
"external_excuses": ["<excuse 1>", "<excuse 2>"],
"internal_admissions": ["<internal thing they admitted>", "<another>"],
"emotional_moments": "<key vulnerability revealed, with specifics>",
"core_fear": "<the fear that was uncovered (or empty if not yet reached)>",
"current_state_phrase": "<a specific phrase the prospect used about their current state>"
}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,messages:[{role:'user',content:prompt}]})
    });
    const data = await resp.json();
    S.drillBrief = JSON.parse(data.content[0].text.replace(/```json|```/g,'').trim());
  } catch(e) {
    console.error('Drill brief generation failed:', e);
    S.drillBrief = null;
  }
}

// ── RENDER DRILL BRIEF CARD (V3.4) ────────────────────────────────────
function renderDrillBriefCard() {
  const card = document.getElementById('drillBriefCard');
  if (!card) return;
  if (!S.drillBrief || S.drillStartPhaseIdx === 0) {
    card.style.display = 'none';
    return;
  }
  const b = S.drillBrief;
  const pickup = PHASES[S.drillStartPhaseIdx]?.name || 'this phase';
  const through = PHASES[S.drillEndPhaseIdx]?.name || '';
  const range = S.drillEndPhaseIdx > S.drillStartPhaseIdx
    ? `Phase ${S.drillStartPhaseIdx+1} (${pickup}) → Phase ${S.drillEndPhaseIdx+1} (${through})`
    : `Phase ${S.drillStartPhaseIdx+1}: ${pickup}`;

  card.innerHTML = `
    <div class="drill-brief-hdr">
      <div class="drill-brief-title">📋 DRILL BRIEF — what's already happened on this call</div>
      <button class="drill-brief-toggle" onclick="toggleDrillBrief()">[hide]</button>
    </div>
    <div class="drill-brief-body" id="drillBriefBody">
      <div class="db-section">
        <span class="db-label">PROSPECT:</span> ${S.pName} (${S.prospectType}-Type) — ${S.pBio||''}
      </div>
      ${b.prospect_goal ? `<div class="db-section"><span class="db-label">GOAL:</span> ${b.prospect_goal}${b.goal_clarity ? ' — '+b.goal_clarity : ''}</div>` : ''}
      ${b.current_state_phrase ? `<div class="db-section"><span class="db-label">CURRENT STATE:</span> "${b.current_state_phrase}"</div>` : ''}
      ${b.timeframe ? `<div class="db-section"><span class="db-label">TIMEFRAME:</span> ${b.timeframe}</div>` : ''}
      ${b.limiting_belief ? `<div class="db-section"><span class="db-label">LIMITING BELIEF:</span> ${b.limiting_belief}</div>` : ''}
      ${(b.external_excuses||[]).length ? `<div class="db-section"><span class="db-label">EXCUSES THEY USED:</span> ${b.external_excuses.join(' · ')}</div>` : ''}
      ${(b.internal_admissions||[]).length ? `<div class="db-section"><span class="db-label">INTERNAL ADMISSIONS:</span> ${b.internal_admissions.join(' · ')}</div>` : ''}
      ${b.core_fear ? `<div class="db-section"><span class="db-label">CORE FEAR (if reached):</span> ${b.core_fear}</div>` : ''}
      ${b.emotional_moments ? `<div class="db-section"><span class="db-label">EMOTIONAL TEMPERATURE:</span> ${b.emotional_moments}</div>` : ''}
      <div class="db-section db-summary">${b.brief}</div>
      <div class="db-section db-pickup"><span class="db-label">YOU'RE DRILLING:</span> ${range}</div>
    </div>`;
  card.style.display = 'block';
}

function toggleDrillBrief() {
  const body = document.getElementById('drillBriefBody');
  const btn = document.querySelector('.drill-brief-toggle');
  if (!body) return;
  if (body.style.display === 'none') {
    body.style.display = 'block';
    if (btn) btn.textContent = '[hide]';
  } else {
    body.style.display = 'none';
    if (btn) btn.textContent = '[show]';
  }
}

async function analyzeTranscript() {
  showLoader('Analyzing your real call — extracting full prospect psychology...');
  const prompt = `You are an elite sales coach analyzing a real sales call transcript to recreate the prospect for training.

TRANSCRIPT:
${S.transcriptText.substring(0, 8000)}

Extract everything needed to recreate this prospect authentically. Return ONLY valid JSON:
{
"prospect_name": "<first name>",
"prospect_type": "A or B",
"avatar_guess": "founder|operator|reinvention|cultural|athlete",
"prospect_situation": "<3 sentences about their situation>",
"stated_goal": "<what they said they want>",
"goal_clarity": "<what their goal actually means to them>",
"timeframe": "<how long they've been stuck>",
"limiting_beliefs": ["<belief 1>", "<belief 2>", "<belief 3>"],
"external_excuses_used": ["<excuse 1>", "<excuse 2>"],
"internal_admissions": ["<internal thing they said>"],
"core_fear": "<their deepest fear, named specifically>",
"performance_routine": "<how they present themselves vs who they actually are>",
"objections_raised": ["<objection 1>", "<objection 2>"],
"where_it_went_wrong": "<specific moment the call broke down>",
"what_was_missed": "<what the salesperson should have done differently>",
"coaching_focus": "<the single most important thing to fix this time>",
"emotional_drivers": "<what they really want underneath the surface goal>",
"verbal_tells": "<specific phrases they use when nervous/defensive/open>"
}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1200,messages:[{role:'user',content:prompt}]})
    });
    const data = await resp.json();
    S.transcriptAnalysis = JSON.parse(data.content[0].text.replace(/```json|```/g,'').trim());
    S.avatar = S.transcriptAnalysis.avatar_guess || 'founder';
    if (!AVATARS[S.avatar]) S.avatar = 'founder';
    S.pName = S.transcriptAnalysis.prospect_name || AVATARS[S.avatar].names[0];
    S.pBio = S.transcriptAnalysis.prospect_situation || AVATARS[S.avatar].bios[0];
    S.prospectType = S.transcriptAnalysis.prospect_type || 'B';
    if (S.replayDifficulty === 'harder') S.prospectType = 'A';
    const banner = document.getElementById('replayBanner');
    banner.style.display = 'flex';
    document.getElementById('replayInfo').textContent = `Coaching focus: ${S.transcriptAnalysis.coaching_focus?.substring(0,80)||'—'}`;
  } catch(e) {
    S.avatar = 'founder';
    S.pName = AVATARS.founder.names[0];
    S.pBio = AVATARS.founder.bios[0];
    S.prospectType = 'B';
    console.error('Transcript analysis failed:', e);
  }
  hideLoader();
}
