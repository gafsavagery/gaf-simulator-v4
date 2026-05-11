// ── DEBRIEF ────────────────────────────────────────────────────────────
function gc(v) { return v>=75?'g':v>=50?'o':'r'; }
function buildDebrief(s) {
  saveSession(s);
  const tot=Math.floor((Date.now()-S.sessStart)/1000);
  const typeLabel = S.prospectType ? S.prospectType+'-Type' : '';
  document.getElementById('dbMeta').textContent=`${S.pName} · ${AVATARS[S.avatar]?.full_name||S.avatar} · ${typeLabel} · ${fmt(tot)}${S.mode==='replay'?' · REPLAY':''}`;
  const sc=s.scores||{};
  document.getElementById('scoreGrid').innerHTML=[
    {l:'Overall',v:sc.overall,sub:'Weighted overall'},
    {l:'Trust Built',v:sc.trust_built,sub:'How much they opened up'},
    {l:'Belief Shifted',v:sc.belief_shift,sub:'Cause theory changed'},
    {l:'Ego Managed',v:sc.ego_managed,sub:'Resistance handled'},
    {l:'Talk Ratio',v:sc.talk_ratio_score,sub:'Prospect talked enough'},
    {l:'Timeframe',v:sc.timeframe_locked,sub:'Specific duration locked'},
    {l:'Ownership',v:sc.internal_ownership,sub:'Went internal'},
    {l:'Urgency Built',v:sc.urgency_built,sub:'Cost of staying stuck felt'},
    {l:'Tonality',v:sc.tonality_score,sub:'Right tone right time'},
  ].map(c=>`<div class="sc"><div class="sc-lbl">${c.l}</div><div class="sc-val ${gc(c.v||0)}">${c.v||'—'}</div><div class="sc-sub">${c.sub}</div></div>`).join('');

  const tot2=S.wordCounts.you+S.wordCounts.them;
  const yp=tot2?Math.round((S.wordCounts.you/tot2)*100):50; const tp=100-yp;
  const dtr=document.getElementById('dbTR');
  dtr.querySelector('.talk-you').style.flex=yp; dtr.querySelector('.talk-them').style.flex=tp;
  document.getElementById('dbTRLbl').innerHTML=`<span style="color:var(--amber)">You ${yp}%</span><span style="color:var(--blue)">Them ${tp}%</span>`;
  document.getElementById('dbTRNote').textContent=yp>58?'⚠ You talked too much — aim for 60%+ them':yp<38?'✓ Excellent — they did the talking':'✓ Solid ratio';

  const pg=s.phase_grades||{};
  document.getElementById('phBreakdown').innerHTML=PHASES.map(p=>{
    const g=pg[p.id]||{grade:'—',what_happened:'Not reached',what_was_missing:''};
    const t=S.phTimings[p.id]?fmt(Math.round(S.phTimings[p.id])):'—';
    const col={A:'var(--green)',B:'var(--green)',C:'var(--amber)',D:'var(--red)',F:'var(--red)','—':'var(--t3)'}[g.grade]||'var(--t3)';
    const pct=S.phTimings[p.id]?Math.min(100,(S.phTimings[p.id]/300)*100):0;
    return `<div class="ph-row">
      <div class="ph-row-top"><div class="ph-rname">${p.name}</div><div class="ph-rtime">${t}</div><div class="ph-rbar"><div class="ph-rfill" style="width:${pct}%"></div></div><div class="ph-rgrade" style="color:${col}">${g.grade}</div></div>
      ${g.what_happened&&g.what_happened!=='Not reached'?`<div class="ph-rdesc">${g.what_happened}</div>`:''}
      ${g.what_was_missing?`<div class="ph-rmiss">Missing: ${g.what_was_missing}</div>`:''}
    </div>`;
  }).join('');

  const pt=s.prospect_tracking||{};
  const tf=s.tristan_feedback||{};
  document.getElementById('ptBlock').innerHTML=`<div class="fb-block"><div class="fb-hdr"><div class="fb-dot" style="background:var(--blue)"></div><div class="fb-hdr-txt">What Was Going On Inside Their Head</div></div><div class="fb-body">
    <div class="fb-item neu"><strong>Stated Goal</strong>${pt.stated_goal||'Never surfaced'}</div>
    <div class="fb-item neu"><strong>Timeframe Given</strong>${pt.timeframe_given||'Never locked'}</div>
    <div class="fb-item ${pt.fear_named?'pos':'neg'}"><strong>Core Fear Named?</strong>${pt.fear_named?'YES — ':'NO — '}${pt.fear_quote||''}</div>
    <div class="fb-item ${pt.commitment_made?'pos':'neg'}"><strong>Commitment Made?</strong>${pt.commitment_made?'YES':'NO'}</div>
    ${(pt.external_excuses||[]).length?`<div class="fb-item neg"><strong>External Excuses Used</strong>${pt.external_excuses.join('<br>')}</div>`:''}
    ${(pt.internal_admissions||[]).length?`<div class="fb-item pos"><strong>Internal Admissions</strong>${pt.internal_admissions.join('<br>')}</div>`:''}
    ${(pt.buying_signals||[]).length?`<div class="fb-item pos"><strong>Buying Signals</strong>${pt.buying_signals.join('<br>')}</div>`:''}
    ${(pt.resistance_moments||[]).length?`<div class="fb-item neg"><strong>Resistance Moments</strong>${pt.resistance_moments.join('<br>')}</div>`:''}
  </div></div>`;

  const recs=s.improvement_recs||[];
  const km=s.key_moments||{};
  document.getElementById('fbBody').innerHTML=
    (s.summary?`<div class="fb-item neu"><strong>Summary</strong>${s.summary}</div>`:'')
    +`<div class="fb-block" style="margin-top:8px"><div class="fb-hdr"><div class="fb-dot" style="background:var(--teal)"></div><div class="fb-hdr-txt">Tristan's Coaching Notes</div></div><div class="fb-body">
      ${tf.pace_assessment?`<div class="fb-item neu"><strong>Pace</strong>${tf.pace_assessment}</div>`:''}
      ${tf.timeframe_quality?`<div class="fb-item neu"><strong>Timeframe Quality</strong>${tf.timeframe_quality}</div>`:''}
      ${tf.question_efficiency?`<div class="fb-item neu"><strong>Question Efficiency</strong>${tf.question_efficiency}</div>`:''}
      ${tf.tone_assessment?`<div class="fb-item neu"><strong>Tone</strong>${tf.tone_assessment}</div>`:''}
      ${tf.biggest_coaching_point?`<div class="fb-item neg"><strong>Biggest Coaching Point</strong>${tf.biggest_coaching_point}</div>`:''}
    </div></div>`;

  document.getElementById('lineList').innerHTML=
    (s.play_by_play?.length?`<div class="fb-block"><div class="fb-hdr"><div class="fb-dot" style="background:var(--purple)"></div><div class="fb-hdr-txt">Play-by-Play Game Tape</div></div><div class="fb-body">${s.play_by_play.map(p=>`<div class="fb-item ${p.rating==='good'?'pos':p.rating==='bad'?'neg':'neu'}"><strong>MSG ${p.msg_range} · ${(p.phase||'').replace('ph_','').replace('_',' ').toUpperCase()}</strong>${p.what_happened}<div style="font-size:10px;color:var(--t3);margin-top:3px">Impact: ${p.impact}</div><div style="font-size:10px;margin-top:3px;color:${p.rating==='good'?'var(--green)':p.rating==='bad'?'var(--red)':'var(--blue)'}">Coach: ${p.coach_note}</div></div>`).join('')}</div></div>`:'')
    +(km.best_question||km.worst_question?`<div class="fb-block"><div class="fb-hdr"><div class="fb-dot" style="background:var(--amber)"></div><div class="fb-hdr-txt">Key Moments</div></div><div class="fb-body">
      ${km.best_question?`<div class="fb-item pos"><strong>✓ Best Question</strong>"${km.best_question.quote}"<div style="font-size:10px;color:var(--green);margin-top:4px">${km.best_question.why}</div></div>`:''}
      ${km.worst_question?`<div class="fb-item neg"><strong>✗ Worst Question</strong>"${km.worst_question.quote}"<div style="font-size:10px;color:var(--red);margin-top:3px">${km.worst_question.why}</div><div style="font-size:10px;color:var(--amber);margin-top:3px">Better: "${km.worst_question.better_version}"</div></div>`:''}
      ${km.missed_opportunity?`<div class="fb-item neg"><strong>⚠ Missed Opportunity</strong>${km.missed_opportunity}</div>`:''}
    </div></div>`:'')
    +(recs.length?`<div class="fb-block"><div class="fb-hdr"><div class="fb-dot" style="background:var(--red)"></div><div class="fb-hdr-txt">Top ${recs.length} Improvements — Priority Order</div></div><div class="fb-body">${recs.map((r,i)=>`<div class="fb-item neg"><strong>#${r.priority||i+1} · ${r.area||''}</strong>${r.problem}<div style="font-size:10px;color:var(--amber);margin-top:3px">Drill: ${r.drill}</div><div style="font-size:10px;color:var(--teal);margin-top:2px">Better: "${r.better_question}"</div></div>`).join('')}</div></div>`:'');
}

// ── SAVE SESSION ───────────────────────────────────────────────────────
function saveSession(scores) {
  try {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const timeStr = `${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
    const focusStr = S.focus === 'full' ? 'FullCall' : S.focus.replace('ph_','').replace('_','');
    const filename = `GAF_${dateStr}_${timeStr}_${S.pName}_${S.prospectType}Type_${focusStr}.json`;
    const sessionData = {
      meta:{date:new Date().toISOString(),prospect_name:S.pName,prospect_bio:S.pBio,avatar:S.avatar,prospect_type:S.prospectType,source:S.src,focus:S.focus,mode:S.mode,total_time_secs:Math.floor((Date.now()-S.sessStart)/1000)},
      scores:scores?.scores||{},phase_grades:scores?.phase_grades||{},phase_timings:S.phTimings||{},
      checkpoints:S.checkpoints||{},flags:S.flags||{},
      prospect_tracking:scores?.prospect_tracking||{},
      improvement_recs:scores?.improvement_recs||[],
      play_by_play:scores?.play_by_play||[],
      key_moments:scores?.key_moments||{},
      transcript:S.msgs.map((m,i)=>({msg_num:i+1,role:m.role,phase:m.phase||'',content:m.content})),
    };
    const blob = new Blob([JSON.stringify(sessionData,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
    showToast('Session saved — '+filename);
  } catch(e) { console.error('Save error:', e); showToast('Save failed'); }
}

// ── SCORING ────────────────────────────────────────────────────────────
async function callScoring() {
  const transcript = S.msgs.map((m,i)=>`[${i+1}][${m.role.toUpperCase()}][${m.phase}]\n${m.content}`).join('\n\n');
  const timings = Object.entries(S.phTimings).map(([p,s])=>`${p}:${Math.round(s)}s`).join(', ');
  const av = AVATARS[S.avatar] || {};
  const typeB = TYPE_BEHAVIOR[S.prospectType] || TYPE_BEHAVIOR.B;

  const replayCtx = S.mode==='replay' && S.transcriptAnalysis
    ? `\nREPLAY SESSION: Original issue: ${S.transcriptAnalysis.where_it_went_wrong}. Coaching focus: ${S.transcriptAnalysis.coaching_focus}. Note specifically whether they fixed the original issue.`
    : '';

  const prompt = `You are an elite sales coach trained on the Itai/Tristan framework coaching style. Analyze this training session like game tape — frame by frame, brutally specific, always actionable.

FRAMEWORK: 18-phase Itai Sales Process
Phase flow: Rapport → End Outcome → Current Not Serving → Timeframe → Limiting Beliefs → Internal/External → Core Fear → Reframe Fear → Costs of Fear → Future Consequence → Visualize 2.0 → Future Pace 2.0 → Pre-Pitch Teardown → Ideal Program → Pitch → Certainty → Objections/Close

PROSPECT:
Avatar: ${av.full_name} | ${S.pBio}
Type: ${S.prospectType}-Type — ${typeB.description}
Focus: ${S.focus==='full'?'Full Call':'Drill: '+S.focus}
Phase timings: ${timings}
${replayCtx}

TRISTAN'S KEY COACHING PRINCIPLES (grade against these):
1. Slow the pace — do they mirror the prospect or rush?
2. Pin the timeframe — is a specific duration on record?
3. Attack the belief not the person — was tone correct?
4. Know what you're getting from each question before asking
5. Don't enable scattered thinking — did they pin vague answers?
6. Fight or flight recovery — if prospect porcupined, was it handled?
7. Efficiency — are they asking 3 questions to get somewhere a 1 question would?
8. Energy and tone — too high energy reduces leverage

CHECKPOINTS REACHED: ${Object.entries(S.checkpoints).map(([k,v])=>`${k}:${v}`).join(', ')||'none'}

TRANSCRIPT:
${transcript}

Return ONLY valid JSON:
{
  "scores":{"overall":<0-100>,"trust_built":<0-100>,"belief_shift":<0-100>,"ego_managed":<0-100>,"talk_ratio_score":<0-100>,"timeframe_locked":<0-100>,"internal_ownership":<0-100>,"urgency_built":<0-100>,"tonality_score":<0-100>},
  "prospect_tracking":{"stated_goal":"<what they said>","timeframe_given":"<specific or vague>","external_excuses":["<excuse 1>"],"internal_admissions":["<admission 1>"],"fear_named":<true/false>,"fear_quote":"<exact quote or never reached>","commitment_made":<true/false>,"buying_signals":["<signal 1>"],"resistance_moments":["<moment 1>"]},
  "phase_grades":{"ph_rapport":{"grade":"A/B/C/D/F","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_end_outcome":{"grade":"A/B/C/D/F","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_current_not_serving":{"grade":"A/B/C/D/F","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_timeframe":{"grade":"A/B/C/D/F","what_happened":"<2 sentences>","timeframe_specific":<true/false>,"what_was_missing":"<specific>"},"ph_limiting_beliefs":{"grade":"A/B/C/D/F","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_internal_external":{"grade":"A/B/C/D/F","what_happened":"<2 sentences>","reached_internal":<true/false>,"what_was_missing":"<specific>"},"ph_core_fear":{"grade":"A/B/C/D/F/—","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_reframe_fear":{"grade":"A/B/C/D/F/—","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_costs_fear":{"grade":"A/B/C/D/F/—","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_future_consequence":{"grade":"A/B/C/D/F/—","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_visualize_identity":{"grade":"A/B/C/D/F/—","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_future_pace_identity":{"grade":"A/B/C/D/F/—","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_pitch":{"grade":"A/B/C/D/F/—","what_happened":"<2 sentences>","what_was_missing":"<specific>"},"ph_objections":{"grade":"A/B/C/D/F/—","what_happened":"<2 sentences>","what_was_missing":"<specific>"}},
  "tristan_feedback":{"pace_assessment":"<was pace appropriate>","timeframe_quality":"<was timeframe specific>","question_efficiency":"<were questions efficient or redundant>","tone_assessment":"<was tone right for type>","fight_or_flight_moments":["<moment if any>"],"biggest_coaching_point":"<the one thing Tristan would drill hardest>"},
  "play_by_play":[{"msg_range":"1-3","phase":"<phase>","what_happened":"<what salesperson did>","impact":"<how it affected prospect>","rating":"good/neutral/bad","coach_note":"<specific Tristan-style note>"}],
  "key_moments":{"best_question":{"quote":"<exact>","why":"<why it worked>"},"worst_question":{"quote":"<exact>","why":"<why it failed>","better_version":"<exact replacement>"},"missed_opportunity":"<specific moment + what to do instead>"},
  "improvement_recs":[{"priority":1,"area":"<phase or skill>","problem":"<what went wrong>","drill":"<specific practice>","better_question":"<exact replacement>"},{"priority":2,"area":"<phase or skill>","problem":"<what went wrong>","drill":"<specific practice>","better_question":"<exact replacement>"},{"priority":3,"area":"<phase or skill>","problem":"<what went wrong>","drill":"<specific practice>","better_question":"<exact replacement>"}],
  "summary":"<3-4 sentences. Brutally honest. What one thing would have most changed this call?>"
}`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514', max_tokens:4000,
      system:'You are an elite sales coach trained on the Tristan Steckler and Itai framework style. Grade like game tape. Return valid JSON only.',
      messages:[{role:'user',content:prompt}]})
  });
  if (!resp.ok) throw new Error(await resp.text());
  const data = await resp.json();
  return JSON.parse(data.content[0].text.replace(/```json|```/g,'').trim());
}

// ── END SESSION ────────────────────────────────────────────────────────
async function endSession() {
  S.phTimings[S.phase]=(Date.now()-S.phStart)/1000;
  clearInterval(S.timerInt);
  if(S.msgs.length<4){showToast('Have a longer conversation before scoring');return;}
  showLoader('Analyzing your performance...');
  try {
    const scores = await callScoring();
    window.__lastScores = scores;
    hideLoader(); buildDebrief(scores); showScreen('debrief');
  } catch(e) { hideLoader(); showToast('Scoring failed — see console'); console.error(e); }
}

// ── CHECKPOINTS — TRAFFIC LIGHT SYSTEM ────────────────────────────────
function detectCheckpoints(userMsg, prospectReply) {
  const u = userMsg.toLowerCase();
  const p = prospectReply.toLowerCase();

  // CLARITY checkpoints
  if (!S.checkpoints['ck-goal'] && (p.includes('want') || p.includes('goal') || p.includes('freedom') || p.includes('time') || p.includes('money'))) {
    setCheckpoint('ck-goal', 'green', 'Goal stated');
  }
  if (!S.checkpoints['ck-clarity'] && (u.includes('what does') || u.includes('what do you mean') || u.includes('specifically') || u.includes('help me understand'))) {
    setCheckpoint('ck-clarity', 'green', 'Clarity gotten ✓');
  }
  if (!S.checkpoints['ck-timeframe'] && (p.includes('year') || p.includes('month') || p.includes('years') || p.match(/\d+\s*(year|month)/))) {
    setCheckpoint('ck-timeframe', 'green', 'Timeframe locked ✓');
  } else if (!S.checkpoints['ck-timeframe'] && S.phIdx >= 3 && (u.includes('how long') || u.includes('when did'))) {
    setCheckpoint('ck-timeframe', 'yellow', 'Timeframe — verify specific');
  }
  if (!S.checkpoints['ck-decisionmaker'] && (u.includes('partner') || u.includes('spouse') || u.includes('anyone else') || u.includes('decision'))) {
    setCheckpoint('ck-decisionmaker', 'green', 'Decision maker clarified ✓');
  }
  if (!S.checkpoints['ck-priorinvest'] && (u.includes('invested') || u.includes('tried') || u.includes('program') || u.includes('coach'))) {
    setCheckpoint('ck-priorinvest', 'green', 'Prior investment explored ✓');
  }

  // LEVERAGE checkpoints
  if (!S.checkpoints['ck-internal'] && (p.includes('afraid') || p.includes('fear') || p.includes('hesitant') || p.includes('voices') || p.includes('my own') || p.includes('myself'))) {
    setCheckpoint('ck-internal', 'green', 'Went internal ✓');
  } else if (!S.checkpoints['ck-internal'] && S.phIdx >= 5 && (p.includes('time') || p.includes('money') || p.includes('kids') || p.includes('economy'))) {
    setCheckpoint('ck-internal', 'red', 'Still externalizing — push harder');
    addFlag('bad', '🔴 Stuck external — need ownership shift');
  }
  if (!S.checkpoints['ck-fear'] && (u.includes('what does that fear') || u.includes('how come') || u.includes('why would it fail') || u.includes('what are those voices'))) {
    setCheckpoint('ck-fear', 'green', 'Core fear being clarified ✓');
  }
  if (!S.checkpoints['ck-cost'] && (u.includes('cost you') || u.includes('what has') || u.includes('what did that') || u.includes('how much'))) {
    setCheckpoint('ck-cost', 'green', 'Personal cost explored ✓');
    if (p.includes('relation') || p.includes('family') || p.includes('kids') || p.includes('partner') || p.includes('wife') || p.includes('husband')) {
      addFlag('good', '✓ Personal cost reached — pin it');
    }
  }
  if (!S.checkpoints['ck-futurepace'] && (u.includes('3 years') || u.includes('what does') && (u.includes('look like') || u.includes('feel like')) || u.includes('future'))) {
    setCheckpoint('ck-futurepace', 'green', 'Future paced ✓');
  }
  if (!S.checkpoints['ck-identity'] && (u.includes('version of you') || u.includes('2.0') || u.includes('that version') || u.includes('who you become'))) {
    setCheckpoint('ck-identity', 'green', '2.0 identity seeded ✓');
  }
  if (!S.checkpoints['ck-commitment'] && (u.includes('whose choice') || u.includes('committing') || (p.includes('my choice') || p.includes('mine')))) {
    setCheckpoint('ck-commitment', 'green', 'Commitment locked ✓');
    addFlag('good', '🔥 Commitment locked — close incoming');
  }
}

function setCheckpoint(id, color, flagText) {
  S.checkpoints[id] = color;
  const el = document.getElementById(id);
  if (el) {
    el.className = 'tag ' + color;
    if (flagText && color !== 'red') addFlag('good', flagText);
    else if (flagText && color === 'red') addFlag('bad', flagText);
  }
}

// ── LIVE FLAGS ─────────────────────────────────────────────────────────
function analyzeLiveFlags(role, content) {
  const u = role === 'user';
  const cl = content.toLowerCase();

  if (u) {
    // Bad patterns
    if ((cl.match(/\?/g)||[]).length > 2) addFlag('bad', '🔴 Multiple questions — pick ONE');
    if (cl.includes('our program') || cl.includes('my program') || cl.includes('the program')) addFlag('warn', '⚠ Program mention — stay in discovery');
    if (cl.includes('great question') || cl.includes('good question')) addFlag('warn', '⚠ Don\'t compliment answers — peer frame');
    if (cl.includes('i think') || cl.includes('i believe') || cl.includes('you should')) addFlag('warn', '⚠ Giving opinions — ask don\'t tell');
    if (cl.includes('the real problem') || cl.includes('the issue is') || cl.includes('what\'s really happening')) addFlag('bad', '🔴 Stating cause — ask "have you considered" instead');
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 80) addFlag('warn', '⚠ Long message — you\'re lecturing, not listening');
  } else {
    // Prospect signals
    if (cl.includes('shit') || cl.includes('fuck') || cl.includes('wow') || cl.includes('damn')) addFlag('good', '🔥 Emotional breakthrough — go deeper');
    if (cl.includes("that's exactly") || cl.includes('never thought') || cl.includes('never looked at')) addFlag('good', '✓ Belief shift happening — anchor it');
    if (cl.includes('what does that look like') || cl.includes('tell me more') || cl.includes('how does that work')) addFlag('good', '🎯 Buying signal — they\'re leaning in');
    if (cl.includes("i don't know") && S.phIdx >= 4) addFlag('info', '💡 "I don\'t know" = open door — incept now');
    if (cl.includes('my wife') || cl.includes('my husband') || cl.includes('my partner') && S.prospectType === 'B') addFlag('warn', '⚠ B-Type spouse shield appearing — pre-handle now');
    if (cl.includes('i\'ve tried') || cl.includes('already done') || cl.includes('been in') && S.prospectType === 'A') addFlag('info', '💡 A-Type expertise armor — doubt nail incoming');
    if ((cl.includes('lol') || cl.includes('haha') || cl.includes('i mean it\'s fine')) && S.phIdx >= 2) addFlag('warn', '⚠ Softening serious thing — don\'t let it slide');
    if (cl.includes('afraid') || cl.includes('scared') || cl.includes('terrified') || cl.includes('worried')) addFlag('good', '✓ Fear surfaced — clarify the mechanism');
  }
}

function addFlag(type, text) {
  if (S.flags.slice(-6).includes(text)) return;
  S.flags.push(text);
  const list = document.getElementById('flagList');
  if (list.querySelector('.flag.info')?.textContent === 'Call started — open framework panel 🎧') list.innerHTML='';
  const div = document.createElement('div');
  div.className = 'flag ' + type;
  div.textContent = text;
  list.insertBefore(div, list.firstChild);
  while(list.children.length > 6) list.removeChild(list.lastChild);
}

// ── METRICS ────────────────────────────────────────────────────────────
function updateTalkRatio() {
  const tot=S.wordCounts.you+S.wordCounts.them; if(!tot) return;
  const yp=Math.round((S.wordCounts.you/tot)*100); const tp=100-yp;
  document.getElementById('tYou').style.flex=yp;
  document.getElementById('tThem').style.flex=tp;
  document.getElementById('tYouPct').textContent='You '+yp+'%';
  document.getElementById('tThemPct').textContent='Them '+tp+'%';
  if(yp>58&&S.msgs.length>6) addFlag('warn','You at '+yp+'% — let them talk more');
}
function updateMetrics() {
  const pm=S.msgs.filter(m=>m.role==='prospect').map(m=>m.content.toLowerCase()).join(' ');
  const ym=S.msgs.filter(m=>m.role==='user').map(m=>m.content.toLowerCase()).join(' ');
  const mc=S.msgs.length;
  let trust=Math.min(90,10+mc*3);
  if(pm.includes('honestly')||pm.includes('to be real')||pm.includes('yeah')) trust+=8;
  if(pm.includes('afraid')||pm.includes('scared')) trust+=12;
  let belief=Math.min(90,mc*2);
  if(pm.includes('that makes sense')||pm.includes('i can see')||pm.includes('never thought')) belief+=18;
  if(pm.includes('my choice')||pm.includes('i know')) belief+=15;
  let ego=Math.min(90,8+mc*2);
  if(ym.includes('have you considered')) ego+=12;
  if(pm.includes("you're right")||pm.includes('good point')) ego+=14;
  if(pm.includes("i've tried everything")) ego-=5;
  let urgency=Math.min(90,mc*1.5);
  if(pm.includes('tired')||pm.includes('frustrated')||pm.includes('been a while')) urgency+=15;
  if(S.checkpoints['ck-cost']==='green') urgency+=20;
  setM('Trust',trust,'fTrust','mTrust');
  setM('Belief',belief,'fBelief','mBelief');
  setM('Ego',ego,'fEgo','mEgo');
  setM('Urgency',urgency,'fUrgency','mUrgency');
}
function setM(n,v,fid,vid) { document.getElementById(fid).style.width=v+'%'; document.getElementById(vid).textContent=v+'%'; }

// ── TIMER ──────────────────────────────────────────────────────────────
function tickTimers() {
  if (S.paused) return;
  const tot = Math.floor((Date.now()-S.sessStart-S.totalPaused)/1000);
  const ph = Math.floor((Date.now()-S.phStart-S.totalPaused)/1000);
  document.getElementById('timerDisp').textContent = fmt(tot);
  document.getElementById('phTimerDisp').textContent = fmt(ph);
}
function fmt(s) { return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
function togglePause() {
  const btn = document.getElementById('pauseBtn');
  if (!S.paused) { S.paused=true; S.pausedAt=Date.now(); btn.textContent='▶ Resume'; btn.classList.add('paused'); }
  else { S.totalPaused+=Date.now()-S.pausedAt; S.paused=false; btn.textContent='⏸ Pause'; btn.classList.remove('paused'); }
}

// ── INTEL ──────────────────────────────────────────────────────────────
function toggleIntel() {
  S.intelVisible=!S.intelVisible;
  document.getElementById('intelPanel').classList.toggle('hidden',!S.intelVisible);
  document.getElementById('intelHideBtn').textContent=S.intelVisible?'‹':'›';
}

// ── MESSAGES ───────────────────────────────────────────────────────────
function appendMsg(role, content) {
  const c = document.getElementById('chatMsgs');
  const ts = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const initials = role==='prospect' ? S.pName[0] : 'YOU';
  const div = document.createElement('div');
  div.className = 'msg '+role;
  div.innerHTML = `<div class="msg-av">${initials}</div><div><div class="msg-bubble">${content}</div><div class="msg-meta">${ts} · ${PHASES[S.phIdx]?.name||''}</div></div>`;
  c.insertBefore(div, document.getElementById('typing'));
  c.scrollTop = c.scrollHeight;
  const words = content.split(/\s+/).length;
  if (role==='user') S.wordCounts.you+=words; else S.wordCounts.them+=words;
  updateTalkRatio();
  S.msgs.push({role, content, phase:S.phase, ts:Date.now()});
  if (S.msgs.length%3===0) updateMetrics();
  analyzeLiveFlags(role, content);
}
function setTyping(v) { document.getElementById('typing').classList.toggle('on',v); document.getElementById('chatMsgs').scrollTop=9999; }

async function sendMsg() {
  const inp = document.getElementById('chatInput');
  const txt = inp.value.trim(); if (!txt) return;
  inp.value=''; autoResize(inp);
  document.getElementById('sendBtn').disabled=true;
  appendMsg('user',txt); setTyping(true);
  try {
    const r = await callProspect(txt);
    setTyping(false); appendMsg('prospect',r); detectCheckpoints(txt,r);
    // Speak prospect response if voice is on
    if (S.voiceOn) speakProspect(r);
  } catch(e) { setTyping(false); showToast('API error'); console.error(e); }
  document.getElementById('sendBtn').disabled=false;
  document.getElementById('chatInput').focus();
}
function handleKey(e) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();} }
function autoResize(el) { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,110)+'px'; }

// ── PROSPECT AI ────────────────────────────────────────────────────────
function buildSysPrompt() {
  const av = AVATARS[S.avatar];
  if (!av) return 'You are a prospect on a sales call.';

  const typeB = TYPE_BEHAVIOR[S.prospectType] || TYPE_BEHAVIOR.B;
  const srcDesc = {
    'inbound-ad':'You saw content and booked yourself. Mild curiosity, no urgency.',
    'referral':'Someone you respect referred you. Moderate trust going in.',
    'outbound':'You were reached out to cold. Slightly skeptical.',
    'event':'You heard this person speak. Some credibility already established.',
    'cold-approach':'You were approached in person. More guarded than usual.',
    'replay':'Recreated from a real sales call. Stay in character.'
  }[S.src] || '';

  // Build drill context if in drill mode
  let drillContext = '';
  if (S.focus && S.focus !== 'full' && S.drillBrief) {
    drillContext = `\n\nDRILL MODE — CONTEXT FROM EARLIER IN THE CALL (phases 1-${S.phIdx} already happened):
${S.drillBrief.brief}

Your stated goal: ${S.drillBrief.prospect_goal}
What ${S.drillBrief.prospect_goal} means to you: ${S.drillBrief.goal_clarity}
Timeframe established: ${S.drillBrief.timeframe}
Your limiting belief: ${S.drillBrief.limiting_belief}
Excuses you gave: ${(S.drillBrief.external_excuses||[]).join(', ')}
What you admitted internally: ${(S.drillBrief.internal_admissions||[]).join(', ')}
Key emotional moment: ${S.drillBrief.emotional_moments}

Behave as if this prior context actually happened. The salesperson is now drilling Phase ${S.phIdx+1}: "${PHASES[S.phIdx].name}".`;
  }

  // Replay context
  let replayContext = '';
  if (S.mode==='replay' && S.transcriptAnalysis) {
    const t = S.transcriptAnalysis;
    replayContext = `\n\nREPLAY CONTEXT — You are recreated from a real call:
Your stated goal: ${t.stated_goal}
Your core fear: ${t.core_fear}
Your limiting beliefs: ${(t.limiting_beliefs||[]).join(', ')}
External excuses you used: ${(t.external_excuses_used||[]).join(', ')}
What you admitted internally: ${(t.internal_admissions||[]).join(', ')}
Your performance routine: ${t.performance_routine}
Objections you raised: ${(t.objections_raised||[]).join(', ')}
Coaching focus this session: ${t.coaching_focus}
${S.replayDifficulty==='harder'?'MAKE THIS HARDER: Be more resistant than the original call. Push back more on questions. Keep armor up longer.':''}`;
  }

  return `You are ${S.pName}. You are a real person on a sales discovery call. NOT an AI assistant. Never break character.

WHO YOU ARE: You ${S.pBio}.
HOW YOU GOT HERE: ${srcDesc}

PROSPECT TYPE — ${S.prospectType}-Type:
${typeB.description}

OPENING ENERGY: ${typeB.opening}
HOW YOU RESIST: ${typeB.resistance}
WHAT SELLS YOU: ${typeB.what_sells}
YOUR FEAR SIGNAL: ${typeB.fear_signal}
YOUR BUYING SIGNAL: ${typeB.buying_signal}

YOUR REAL CHALLENGES (embody these — do not list them):
${av.challenges.map(c=>`- ${c}`).join('\n')}

WHAT YOU CURRENTLY BELIEVE IS THE PROBLEM (you think these are right — they're not):
${av.false_beliefs.map(b=>`- ${b}`).join('\n')}

PERFORMANCE ROUTINE:
You have a performance you run with everyone. You present a polished, composed version of yourself until someone asks the right question or demonstrates they actually understand your world. Only then do you drop the routine and get real.

${S.prospectType==='A' ? 
`A-TYPE SPECIFIC BEHAVIORS:
- Start with some form of status signal or frame control in the first response
- Give short, clipped answers to generic questions
- When challenged intellectually — engage but push back
- Your real fear is bigger than you show — but it's WELL HIDDEN behind competence
- Use past attempts and expertise as armor: "I've already done [X]" "I know about [Y]"
- You porcupine if condescended to — but open up fast if they prove genuine sharpness` 
: 
`B-TYPE SPECIFIC BEHAVIORS:
- Warm and talkative but scattered — jump between topics
- Externalize naturally: bring up spouse, kids, money, timing without being asked
- Add softening language to serious things: "it's fine," "no big deal," "lol"
- When pushed on ownership — deflect back to external before slowly admitting internal
- You need emotional pain to move — logical arguments alone won't work
- People-please during the call, then ghost if you're not emotionally sold`}

RESPONSE RULES:
1. Keep responses to 3-6 sentences max. Real prospects don't monologue.
2. Don't volunteer depth — make them work for it with good questions.
3. React to generic questions with surface answers.
4. React to specific, insightful questions by opening up one layer deeper.
5. NEVER say you're an AI or break character.
6. Current phase: ${PHASES[S.phIdx]?.name}. Behave appropriately for this phase.
${drillContext}${replayContext}`;
}

async function callProspect(userMsg) {
  const msgs = [];
  for (const m of S.msgs) msgs.push({role:m.role==='prospect'?'assistant':'user', content:m.content});
  if (userMsg==='__OPEN__') {
    const openLine = S.mode==='replay' && S.transcriptAnalysis
      ? `[CALL STARTING - REPLAY] Give your opening as ${S.pName}. Stay in character from the real call. ${S.prospectType==='A'?'Be slightly direct or distracted.':'Be warm but slightly scattered.'}`
      : `[CALL STARTING] Give your opening as ${S.pName}. One natural line — how you\'d start a Zoom. ${S.prospectType==='A'?'Be direct, possibly brief or slightly dominant.':'Be warm and slightly chatty.'}`;
    
    // If drill mode with context — start mid-call
    if (S.focus && S.focus !== 'full' && S.drillBrief && S.phIdx > 0) {
      const drillOpen = `[DRILL MODE - Phase ${S.phIdx+1}: ${PHASES[S.phIdx].name}] 
The earlier parts of this call already happened. Give your current state as ${S.pName} — respond as if you\'re picking up where the call left off. You\'ve already talked about your goal (${S.drillBrief?.prospect_goal||'their goal'}), the timeframe (${S.drillBrief?.timeframe||'established'}), and some of your limiting beliefs. You\'re now at the ${PHASES[S.phIdx].name} phase. React naturally to being at this point in the conversation.`;
      msgs.push({role:'user', content:drillOpen});
    } else {
      msgs.push({role:'user', content:openLine});
    }
  } else {
    msgs.push({role:'user', content:userMsg});
  }

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':S.apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514', max_tokens:400, system:buildSysPrompt(), messages:msgs})
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error('API error: ' + errText.substring(0,200));
  }
  const data = await resp.json();
  if (!data.content || !data.content[0]) throw new Error('No content in response');
  return data.content[0].text;
}

// ── PHASE LIST ─────────────────────────────────────────────────────────
function buildPhaseList() {
  document.getElementById('phList').innerHTML = PHASES.map((p,i) => `
    <div class="ph-item" data-idx="${i}" onclick="jumpPhase(${i})">
      <div class="ph-dot"></div>
      <div class="ph-name">${p.name}</div>
    </div>`).join('');
}
function updatePhaseUI() {
  const p = PHASES[S.phIdx];
  if (!p) return;
  document.querySelectorAll('.ph-item').forEach((item,i) => {
    item.classList.remove('active','done');
    if (i < S.phIdx) item.classList.add('done');
    if (i === S.phIdx) item.classList.add('active');
  });
  document.getElementById('phBadge').textContent = p.name;
  document.getElementById('phHintName').textContent = p.name;
  document.getElementById('phHintDesc').textContent = p.hint;
  updateQF();
}
function advPhase() {
  S.phTimings[S.phase] = (Date.now()-S.phStart)/1000;
  if (S.focus && S.focus !== 'full') { endSession(); return; }
  if (S.phIdx < PHASES.length-1) {
    S.phIdx++; S.phase=PHASES[S.phIdx].id; S.phStart=Date.now();
    document.getElementById('phTimerDisp').textContent='00:00';
    updatePhaseUI();
    const d=document.createElement('div'); d.className='sys-msg'; d.textContent='→ '+PHASES[S.phIdx].name;
    document.getElementById('chatMsgs').insertBefore(d, document.getElementById('typing'));
    document.getElementById('chatMsgs').scrollTop=9999;
    toggleQF(true);
  }
}
function jumpPhase(idx) {
  if (idx <= S.phIdx) return;
  S.phTimings[S.phase]=(Date.now()-S.phStart)/1000;
  S.phIdx=idx; S.phase=PHASES[idx].id; S.phStart=Date.now();
  updatePhaseUI();
}

// ── QUESTION FRAMEWORK PANEL ───────────────────────────────────────────
function toggleQF(force) {
  if (force!==undefined) S.qfOpen=force;
  else S.qfOpen=!S.qfOpen;
  document.getElementById('qfWrap').classList.toggle('open', S.qfOpen);
  document.getElementById('qfFab').classList.toggle('off', !S.qfOpen);
}

function updateQF() {
  const p = PHASES[S.phIdx];
  if (!p) return;
  document.getElementById('qfLbl').textContent = p.name + ' — Question Framework';

  const qs = p.questions;
  const html = `
    <div class="qf-phase-note">
      <div class="qf-phase-note-lbl">Phase Goal</div>
      <p>${p.goal}</p>
    </div>
    <div class="qf-cats">
      <div class="qf-cat anytime">
        <div class="qf-cat-lbl">Anytime Questions</div>
        <div class="qf-cat-def">Context gathering. No time decay — can be asked at any point in the call.</div>
        <div class="qf-q-list">${(qs.anytime||[]).map(q=>`<div class="qf-q">${q}</div>`).join('')}</div>
      </div>
      <div class="qf-cat situational">
        <div class="qf-cat-lbl">Situational Questions</div>
        <div class="qf-cat-def">Reactive. 30-second half-life. Pull on threads they just dropped.</div>
        <div class="qf-q-list">${(qs.situational||[]).map(q=>`<div class="qf-q">${q}</div>`).join('')}</div>
      </div>
      <div class="qf-cat pin">
        <div class="qf-cat-lbl">Pin Questions</div>
        <div class="qf-cat-def">Leverage application. Take what was surfaced and apply pressure — cost or projection.</div>
        <div class="qf-q-list">${(qs.pin||[]).map(q=>`<div class="qf-q">${q}</div>`).join('')}${(qs.pin||[]).length===0?'<div class="qf-q" style="color:var(--t3);font-style:normal">No pins this phase — focus on collection</div>':''}</div>
      </div>
    </div>
    <div class="qf-tristan">
      <div class="qf-tristan-lbl">Tristan's Coaching</div>
      <p>${p.tristan_note}</p>
    </div>
    <div class="qf-danger">
      <div class="qf-danger-lbl">🚫 Auto-Fail Triggers</div>
      <p>${p.auto_fail.join(' · ')}</p>
    </div>`;

  document.getElementById('qfContent').innerHTML = html;
}

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

// ── ELEVENLABS KEY ─────────────────────────────────────────────────────
function onElKey(val) {
  S.elKey = val.trim();
  const badge = document.getElementById('elKeyBadge');
  if (!val) { badge.className='api-badge'; badge.textContent='Not set'; }
  else if (val.startsWith('sk_') || val.length > 20) {
    badge.className='api-badge ok'; badge.textContent='Key set ✓';
    if (document.getElementById('elRememberCb').checked) localStorage.setItem('gaf_el_key', val.trim());
  } else { badge.className='api-badge bad'; badge.textContent='Looks wrong'; }
}
function onElRemember(checked) {
  localStorage.setItem('gaf_el_remember', checked);
  if (checked && S.elKey) {
    localStorage.setItem('gaf_el_key', S.elKey);
    document.getElementById('elSavedNote').style.display='inline';
  } else if (!checked) {
    localStorage.removeItem('gaf_el_key');
    document.getElementById('elSavedNote').style.display='none';
  }
}

// ── VOICE ENGINE ───────────────────────────────────────────────────────
function toggleVoice() {
  if (!S.elKey) { showToast('Add your ElevenLabs API key first'); return; }
  S.voiceOn = !S.voiceOn;
  const toggle = document.getElementById('voiceToggle');
  const lbl = document.getElementById('voiceToggleLbl');
  toggle.classList.toggle('on', S.voiceOn);
  lbl.textContent = S.voiceOn ? 'Voice On' : 'Voice Off';
  if (!S.voiceOn && S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; setSpeaking(false); }
}

function onVoiceChange(val) {
  S.voiceId = val;
  if (S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; setSpeaking(false); }
}

function setSpeaking(val) {
  S.isSpeaking = val;
  document.getElementById('speakingIndicator').classList.toggle('on', val);
}

// Detect emotional state from prospect message to tune ElevenLabs parameters
function detectProspectEmotion(text) {
  const t = text.toLowerCase();
  // Angry / defensive
  if (t.includes('blood is boiling') || t.includes('not okay') || t.includes('stop') || t.includes('that\'s a personal') || t.includes('offense')) {
    return { stability: 0.25, similarity_boost: 0.85, style: 0.7, use_speaker_boost: true };
  }
  // Emotional breakthrough / crying
  if (t.includes('...') || t.match(/i (mean|just|don't know)/) && t.length > 120 || t.includes('honestly') && t.includes('never')) {
    return { stability: 0.35, similarity_boost: 0.9, style: 0.6, use_speaker_boost: true };
  }
  // Short clipped A-type
  if (text.split(' ').length < 15 && (t.includes('yeah') || t.includes('okay') || t.includes('sure') || t.includes('got it'))) {
    return { stability: 0.75, similarity_boost: 0.7, style: 0.2, use_speaker_boost: false };
  }
  // Opening up / vulnerable
  if (t.includes('honestly') || t.includes('to be real') || t.includes('i\'ve never') || t.includes('i guess') && text.length > 80) {
    return { stability: 0.45, similarity_boost: 0.88, style: 0.5, use_speaker_boost: true };
  }
  // Laughing / light
  if (t.includes('lol') || t.includes('haha') || t.includes('funny') || t.includes('ha ')) {
    return { stability: 0.55, similarity_boost: 0.75, style: 0.55, use_speaker_boost: false };
  }
  // Skeptical / guarded
  if (t.includes('i\'ve tried') || t.includes('already done') || t.includes('i mean') && text.split(' ').length < 30) {
    return { stability: 0.7, similarity_boost: 0.72, style: 0.25, use_speaker_boost: false };
  }
  // Default natural conversation
  return { stability: 0.52, similarity_boost: 0.82, style: 0.38, use_speaker_boost: true };
}

async function speakProspect(text) {
  if (!S.voiceOn || !S.elKey || !text) return;
  // Stop any current audio
  if (S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; }
  setSpeaking(true);
  const emotion = detectProspectEmotion(text);
  // Clean text — remove any stage directions in brackets
  const cleanText = text.replace(/\[.*?\]/g, '').trim();
  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${S.voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': S.elKey
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: emotion.stability,
          similarity_boost: emotion.similarity_boost,
          style: emotion.style,
          use_speaker_boost: emotion.use_speaker_boost
        }
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      console.error('ElevenLabs error:', err);
      setSpeaking(false);
      if (resp.status === 401) showToast('ElevenLabs key invalid');
      else if (resp.status === 429) showToast('ElevenLabs rate limit — slow down');
      return;
    }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    S.currentAudio = audio;
    audio.onended = () => { setSpeaking(false); S.currentAudio = null; URL.revokeObjectURL(url); };
    audio.onerror = () => { setSpeaking(false); S.currentAudio = null; };
    await audio.play();
  } catch(e) {
    setSpeaking(false);
    console.error('Voice error:', e);
  }
}

// ── MIC / SPEECH RECOGNITION ───────────────────────────────────────────
function toggleMic() {
  if (S.isSpeaking) {
    // Stop prospect speaking first
    if (S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; setSpeaking(false); }
    return;
  }
  if (S.isListening) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Speech recognition not supported — use Chrome');
    return;
  }
  if (S.recognition) S.recognition.abort();
  const recog = new SpeechRecognition();
  recog.continuous = false;
  recog.interimResults = true;
  recog.lang = 'en-US';
  S.recognition = recog;
  S.isListening = true;
  const btn = document.getElementById('micBtn');
  btn.classList.add('listening');
  btn.title = 'Click to stop';
  const input = document.getElementById('chatInput');
  let finalTranscript = '';
  recog.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    input.value = finalTranscript + interim;
    autoResize(input);
  };
  recog.onend = () => {
    S.isListening = false;
    btn.classList.remove('listening');
    btn.title = 'Click to speak';
    S.recognition = null;
    // Auto-send if we got something
    if (finalTranscript.trim()) {
      setTimeout(sendMsg, 150);
    }
  };
  recog.onerror = (e) => {
    S.isListening = false;
    btn.classList.remove('listening');
    S.recognition = null;
    if (e.error !== 'aborted') showToast('Mic error: ' + e.error);
  };
  recog.start();
}

function stopListening() {
  if (S.recognition) {
    S.recognition.stop();
  }
  S.isListening = false;
  document.getElementById('micBtn').classList.remove('listening');
}
function setMode(mode) {
  S.mode = mode;
  document.getElementById('mode-fresh').classList.toggle('active', mode==='fresh');
  document.getElementById('mode-replay').classList.toggle('active', mode==='replay');
  document.getElementById('fresh-options').style.display = mode==='fresh' ? 'contents' : 'none';
  document.getElementById('replay-options').style.display = mode==='replay' ? 'contents' : 'none';
  document.getElementById('s-mode').textContent = mode==='fresh'?'Fresh':'Replay';
  if (mode==='replay') { S.avatar=null; S.src='replay'; S.prospectType=null; }
  checkReady();
}
function selAv(el) {
  document.querySelectorAll('.av-card').forEach(c => { c.classList.remove('sel'); c.style.removeProperty('--ac'); c.style.removeProperty('--ad'); });
  el.classList.add('sel');
  el.style.setProperty('--ac', el.dataset.ac);
  el.style.setProperty('--ad', el.dataset.ad);
  S.avatar = el.dataset.av;
  document.getElementById('s-av').textContent = AVATARS[S.avatar]?.full_name || S.avatar;
  checkReady();
}
function selPill(el, type) {
  el.closest('.pill-row').querySelectorAll('.pill').forEach(p => p.classList.remove('sel'));
  el.classList.add('sel');
  S[type] = el.dataset[type];
  const srcLabels = {'inbound-ad':'Inbound Ad','referral':'Referral','outbound':'Outbound / DM','event':'Event / Podcast','cold-approach':'In-Person Cold'};
  document.getElementById('s-src').textContent = srcLabels[S.src] || S.src;
  checkReady();
}
function selType(el, type) {
  document.querySelectorAll('.type-btn').forEach(b => { b.className='type-btn'; });
  el.classList.add('sel-'+type.toLowerCase());
  S.prospectType = type;
  document.getElementById('s-type').textContent = type+'-Type';
  checkReady();
}
function selReplayType(el, type) {
  document.querySelectorAll('#replayTypeRow .type-btn').forEach(b => b.className='type-btn');
  el.classList.add(type==='same'?'sel-b':'sel-a');
  S.replayDifficulty = type;
  checkReady();
}
function selFocus(el) {
  document.querySelectorAll('.focus-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  S.focus = el.dataset.focus;
  document.getElementById('s-focus').textContent = S.focus==='full' ? 'Full Call' : el.querySelector('.fl').textContent.trim();
  checkReady();
}
function checkReady() {
  const keyOk = S.apiKey.startsWith('sk-ant-');
  let configOk = false;
  if (S.mode === 'fresh') {
    configOk = !!(S.avatar && S.src && S.prospectType);
  } else {
    configOk = !!(S.transcriptText);
  }
  const ready = keyOk && configOk;
  document.getElementById('cfgSummary').style.display = ready ? 'flex' : 'none';
  document.getElementById('startBtn').disabled = !ready;
}

// ── TRANSCRIPT UPLOAD ──────────────────────────────────────────────────
function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const zone = document.getElementById('uploadZone');
  zone.classList.add('upload-loaded');
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    S.transcriptText = text;
    const preview = document.getElementById('uploadPreview');
    const content = document.getElementById('previewContent');
    preview.style.display = 'block';
    const words = text.split(/\s+/).length;
    content.innerHTML = `<strong>File:</strong> ${file.name} · ${words} words<br><br>${text.substring(0,400).replace(/</g,'&lt;').replace(/>/g,'&gt;')}${text.length>400?'...':''}`;
    zone.querySelector('.upload-title').textContent = '✓ ' + file.name + ' loaded';
    document.getElementById('replayTypeSec').style.display = 'block';
    checkReady();
  };
  reader.readAsText(file);
}
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('uploadZone');
  if (zone) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
    zone.addEventListener('drop', e => {
      e.preventDefault(); zone.classList.remove('drag');
      const file = e.dataTransfer.files[0];
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        document.getElementById('transcriptFile').files = dt.files;
        handleFileUpload(document.getElementById('transcriptFile'));
      }
    });
  }
});

// ── SCREENS ────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id==='debrief') document.getElementById(id).scrollTop = 0;
}
function showLoader(txt) { document.getElementById('loader-txt').textContent=txt; document.getElementById('loader').classList.add('on'); }
function hideLoader() { document.getElementById('loader').classList.remove('on'); }
function showToast(msg) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('on'); setTimeout(()=>t.classList.remove('on'),4000); }

