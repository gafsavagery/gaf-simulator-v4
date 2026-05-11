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
