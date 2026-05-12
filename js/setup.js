// ── SETUP ──────────────────────────────────────────────────────────────
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
