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