// ── SETUP FUNCTIONS ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', initSetup);

function initSetup() {
  const grid = document.getElementById('avGrid');
  grid.innerHTML = '';
  Object.values(AVATARS).forEach(av => {
    const card = document.createElement('div');
    card.className = 'av-card';
    card.dataset.av = av.key;
    card.dataset.ac = av.accent_color;
    card.dataset.ad = av.accent_dim;
    card.onclick = function(){ selAv(this); };
    card.innerHTML = `<div class="av-icon">${av.icon}</div><div class="av-name">${av.full_name}</div><div class="av-sub">${av.sub}</div>`;
    grid.appendChild(card);
  });
  initKey();
}

function onKey(val) {
  S.apiKey = val.trim();
  const badge = document.getElementById('keyBadge');
  if (!val) { badge.className='api-badge'; badge.textContent='Not set'; }
  else if (val.startsWith('sk-ant-')) {
    badge.className='api-badge ok'; badge.textContent='Key set ✓';
    if (document.getElementById('rememberCb').checked) localStorage.setItem('gaf_key', val.trim());
  } else { badge.className='api-badge bad'; badge.textContent='Looks wrong'; }
  checkReady();
}
function onRemember(checked) {
  localStorage.setItem('gaf_remember', checked);
  if (checked && S.apiKey.startsWith('sk-ant-')) {
    localStorage.setItem('gaf_key', S.apiKey);
    document.getElementById('savedNote').style.display='inline';
  } else if (!checked) {
    localStorage.removeItem('gaf_key');
    document.getElementById('savedNote').style.display='none';
  }
}
function initKey() {
  const saved = localStorage.getItem('gaf_key');
  const remember = localStorage.getItem('gaf_remember') === 'true';
  if (saved && remember) {
    document.getElementById('keyInput').value = saved;
    document.getElementById('rememberCb').checked = true;
    document.getElementById('savedNote').style.display = 'inline';
    onKey(saved);
  }
  const elSaved = localStorage.getItem('gaf_el_key');
  const elRemember = localStorage.getItem('gaf_el_remember') === 'true';
  if (elSaved && elRemember) {
    document.getElementById('elKeyInput').value = elSaved;
    document.getElementById('elRememberCb').checked = true;
    document.getElementById('elSavedNote').style.display = 'inline';
    onElKey(elSaved);
  }
}

