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

function detectProspectEmotion(text) {
  const t = text.toLowerCase();
  if (t.includes('blood is boiling') || t.includes('not okay') || t.includes('that\'s personal') || t.includes('offense')) {
    return { stability: 0.25, similarity_boost: 0.85, style: 0.7, use_speaker_boost: true };
  }
  if ((t.includes('...') || t.includes('honestly') && t.includes('never')) && text.length > 120) {
    return { stability: 0.35, similarity_boost: 0.9, style: 0.6, use_speaker_boost: true };
  }
  if (text.split(' ').length < 15 && (t.includes('yeah') || t.includes('okay') || t.includes('sure') || t.includes('got it'))) {
    return { stability: 0.75, similarity_boost: 0.7, style: 0.2, use_speaker_boost: false };
  }
  if (t.includes('honestly') || t.includes('to be real') || t.includes('i\'ve never') || (t.includes('i guess') && text.length > 80)) {
    return { stability: 0.45, similarity_boost: 0.88, style: 0.5, use_speaker_boost: true };
  }
  if (t.includes('lol') || t.includes('haha') || t.includes('funny') || t.includes('ha ')) {
    return { stability: 0.55, similarity_boost: 0.75, style: 0.55, use_speaker_boost: false };
  }
  if (t.includes('i\'ve tried') || t.includes('already done') || (t.includes('i mean') && text.split(' ').length < 30)) {
    return { stability: 0.7, similarity_boost: 0.72, style: 0.25, use_speaker_boost: false };
  }
  return { stability: 0.52, similarity_boost: 0.82, style: 0.38, use_speaker_boost: true };
}

async function speakProspect(text) {
  if (!S.voiceOn || !S.elKey || !text) return;
  if (S.currentAudio) { S.currentAudio.pause(); S.currentAudio = null; }
  setSpeaking(true);
  const emotion = detectProspectEmotion(text);
  const cleanText = text.replace(/\[.*?\]/g, '').replace(/\*.*?\*/g, '').trim();
  try {
    const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${S.voiceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': S.elKey },
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
  recog.continuous = true;
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
      if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    input.value = (finalTranscript + interim).trim();
    autoResize(input);
  };
  recog.onend = () => {
    // Only fires if recognition stops on its own (error etc) — not when user clicks stop
    if (S.isListening) {
      // Restart if still supposed to be listening
      try { recog.start(); } catch(e) {}
    }
  };
  recog.onerror = (e) => {
    if (e.error === 'aborted') return;
    S.isListening = false;
    btn.classList.remove('listening');
    btn.title = 'Click to speak';
    S.recognition = null;
    showToast('Mic error: ' + e.error);
  };
  recog.start();
}

function stopListening() {
  S.isListening = false;
  const btn = document.getElementById('micBtn');
  btn.classList.remove('listening');
  btn.title = 'Click to speak';
  if (S.recognition) {
    S.recognition.onend = null; // Prevent restart loop
    S.recognition.stop();
    S.recognition = null;
  }
  // Don't auto-send — user clicks send manually
}
