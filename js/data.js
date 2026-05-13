const PHASES = [
{
id:'ph_rapport', name:'Rapport + Intro 🏁', hint:'Read the room → Move A or B → Mini agenda → Transition Q',
checkpoints_needed:['ck-goal'],
goal:'Set the frame. Get agreement to structure. Zero program talk. Get prospect settled and talking.',
tristan_note:'Read setup signals before the call starts. Late? Distracted? Bad environment? These tell you who you\'re dealing with. Slow your pace down — they mirror you. Come in calm.',
questions:{
anytime:['Where are you calling from?','How did you hear about us?','What\'s going on for you right now — what\'s the situation?'],
situational:['You mentioned [X] — what do you mean by that exactly?','You seem [distracted/rushed] — is now actually a good time?'],
pin:[]
},
auto_fail:['Mentioned program in rapport','Skipped mini agenda','Delivered agenda with excitement'],
danger:'Never mention the program. Mini agenda word-for-word. Must get sounds fair.'
},
{
id:'ph_end_outcome', name:'End Outcome — Clear Goal', hint:'What do they want → Get extreme clarity on what that word means',
checkpoints_needed:['ck-goal','ck-clarity'],
goal:'Get their end outcome in their words. Get extreme clarity on what freedom/flexibility/time/etc means to them specifically. These words mean different things to different people.',
tristan_note:'Don\'t accept "more money" as a goal. Push through it — what\'s the real thing they\'re after? Get their words, not the buzzword. Clarity here makes everything downstream easier.',
questions:{
anytime:['In your opinion what\'s the biggest reason you\'re looking to make this change right now?','What does freedom actually mean to you — how do you define it?','What does [their word] mean for you specifically?'],
situational:['You said [their word] — can you help me understand what that looks like for you day to day?','What would [their goal] actually change in your life if you had it?'],
pin:['What have you been settling for instead of that?','If you got [their goal] — what does a Tuesday morning actually look like?']
},
auto_fail:['Accepted surface answer without clarifying','Moved forward without knowing what their goal actually means to them'],
danger:'Do NOT accept buzzwords at face value. Clarity is everything here — it prevents wishy-washy answers in every phase that follows.'
},
{
id:'ph_current_not_serving', name:'Current Not Serving', hint:'Where do they lack [their goal] → Why current situation isn\'t serving them',
checkpoints_needed:['ck-clarity'],
goal:'Understand why their current situation isn\'t giving them what they defined. Use their exact words from the previous phase. This widens the gap.',
tristan_note:'Include their response in your question. If they said freedom means time with family — ask "where do you feel like you lack that ability to be present with your family?" Not a generic question.',
questions:{
anytime:['Where do you feel like you lack that [their definition of goal]?','What does your current situation not give you that you want?','What\'s missing right now that keeps you from [their goal]?'],
situational:['You said [their exact words] — where specifically do you feel that most?','What are you actually trying to buy back with this change?'],
pin:['What does it actually feel like knowing that\'s not there?','What has staying in that situation actually cost you?']
},
auto_fail:['Asked generic question instead of using their exact words','Moved to timeframe without understanding the gap'],
danger:'Use THEIR words in your questions. Not yours. Their language creates resonance. Generic questions get generic answers.'
},
{
id:'ph_timeframe', name:'Get Clear Timeframe 🏁', hint:'Positive or negative frame → Push for specific duration → No wishy-washy',
checkpoints_needed:['ck-timeframe'],
goal:'Get a specific time frame. Without it you can\'t challenge them. Longer timeframe = more urgency material. Push for specifics — not "a while" or "always."',
tristan_note:'This is one of the most important parts. Pin the time. "How long is always?" Push for a number. 2 years vs 6 months changes everything. The timeframe exists because there\'s a limiting belief. No belief = no timeframe.',
questions:{
anytime:['How long have you been wanting [their goal]?','How long has it been this way for you?','When did you first feel like you lacked [their goal]?'],
situational:['How long is "a while" — like 6 months or more like 3 years?','When did you first notice this pattern showing up?'],
pin:['So [X years] of this — what has that actually added up to?','If you\'d addressed this [X] years ago — where would you be right now?']
},
auto_fail:['Accepted "a while" or "always" without pushing for specific','Moved to limiting beliefs without a clear timeframe on record'],
danger:'Wishy-washy timeframe = weak challenge material later. Push every time. "Always" is not a timeframe — clarify it.'
},
{
id:'ph_limiting_beliefs', name:'Mid-Discovery — Limiting Beliefs', hint:'Why hasn\'t it happened → Why still here → What\'s gotten in the way',
checkpoints_needed:[],
goal:'Surface why it hasn\'t changed despite the timeframe. Get them asking themselves the question you\'re asking. This is non-confrontational problem solving — you\'re figuring it out together.',
tristan_note:'Don\'t accept the first answer. If they give you one reason — ask what else. Know what you\'re trying to get from every question before you ask it. Don\'t let them go on tangents that give you no ammo.',
questions:{
anytime:['Why hasn\'t it happened yet?','Why are you still in the same situation after [timeframe]?','How did you let it get to this point?','What\'s gotten in your way of changing that?'],
situational:['You said [X reason] — and what else has been in the way?','Beyond the obvious stuff — what do you think is really going on?'],
pin:['If [their excuse] wasn\'t there — would it actually be solved?','What would have to be true for this to have changed already?']
},
auto_fail:['Accepted first surface answer and moved on','Allowed tangent with no useful information'],
danger:'This phase splits into External vs Internal. Don\'t rush it. Every excuse they give you is either external (invalid) or internal (gold).'
},
{
id:'ph_internal_external', name:'Internal vs External 🏁', hint:'External excuses → Reframe each one → Get to internal ownership',
checkpoints_needed:['ck-internal'],
goal:'Move them from external blame (time/money/kids/economy) to internal ownership (fear/hesitation/voices in head/getting in own way). You cannot proceed without this. External = they won\'t buy.',
tristan_note:'Attack the belief not the person. Tone is EVERYTHING. "What type of example are you setting?" with wrong tonality = fight or flight. Same question with genuine curiosity = they go deep. If they porcupine — call timeout: "Do you feel I want what\'s best for you?"',
questions:{
anytime:['Aside from [external excuse] — what do YOU feel has gotten in your way?','If [external factor] wasn\'t there — what\'s the thing that\'s really holding you back?','What role have you played in staying here?'],
situational:['You said [external excuse] — and are there people in your exact same situation who\'ve gotten through it? What do you think made the difference?','When you\'re really honest with yourself — what is it that keeps you stuck?'],
pin:['If you\'re being brutally honest — how much of this is actually external vs something inside you?','What would the most honest version of you say is really going on?']
},
auto_fail:['Accepted external excuse and moved on','Challenged in wrong tone and caused fight or flight','Moved forward without internal ownership'],
danger:'B-Types: will externalize hard. Keep reframing until they crack. A-Types: will skip to internal fast but use expertise/past attempts as the block. Both need ownership before you can proceed.'
},
{
id:'ph_core_fear', name:'Uncover the Core Fear', hint:'Get clarity on internal belief → How come → What have the voices told you → How so',
checkpoints_needed:['ck-fear'],
goal:'Get clarity on exactly what the fear is. This isn\'t good enough yet — "afraid of starting" tells you nothing. You need to know HOW the fear works in their specific mind.',
tristan_note:'All objections come from fear. Every single one. The timeframe exists because fear is holding them back. Get into the mechanism — not just the label. "I\'m afraid of failing" → why would it fail → what specifically → now you have the real thing.',
questions:{
anytime:['How come?','What makes you say it\'s risky?','What have those voices in your head been telling you?','Why would it fail — specifically?'],
situational:['You said [fear phrase] — what does that actually mean in practice? Like what do you imagine happening?','When that fear shows up — what does it actually say to you?'],
pin:['That fear has been running for [timeframe] — what has it cost you to listen to it?','If that fear is wrong — what does that mean about the last [X years]?']
},
auto_fail:['Accepted "afraid of failing" without drilling into the mechanism','Moved to reframe without understanding the specific fear'],
danger:'You cannot reframe a fear you don\'t understand. Get the specific. "Afraid of failing" is a category not a fear. The actual fear is underneath it.'
},
{
id:'ph_reframe_fear', name:'Reframe the Fear', hint:'Feed doubt into the fear → Prove it\'s false → Don\'t challenge Level 1 ("I got comfortable")',
checkpoints_needed:[],
goal:'Feed doubt into the fear being incorrect. Prove the fear is a facade. Get them to question whether the fear is actually valid. Our job: make the fear itself the enemy — you and them vs the fear together.',
tristan_note:'3 levels of fear response. Level 1 = "I got comfortable." Level 2 = procrastinate. Level 3 = why do you procrastinate? Always fear underneath. Don\'t challenge Level 1 — it\'s a surface mechanism. Dig to level 3. Then feed doubt into it.',
questions:{
anytime:['Has there been a time you did something for the first time that worked out? What does that tell you about the fear?','What if the fear is wrong — what does the evidence actually show?','The people who succeed despite this fear — what do you think they did differently?'],
situational:['You said [fear] — and yet you\'ve done [evidence they gave]. How does that fit?','If I told you [reframe] — does that land or does it feel off?'],
pin:['What if this fear has been the single biggest thing keeping you from [their goal] for [timeframe]?','Is the fear protecting you or imprisoning you — honestly?']
},
auto_fail:['Challenged Level 1 fear directly and got pushback','Stated reframe as fact instead of asking as question','Moved on without the prospect questioning their own fear'],
danger:'Feed DOUBT into the fear — not a frontal challenge. The fear needs to feel like a lie to them, not like you\'re arguing with them.'
},
{
id:'ph_costs_fear', name:'Costs of Fear', hint:'What has this fear cost → Look at last 2-3 years → Make fear the worst thing in the world to them',
checkpoints_needed:['ck-cost'],
goal:'Make "fear" the word that represents the worst thing in the world to them. Future pace the costs. Get them to calculate what staying in fear has actually cost — money, relationships, time, identity.',
tristan_note:'Use future pacing. "Have them tell us" — my kids will grow older and I won\'t be there. What impact does that have on those around you? Don\'t tell them the cost. Make them calculate it themselves.',
questions:{
anytime:['What has this fear cost you over the last [timeframe]?','If we look at the last 2-3 years of allowing this fear to run — what has it actually taken from you?','What can\'t you do right now because of this fear?'],
situational:['You said [personal cost] — can you help me understand what that actually means for you?','What\'s the one thing this fear has cost you that you can actually put a name on?'],
pin:['How much has this fear already cost you in total — financially and personally?','If you keep listening to this fear for another [timeframe] — what does that add up to?']
},
auto_fail:['Told them the cost instead of asking them to calculate it','Stayed at business level and didn\'t get personal cost'],
danger:'Personal cost must be reached. Business cost alone won\'t close. Get to relationships, identity, what they\'re missing with people they love.'
},
{
id:'ph_future_consequence', name:'Future Consequence 🏁', hint:'Future pace the fear continuing → Have THEM tell you → What does that mean for those around you',
checkpoints_needed:['ck-futurepace'],
goal:'If fear continues — what does life actually look like? Not what you say. What THEY say. They paint the dark future picture themselves. This becomes unbearable.',
tristan_note:'"You said frustrating — what makes you say it will be frustrating?" Make them go there. Future pace their specific fears. "How will that impact those around you?" Make them feel the consequence before it happens.',
questions:{
anytime:['If nothing changes — what does your life actually look like in 3 years?','What does that mean for those around you — your partner / kids / team?','What standard are you setting for yourself if this continues?'],
situational:['You said [their fear word] — paint me the picture. What does that actually look like?','What does this mean for [specific person/thing they mentioned]?'],
pin:['Is that a life you\'re willing to accept?','Whose choice is it whether that continues?']
},
auto_fail:['Painted the dark future yourself instead of asking them to','Didn\'t connect consequence to specific people or things they mentioned','Got generic "things will be bad" instead of specific picture'],
danger:'THEY must paint this picture. Not you. The moment you say "you\'ll be stuck" it becomes a threat. When THEY say it — it becomes a commitment to change.'
},
{
id:'ph_visualize_identity', name:'Visualize 2.0 Identity', hint:'The version of you that has achieved [XYZ] → How do they operate → Do they still have the limiting belief',
checkpoints_needed:['ck-identity'],
goal:'Get them to visualize the 2.0 version of themselves who has achieved the goal. How do they operate? What\'s different about their belief system? Do they still have the limiting belief? This seeds identity shift.',
tristan_note:'4 areas: actions, belief system, do they still operate with limiting belief, what kind of standard of excellence are they made of. Get them to describe the person, not just the outcome.',
questions:{
anytime:['The version of you that has achieved [their goal] — how do they operate differently from how you operate today?','What\'s different about their belief system?','Do they still have [their limiting belief] — or has it changed?'],
situational:['You said [limiting belief] — does that version of you still have that? What does that tell you?','How does that version of you make decisions differently?'],
pin:['What would it mean to actually become that person — not just have the result?','Is that version of you actually out of reach or is it closer than you think?']
},
auto_fail:['Only discussed the outcome not the identity behind it','Didn\'t connect the 2.0 identity to removing their specific limiting belief'],
danger:'This is about who they BECOME not what they GET. Push past the outcome into the identity. The identity is what you actually sell.'
},
{
id:'ph_future_pace_identity', name:'Future Pace 2.0 Identity', hint:'When you let go of limitation → How would you view yourself → How would others view you',
checkpoints_needed:['ck-commitment'],
goal:'Future pace the 2.0 identity fully. How do they see themselves? How do others see them? What does it mean to be that person? Get them to commit: this is who I\'m choosing to be.',
tristan_note:'5 questions: how would you view yourself differently, how would others view you, what does it mean to say "I\'m a 2.0 version", what kind of standard of excellence, how does that impact ability to trust yourself in decisions. Get commitment.',
questions:{
anytime:['When you let go of [their limitation] — how would you view yourself differently?','How would the people around you see you differently?','What would it mean to be able to say you\'re that version of yourself?'],
situational:['You described [2.0 identity] — what does it feel like from the inside?','What decisions would you make differently if you were already that person?'],
pin:['So what do we need to do to make sure [limitation] doesn\'t control us again?','Whose choice is it whether you become that person?']
},
auto_fail:['Got generic "I\'d feel great" instead of specific picture','Didn\'t lock commitment before moving to pre-pitch'],
danger:'The commitment question "whose choice is it" must land here. Without ownership the pitch is just a presentation. With ownership it\'s a decision they\'re making about themselves.'
},
{
id:'ph_pre_pitch_teardown', name:'Pre-Pitch Teardown', hint:'How do we make sure together → What will we do differently → Ensure limitation doesn\'t control again',
checkpoints_needed:[],
goal:'Bridge from identity work to the program. How will we make sure the limitation doesn\'t take back control? Get them thinking about what they actually need — this primes them to hear the pitch.',
tristan_note:'This is a small but important bridge. You\'re moving from "you\'ve accepted the problem" to "now let\'s talk about what solving it actually looks like." Sets up their ideal program answer.',
questions:{
anytime:['How can we make sure together that [their limitation] doesn\'t control us going forward?','What would actually have to be different this time vs everything you\'ve already tried?','What would you need to have in place to make sure you don\'t fall back into the same pattern?'],
situational:['Given everything we\'ve talked about — what do you feel you actually need?','What would make this time different from the last time you tried to change this?'],
pin:[]
},
auto_fail:['Skipped straight to pitch without this bridge'],
danger:'Short phase. 2-3 exchanges. But don\'t skip it — it frames the pitch as solving a specific problem rather than selling a product.'
},
{
id:'ph_ideal_program', name:'Pre-Pitch — Ideal Program', hint:'What would ideal program look like → If we could get you to goal + out of pain → What would that need to include',
checkpoints_needed:[],
goal:'Get them to describe their ideal program before you pitch. Whatever they say = your pitch language. You\'re confirming what they need, then mirroring it back in the pitch.',
tristan_note:'Ask them what their perfect program looks like. If we could get you to [goal] and get you out of [pain] — what would the ideal solution look like? If you worked with us you\'d feel 100% certain it\'d get you there. Confirm before pitching.',
questions:{
anytime:['If we could get you to [their goal] and get you out of [their pain] — what would the ideal program or support actually look like for you?','What\'s the one or two things that would make this a no-brainer for you?','What does working with someone on this actually need to look like to fit your life?'],
situational:['You said [their need] — how important is that compared to [other thing they mentioned]?','Out of everything you said — what\'s the most critical thing?'],
pin:['If you had that — are you confident it could get you to [their goal]?']
},
auto_fail:['Pitched before asking what they need','Ignored their answer and pitched all features anyway'],
danger:'Their answer here = your pitch language. Don\'t pitch features they didn\'t ask for. This question makes the pitch feel like you\'re reading their mind.'
},
{
id:'ph_pitch', name:'Pitch', hint:'Problem-first pillars → Only pitch what they said they needed → Future pace before price',
checkpoints_needed:[],
goal:'Pitch back their exact words. Each pillar opens with the problem they named. Future pace before price. Never apologize for price. Never give a range.',
tristan_note:'Only pitch 2-3 pillars max. Whatever they said they needed. Problem-first: "One of the main reasons people come to us is [the exact problem they named]." Then future pace. Then state price matter-of-factly.',
questions:{
anytime:['Based on everything you\'ve told me — does that feel like what you came here for?','If we do this together — what does that mean for [their specific stated outcome]?'],
situational:['You said [what they need] — that\'s exactly what [pillar] addresses. Does that land?'],
pin:[]
},
auto_fail:['Pitched all pillars regardless of stated needs','Used program jargon','Went to price without future pace','Apologized for the price'],
danger:'Every pillar must open with THEIR problem not your feature. "One of the main reasons people come to us is [their problem]..." Never pitch what they didn\'t ask for.'
},
{
id:'ph_certainty', name:'Get Certainty 🏁', hint:'Are you confident we can get you there → Why → Are you committing to doing the work → Why',
checkpoints_needed:[],
goal:'Two-part certainty check before close. 1) Are they confident you can get them to their goal? 2) Are they committing to actually doing the work? Both need yes + explanation.',
tristan_note:'"With what we went over — are you confident we can get you to [their goal]? Yes → from who tells me why they\'re certain." Then: "Are you committing to following through, that you will succeed? Yes — why?" Both questions need real answers not just yes.',
questions:{
anytime:['With everything we went over — are you confident we can get you to [their goal]?','Good — now the other half: are you committed to actually doing the work to get there? Why?','What would be a good number for you?'],
situational:['You said [their reason for confidence] — what specifically makes you believe that?'],
pin:[]
},
auto_fail:['Skipped certainty check and went straight to price','Accepted "yeah sure" without getting real why'],
danger:'Both certainty questions need a real "why" answer. This is where you test conviction. Weak answers here = objections at close.'
},
{
id:'ph_objections', name:'Price + Objections + Close 🏁', hint:'Group multiple objections → Handle individually → Soft close → Never hard close',
checkpoints_needed:[],
goal:'If the call was built correctly — minimal objections. Multiple objections = something earlier failed. Group multiple objections to certainty first. Handle individually. Close softly.',
tristan_note:'Multiple objections = collapse to one: "Is it fair to say you\'re really looking for certainty this will work?" Then: "If you knew 100% you wouldn\'t fail — would you still be concerned?" Their yes = everything collapses to self-belief. That\'s all you\'re solving.',
questions:{
anytime:['Is it fair to say — with everything you just said — what you\'re really looking for is certainty this is going to work for you?','If you knew for 100% fact you wouldn\'t fail — would you still be concerned about [objection]?','So based on everything — what are you going to do?'],
situational:['You said [objection] — is that really the thing or is there something underneath that?','Aside from [objection] — do you actually believe this could get you where you want to go?'],
pin:['Is not having [money/time] a problem or a symptom of the exact problem we just spent [time] talking about?','Which is actually riskier — staying exactly where you are or doing something about it now?']
},
auto_fail:['Handled multiple objections separately instead of grouping','Argued instead of accepting and reframing','Apologized for price','Hard closed'],
danger:'NEVER argue. Accept and reframe every time. Multiple objections = group to certainty. The real objection is always self-belief. Everything else is a smoke screen.'
}
];

