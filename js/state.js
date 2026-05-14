// ── STATE ──────────────────────────────────────────────────────────────
const S = {
  apiKey:'', elKey:'', avatar:null, src:null, prospectType:null, focus:'full',
  mode:'fresh', transcriptText:'', transcriptAnalysis:null,
  phIdx:0, phase:'ph_rapport', msgs:[], phTimings:{}, phStart:null, sessStart:null,
  timerInt:null, paused:false, pausedAt:null, totalPaused:0,
  wordCounts:{you:0,them:0}, checkpoints:{}, flags:[],
  pName:'', pBio:'', qfOpen:true, intelVisible:true,
  replayDifficulty:'same',
  drillBrief:null,
  // V3.4 — block drill mode
  drillBlocks:[], fullCall:true, drillStartPhaseIdx:0, drillEndPhaseIdx:null,
  // Voice
  voiceOn:false, voiceId:'21m00Tcm4TlvDq8ikWAM',
  isListening:false, isSpeaking:false,
  recognition:null, currentAudio:null
};
