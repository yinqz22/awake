/* =====================================================================
   ADMIN PANEL  (roles: member | admin | owner)
   IMPORTANT: everything in this file is only the USER INTERFACE. Hiding buttons or the Admin tab is
   cosmetic. The real protection is firestore.rules.admin (roles in authz/<uid>, enforced by Google's servers).
   ===================================================================== */
const ADM={tab:'base',rows:[],loaded:false,q:'',cache:{}};
const admEsc=esc;
const tsMs=v=>v&&v.toMillis?v.toMillis():(typeof v==='number'?v:0);
const myRoleAdm=()=>(user&&user._az&&user._az.role)||'member';
function adminAllowed(){ return ['admin','owner'].includes(myRoleAdm()); }
function adminSyncNav(){
  const sb=document.getElementById('sidebar'); if(!sb) return;
  let b=document.getElementById('navAdmin');
  if(adminAllowed()){
    if(!b){ b=document.createElement('button'); b.className='side-btn'+(currentView==='admin'?' active':''); b.id='navAdmin'; b.title='Admin'; b.onclick=()=>showView('admin'); b.innerHTML='<span class="ico ico-admin"></span>'; sb.insertBefore(b,document.getElementById('navSettings')); }
  } else { if(b) b.remove(); if(currentView==='admin') showView('home'); }
}
if(window.AWAKE_ROUTES) window.AWAKE_ROUTES.admin=()=>{ if(!adminAllowed()) return false; showView('admin'); return true; };

/* ---------- helpers ---------- */
const fmtD=ts=>{ if(!ts) return '—'; try{ return new Date(ts).toLocaleDateString(awLocale(),{day:'2-digit',month:'2-digit',year:'numeric'}); }catch(e){ return '—'; } };
const fmtDT=ts=>{ if(!ts) return '—'; try{ return new Date(ts).toLocaleString(awLocale(),{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}); }catch(e){ return '—'; } };
function ago(ts){ if(!ts) return 'never'; const s=(Date.now()-ts)/1000; if(s<90) return 'just now'; if(s<3600) return Math.round(s/60)+' min ago'; if(s<86400) return Math.round(s/3600)+' h ago'; if(s<86400*30) return Math.round(s/86400)+' d ago'; return fmtD(ts); }
const eur=n=>{ try{ return new Intl.NumberFormat(awLocale(),{style:'currency',currency:'EUR'}).format(n); }catch(e){ return n.toFixed(2)+' €'; } };
function rowStatus(r){ if(r.banned) return 'BANNED'; if(!r.migrated) return 'NOT MIGRATED'; if(r.last&&Date.now()-r.last<5*60*1000) return 'ONLINE'; return 'ACTIVE'; }
const roleBadge=r=>`<span class="adm-badge role-${r}">${r.toUpperCase()}</span>`;
const statBadge=s=>`<span class="adm-badge st-${s.replace(/\s+/g,'').toLowerCase()}">${s}</span>`;
const avatarHtml=(r,cls='')=>`<div class="avatar adm-av ${cls}">${r.avatar?`<img src="${admEsc(r.avatar)}">`:admEsc(initials(r.name))}</div>`;
function copyText(t){ navigator.clipboard.writeText(t).then(()=>toast('Copied.')).catch(()=>toast('Copy failed.')); }
function canManage(r){
  const me=myRoleAdm();
  if(r.id===user.id||r.uid===user.uid) return false;
  if(me==='owner') return r.role!=='owner';
  if(me==='admin') return r.role==='member';
  return false;
}