// ── AVATAR DATA (same as original) ────────────────────────────────────
const AVATARS = {
founder:{key:'founder',full_name:'7–8 Figure Founder',sub:'Entrepreneur · Agency Owner · Startup Builder',accent_color:'#e8a838',accent_dim:'#3d2a00',icon:'⚙️',
names:['Marcus','Sarah','Derek','Priya','Ryan','Michelle','Jason','Carlos','Craig','Danielle'],
bios:['runs a 7-fig marketing agency, team of 18, just hit $4M/yr — feels like the wheels are coming off behind closed doors','founded a DTC wellness brand, grew to $6M in 3 years, stuck at same revenue for 18 months, blames the market','owns a consulting firm, team of 12, does great work but is the bottleneck for every single decision','SaaS founder, just crossed $1M ARR, first-time CEO, privately terrified she\'ll be exposed as someone who got lucky','runs a coaching business at $2M/yr built entirely on personal brand — terrified the brand is more successful than she actually is'],
challenges:['team keeps underperforming no matter who he hires','revenue flatlined after a strong run, blames the market','12-hour days, nothing actually compounds'],
false_beliefs:['The problem is my strategy','I just need to hire better people','I need to work harder'],
favorable_cause:'The real reason the business keeps hitting the same ceiling is that the operator running it hasn\'t been upgraded — only the business has.',
},
operator:{key:'operator',full_name:'High-Income Operator',sub:'Closer · Consultant · Creator',accent_color:'#4a90d9',accent_dim:'#0a2140',icon:'⚡',
names:['Chris','Tiffany','Tyler','Maya','Brandon','Jessica','Kyle','Nate'],
bios:['high-ticket closer doing $20-40k/mo on a good month, $8k on a bad one, hates the inconsistency','consultant running a one-man shop, smart, gets results for clients, can\'t seem to price herself properly','sales manager at a tech company, $200k OTE, hit it once, been chasing it since'],
challenges:['income swings wildly month to month','had the killer instinct, then lost it somewhere','pre-call anxiety he shouldn\'t have at this level'],
false_beliefs:['I just need more discipline and consistency','I need a better system or a better offer'],
favorable_cause:'Performance is inconsistent because confidence and output are anchored to an identity that was built for a lower level.',
},
reinvention:{key:'reinvention',full_name:'Reinvention-Stage Millionaire',sub:'Retired · Burnt-out · High Earner in Transition',accent_color:'#7b5ea7',accent_dim:'#200a35',icon:'🔄',
names:['Robert','Sandra','David','Yvonne','Steve','Patricia'],
bios:['sold his company 18 months ago, $8M exit, thought he\'d feel free — feels completely lost instead','retired exec in her late 40s, did very well, now has everything she thought she wanted and doesn\'t know what to do with it'],
challenges:['made the money, nothing pulls him forward anymore','starts new projects with fire, loses interest in 60 days'],
false_beliefs:['I just need to find the right next thing','I need more time to figure it out on my own'],
favorable_cause:'Nothing sticks because none of it rebuilt the identity underneath.',
},
cultural:{key:'cultural',full_name:'Cultural Power Player',sub:'Artist · Musician · Celebrity',accent_color:'#e05c5c',accent_dim:'#3a0a0a',icon:'🎨',
names:['Andre','Jade','Malik','Simone','Jordan','Destiny'],
bios:['Grammy-nominated R&B artist, 3 platinum records, privately questioning whether any of it is what he wanted to make','multi-platinum producer working with major labels, can\'t stop taking projects he doesn\'t believe in for the money'],
challenges:['creativity feels like output now, not expression','surrounded by yes-men, nobody tells him the truth'],
false_beliefs:['I just need the right creative direction','My problem is external: bad management, wrong team'],
favorable_cause:'Reinventions aren\'t landing because all the external changes are applied to a blocked internal source.',
},
athlete:{key:'athlete',full_name:'Pro Athlete in Transition',sub:'NFL · NBA · WWE · Active or Recently Retired',accent_color:'#3daa6e',accent_dim:'#072b17',icon:'🏆',
names:['Darius','Alicia','Marcus','Trevion','Jamal','Simone'],
bios:['former NFL wide receiver, 6 seasons, retired at 29, has money but no idea what to do with himself','NBA player in his final contract year, already thinking about what comes next, terrified of saying it out loud'],
challenges:['identity completely wrapped in the sport','feels purposeless despite having money'],
false_beliefs:['I just need to find the right business opportunity','The discipline I built in sport will transfer automatically'],
favorable_cause:'Nothing hits the way the sport did because he transferred his skills but not his identity.'
}
};

