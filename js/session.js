// ── SESSION START ──────────────────────────────────────────────────────
async function startSession() {
  S.msgs=[]; S.phTimings={}; S.phIdx=0; S.phase='ph_rapport';
  S.wordCounts={you:0,them:0}; S.checkpoints={}; S.flags=[];
  S.paused=false; S.pausedAt=null; S.totalPaused=0;
  S.sessStart=Date.now(); S.phStart=Date.now();
  S.transcriptAnalysis=null; S.drillBrief=null;

  // Phase drill mode — jump to selected phase
  if (S.focus && S.focus !== 'full') {
    const focusIdx = PHASES.findIndex(p => p.id === S.focus);
    if (focusIdx >= 0) {
      S.phIdx = focusIdx;
      S.phase = PHASES[focusIdx].id;
      // Build drill brief for context
      await buildDrillBrief(focusIdx);
    }
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

async function buildDrillBrief(phaseIdx) {
  // Build fictional context for all phases before the drill phase
  if (phaseIdx === 0) return; // No context needed for first phase
  const av = AVATARS[S.avatar];
  if (!av) return;
  const prompt = `You are building context for a sales training drill.

The salesperson is drilling Phase ${phaseIdx+1}: "${PHASES[phaseIdx].name}" of an 18-phase sales call.

Prospect type: ${S.prospectType}-Type
Avatar: ${av.full_name}
Bio: ${av.bios[0]}

Generate a realistic brief of what would have happened in Phases 1-${phaseIdx} of this call. Keep it concise — 3-5 sentences covering:
- What goal they stated (be specific)
- What current situation they described  
- What timeframe they gave
- What limiting beliefs/external excuses they showed
- What internal ownership they took (if any)
- Key emotional moments or vulnerabilities revealed

Return ONLY a JSON object:
{
  "brief": "<3-5 sentence summary of prior call context>",
  "prospect_goal": "<their specific stated goal>",
  "goal_clarity": "<what freedom/success means to them specifically>",
  "timeframe": "<specific duration>",
  "limiting_belief": "<their core limiting belief>",
  "external_excuses": ["<excuse 1>", "<excuse 2>"],
  "internal_admissions": ["<internal thing they admitted>"],
  "emotional_moments": "<key vulnerability revealed>"
}`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,messages:[{role:'user',content:prompt}]})
    });
    const data = await resp.json();
    S.drillBrief = JSON.parse(data.content[0].text.replace(/```json|```/g,'').trim());
  } catch(e) {
    console.error('Drill brief generation failed:', e);
    S.drillBrief = null;
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
    if (S.replayDifficulty === 'harder') S.prospectType = 'A'; // Make harder = A-type resistance
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