/* ---------- data ---------- */
async function admLoad(){
  const [u,a,m,t]=await Promise.all(['users','authz','adminmeta','activity'].map(c=>db.col(c).get()));
  const az={}, meta={}, act={};
  a.forEach(d=>{ const x=d.data(); if(x&&x.id) az[x.id]=Object.assign({uid:d.id},x); });
  m.forEach(d=>{ meta[d.id]=d.data(); }); t.forEach(d=>{ act[d.id]=d.data(); });
  const rows=[];
  u.forEach(d=>{ const x=d.data()||{}, id=d.id, z=az[id];
    rows.push({id,name:x.name||id,avatar:x.avatar||'',joined:x.createdAt||(z&&z.joinedAt)||0,role:z?z.role:'member',uid:z?z.uid:'',banned:!!(z&&z.banned),banReason:(z&&z.banReason)||'',
      publicId:(meta[id]&&meta[id].publicId)||'',last:tsMs(act[id]&&act[id].lastActive),migrated:!!x.uid&&!!z,friends:(x.friends||[]).length}); });
  const order={owner:0,admin:1,member:2};
  rows.sort((p,q)=>(order[p.role]-order[q.role])||p.name.localeCompare(q.name));
  ADM.rows=rows; ADM.loaded=true;
  // give every existing and new user a random 22-character ID (generated once, never changes)
  for(const r of rows.filter(r=>!r.publicId)){
    try{
      for(let i=0;i<3;i++){ const pid=genPublicId(); const ex=await db.doc('pubids/'+pid).get(); if(ex.exists) continue;
        await db.doc('pubids/'+pid).set({id:r.id}); await db.doc('adminmeta/'+r.id).set({publicId:pid,createdAt:Date.now()}); r.publicId=pid; break; }
    }catch(e){}
  }
}
async function admFit(r){
  const k='fit:'+r.id; if(ADM.cache[k]) return ADM.cache[k];
  let fit={workouts:[],body:[],months:[],doneCount:0}, logs=[];
  try{ const s=await db.doc('sessions/fit_'+r.id).get(); if(s.exists) fit=Object.assign(fit,s.data()); }catch(e){}
  await Promise.all((fit.months||[]).map(async ym=>{ try{ const s=await db.doc(`sessions/fitlog_${r.id}_${ym}`).get(); if(s.exists) logs.push(...(s.data().sessions||[])); }catch(e){} }));
  logs.sort((a,b)=>b.ts-a.ts);
  return ADM.cache[k]={fit,logs};
}
async function admStats(r){
  const k='st:'+r.id; if(ADM.cache[k]) return ADM.cache[k];
  let ids=[]; try{ const p=await db.doc('private/'+r.id).get(); if(p.exists) ids=p.data().sessions||[]; }catch(e){}
  const docs=await Promise.all(ids.map(id=>db.doc('sessions/'+id).get().catch(()=>null)));
  let revenue=0, profit=0, n=0;
  docs.filter(d=>d&&d.exists).forEach(d=>{ n++; (d.data().items||[]).forEach(i=>{ if(i.status==='verkauft'){ revenue+=+i.sellPrice||0; profit+=(+i.sellPrice||0)-(+i.buyPrice||0); } }); });
  const {fit,logs}=await admFit(r);
  return ADM.cache[k]={revenue,profit,sessions:n,workouts:(fit.workouts||[]).length,trainings:Math.max(fit.doneCount||0,logs.length)};
}

/* ---------- page ---------- */
function admRender(){
  const el=document.getElementById('content'); if(!el) return;
  el.innerHTML=`<div class="adm-wrap fade">
    <div class="adm-head"><span class="adm-logo"><span class="ico ico-admin"></span></span><div><h2>Admin Panel</h2><small>${roleBadge(myRoleAdm())}</small></div>
      <button type="button" class="btn-small adm-test" onclick="admSelfTest()">Security check</button></div>
    <div class="wk-sub adm-tabs" id="admTabs"><span class="pill"></span>
      <button type="button" class="${ADM.tab==='base'?'on':''}" onclick="admTab('base')">USER BASE</button>
      <button type="button" class="${ADM.tab==='deep'?'on':''}" onclick="admTab('deep')">DEEP SEARCH</button></div>
    <div id="admBody"></div></div>`;
  admPill(false); admBody();
}
function admPill(anim){
  const sub=document.getElementById('admTabs'); if(!sub) return; const on=sub.querySelector('button.on'), pill=sub.querySelector('.pill'); if(!on||!pill) return;
  if(!anim) pill.style.transition='none'; pill.style.width=on.offsetWidth+'px'; pill.style.transform=`translateX(${on.offsetLeft-4}px)`; if(!anim) requestAnimationFrame(()=>{ pill.style.transition=''; });
}
function admTab(t){
  if(ADM.tab===t) return; ADM.tab=t;
  document.querySelectorAll('#admTabs button').forEach((b,i)=>b.classList.toggle('on',(i===0)===(t==='base'))); admPill(true);
  const b=document.getElementById('admBody'); b.classList.remove('wk-in'); void b.offsetWidth; b.classList.add('wk-in'); admBody();
}
async function admBody(){
  const body=document.getElementById('admBody'); if(!body) return;
  if(!ADM.loaded){
    body.innerHTML='<div class="wk-loading"><span class="wk-spin"></span></div>';
    try{ await admLoad(); }
    catch(e){ body.innerHTML=`<div class="card-box adm-err">Could not load users (${admEsc((e&&e.code)||'error')}). If you just changed the database rules, make sure your account has a role in <b>authz</b>.</div>`; return; }
    if(!document.getElementById('admBody')) return;
  }
  if(ADM.tab==='base') admBase(body); else admDeep(body);
}

