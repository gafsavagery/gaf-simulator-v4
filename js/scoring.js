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
