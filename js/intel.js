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