/* ---------- user base ---------- */
function admBase(body){
  body.innerHTML=`<div class="adm-search"><span class="adm-mag">⌕</span><input id="admQ" placeholder="Search username or user ID..." value="${admEsc(ADM.q)}" autocomplete="off" oninput="admFilter(this.value)"><button type="button" class="adm-clear ${ADM.q?'':'hidden'}" id="admClr" onclick="admFilter('');document.getElementById('admQ').value=''">✕</button></div>
    <div class="adm-count" id="admCount"></div><div class="adm-list" id="admList"></div>`;
  admList();
}
let _admT; function admFilter(v){ ADM.q=v; document.getElementById('admClr')?.classList.toggle('hidden',!v); clearTimeout(_admT); _admT=setTimeout(admList,60); }
function admMatch(q){ q=q.trim().toLowerCase(); if(!q) return ADM.rows; return ADM.rows.filter(r=>r.name.toLowerCase().includes(q)||r.id.includes(q)||(r.publicId&&r.publicId.toLowerCase()===q)||(q.length>=6&&r.publicId&&r.publicId.toLowerCase().startsWith(q))); }
function admList(){
  const list=document.getElementById('admList'); if(!list) return;
  const rows=admMatch(ADM.q);
  document.getElementById('admCount').textContent=`${rows.length} ${rows.length===1?'user':'users'}`;
  if(!rows.length){ list.innerHTML='<div class="adm-empty">No user found</div>'; return; }
  list.innerHTML=rows.map((r,i)=>`<div class="adm-card ${r.banned?'banned':''}" style="animation-delay:${Math.min(i,10)*28}ms">
    ${avatarHtml(r)}
    <div class="adm-main"><button type="button" class="adm-name" onclick="admOpen('${r.id}')">${admEsc(r.name)}</button>
      <div class="adm-meta">${roleBadge(r.role)} ${statBadge(rowStatus(r))}</div></div>
    <div class="adm-cols">
      <div><small>User ID</small><span class="adm-id">${r.publicId?`<code>${admEsc(r.publicId)}</code><button type="button" class="copy-btn" onclick="copyText('${admEsc(r.publicId)}')" aria-label="Copy ID"><span class="ico-copy"></span></button>`:'—'}</span></div>
      <div><small>Joined</small><span>${fmtD(r.joined)}</span></div>
      <div><small>Last active</small><span>${admEsc(ago(r.last))}</span></div></div></div>`).join('');
}

