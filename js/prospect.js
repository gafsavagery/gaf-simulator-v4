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

  let drillContext = '';
  if (S.focus && S.focus !== 'full' && S.drillBrief) {
    drillContext = `\n\nDRILL MODE — CONTEXT FROM EARLIER IN THE CALL (phases 1-${S.phIdx} already happened):\n${S.drillBrief.brief}\n\nYour stated goal: ${S.drillBrief.prospect_goal}\nWhat ${S.drillBrief.prospect_goal} means to you: ${S.drillBrief.goal_clarity}\nTimeframe established: ${S.drillBrief.timeframe}\nYour limiting belief: ${S.drillBrief.limiting_belief}\nExcuses you gave: ${(S.drillBrief.external_excuses||[]).join(', ')}\nWhat you admitted internally: ${(S.drillBrief.internal_admissions||[]).join(', ')}\nKey emotional moment: ${S.drillBrief.emotional_moments}\n\nBehave as if this prior context actually happened. The salesperson is now drilling Phase ${S.phIdx+1}: "${PHASES[S.phIdx].name}".`;
  }

  let replayContext = '';
  if (S.mode==='replay' && S.transcriptAnalysis) {
    const t = S.transcriptAnalysis;
    replayContext = `\n\nREPLAY CONTEXT — You are recreated from a real call:\nYour stated goal: ${t.stated_goal}\nYour core fear: ${t.core_fear}\nYour limiting beliefs: ${(t.limiting_beliefs||[]).join(', ')}\nExternal excuses you used: ${(t.external_excuses_used||[]).join(', ')}\nWhat you admitted internally: ${(t.internal_admissions||[]).join(', ')}\nYour performance routine: ${t.performance_routine}\nObjections you raised: ${(t.objections_raised||[]).join(', ')}\nCoaching focus this session: ${t.coaching_focus}\n${S.replayDifficulty==='harder'?'MAKE THIS HARDER: Be more resistant than the original call. Push back more on questions. Keep armor up longer.':''}`;
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
- Your real fear is bigger than you show — but it is WELL HIDDEN behind competence
- Use past attempts and expertise as armor
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
6. NEVER use stage directions like *adjusts on camera* or *smiles* — just speak naturally as text.
7. Current phase: ${PHASES[S.phIdx]?.name}. Behave appropriately for this phase.
${drillContext}${replayContext}`;
}

async function callProspect(userMsg) {
  const msgs = [];
  for (const m of S.msgs) msgs.push({role:m.role==='prospect'?'assistant':'user', content:m.content});

  if (userMsg==='__OPEN__') {
    if (S.focus && S.focus !== 'full' && S.drillBrief && S.phIdx > 0) {
      const drillOpen = `[DRILL MODE - Phase ${S.phIdx+1}: ${PHASES[S.phIdx].name}] The earlier parts of this call already happened. Give your current state as ${S.pName} — 1-2 sentences picking up where the call left off. Goal discussed: ${S.drillBrief?.prospect_goal||'their goal'}. Timeframe: ${S.drillBrief?.timeframe||'established'}.`;
      msgs.push({role:'user', content:drillOpen});
    } else {
      const openLine = `[CALL JUST CONNECTED] You are ${S.pName} and just joined this Zoom. The other person has not spoken yet. Give ONLY a brief neutral greeting — "Hey", "Hello", or "Hey, how's it going" — maximum 5 words. Do NOT introduce yourself. Do NOT explain why you're here. Do NOT volunteer any information. Just wait for them to lead.`;
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