// ── A/B TYPE BEHAVIOR ADDITIONS ───────────────────────────────────────
const TYPE_BEHAVIOR = {
A:{
description:'Decisive operator. High ego — the chest-puff is the mask. Real fear runs deeper than B-Types. Already living outside comfort zone in some domain. Justifies instead of externalizes: "Already tried it." "Different situation." "Need more due diligence." Hides behind expertise and track record. Thinks they don\'t need you.',
opening:'Direct, possibly curt. May try to run the call or establish dominance immediately. Sets status signals early.',
resistance:'Intellectual challenge — will try to poke holes. Expertise as armor. "I\'ve done the inner work." "I\'ve been in therapy for years." Won\'t admit fear easily.',
what_sells:'Logical pain — numbers, systems, hours, what\'s leaking. Sharpness and competence earn the right to go deep. Never condescend — they porcupine instantly.',
fear_signal:'When they start admitting the pattern follows them everywhere despite trying everything. When they get quiet instead of combative.',
buying_signal:'Stops challenging. Starts asking how. Drops the performance.'
},
B:{
description:'Indecisive overthinker. Lacks internal self-worth. Lives inside comfort zone. Externalizes everything — spouse, money, time, family in the way. Uses spouse as a shield. Does not take ownership for current circumstances.',
opening:'Warm but scattered. May give too much information. Talks fast and jumps between topics. Needs to be focused.',
resistance:'External blame: spouse, economy, kids, timing, resources. Will agree to everything on the call then ghost.',
what_sells:'Emotional pain. Identity-gap work. Urgency through lifestyle outcomes — the house, the car, the family. Manufactured push-away to create urgency.',
fear_signal:'When they start adding LOL energy or softening serious statements. When they say "it\'s fine" but clearly it isn\'t.',
buying_signal:'Gets emotional. Starts talking about specific people and relationships affected. Stops deflecting to external factors.'
}
};