// ── ELEVENLABS KEY ─────────────────────────────────────────────────────
function onElKey(val) {
  S.elKey = val.trim();
  const badge = document.getElementById('elKeyBadge');
  if (!val) { badge.className='api-badge'; badge.textContent='Not set'; }
  else if (val.startsWith('sk_') || val.length > 20) {
    badge.className='api-badge ok'; badge.textContent='Key set ✓';
    if (document.getElementById('elRememberCb').checked) localStorage.setItem('gaf_el_key', val.trim());
  } else { badge.className='api-badge bad'; badge.textContent='Looks wrong'; }
}
function onElRemember(checked) {
  localStorage.setItem('gaf_el_remember', checked);
  if (checked && S.elKey) {
    localStorage.setItem('gaf_el_key', S.elKey);
    document.getElementById('elSavedNote').style.display='inline';
  } else if (!checked) {
    localStorage.removeItem('gaf_el_key');
    document.getElementById('elSavedNote').style.display='none';
  }
}

// ── STATE ──────────────────────────────────────────────────────────────
const S = {
  apiKey:'', elKey:'', avatar:null, src:null, prospectType:null, focus:'full',
  mode:'fresh', transcriptText:'', transcriptAnalysis:null,
  phIdx:0, phase:'ph_rapport', msgs:[], phTimings:{}, phStart:null, sessStart:null,
  timerInt:null, paused:false, pausedAt:null, totalPaused:0,
  wordCounts:{you:0,them:0}, checkpoints:{}, flags:[],
  pName:'', pBio:'', qfOpen:true, intelVisible:true,
  replayDifficulty:'same',
  drillBrief:null,
  // Voice
  voiceOn:false, voiceId:'21m00Tcm4TlvDq8ikWAM',
  isListening:false, isSpeaking:false,
  recognition:null, currentAudio:null
};