/* ---------- profile (popup + deep search share this) ---------- */
function admProfileHtml(r,full){
  return `<div class="adm-prof-head">${avatarHtml(r,'big')}<div><h2>${admEsc(r.name)}</h2><div class="adm-meta">${roleBadge(r.role)} ${statBadge(rowStatus(r))}</div></div></div>
    ${r.banned?`<div class="adm-alert">Banned${r.banReason?': '+admEsc(r.banReason):''}</div>`:''}
    ${!r.migrated?`<div class="adm-note">This account has not signed in since the secure login was introduced yet. Role actions become available after the first login.</div>`:''}
    <h4 class="adm-sec">Profile</h4>
    <div class="adm-grid">
      <div><small>Username</small><b>${admEsc(r.name)}</b></div>
      <div><small>User ID</small><b class="adm-id">${r.publicId?`<code>${admEsc(r.publicId)}</code><button type="button" class="copy-btn" onclick="copyText('${admEsc(r.publicId)}')"><span class="ico-copy"></span></button>`:'—'}</b></div>
      <div><small>Role</small><b>${r.role.toUpperCase()}</b></div>
      <div><small>Joined</small><b>${fmtD(r.joined)}</b></div>
      <div><small>Status</small><b>${rowStatus(r)}</b></div>
      <div><small>Last active</small><b>${r.last?fmtDT(r.last):'—'}</b></div></div>
    <h4 class="adm-sec">Stats</h4>
    <div class="adm-grid stats" data-stats="${r.id}"><div><small>Revenue</small><b>…</b></div><div><small>Profit</small><b>…</b></div><div><small>Workouts</small><b>…</b></div><div><small>Sessions</small><b>…</b></div><div><small>Trainings done</small><b>…</b></div></div>
    ${full?`<h4 class="adm-sec">Workouts</h4><div id="admWk" class="adm-sub"><div class="wk-loading"><span class="wk-spin"></span></div></div>
    <h4 class="adm-sec">Sessions</h4><div id="admSs" class="adm-sub"><div class="wk-loading"><span class="wk-spin"></span></div></div>`:''}
    ${admActionsHtml(r)}`;
}
function admActionsHtml(r){
  if(!canManage(r)){ return `<div class="adm-note">${r.role==='owner'?'The owner account is protected and cannot be changed.':(r.id===user.id?'This is your own account.':'You have no management rights for this account.')}</div>`; }
  const me=myRoleAdm(), a=[];
  if(me==='owner'&&r.migrated) a.push(r.role==='admin'?`<button class="adm-btn" onclick="admAct('demote','${r.id}')">Remove Admin</button>`:`<button class="adm-btn" onclick="admAct('promote','${r.id}')">Make Admin</button>`);
  if(r.migrated) a.push(`<button class="adm-btn" onclick="admAct('kick','${r.id}')">Kick user</button>`);
  if(r.migrated) a.push(r.banned?`<button class="adm-btn" onclick="admAct('unban','${r.id}')">Unban user</button>`:`<button class="adm-btn warn" onclick="admAct('ban','${r.id}')">Ban user</button>`);
  a.push(`<button class="adm-btn" onclick="admAct('pw','${r.id}')">Change password</button>`);
  a.push(`<button class="adm-btn danger" onclick="admAct('delete','${r.id}')">Delete account</button>`);
  return `<h4 class="adm-sec">Manage</h4><div class="adm-actions">${a.join('')}</div>`;
}
async function admFillDetail(root,r,full){
  const st=await admStats(r); const g=root.querySelector(`[data-stats="${r.id}"]`);
  if(g) g.innerHTML=`<div><small>Revenue</small><b>${eur(st.revenue)}</b></div><div><small>Profit</small><b>${eur(st.profit)}</b></div><div><small>Workouts</small><b>${st.workouts}</b></div><div><small>Sessions</small><b>${st.sessions}</b></div><div><small>Trainings done</small><b>${st.trainings}</b></div>`;
  if(!full) return;
  const {fit,logs}=await admFit(r);
  const wk=root.querySelector('#admWk'), ss=root.querySelector('#admSs');
  if(wk) wk.innerHTML=(fit.workouts||[]).length?fit.workouts.map(w=>{
    const mine=logs.filter(l=>l.wid===w.id), last=mine[0], avg=mine.length?mine.reduce((a,l)=>a+(l.dur||0),0)/mine.length:0;
    return `<div class="adm-wk"><div class="adm-wk-top"><b>${admEsc(w.name)}</b><span>${fmtD(w.createdAt)}</span></div>
      <div class="adm-wk-prog"><span>${mine.length} trainings</span><span>${avg?'Ø '+fmtMin(avg):'—'}</span><span>${last?'last: '+fmtD(last.ts):'not started'}</span></div>
      ${(w.days||[]).map(d=>`<div class="adm-day"><em>${admEsc(dayShort(d.d))}${d.label?' · '+admEsc(d.label):''}</em><div>${(d.exercises||[]).map(e=>`<span>${admEsc(e.name)} <i>${e.sets}×${e.reps}${e.weight?' · '+e.weight+' kg':''}</i></span>`).join('')}</div></div>`).join('')}</div>`;
  }).join(''):'<div class="adm-empty small">No workouts created yet.</div>';
  if(ss) ss.innerHTML=logs.length?`<div class="adm-tbl"><table><thead><tr><th>Date</th><th>Workout</th><th>Exercises</th><th>Sets</th><th>Duration</th><th>Status</th></tr></thead><tbody>${logs.slice(0,40).map(l=>{
      const ex=l.exs||[], done=ex.filter(e=>e.status==='done').length, partial=ex.some(e=>e.status!=='done');
      return `<tr><td>${fmtDT(l.ts)}</td><td>${admEsc(l.wname||'')}${l.label?' · '+admEsc(l.label):''}</td><td>${done}/${ex.length}<small>${ex.map(e=>admEsc(e.name)).join(', ')}</small></td><td>${l.sets||0}</td><td>${l.dur?fmtMin(l.dur):'—'}</td><td>${partial?'<span class="adm-badge st-online">PARTIAL</span>':'<span class="adm-badge st-active">COMPLETED</span>'}</td></tr>`; }).join('')}</tbody></table></div>`:'<div class="adm-empty small">No training sessions yet.</div>';
}
function admOpen(id){
  const r=ADM.rows.find(x=>x.id===id); if(!r) return; admClosePop(true);
  const ov=document.createElement('div'); ov.className='adm-ov'; ov.id='admPop';
  ov.innerHTML=`<div class="adm-modal"><button type="button" class="adm-x" onclick="admClosePop()" aria-label="Close">✕</button><div class="adm-modal-in">${admProfileHtml(r,false)}</div></div>`;
  ov.onclick=e=>{ if(e.target===ov) admClosePop(); }; document.body.appendChild(ov);
  admFillDetail(ov,r,false);
}
function admClosePop(now){ const o=document.getElementById('admPop'); if(!o) return; if(now){ o.remove(); return; } o.classList.add('closing'); setTimeout(()=>o.remove(),200); }
document.addEventListener('keydown',e=>{ if(e.key==='Escape') admClosePop(); });

