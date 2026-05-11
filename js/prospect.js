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