const PHASES = [
  {
    id:'ph_rapport', name:'Rapport + Intro', hint:'Read the room → Move A or B → Mini agenda → Transition Q',
    checkpoints_needed:['ck-goal'],
    goal:'Set the frame. Get agreement to structure. Zero program talk. Get prospect settled and talking.',
    tristan_note:'Read setup signals before the call starts. Late? Distracted? Bad environment? These tell you who you\'re dealing with. Slow your pace down — they mirror you. Come in calm.',
    questions:{
      anytime:['Where are you calling from?','How did you hear about us?','What\'s going on for you right now — what\'s the situation?'],
      situational:['You mentioned [X] — what do you mean by that exactly?','You seem [distracted/rushed] — is now actually a good time?'],
      pin:[]
    },
    auto_fail:['Mentioned program in rapport','Skipped mini agenda','Delivered agenda with excitement'],
    danger:'Never mention the program. Mini agenda word-for-word. Must get sounds fair.'
  },
  {
    id:'ph_end_outcome', name:'End Outcome — Clear Goal', hint:'What do they want → Get extreme clarity on what that word means',
    checkpoints_needed:['ck-goal','ck-clarity'],
    goal:'Get their end outcome in their words. Get extreme clarity on what freedom/flexibility/time/etc means to them specifically. These words mean different things to different people.',
    tristan_note:'Don\'t accept "more money" as a goal. Push through it — what\'s the real thing they\'re after? Get their words, not the buzzword. Clarity here makes everything downstream easier.',
    questions:{
      anytime:['In your opinion what\'s the biggest reason you\'re looking to make this change right now?','What does freedom actually mean to you — how do you define it?','What does [their word] mean for you specifically?'],
      situational:['You said [their word] — can you help me understand what that looks like for you day to day?','What would [their goal] actually change in your life if you had it?'],
      pin:['What have you been settling for instead of that?','If you got [their goal] — what does a Tuesday morning actually look like?']
    },
    auto_fail:['Accepted surface answer without clarifying','Moved forward without knowing what their goal actually means to them'],
    danger:'Do NOT accept buzzwords at face value. Clarity is everything here — it prevents wishy-washy answers in every phase that follows.'
  },
  {
    id:'ph_current_not_serving', name:'Current Not Serving', hint:'Where do they lack [their goal] → Why current situation isn\'t serving them',
    checkpoints_needed:['ck-clarity'],
    goal:'Understand why their current situation isn\'t giving them what they defined. Use their exact words from the previous phase. This widens the gap.',
    tristan_note:'Include their response in your question. If they said freedom means time with family — ask "where do you feel like you lack that ability to be present with your family?" Not a generic question.',
    questions:{
      anytime:['Where do you feel like you lack that [their definition of goal]?','What does your current situation not give you that you want?','What\'s missing right now that keeps you from [their goal]?'],
      situational:['You said [their exact words] — where specifically do you feel that most?','What are you actually trying to buy back with this change?'],
      pin:['What does it actually feel like knowing that\'s not there?','What has staying in that situation actually cost you?']
    },
    auto_fail:['Asked generic question instead of using their exact words','Moved to timeframe without understanding the gap'],
    danger:'Use THEIR words in your questions. Not yours. Their language creates resonance. Generic questions get generic answers.'
  },
  {
    id:'ph_timeframe', name:'Get Clear Timeframe', hint:'Positive or negative frame → Push for specific duration → No wishy-washy',
    checkpoints_needed:['ck-timeframe'],
    goal:'Get a specific time frame. Without it you can\'t challenge them. Longer timeframe = more urgency material. Push for specifics — not "a while" or "always."',
    tristan_note:'This is one of the most important parts. Pin the time. "How long is always?" Push for a number. 2 years vs 6 months changes everything. The timeframe exists because there\'s a limiting belief. No belief = no timeframe.',
    questions:{
      anytime:['How long have you been wanting [their goal]?','How long has it been this way for you?','When did you first feel like you lacked [their goal]?'],
      situational:['How long is "a while" — like 6 months or more like 3 years?','When did you first notice this pattern showing up?'],
      pin:['So [X years] of this — what has that actually added up to?','If you\'d addressed this [X] years ago — where would you be right now?']
    },
    auto_fail:['Accepted "a while" or "always" without pushing for specific','Moved to limiting beliefs without a clear timeframe on record'],
    danger:'Wishy-washy timeframe = weak challenge material later. Push every time. "Always" is not a timeframe — clarify it.'
  },
  {
    id:'ph_limiting_beliefs', name:'Mid-Discovery — Limiting Beliefs', hint:'Why hasn\'t it happened → Why still here → What\'s gotten in the way',
    checkpoints_needed:[],
    goal:'Surface why it hasn\'t changed despite the timeframe. Get them asking themselves the question you\'re asking. This is non-confrontational problem solving — you\'re figuring it out together.',
    tristan_note:'Don\'t accept the first answer. If they give you one reason — ask what else. Know what you\'re trying to get from every question before you ask it. Don\'t let them go on tangents that give you no ammo.',
    questions:{
      anytime:['Why hasn\'t it happened yet?','Why are you still in the same situation after [timeframe]?','How did you let it get to this point?','What\'s gotten in your way of changing that?'],
      situational:['You said [X reason] — and what else has been in the way?','Beyond the obvious stuff — what do you think is really going on?'],
      pin:['If [their excuse] wasn\'t there — would it actually be solved?','What would have to be true for this to have changed already?']
    },
    auto_fail:['Accepted first surface answer and moved on','Allowed tangent with no useful information'],
    danger:'This phase splits into External vs Internal. Don\'t rush it. Every excuse they give you is either external (invalid) or internal (gold).'
  },
  {
    id:'ph_internal_external', name:'Internal vs External', hint:'External excuses → Reframe each one → Get to internal ownership',
    checkpoints_needed:['ck-internal'],
    goal:'Move them from external blame (time/money/kids/economy) to internal ownership (fear/hesitation/voices in head/getting in own way). You cannot proceed without this. External = they won\'t buy.',
    tristan_note:'Attack the belief not the person. Tone is EVERYTHING. "What type of example are you setting?" with wrong tonality = fight or flight. Same question with genuine curiosity = they go deep. If they porcupine — call timeout: "Do you feel I want what\'s best for you?"',
    questions:{
      anytime:['Aside from [external excuse] — what do YOU feel has gotten in your way?','If [external factor] wasn\'t there — what\'s the thing that\'s really holding you back?','What role have you played in staying here?'],
      situational:['You said [external excuse] — and are there people in your exact same situation who\'ve gotten through it? What do you think made the difference?','When you\'re really honest with yourself — what is it that keeps you stuck?'],
      pin:['If you\'re being brutally honest — how much of this is actually external vs something inside you?','What would the most honest version of you say is really going on?']
    },
    auto_fail:['Accepted external excuse and moved on','Challenged in wrong tone and caused fight or flight','Moved forward without internal ownership'],
    danger:'B-Types: will externalize hard. Keep reframing until they crack. A-Types: will skip to internal fast but use expertise/past attempts as the block. Both need ownership before you can proceed.'
  },
  {
    id:'ph_core_fear', name:'Uncover the Core Fear', hint:'Get clarity on internal belief → How come → What have the voices told you → How so',
    checkpoints_needed:['ck-fear'],
    goal:'Get clarity on exactly what the fear is. This isn\'t good enough yet — "afraid of starting" tells you nothing. You need to know HOW the fear works in their specific mind.',
    tristan_note:'All objections come from fear. Every single one. The timeframe exists because fear is holding them back. Get into the mechanism — not just the label. "I\'m afraid of failing" → why would it fail → what specifically → now you have the real thing.',
    questions:{
      anytime:['How come?','What makes you say it\'s risky?','What have those voices in your head been telling you?','Why would it fail — specifically?'],
      situational:['You said [fear phrase] — what does that actually mean in practice? Like what do you imagine happening?','When that fear shows up — what does it actually say to you?'],
      pin:['That fear has been running for [timeframe] — what has it cost you to listen to it?','If that fear is wrong — what does that mean about the last [X years]?']
    },
    auto_fail:['Accepted "afraid of failing" without drilling into the mechanism','Moved to reframe without understanding the specific fear'],
    danger:'You cannot reframe a fear you don\'t understand. Get the specific. "Afraid of failing" is a category not a fear. The actual fear is underneath it.'
  },
  {
    id:'ph_reframe_fear', name:'Reframe the Fear', hint:'Feed doubt into the fear → Prove it\'s false → Don\'t challenge Level 1 ("I got comfortable")',
    checkpoints_needed:[],
    goal:'Feed doubt into the fear being incorrect. Prove the fear is a facade. Get them to question whether the fear is actually valid. Our job: make the fear itself the enemy — you and them vs the fear together.',
    tristan_note:'3 levels of fear response. Level 1 = "I got comfortable." Level 2 = procrastinate. Level 3 = why do you procrastinate? Always fear underneath. Don\'t challenge Level 1 — it\'s a surface mechanism. Dig to level 3. Then feed doubt into it.',
    questions:{
      anytime:['Has there been a time you did something for the first time that worked out? What does that tell you about the fear?','What if the fear is wrong — what does the evidence actually show?','The people who succeed despite this fear — what do you think they did differently?'],
      situational:['You said [fear] — and yet you\'ve done [evidence they gave]. How does that fit?','If I told you [reframe] — does that land or does it feel off?'],
      pin:['What if this fear has been the single biggest thing keeping you from [their goal] for [timeframe]?','Is the fear protecting you or imprisoning you — honestly?']
    },
    auto_fail:['Challenged Level 1 fear directly and got pushback','Stated reframe as fact instead of asking as question','Moved on without the prospect questioning their own fear'],
    danger:'Feed DOUBT into the fear — not a frontal challenge. The fear needs to feel like a lie to them, not like you\'re arguing with them.'
  },
  {
    id:'ph_costs_fear', name:'Costs of Fear', hint:'What has this fear cost → Look at last 2-3 years → Make fear the worst thing in the world to them',
    checkpoints_needed:['ck-cost'],
    goal:'Make "fear" the word that represents the worst thing in the world to them. Future pace the costs. Get them to calculate what staying in fear has actually cost — money, relationships, time, identity.',
    tristan_note:'Use future pacing. "Have them tell us" — my kids will grow older and I won\'t be there. What impact does that have on those around you? Don\'t tell them the cost. Make them calculate it themselves.',
    questions:{
      anytime:['What has this fear cost you over the last [timeframe]?','If we look at the last 2-3 years of allowing this fear to run — what has it actually taken from you?','What can\'t you do right now because of this fear?'],
      situational:['You said [personal cost] — can you help me understand what that actually means for you?','What\'s the one thing this fear has cost you that you can actually put a name on?'],
      pin:['How much has this fear already cost you in total — financially and personally?','If you keep listening to this fear for another [timeframe] — what does that add up to?']
    },
    auto_fail:['Told them the cost instead of asking them to calculate it','Stayed at business level and didn\'t get personal cost'],
    danger:'Personal cost must be reached. Business cost alone won\'t close. Get to relationships, identity, what they\'re missing with people they love.'
  },
  {
    id:'ph_future_consequence', name:'Future Consequence', hint:'Future pace the fear continuing → Have THEM tell you → What does that mean for those around you',
    checkpoints_needed:['ck-futurepace'],
    goal:'If fear continues — what does life actually look like? Not what you say. What THEY say. They paint the dark future picture themselves. This becomes unbearable.',
    tristan_note:'"You said frustrating — what makes you say it will be frustrating?" Make them go there. Future pace their specific fears. "How will that impact those around you?" Make them feel the consequence before it happens.',
    questions:{
      anytime:['If nothing changes — what does your life actually look like in 3 years?','What does that mean for those around you — your partner / kids / team?','What standard are you setting for yourself if this continues?'],
      situational:['You said [their fear word] — paint me the picture. What does that actually look like?','What does this mean for [specific person/thing they mentioned]?'],
      pin:['Is that a life you\'re willing to accept?','Whose choice is it whether that continues?']
    },
    auto_fail:['Painted the dark future yourself instead of asking them to','Didn\'t connect consequence to specific people or things they mentioned','Got generic "things will be bad" instead of specific picture'],
    danger:'THEY must paint this picture. Not you. The moment you say "you\'ll be stuck" it becomes a threat. When THEY say it — it becomes a commitment to change.'
  },
  {
    id:'ph_visualize_identity', name:'Visualize 2.0 Identity', hint:'The version of you that has achieved [XYZ] → How do they operate → Do they still have the limiting belief',
    checkpoints_needed:['ck-identity'],
    goal:'Get them to visualize the 2.0 version of themselves who has achieved the goal. How do they operate? What\'s different about their belief system? Do they still have the limiting belief? This seeds identity shift.',
    tristan_note:'4 areas: actions, belief system, do they still operate with limiting belief, what kind of standard of excellence are they made of. Get them to describe the person, not just the outcome.',
    questions:{
      anytime:['The version of you that has achieved [their goal] — how do they operate differently from how you operate today?','What\'s different about their belief system?','Do they still have [their limiting belief] — or has it changed?'],
      situational:['You said [limiting belief] — does that version of you still have that? What does that tell you?','How does that version of you make decisions differently?'],
      pin:['What would it mean to actually become that person — not just have the result?','Is that version of you actually out of reach or is it closer than you think?']
    },
    auto_fail:['Only discussed the outcome not the identity behind it','Didn\'t connect the 2.0 identity to removing their specific limiting belief'],
    danger:'This is about who they BECOME not what they GET. Push past the outcome into the identity. The identity is what you actually sell.'
  },
  {
    id:'ph_future_pace_identity', name:'Future Pace 2.0 Identity', hint:'When you let go of limitation → How would you view yourself → How would others view you',
    checkpoints_needed:['ck-commitment'],
    goal:'Future pace the 2.0 identity fully. How do they see themselves? How do others see them? What does it mean to be that person? Get them to commit: this is who I\'m choosing to be.',
    tristan_note:'5 questions: how would you view yourself differently, how would others view you, what does it mean to say "I\'m a 2.0 version", what kind of standard of excellence, how does that impact ability to trust yourself in decisions. Get commitment.',
    questions:{
      anytime:['When you let go of [their limitation] — how would you view yourself differently?','How would the people around you see you differently?','What would it mean to be able to say you\'re that version of yourself?'],
      situational:['You described [2.0 identity] — what does it feel like from the inside?','What decisions would you make differently if you were already that person?'],
      pin:['So what do we need to do to make sure [limitation] doesn\'t control us again?','Whose choice is it whether you become that person?']
    },
    auto_fail:['Got generic "I\'d feel great" instead of specific picture','Didn\'t lock commitment before moving to pre-pitch'],
    danger:'The commitment question "whose choice is it" must land here. Without ownership the pitch is just a presentation. With ownership it\'s a decision they\'re making about themselves.'
  },
  {
    id:'ph_pre_pitch_teardown', name:'Pre-Pitch Teardown', hint:'How do we make sure together → What will we do differently → Ensure limitation doesn\'t control again',
    checkpoints_needed:[],
    goal:'Bridge from identity work to the program. How will we make sure the limitation doesn\'t take back control? Get them thinking about what they actually need — this primes them to hear the pitch.',
    tristan_note:'This is a small but important bridge. You\'re moving from "you\'ve accepted the problem" to "now let\'s talk about what solving it actually looks like." Sets up their ideal program answer.',
    questions:{
      anytime:['How can we make sure together that [their limitation] doesn\'t control us going forward?','What would actually have to be different this time vs everything you\'ve already tried?','What would you need to have in place to make sure you don\'t fall back into the same pattern?'],
      situational:['Given everything we\'ve talked about — what do you feel you actually need?','What would make this time different from the last time you tried to change this?'],
      pin:[]
    },
    auto_fail:['Skipped straight to pitch without this bridge'],
    danger:'Short phase. 2-3 exchanges. But don\'t skip it — it frames the pitch as solving a specific problem rather than selling a product.'
  },
  {
    id:'ph_ideal_program', name:'Pre-Pitch — Ideal Program', hint:'What would ideal program look like → If we could get you to goal + out of pain → What would that need to include',
    checkpoints_needed:[],
    goal:'Get them to describe their ideal program before you pitch. Whatever they say = your pitch language. You\'re confirming what they need, then mirroring it back in the pitch.',
    tristan_note:'Ask them what their perfect program looks like. If we could get you to [goal] and get you out of [pain] — what would the ideal solution look like? If you worked with us you\'d feel 100% certain it\'d get you there. Confirm before pitching.',
    questions:{
      anytime:['If we could get you to [their goal] and get you out of [their pain] — what would the ideal program or support actually look like for you?','What\'s the one or two things that would make this a no-brainer for you?','What does working with someone on this actually need to look like to fit your life?'],
      situational:['You said [their need] — how important is that compared to [other thing they mentioned]?','Out of everything you said — what\'s the most critical thing?'],
      pin:['If you had that — are you confident it could get you to [their goal]?']
    },
    auto_fail:['Pitched before asking what they need','Ignored their answer and pitched all features anyway'],
    danger:'Their answer here = your pitch language. Don\'t pitch features they didn\'t ask for. This question makes the pitch feel like you\'re reading their mind.'
  },
  {
    id:'ph_pitch', name:'Pitch', hint:'Problem-first pillars → Only pitch what they said they needed → Future pace before price',
    checkpoints_needed:[],
    goal:'Pitch back their exact words. Each pillar opens with the problem they named. Future pace before price. Never apologize for price. Never give a range.',
    tristan_note:'Only pitch 2-3 pillars max. Whatever they said they needed. Problem-first: "One of the main reasons people come to us is [the exact problem they named]." Then future pace. Then state price matter-of-factly.',
    questions:{
      anytime:['Based on everything you\'ve told me — does that feel like what you came here for?','If we do this together — what does that mean for [their specific stated outcome]?'],
      situational:['You said [what they need] — that\'s exactly what [pillar] addresses. Does that land?'],
      pin:[]
    },
    auto_fail:['Pitched all pillars regardless of stated needs','Used program jargon','Went to price without future pace','Apologized for the price'],
    danger:'Every pillar must open with THEIR problem not your feature. "One of the main reasons people come to us is [their problem]..." Never pitch what they didn\'t ask for.'
  },
  {
    id:'ph_certainty', name:'Get Certainty', hint:'Are you confident we can get you there → Why → Are you committing to doing the work → Why',
    checkpoints_needed:[],
    goal:'Two-part certainty check before close. 1) Are they confident you can get them to their goal? 2) Are they committing to actually doing the work? Both need yes + explanation.',
    tristan_note:'"With what we went over — are you confident we can get you to [their goal]? Yes → from who tells me why they\'re certain." Then: "Are you committing to following through, that you will succeed? Yes — why?" Both questions need real answers not just yes.',
    questions:{
      anytime:['With everything we went over — are you confident we can get you to [their goal]?','Good — now the other half: are you committed to actually doing the work to get there? Why?','What would be a good number for you?'],
      situational:['You said [their reason for confidence] — what specifically makes you believe that?'],
      pin:[]
    },
    auto_fail:['Skipped certainty check and went straight to price','Accepted "yeah sure" without getting real why'],
    danger:'Both certainty questions need a real "why" answer. This is where you test conviction. Weak answers here = objections at close.'
  },
  {
    id:'ph_objections', name:'Price + Objections + Close', hint:'Group multiple objections → Handle individually → Soft close → Never hard close',
    checkpoints_needed:[],
    goal:'If the call was built correctly — minimal objections. Multiple objections = something earlier failed. Group multiple objections to certainty first. Handle individually. Close softly.',
    tristan_note:'Multiple objections = collapse to one: "Is it fair to say you\'re really looking for certainty this will work?" Then: "If you knew 100% you wouldn\'t fail — would you still be concerned?" Their yes = everything collapses to self-belief. That\'s all you\'re solving.',
    questions:{
      anytime:['Is it fair to say — with everything you just said — what you\'re really looking for is certainty this is going to work for you?','If you knew for 100% fact you wouldn\'t fail — would you still be concerned about [objection]?','So based on everything — what are you going to do?'],
      situational:['You said [objection] — is that really the thing or is there something underneath that?','Aside from [objection] — do you actually believe this could get you where you want to go?'],
      pin:['Is not having [money/time] a problem or a symptom of the exact problem we just spent [time] talking about?','Which is actually riskier — staying exactly where you are or doing something about it now?']
    },
    auto_fail:['Handled multiple objections separately instead of grouping','Argued instead of accepting and reframing','Apologized for price','Hard closed'],
    danger:'NEVER argue. Accept and reframe every time. Multiple objections = group to certainty. The real objection is always self-belief. Everything else is a smoke screen.'
  }
];