/* ---------- deep search ---------- */
function admDeep(body){
  body.innerHTML=`<div class="adm-search big"><span class="adm-mag">⌕</span><input id="admDq" placeholder="Enter username or user ID..." value="${admEsc(ADM.dq||'')}" autocomplete="off" onkeydown="if(event.key==='Enter')admDeepGo()"><button type="button" class="adm-go" onclick="admDeepGo()">Search</button></div><div id="admDres"></div>`;
  if(ADM.dq) admDeepGo(true);
}
function admDeepGo(silent){
  const q=(document.getElementById('admDq').value||'').trim(); ADM.dq=q; const out=document.getElementById('admDres'); if(!out) return;
  if(!q){ out.innerHTML=''; return; }
  let hits=[];
  if(/^[A-Za-z0-9]{22}$/.test(q)) hits=ADM.rows.filter(r=>r.publicId===q);
  if(!hits.length){ const l=q.toLowerCase(); hits=ADM.rows.filter(r=>r.id===safeId(q)||r.name.toLowerCase()===l); if(!hits.length) hits=ADM.rows.filter(r=>r.name.toLowerCase().includes(l)||r.id.includes(l)); }
  if(!hits.length){ out.innerHTML='<div class="adm-empty fade">No user found</div>'; return; }
  if(hits.length>1){ out.innerHTML=`<div class="adm-count">${hits.length} matches</div><div class="adm-list">${hits.map((r,i)=>`<div class="adm-card" style="animation-delay:${i*28}ms">${avatarHtml(r)}<div class="adm-main"><button type="button" class="adm-name" onclick="admDeepOpen('${r.id}')">${admEsc(r.name)}</button><div class="adm-meta">${roleBadge(r.role)} ${statBadge(rowStatus(r))}</div></div></div>`).join('')}</div>`; return; }
  admDeepOpen(hits[0].id);
}
function admDeepOpen(id){
  const r=ADM.rows.find(x=>x.id===id); const out=document.getElementById('admDres'); if(!r||!out) return;
  out.innerHTML=`<div class="adm-deep fade">${admProfileHtml(r,true)}</div>`; admFillDetail(out,r,true);
}

