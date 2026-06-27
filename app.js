const $ = (sel) => document.querySelector(sel);
const cfg = window.API_CONFIG || { provider:'off', refreshSeconds:60 };
let mode = 'real';
let currentData = clone(window.REAL_BRACKET_DATA);

function clone(o){ return JSON.parse(JSON.stringify(o)); }
function normalize(s){return String(s||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[ch]));}
function setStatus(msg,type='warn'){ $('#connectionStatus').textContent=msg; $('#statusDot').className='dot '+(type==='ok'?'ok':type==='err'?'err':''); }

const slots = {
  leftR32:[0,1,2,3,4,5,6,7], leftR16:[0,1,2,3], leftQF:[0,1], leftSF:[0],
  rightR32:[8,9,10,11,12,13,14,15], rightR16:[4,5,6,7], rightQF:[2,3], rightSF:[1]
};
const y = { r32:[0,68,136,204,318,386,454,522], r16:[34,170,352,488], qf:[102,420], sf:[250] };
const yr = { r32:[0,68,136,204,318,386,454,522], r16:[34,170,352,488], qf:[102,420], sf:[250] };

function render(data){
  ['leftR32','leftR16','leftQF','leftSF','rightSF','rightQF','rightR16','rightR32'].forEach(id=>{$('#'+id).innerHTML=''});
  const rounds = Object.fromEntries((data.rounds||[]).map(r=>[r.key,r]));
  renderRound('leftR32', rounds.r32?.matches||[], slots.leftR32, y.r32);
  renderRound('leftR16', rounds.r16?.matches||[], slots.leftR16, y.r16);
  renderRound('leftQF', rounds.qf?.matches||[], slots.leftQF, y.qf);
  renderRound('leftSF', rounds.sf?.matches||[], slots.leftSF, y.sf);
  renderRound('rightR32', rounds.r32?.matches||[], slots.rightR32, yr.r32);
  renderRound('rightR16', rounds.r16?.matches||[], slots.rightR16, yr.r16);
  renderRound('rightQF', rounds.qf?.matches||[], slots.rightQF, yr.qf);
  renderRound('rightSF', rounds.sf?.matches||[], slots.rightSF, yr.sf);
  renderFinal(rounds.final?.matches||[], data.champion);
  renderChips(data.qualifiedTeams||[]);
  drawConnectors();
}
function renderRound(containerId, matches, indexes, positions){
  const el = $('#'+containerId);
  indexes.forEach((idx,i)=>{
    const m = matches[idx] || {id:'',date:'',home:'TBD',away:'TBD'};
    const card = matchCard(m);
    card.style.top = positions[i]+'px';
    el.appendChild(card);
  });
}
function matchCard(m){
  const status=(m.status||'').toLowerCase();
  const card=document.createElement('article');
  card.className='match '+(m.predicted?'predicted ':'')+(status.includes('ft')?'done ':'')+(['1h','2h','ht','et','p'].includes(status)?'live ':'');
  card.innerHTML=`<div class="match-header"><span>${escapeHtml(m.id||'')}</span><span>${escapeHtml(m.date||m.status||'')}</span></div>${teamRow(m.home,m.homeScore,m.winner)}${teamRow(m.away,m.awayScore,m.winner)}`;
  return card;
}
function teamRow(name,score,winner){
  const tbd=!name||normalize(name)==='tbd';
  const win=winner&&normalize(name)===normalize(winner);
  return `<div class="team ${tbd?'tbd':''} ${win?'winner':''}"><span class="name">${escapeHtml(name||'TBD')}</span><span class="score">${score??''}</span></div>`;
}
function renderFinal(matches, champion){
  const final = matches[0] || {id:'M104',date:'JUL 19',home:'TBD',away:'TBD',venue:'MetLife Stadium, NJ'};
  $('#finalMatch').innerHTML = `<div class="match-header">FINAL</div><div class="final-meta">${escapeHtml(final.id||'M104')} · ${escapeHtml(final.date||'JUL 19')}<br>${escapeHtml(final.venue||'MetLife Stadium, NJ')}</div>${teamRow(final.home,final.homeScore,final.winner)}${teamRow(final.away,final.awayScore,final.winner)}`;
  $('#champion').innerHTML = `★ CHAMPION ★<br><strong>${escapeHtml(champion||'TBD')}</strong>`;
  const third = matches[1] || {id:'M103',date:'JUL 18',home:'TBD',away:'TBD'};
  $('#thirdPlace').innerHTML = `<div class="match-header">3RD PLACE</div><div class="third-meta">${escapeHtml(third.id||'M103')} · ${escapeHtml(third.date||'JUL 18')}</div>${teamRow(third.home,third.homeScore,third.winner)}${teamRow(third.away,third.awayScore,third.winner)}`;
}
function renderChips(teams){ const el=$('#qualifiedList'); el.innerHTML=''; teams.forEach(t=>{const s=document.createElement('span');s.className='chip';s.textContent=t;el.appendChild(s);}); }
function drawConnectors(){
  document.querySelectorAll('.connector').forEach(e=>e.remove());
  // Decorative connector lines approximating the attached PDF layout.
  const pairs = [
    ['leftR32',58,68],['leftR32',194,68],['leftR32',376,68],['leftR32',512,68],
    ['leftR16',92,136],['leftR16',410,136],['leftQF',160,318],
    ['rightR32',58,68],['rightR32',194,68],['rightR32',376,68],['rightR32',512,68],
    ['rightR16',92,136],['rightR16',410,136],['rightQF',160,318]
  ];
  pairs.forEach(([id,top,height])=>{ const el=$('#'+id); const v=document.createElement('span'); v.className='connector v'; v.style.top=top+'px'; v.style.height=height+'px'; v.style.right='-13px'; if(id.startsWith('right')){v.style.right='auto';v.style.left='-13px'} el.appendChild(v); });
}