// ── AVATAR DATA (same as original) ────────────────────────────────────
const AVATARS = {
  founder:{key:'founder',full_name:'7–8 Figure Founder',sub:'Entrepreneur · Agency Owner · Startup Builder',accent_color:'#e8a838',accent_dim:'#3d2a00',icon:'⚙️',
    names:['Marcus','Sarah','Derek','Priya','Ryan','Michelle','Jason','Carlos','Craig','Danielle'],
    bios:['runs a 7-fig marketing agency, team of 18, just hit $4M/yr — feels like the wheels are coming off behind closed doors','founded a DTC wellness brand, grew to $6M in 3 years, stuck at same revenue for 18 months, blames the market','owns a consulting firm, team of 12, does great work but is the bottleneck for every single decision','SaaS founder, just crossed $1M ARR, first-time CEO, privately terrified she\'ll be exposed as someone who got lucky','runs a coaching business at $2M/yr built entirely on personal brand — terrified the brand is more successful than she actually is'],
    challenges:['team keeps underperforming no matter who he hires','revenue flatlined after a strong run, blames the market','12-hour days, nothing actually compounds'],
    false_beliefs:['The problem is my strategy','I just need to hire better people','I need to work harder'],
    favorable_cause:'The real reason the business keeps hitting the same ceiling is that the operator running it hasn\'t been upgraded — only the business has.',
  },
  operator:{key:'operator',full_name:'High-Income Operator',sub:'Closer · Consultant · Creator',accent_color:'#4a90d9',accent_dim:'#0a2140',icon:'⚡',
    names:['Chris','Tiffany','Tyler','Maya','Brandon','Jessica','Kyle','Nate'],
    bios:['high-ticket closer doing $20-40k/mo on a good month, $8k on a bad one, hates the inconsistency','consultant running a one-man shop, smart, gets results for clients, can\'t seem to price herself properly','sales manager at a tech company, $200k OTE, hit it once, been chasing it since'],
    challenges:['income swings wildly month to month','had the killer instinct, then lost it somewhere','pre-call anxiety he shouldn\'t have at this level'],
    false_beliefs:['I just need more discipline and consistency','I need a better system or a better offer'],
    favorable_cause:'Performance is inconsistent because confidence and output are anchored to an identity that was built for a lower level.',
  },
  reinvention:{key:'reinvention',full_name:'Reinvention-Stage Millionaire',sub:'Retired · Burnt-out · High Earner in Transition',accent_color:'#7b5ea7',accent_dim:'#200a35',icon:'🔄',
    names:['Robert','Sandra','David','Yvonne','Steve','Patricia'],
    bios:['sold his company 18 months ago, $8M exit, thought he\'d feel free — feels completely lost instead','retired exec in her late 40s, did very well, now has everything she thought she wanted and doesn\'t know what to do with it'],
    challenges:['made the money, nothing pulls him forward anymore','starts new projects with fire, loses interest in 60 days'],
    false_beliefs:['I just need to find the right next thing','I need more time to figure it out on my own'],
    favorable_cause:'Nothing sticks because none of it rebuilt the identity underneath.',
  },
  cultural:{key:'cultural',full_name:'Cultural Power Player',sub:'Artist · Musician · Celebrity',accent_color:'#e05c5c',accent_dim:'#3a0a0a',icon:'🎨',
    names:['Andre','Jade','Malik','Simone','Jordan','Destiny'],
    bios:['Grammy-nominated R&B artist, 3 platinum records, privately questioning whether any of it is what he wanted to make','multi-platinum producer working with major labels, can\'t stop taking projects he doesn\'t believe in for the money'],
    challenges:['creativity feels like output now, not expression','surrounded by yes-men, nobody tells him the truth'],
    false_beliefs:['I just need the right creative direction','My problem is external: bad management, wrong team'],
    favorable_cause:'Reinventions aren\'t landing because all the external changes are applied to a blocked internal source.',
  },
  athlete:{key:'athlete',full_name:'Pro Athlete in Transition',sub:'NFL · NBA · WWE · Active or Recently Retired',accent_color:'#3daa6e',accent_dim:'#072b17',icon:'🏆',
    names:['Darius','Alicia','Marcus','Trevion','Jamal','Simone'],
    bios:['former NFL wide receiver, 6 seasons, retired at 29, has money but no idea what to do with himself','NBA player in his final contract year, already thinking about what comes next, terrified of saying it out loud'],
    challenges:['identity completely wrapped in the sport','feels purposeless despite having money'],
    false_beliefs:['I just need to find the right business opportunity','The discipline I built in sport will transfer automatically'],
    favorable_cause:'Nothing hits the way the sport did because he transferred his skills but not his identity.',
  }
};

