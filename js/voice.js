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

// ── VOICE ENGINE ───────────────────────────────────────────────────────
function toggleVoice() {
  if (!S.elKey) { showToast('Add your ElevenLabs API key first'); return; }
  S.voiceOn = !S.voiceOn;
  const toggle = document.getElementById('voiceToggle');
  const lbl = document.getElementById('voiceToggleLbl');
  toggle.classList.toggle('on', S.voiceOn);
  lbl.textContent = S.voiceOn ? 'Voice On' : 'Voice Off';
  if (!S.voiceOn && S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; setSpeaking(false); }
}

function onVoiceChange(val) {
  S.voiceId = val;
  if (S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; setSpeaking(false); }
}

function setSpeaking(val) {
  S.isSpeaking = val;
  document.getElementById('speakingIndicator').classList.toggle('on', val);
}

// Detect emotional state from prospect message to tune ElevenLabs parameters
function detectProspectEmotion(text) {
  const t = text.toLowerCase();
  // Angry / defensive
  if (t.includes('blood is boiling') || t.includes('not okay') || t.includes('stop') || t.includes('that\'s a personal') || t.includes('offense')) {
    return { stability: 0.25, similarity_boost: 0.85, style: 0.7, use_speaker_boost: true };
  }
  // Emotional breakthrough / crying
  if (t.includes('...') || t.match(/i (mean|just|don't know)/) && t.length > 120 || t.includes('honestly') && t.includes('never')) {
    return { stability: 0.35, similarity_boost: 0.9, style: 0.6, use_speaker_boost: true };
  }
  // Short clipped A-type
  if (text.split(' ').length < 15 && (t.includes('yeah') || t.includes('okay') || t.includes('sure') || t.includes('got it'))) {
    return { stability: 0.75, similarity_boost: 0.7, style: 0.2, use_speaker_boost: false };
  }
  // Opening up / vulnerable
  if (t.includes('honestly') || t.includes('to be real') || t.includes('i\'ve never') || t.includes('i guess') && text.length > 80) {
    return { stability: 0.45, similarity_boost: 0.88, style: 0.5, use_speaker_boost: true };
  }
  // Laughing / light
  if (t.includes('lol') || t.includes('haha') || t.includes('funny') || t.includes('ha ')) {
    return { stability: 0.55, similarity_boost: 0.75, style: 0.55, use_speaker_boost: false };
  }
  // Skeptical / guarded
  if (t.includes('i\'ve tried') || t.includes('already done') || t.includes('i mean') && text.split(' ').length < 30) {
    return { stability: 0.7, similarity_boost: 0.72, style: 0.25, use_speaker_boost: false };
  }
  // Default natural conversation
  return { stability: 0.52, similarity_boost: 0.82, style: 0.38, use_speaker_boost: true };
}

async function speakProspect(text) {
  if (!S.voiceOn || !S.elKey || !text) return;
  // Stop any current audio
  if (S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; }
  setSpeaking(true);
  const emotion = detectProspectEmotion(text);
  // Clean text — remove any stage directions in brackets
  const cleanText = text.replace(/\[.*?\]/g, '').trim();
  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${S.voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': S.elKey
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: emotion.stability,
          similarity_boost: emotion.similarity_boost,
          style: emotion.style,
          use_speaker_boost: emotion.use_speaker_boost
        }
      })
    });
    if (!resp.ok) {
      const err = await resp.text();
      console.error('ElevenLabs error:', err);
      setSpeaking(false);
      if (resp.status === 401) showToast('ElevenLabs key invalid');
      else if (resp.status === 429) showToast('ElevenLabs rate limit — slow down');
      return;
    }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    S.currentAudio = audio;
    audio.onended = () => { setSpeaking(false); S.currentAudio = null; URL.revokeObjectURL(url); };
    audio.onerror = () => { setSpeaking(false); S.currentAudio = null; };
    await audio.play();
  } catch(e) {
    setSpeaking(false);
    console.error('Voice error:', e);
  }
}

// ── MIC / SPEECH RECOGNITION ───────────────────────────────────────────
function toggleMic() {
  if (S.isSpeaking) {
    // Stop prospect speaking first
    if (S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; setSpeaking(false); }
    return;
  }
  if (S.isListening) {
    stopListening();
  } else {
    startListening();
  }
}

function startListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Speech recognition not supported — use Chrome');
    return;
  }
  if (S.recognition) S.recognition.abort();
  const recog = new SpeechRecognition();
  recog.continuous = false;
  recog.interimResults = true;
  recog.lang = 'en-US';
  S.recognition = recog;
  S.isListening = true;
  const btn = document.getElementById('micBtn');
  btn.classList.add('listening');
  btn.title = 'Click to stop';
  const input = document.getElementById('chatInput');
  let finalTranscript = '';
  recog.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    input.value = finalTranscript + interim;
    autoResize(input);
  };
  recog.onend = () => {
    S.isListening = false;
    btn.classList.remove('listening');
    btn.title = 'Click to speak';
    S.recognition = null;
    // Auto-send if we got something
    if (finalTranscript.trim()) {
      setTimeout(sendMsg, 150);
    }
  };
  recog.onerror = (e) => {
    S.isListening = false;
    btn.classList.remove('listening');
    S.recognition = null;
    if (e.error !== 'aborted') showToast('Mic error: ' + e.error);
  };
  recog.start();
}

function stopListening() {
  if (S.recognition) {
    S.recognition.stop();
  }
  S.isListening = false;
  document.getElementById('micBtn').classList.remove('listening');
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