async function fetchLiveScores(){
  try{
    if(mode==='prediction'){ setStatus('Prediction mode is active. Click “Real teams only” to return.','warn'); return; }
    if(cfg.provider==='off') throw new Error('Live API is switched off');
    let payload;
    if(cfg.provider==='proxy'){
      const res=await fetch('/.netlify/functions/live-scores');
      if(!res.ok) throw new Error('Proxy returned '+res.status+' — deploy to Netlify and add API key');
      payload=await res.json();
    } else if(cfg.provider==='api-football-direct' && cfg.apiFootball?.enabled){
      const url=`${cfg.apiFootball.baseUrl}/fixtures?league=${cfg.apiFootball.league}&season=${cfg.apiFootball.season}`;
      const res=await fetch(url,{headers:{'x-apisports-key':cfg.apiFootball.apiKey}});
      if(!res.ok) throw new Error('API returned '+res.status);
      payload=await res.json();
    } else throw new Error('No API provider configured');
    currentData = mergeApiFootball(window.REAL_BRACKET_DATA,payload); currentData.mode='real'; render(currentData); setStatus('Live API connected. Last refresh: '+new Date().toLocaleTimeString(),'ok');
  }catch(err){ currentData=clone(window.REAL_BRACKET_DATA); render(currentData); setStatus('Showing real qualified teams fallback. Live API not connected: '+err.message,'err'); }
}
function mergeApiFootball(localData, apiPayload){
  const fixtures=Array.isArray(apiPayload?.response)?apiPayload.response:[]; if(!fixtures.length) return clone(localData);
  const words=['Round of 32','8th Finals','Round of 16','Quarter','Semi','Final','3rd Place'];
  const relevant=fixtures.filter(f=>words.some(w=>String(f.league?.round||'').toLowerCase().includes(w.toLowerCase()))); if(!relevant.length) return clone(localData);
  const roundMap={'Round of 32':'r32','8th Finals':'r16','Round of 16':'r16','Quarter':'qf','Semi':'sf','Final':'final','3rd Place':'final'};
  const buckets={r32:[],r16:[],qf:[],sf:[],final:[]}; const rebuilt={mode:'real',generatedAt:new Date().toISOString(),source:'Live API',qualifiedTeams:[...localData.qualifiedTeams],rounds:[],champion:'TBD'};
  relevant.sort((a,b)=>new Date(a.fixture?.date||0)-new Date(b.fixture?.date||0)).forEach(f=>{
    const rn=String(f.league?.round||''); const key=Object.keys(roundMap).find(k=>rn.toLowerCase().includes(k.toLowerCase())); const bucket=roundMap[key]||'r32';
    const home=f.teams?.home?.name||'TBD', away=f.teams?.away?.name||'TBD'; let winner=null; if(f.teams?.home?.winner) winner=home; if(f.teams?.away?.winner) winner=away;
    buckets[bucket].push({id:'M'+(f.fixture?.id||''),date:f.fixture?.status?.short||(f.fixture?.date?new Date(f.fixture.date).toLocaleDateString():''),status:f.fixture?.status?.short||'',home,away,homeScore:f.goals?.home,awayScore:f.goals?.away,winner,venue:f.fixture?.venue?.name||f.venue?.name||''});
    [home,away].forEach(t=>{ if(t&&normalize(t)!=='tbd'&&!rebuilt.qualifiedTeams.some(q=>normalize(q)===normalize(t))) rebuilt.qualifiedTeams.push(t); });
  });
  const labels={r32:'Round of 32',r16:'Round of 16',qf:'Quarterfinal',sf:'Semifinal',final:'Final'};
  ['r32','r16','qf','sf','final'].forEach(k=>rebuilt.rounds.push({key:k,name:labels[k],matches:buckets[k].length?buckets[k]:clone(localData.rounds.find(r=>r.key===k)?.matches||[])}));
  const final=rebuilt.rounds.find(r=>r.key==='final')?.matches?.[0]; if(final?.winner) rebuilt.champion=final.winner; return rebuilt;
}

$('#predictionBtn').addEventListener('click',()=>{mode='prediction'; currentData=clone(window.PREDICTION_BRACKET_DATA); render(currentData); setStatus('Prediction mode activated. This is not real data.','warn');});
$('#realBtn').addEventListener('click',()=>{
  mode='real';
  currentData=clone(window.REAL_BRACKET_DATA);
  render(currentData);
  setStatus('Real teams only. Prediction removed. Auto API refresh is OFF.', 'ok');
});
$('#refreshBtn').addEventListener('click',fetchLiveScores); $('#printBtn').addEventListener('click',()=>window.print());
render(currentData);
setStatus('Real qualified teams loaded. Auto API refresh is OFF. Click Refresh live data to update manually.', 'ok');