// ── A/B TYPE BEHAVIOR ADDITIONS ───────────────────────────────────────
const TYPE_BEHAVIOR = {
  A:{
    description:'Decisive operator. High ego — the chest-puff is the mask. Real fear runs deeper than B-Types. Already living outside comfort zone in some domain. Justifies instead of externalizes: "Already tried it." "Different situation." "Need more due diligence." Hides behind expertise and track record. Thinks they don\'t need you.',
    opening:'Direct, possibly curt. May try to run the call or establish dominance immediately. Sets status signals early.',
    resistance:'Intellectual challenge — will try to poke holes. Expertise as armor. "I\'ve done the inner work." "I\'ve been in therapy for years." Won\'t admit fear easily.',
    what_sells:'Logical pain — numbers, systems, hours, what\'s leaking. Sharpness and competence earn the right to go deep. Never condescend — they porcupine instantly.',
    fear_signal:'When they start admitting the pattern follows them everywhere despite trying everything. When they get quiet instead of combative.',
    buying_signal:'Stops challenging. Starts asking how. Drops the performance.'
  },
  B:{
    description:'Indecisive overthinker. Lacks internal self-worth. Lives inside comfort zone. Externalizes everything — spouse, money, time, family in the way. Uses spouse as a shield. Does not take ownership for current circumstances.',
    opening:'Warm but scattered. May give too much information. Talks fast and jumps between topics. Needs to be focused.',
    resistance:'External blame: spouse, economy, kids, timing, resources. Will agree to everything on the call then ghost.',
    what_sells:'Emotional pain. Identity-gap work. Urgency through lifestyle outcomes — the house, the car, the family. Manufactured push-away to create urgency.',
    fear_signal:'When they start adding LOL energy or softening serious statements. When they say "it\'s fine" but clearly it isn\'t.',
    buying_signal:'Gets emotional. Starts talking about specific people and relationships affected. Stops deflecting to external factors.'
  }
};
