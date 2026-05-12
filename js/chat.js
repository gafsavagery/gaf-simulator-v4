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

// ── INTEL TOGGLE ───────────────────────────────────────────────────────
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

function setTyping(v) {
  document.getElementById('typing').classList.toggle('on',v);
  document.getElementById('chatMsgs').scrollTop=9999;
}

async function sendMsg() {
  const inp = document.getElementById('chatInput');
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value=''; autoResize(inp);
  document.getElementById('sendBtn').disabled=true;
  appendMsg('user',txt); setTyping(true);
  try {
    const r = await callProspect(txt);
    setTyping(false); appendMsg('prospect',r); detectCheckpoints(txt,r);
    if (S.voiceOn) speakProspect(r);
  } catch(e) { setTyping(false); showToast('API error'); console.error(e); }
  document.getElementById('sendBtn').disabled=false;
  document.getElementById('chatInput').focus();
}

function handleKey(e) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg();} }
function autoResize(el) { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,110)+'px'; }

// ── REPLAY ─────────────────────────────────────────────────────────────
function replaySession() { showScreen('setup'); setTimeout(startSession, 80); }
