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

  // V3.4 — Stop at drill end boundary (block drill mode)
  // If we've completed the last phase of the drill range, end the session
  const drillEnd = (S.drillEndPhaseIdx != null) ? S.drillEndPhaseIdx : PHASES.length-1;
  if (S.phIdx >= drillEnd) {
    endSession();
    return;
  }

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
  // V3.4 — Don't allow jumping past the drill end boundary
  const drillEnd = (S.drillEndPhaseIdx != null) ? S.drillEndPhaseIdx : PHASES.length-1;
  if (idx > drillEnd) { showToast('Outside drill range'); return; }
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