/* ---------- actions ---------- */
function admConfirm(title,text,btn,cls,fn,extra){
  admClosePop(true);
  const ov=document.createElement('div'); ov.className='adm-ov'; ov.id='admPop';
  ov.innerHTML=`<div class="adm-modal small"><div class="adm-modal-in"><h3>${title}</h3><p class="adm-p">${text}</p>${extra||''}<div class="err" id="admErr"></div>
    <div class="adm-confirm"><button type="button" class="btn-ghost" onclick="admClosePop()">Cancel</button><button type="button" class="adm-btn ${cls}" id="admGo">${btn}</button></div></div></div>`;
  ov.onclick=e=>{ if(e.target===ov) admClosePop(); }; document.body.appendChild(ov);
  const go=document.getElementById('admGo'); go.onclick=async()=>{ go.disabled=true; try{ await fn(); admClosePop(); }catch(e){ document.getElementById('admErr').textContent=(e&&e.code==='permission-denied')?'Not allowed (database rules).':'Failed: '+((e&&e.message)||e); go.disabled=false; } };
}
async function admAfter(msg){ ADM.cache={}; await admLoad(); toast(msg); if(currentView==='admin'){ if(ADM.tab==='base') admList(); else if(ADM.dq) admDeepGo(true); } }
function admAct(kind,id){
  const r=ADM.rows.find(x=>x.id===id); if(!r||!canManage(r)) return;
  if(kind==='kick') return admConfirm('Kick user','Are you sure you want to kick this user?<br><small>They are signed out now and can sign in again.</small>','Kick','warn',async()=>{ await db.doc('authz/'+r.uid).updateRaw({kickedAt:db.ts()}); await admAfter('User kicked.'); });
  if(kind==='ban') return admConfirm('Ban user','This signs the user out and blocks every future login.','Ban','danger',async()=>{ const reason=(document.getElementById('admReason').value||'').trim().slice(0,120); await db.doc('authz/'+r.uid).updateRaw({banned:true,banReason:reason,kickedAt:db.ts()}); await admAfter('User banned.'); },
      '<input id="admReason" class="adm-input" maxlength="120" placeholder="Reason (optional)">');
  if(kind==='unban') return admConfirm('Unban user','The user can sign in again.','Unban','',async()=>{ await db.doc('authz/'+r.uid).updateRaw({banned:false,banReason:db.del()}); await admAfter('User unbanned.'); });
  if(kind==='promote') return admConfirm('Make Admin','This user gets admin rights.','Make Admin','',async()=>{ await db.doc('authz/'+r.uid).updateRaw({role:'admin'}); await admAfter('Role updated.'); });
  if(kind==='demote') return admConfirm('Remove Admin','This user becomes a normal member.','Remove Admin','warn',async()=>{ await db.doc('authz/'+r.uid).updateRaw({role:'member'}); await admAfter('Role updated.'); });
  if(kind==='delete') return admConfirm('Delete this account permanently?',`All data of <b>${admEsc(r.name)}</b> (profile, workouts, session list) will be removed. This cannot be undone.<br><small>Type the username to confirm.</small>`,'Delete','danger',async()=>{
      if((document.getElementById('admTyped').value||'').trim().toLowerCase()!==r.name.toLowerCase()) throw new Error('Username does not match.');
      await admDeleteUser(r); await admAfter('Account deleted.'); },
      '<input id="admTyped" class="adm-input" placeholder="Username" autocomplete="off">');
  if(kind==='pw') return admConfirm('Change password',
    `The free Firebase plan cannot set another person's password from here (that needs a server). Safe replacement:<ol class="adm-ol"><li>Firebase Console → Authentication → Users → delete <code>${admEsc(r.id)}@awake.app</code></li><li>Click <b>Allow reset</b> below</li><li>Tell the user to sign in with their name and a <b>new</b> password</li></ol><small>Their profile and data are kept. Their current session ends.</small>`,
    'Allow reset','warn',async()=>{ await db.doc('users/'+r.id).updateRaw({uid:db.del(),resetOk:true}); if(r.uid){ try{ await db.doc('authz/'+r.uid).delete(); }catch(e){} } await admAfter('Reset allowed.'); });
}
async function admDeleteUser(r){
  try{ const ud=await db.doc('users/'+r.id).get(); const fr=(ud.exists&&ud.data().friends)||[]; await Promise.all(fr.map(async f=>{ try{ const tid=safeId(f), td=await db.doc('users/'+tid).get(); if(td.exists) await db.doc('users/'+tid).update({friends:(td.data().friends||[]).filter(n=>n!==r.name)}); }catch(e){} })); }catch(e){}
  await wipeAccountData(r.id,r.publicId);
  await db.doc('users/'+r.id).delete();
  if(r.uid) await db.doc('authz/'+r.uid).delete();
}

