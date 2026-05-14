// ── SETUP ──────────────────────────────────────────────────────────────

// ── PHASE BLOCKS — drill grouping (V3.4) ───────────────────────────────
// Maps each block to its list of phase IDs from data.js
const PHASE_BLOCKS = {
  'block1': { name: 'Phase 1: Early Discovery', sub: 'Rapport → Goal → Current → Timeframe', phases: ['ph_rapport','ph_end_outcome','ph_current_not_serving','ph_timeframe'] },
  'block2': { name: 'Phase 2: Mid Discovery',   sub: 'Limiting Beliefs → Internal/External',  phases: ['ph_limiting_beliefs','ph_internal_external'] },
  'block3': { name: 'Phase 3: Late Discovery',  sub: 'Core Fear → Reframe → Costs → Future Cons.', phases: ['ph_core_fear','ph_reframe_fear','ph_costs_fear','ph_future_consequence'] },
  'block4': { name: 'Phase 4: Final Discovery', sub: '2.0 Identity → Pre-Pitch → Pitch → Certainty', phases: ['ph_visualize_identity','ph_future_pace_identity','ph_pre_pitch_teardown','ph_ideal_program','ph_pitch','ph_certainty'] },
  'block5': { name: 'Phase 5: Close',            sub: 'Price → Objections → Close', phases: ['ph_objections'] }
};
const BLOCK_ORDER = ['block1','block2','block3','block4','block5'];

window.addEventListener('DOMContentLoaded', initSetup);

function initSetup() {
  const grid = document.getElementById('avGrid');
  if (!grid) return;
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
  initBlocks();
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

// ── BLOCK DRILL UI (V3.4) ──────────────────────────────────────────────

function initBlocks() {
  // Default: Full Call selected
  S.drillBlocks = [];
  S.fullCall = true;
  S.drillStartPhaseIdx = 0;
  S.drillEndPhaseIdx = PHASES.length - 1;
  updateBlockUI();
  updateFocusSummary();
}

function toggleFullCall() {
  const cb = document.getElementById('fullCallCb');
  S.fullCall = cb.checked;
  if (S.fullCall) {
    // Full Call selected — clear blocks
    S.drillBlocks = [];
    document.querySelectorAll('.block-cb').forEach(b => b.checked = false);
    S.drillStartPhaseIdx = 0;
    S.drillEndPhaseIdx = PHASES.length - 1;
    S.focus = 'full';
  } else {
    // Full Call off — but no blocks picked yet
    S.drillStartPhaseIdx = null;
    S.drillEndPhaseIdx = null;
    S.focus = null;
  }
  updateBlockUI();
  updateFocusSummary();
  checkReady();
}

function toggleBlock(blockId) {
  const cb = document.getElementById('cb-' + blockId);
  // If checking, clear Full Call first
  if (cb.checked) {
    document.getElementById('fullCallCb').checked = false;
    S.fullCall = false;
    if (!S.drillBlocks.includes(blockId)) S.drillBlocks.push(blockId);
  } else {
    S.drillBlocks = S.drillBlocks.filter(b => b !== blockId);
  }
  // Sort by canonical block order
  S.drillBlocks.sort((a,b) => BLOCK_ORDER.indexOf(a) - BLOCK_ORDER.indexOf(b));
  // Validate consecutive
  const consecOK = isConsecutive(S.drillBlocks);
  if (!consecOK && S.drillBlocks.length > 1) {
    // Non-consecutive — reject the click, restore prior state
    cb.checked = !cb.checked;
    S.drillBlocks = S.drillBlocks.filter(b => b !== blockId);
    if (cb.checked) S.drillBlocks.push(blockId);
    S.drillBlocks.sort((a,b) => BLOCK_ORDER.indexOf(a) - BLOCK_ORDER.indexOf(b));
    showToast('Blocks must be consecutive');
    updateBlockUI();
    return;
  }
  // Update drill range
  if (S.drillBlocks.length > 0) {
    const firstBlock = S.drillBlocks[0];
    const lastBlock = S.drillBlocks[S.drillBlocks.length - 1];
    const firstPhaseId = PHASE_BLOCKS[firstBlock].phases[0];
    const lastPhaseId = PHASE_BLOCKS[lastBlock].phases[PHASE_BLOCKS[lastBlock].phases.length - 1];
    S.drillStartPhaseIdx = PHASES.findIndex(p => p.id === firstPhaseId);
    S.drillEndPhaseIdx = PHASES.findIndex(p => p.id === lastPhaseId);
    S.focus = S.drillStartPhaseIdx === 0 ? 'full-from-start' : 'drill';
  } else {
    S.drillStartPhaseIdx = null;
    S.drillEndPhaseIdx = null;
    S.focus = null;
  }
  updateBlockUI();
  updateFocusSummary();
  checkReady();
}

function isConsecutive(blocks) {
  if (blocks.length <= 1) return true;
  const indices = blocks.map(b => BLOCK_ORDER.indexOf(b)).sort((a,b) => a-b);
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] - indices[i-1] !== 1) return false;
  }
  return true;
}

function updateBlockUI() {
  // Visual state for each block card
  BLOCK_ORDER.forEach(blockId => {
    const card = document.getElementById('blockCard-' + blockId);
    if (!card) return;
    const cb = document.getElementById('cb-' + blockId);
    if (cb && cb.checked) card.classList.add('sel');
    else card.classList.remove('sel');
  });
  // Full Call card
  const fcCard = document.getElementById('fullCallCard');
  if (fcCard) {
    if (S.fullCall) fcCard.classList.add('sel');
    else fcCard.classList.remove('sel');
  }
}

function updateFocusSummary() {
  const el = document.getElementById('s-focus');
  if (!el) return;
  if (S.fullCall) {
    el.textContent = 'Full Call';
  } else if (S.drillBlocks.length === 0) {
    el.textContent = '—';
  } else if (S.drillBlocks.length === 1) {
    el.textContent = PHASE_BLOCKS[S.drillBlocks[0]].name.replace('Phase ', 'P');
  } else {
    const first = S.drillBlocks[0].replace('block','');
    const last = S.drillBlocks[S.drillBlocks.length-1].replace('block','');
    el.textContent = `P${first}–P${last}`;
  }
  // Show/hide preview note about brief
  const note = document.getElementById('drillPreviewNote');
  if (note) {
    if (S.fullCall || S.drillBlocks.length === 0) {
      note.style.display = 'none';
    } else if (S.drillStartPhaseIdx === 0) {
      note.style.display = 'block';
      note.textContent = `Starting fresh from rapport. Drilling phases 1–${S.drillEndPhaseIdx+1}. No brief needed.`;
    } else {
      note.style.display = 'block';
      note.textContent = `Drill brief will load phases 1–${S.drillStartPhaseIdx} as prior context. You'll drill phases ${S.drillStartPhaseIdx+1}–${S.drillEndPhaseIdx+1}.`;
    }
  }
}

function checkReady() {
  const keyOk = S.apiKey.startsWith('sk-ant-');
  let configOk = false;
  if (S.mode === 'fresh') {
    const drillOk = S.fullCall || (S.drillBlocks && S.drillBlocks.length > 0);
    configOk = !!(S.avatar && S.src && S.prospectType && drillOk);
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