/* ---------- security check: tries forbidden things; every "denied" is a pass ---------- */
async function admSelfTest(){
  const me=myRoleAdm(), isMem=me==='member';
  const fake='zz-selftest-'+Math.random().toString(36).slice(2,8);
  const owner=(ADM.rows||[]).find(r=>r.role==='owner');
  const T=[
    ['Create a login record with role OWNER',()=>db.doc('authz/'+fake).setRaw({id:fake,name:fake,role:'owner',banned:false,joinedAt:Date.now()}),true],
    ['Create a login record with role ADMIN',()=>db.doc('authz/'+fake).setRaw({id:fake,name:fake,role:'admin',banned:false,joinedAt:Date.now()}),true],
    ['List all roles / bans',()=>db.col('authz').get(),isMem],
    ['Read all 22-character user IDs',()=>db.col('adminmeta').get(),isMem],
    ['Read activity of all users',()=>db.col('activity').get(),isMem],
    ["Read another user's workouts",()=>db.doc('sessions/fit_'+fake).get(),isMem],
    ["Read another user's private data",()=>db.doc('private/'+fake).get(),isMem],
    ["Create a profile for someone else's name",()=>db.doc('users/'+fake).setRaw({name:fake,uid:'x'}),true],
    ['Write a fake 22-character ID',()=>db.doc('adminmeta/'+fake).setRaw({publicId:genPublicId()}),isMem]
  ];
  if(owner&&me!=='owner') T.push(['Change the OWNER account (kick)',()=>db.doc('authz/'+owner.uid).updateRaw({kickedAt:db.ts()}),true]);
  const ov=document.createElement('div'); ov.className='adm-ov'; ov.id='admPop';
  ov.innerHTML=`<div class="adm-modal small"><button type="button" class="adm-x" onclick="admClosePop()">✕</button><div class="adm-modal-in"><h3>Security check</h3><p class="adm-p">Signed in as <b>${me.toUpperCase()}</b>. Each test tries something that must be blocked by the database.</p><div id="admTests" class="adm-tests"><div class="wk-loading"><span class="wk-spin"></span></div></div></div></div>`;
  ov.onclick=e=>{ if(e.target===ov) admClosePop(); }; document.body.appendChild(ov);
  let bad=0, html='';
  for(const [name,fn,mustDeny] of T){
    let denied=false, code='';
    try{ await fn(); }catch(e){ code=(e&&e.code)||''; denied=code==='permission-denied'; }
    if(mustDeny&&!denied) bad++;
    if(!denied){ for(const p of ['authz/'+fake,'users/'+fake,'adminmeta/'+fake]){ try{ await db.doc(p).delete(); }catch(e){} } }
    html+=`<div class="adm-test ${mustDeny?(denied?'ok':'bad'):'info'}"><span>${mustDeny?(denied?'✓':'✗'):'•'}</span><div>${admEsc(name)}<small>${mustDeny?(denied?'blocked':'NOT blocked – rules are not active or wrong'):(denied?'blocked':'allowed (expected for '+me+')')}</small></div></div>`;
  }
  const t=document.getElementById('admTests'); if(t) t.innerHTML=html+`<div class="adm-sum ${bad?'bad':'ok'}">${bad?bad+' test(s) FAILED – the strict rules are not published yet or are wrong.':'All security tests passed.'}</div>`;
}
if(window.AWAKE_ROUTES) window.AWAKE_ROUTES.selftest=()=>{ showView('home'); setTimeout(admSelfTest,200); return true; };
