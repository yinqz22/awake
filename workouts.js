/* =====================================================================
   WORKOUTS  –  workouts, training sessions, progress & graphs
   Data (Firestore, same db as the rest of awake; stored in the already-allowed `sessions` collection
   so NO rule change is needed):
     sessions/fit_<userId>              { workouts:[], body:[], months:[], doneCount }
     sessions/fitlog_<userId>_<YYYY-MM> { sessions:[ finished training sessions ] }
   workout  = { id, name, createdAt, weight, height, steps, perWeek, days:[{ d:0-6 (Mon=0), label, exercises:[{id,name,sets,reps,weight}] }] }
   body     = [{ ts, weight?, height?, steps? }]
   log      = { id, ts, wid, wname, d, label, dur(sec), sets, volume, exs:[{name,planned,reps,weight,status,sets:[{reps,weight}]}] }
   ===================================================================== */
const WK={data:null,loaded:false,tab:'workouts',range:7,logs:{},draft:null,step:0,planDay:null,run:null,clock:0,busy:false,saved:null};
const wt=(de,en,ar)=>curLang==='de'?de:(curLang==='ar'?(ar||en):en);
const WK_DAYS={
  de:['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'],
  en:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  ar:['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد']};
const WK_SHORT={de:['Mo','Di','Mi','Do','Fr','Sa','So'],en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],ar:['إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت','أحد']};
const dayName=d=>(WK_DAYS[curLang]||WK_DAYS.en)[d], dayShort=d=>(WK_SHORT[curLang]||WK_SHORT.en)[d];
const WK_LABELS=['Push','Pull','Legs','Ganzkörper','Oberkörper','Unterkörper','Cardio','Home Workout'];
const WK_QUOTES=[
  ['Stark gemacht, Champ!','Well done, champ!','أحسنت يا بطل!'],
  ['Workout erledigt. Du hast durchgezogen.','Workout done. You pushed through.','انتهى التمرين. لقد أكملته.'],
  ['Wieder ein Training geschafft.','Another training in the books.','تمرين آخر أنجزته.'],
  ['Disziplin zahlt sich aus.','Discipline pays off.','الانضباط يؤتي ثماره.'],
  ['Starkes Training!','Strong training!','تمرين قوي!'],
  ['Du bist heute nicht nur gekommen – du hast durchgezogen.','You didn’t just show up today – you got it done.','لم تحضر اليوم فقط، بل أنجزت التمرين.'],
  ['Jede Wiederholung bringt dich näher an dein Ziel.','Every rep brings you closer to your goal.','كل تكرار يقرّبك من هدفك.'],
  ['Konstanz schlägt Motivation. Weiter so!','Consistency beats motivation. Keep going!','الاستمرارية أقوى من الحماس. واصل!']
];
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const sod=ts=>{ const d=new Date(ts); d.setHours(0,0,0,0); return d.getTime(); };
const ymOf=ts=>{ const d=new Date(ts); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); };
const todayIdx=()=>(new Date().getDay()+6)%7;
const numIn=id=>{ const el=document.getElementById(id); const v=el?parseFloat(String(el.value).replace(',','.')):NaN; return isNaN(v)?null:v; };
const fmtDur=sec=>{ sec=Math.max(0,Math.round(sec)); const h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), s=sec%60; return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`; };
const fmtMin=sec=>{ const m=Math.round(sec/60); return m>=60?`${Math.floor(m/60)} h ${m%60} min`:`${m} min`; };

/* ---------- storage ---------- */
const wkMainPath=()=>'sessions/fit_'+user.id;
async function wkLoad(){
  const s=await db.doc(wkMainPath()).get();
  const d=s.exists?s.data():{};
  WK.data={workouts:d.workouts||[],body:d.body||[],months:d.months||[],doneCount:d.doneCount||0};
  WK.logs={}; WK.loaded=true;
  try{ const raw=LS.get('awake_wk_run_'+user.id); WK.saved=raw?JSON.parse(raw):null; }catch(e){ WK.saved=null; }
}
async function wkSave(){ await db.doc(wkMainPath()).set(WK.data); }
async function wkAddLog(entry){
  const ym=ymOf(entry.ts), path=`sessions/fitlog_${user.id}_${ym}`;
  let doc=WK.logs[ym];
  if(!doc){ const s=await db.doc(path).get(); doc=s.exists?s.data():{sessions:[]}; }
  doc.sessions=[...(doc.sessions||[]),entry]; WK.logs[ym]=doc;
  await db.doc(path).set(doc);
  if(!WK.data.months.includes(ym)) WK.data.months.push(ym);
  WK.data.doneCount=(WK.data.doneCount||0)+1;
  await wkSave();
}
async function wkLoadLogs(fromTs){
  const need=(WK.data.months||[]).filter(ym=>{ const [y,m]=ym.split('-').map(Number); return new Date(y,m,1).getTime()>fromTs; });
  await Promise.all(need.filter(ym=>!WK.logs[ym]).map(async ym=>{
    try{ const s=await db.doc(`sessions/fitlog_${user.id}_${ym}`).get(); WK.logs[ym]=s.exists?s.data():{sessions:[]}; }catch(e){ WK.logs[ym]={sessions:[]}; }
  }));
  return need.flatMap(ym=>(WK.logs[ym]&&WK.logs[ym].sessions)||[]).sort((a,b)=>a.ts-b.ts);
}
async function wkDeleteAll(id){
  id=id||user.id;
  const d=await db.doc('sessions/fit_'+id).get().catch(()=>null);
  const months=(d&&d.exists&&d.data().months)||[];
  await Promise.all(months.map(ym=>db.doc(`sessions/fitlog_${id}_${ym}`).delete().catch(()=>{})));
  await db.doc('sessions/fit_'+id).delete().catch(()=>{});
  LS.del('awake_wk_run_'+id);
}
function wkLeave(){ clearInterval(WK.clock); WK.clock=0; }

/* ---------- main render ---------- */
async function wkRender(){
  const el=document.getElementById('content'); if(!el) return;
  if(!WK.loaded){
    el.innerHTML=`<div class="wk-wrap"><div class="wk-loading"><span class="wk-spin"></span></div></div>`;
    try{ await wkLoad(); }
    catch(e){ el.innerHTML=`<div class="wk-wrap"><div class="card-box">${esc(wt('Workouts konnten nicht geladen werden. Prüfe deine Verbindung.','Workouts could not be loaded. Check your connection.','تعذّر تحميل التمارين. تحقق من اتصالك.'))}</div></div>`; return; }
    if(currentView!=='workouts') return;
  }
  if(WK.run) return wkRenderRun();
  if(WK.draft) return wkRenderWizard();
  wkRenderHome();
}
function wkRenderHome(){
  const el=document.getElementById('content');
  el.innerHTML=`<div class="wk-wrap fade">
    <div class="wk-head"><h2 class="wk-title">Workouts</h2>
      <div class="wk-sub" id="wkSub"><span class="pill"></span>
        <button type="button" class="${WK.tab==='workouts'?'on':''}" onclick="wkSetTab('workouts')">Workouts</button>
        <button type="button" class="${WK.tab==='progress'?'on':''}" onclick="wkSetTab('progress')">${esc(wt('Fortschritt','Progress','التقدم'))}</button>
      </div></div>
    <div id="wkBody"></div></div>`;
  wkPlacePill(false);
  if(WK.tab==='progress') wkRenderProgress(); else wkRenderOverview();
}
function wkPlacePill(anim){
  const sub=document.getElementById('wkSub'); if(!sub) return;
  const on=sub.querySelector('button.on'); const pill=sub.querySelector('.pill'); if(!on||!pill) return;
  if(!anim) pill.style.transition='none';
  pill.style.width=on.offsetWidth+'px'; pill.style.transform=`translateX(${on.offsetLeft-4}px)`;
  if(!anim) requestAnimationFrame(()=>{ pill.style.transition=''; });
}
function wkSetTab(t){
  if(WK.tab===t) return; WK.tab=t;
  const sub=document.getElementById('wkSub');
  sub.querySelectorAll('button').forEach((b,i)=>b.classList.toggle('on',(i===0)===(t==='workouts')));
  wkPlacePill(true);
  const body=document.getElementById('wkBody'); body.classList.remove('wk-in'); void body.offsetWidth; body.classList.add('wk-in');
  if(t==='progress') wkRenderProgress(); else wkRenderOverview();
}

/* ---------- overview: workout cards ---------- */
function wkRenderOverview(){
  const body=document.getElementById('wkBody'); if(!body) return;
  const ws=WK.data.workouts, sv=WK.saved;
  const resume=sv&&sv.wid?`<div class="wk-resume"><div><b>${esc(wt('Training läuft noch','Training in progress','تمرين قيد التنفيذ'))}</b><small>${esc(sv.wname)} · ${esc(sv.label||dayName(sv.d))}</small></div>
      <div class="wk-resume-btns"><button class="btn-small solid" onclick="wkResume()">${esc(wt('Fortsetzen','Resume','متابعة'))}</button><button class="btn-small" onclick="wkDiscardSaved()">${esc(wt('Verwerfen','Discard','تجاهل'))}</button></div></div>`:'';
  body.innerHTML=`${resume}
    <button type="button" class="wk-create" onclick="wkNew()"><span>+</span> ${esc(wt('Workout erstellen','Create workout','إنشاء تمرين'))}</button>
    <div class="wk-grid">${ws.length?ws.map(wkCardHtml).join(''):`<div class="wk-empty"><span class="ico ico-dumb"></span><b>${esc(wt('Noch kein Workout','No workout yet','لا يوجد تمرين بعد'))}</b><p>${esc(wt('Erstelle dein erstes Workout und starte direkt mit dem Training.','Create your first workout and start training right away.','أنشئ أول تمرين لك وابدأ التدريب فورًا.'))}</p></div>`}</div>`;
}
function wkCardHtml(w,i){
  const days=w.days.slice().sort((a,b)=>a.d-b.d);
  const names=[]; days.forEach(d=>d.exercises.forEach(e=>{ if(!names.includes(e.name)) names.push(e.name); }));
  const total=days.reduce((a,d)=>a+d.exercises.length,0);
  return `<div class="wk-card" style="animation-delay:${Math.min(i,8)*50}ms">
    <div class="wk-card-top"><h3>${esc(w.name)}</h3><span class="wk-badge">${w.days.length}× ${esc(wt('pro Woche','per week','أسبوعيًا'))}</span></div>
    <div class="wk-chips">${days.map(d=>`<span class="wk-chip"><b>${esc(dayShort(d.d))}</b>${d.label?' · '+esc(d.label):''}</span>`).join('')}</div>
    <div class="wk-ex"><small>${total} ${esc(wt('Übungen','exercises','تمارين'))}</small>
      <div>${names.slice(0,4).map(n=>`<span>${esc(n)}</span>`).join('')}${names.length>4?`<span class="more">+${names.length-4}</span>`:''}</div></div>
    <div class="wk-card-actions">
      <button type="button" class="wk-start" onclick="wkStart('${w.id}')">▶ ${esc(wt('Workout starten','Start workout','ابدأ التمرين'))}</button>
      <div class="wk-card-sub"><button type="button" class="btn-small" onclick="wkEdit('${w.id}')">${esc(wt('Bearbeiten','Edit','تعديل'))}</button>
      <button type="button" class="btn-small wk-del" onclick="wkConfirmDelete('${w.id}')">${esc(wt('Löschen','Delete','حذف'))}</button></div>
    </div></div>`;
}
function wkConfirmDelete(id){
  const w=WK.data.workouts.find(x=>x.id===id); if(!w) return;
  showModal(`<h3>${esc(wt('Workout löschen?','Delete workout?','حذف التمرين؟'))}</h3>
    <div class="hint">„${esc(w.name)}“ ${esc(wt('wird endgültig gelöscht. Deine bisherigen Trainingsdaten bleiben erhalten.','will be deleted permanently. Your past training data is kept.','سيتم حذفه نهائيًا. تبقى بيانات تدريبك السابقة محفوظة.'))}</div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">${esc(wt('Abbrechen','Cancel','إلغاء'))}</button><button class="btn-primary" style="background:var(--danger);margin-top:0" onclick="wkDelete('${id}')">${esc(wt('Löschen','Delete','حذف'))}</button></div>`);
}
async function wkDelete(id){
  WK.data.workouts=WK.data.workouts.filter(w=>w.id!==id);
  closeModal(); wkRenderOverview();
  try{ await wkSave(); }catch(e){ toast(wt('Speichern fehlgeschlagen.','Saving failed.','فشل الحفظ.')); }
}

/* ---------- progress ---------- */
const WK_RANGES=[7,14,30,'all'];
function wkRangeHtml(){ return `<div class="range-tabs wk-range">${WK_RANGES.map(r=>`<button type="button" class="${WK.range===r?'active':''}" onclick="wkSetRange(${typeof r==='string'?`'${r}'`:r})">${r==='all'?esc(wt('Alle','All','الكل')):r+' '+esc(wt('Tage','days','أيام'))}</button>`).join('')}</div>`; }
function wkSetRange(r){ WK.range=r; wkRenderProgress(true); }
function wkLatest(field){ const a=WK.data.body.filter(b=>b[field]!=null&&!isNaN(b[field])).sort((x,y)=>x.ts-y.ts); return {last:a[a.length-1]||null,prev:a[a.length-2]||null,all:a}; }
function wkDaysArr(range,extra){
  const today=sod(Date.now());
  let n=range;
  if(range==='all'){ const t=[...(extra||[]),...WK.data.body.map(b=>b.ts)]; const f=t.length?Math.min(...t):today; n=Math.max(7,Math.min(365,Math.round((today-sod(f))/864e5)+1)); }
  return [...Array(n)].map((_,i)=>{ const d=new Date(today); d.setDate(d.getDate()-(n-1-i)); return d.getTime(); });
}
async function wkRenderProgress(rangeOnly){
  const body=document.getElementById('wkBody'); if(!body) return;
  const token=++WK.ptoken||(WK.ptoken=1);
  const range=WK.range;
  const horizon=range==='all'?0:Date.now()-(range+7)*864e5;
  if(!rangeOnly) body.innerHTML=`<div class="wk-loading"><span class="wk-spin"></span></div>`;
  const logs=await wkLoadLogs(horizon);
  if(token!==WK.ptoken||WK.tab!=='progress'||!document.getElementById('wkBody')) return;
  const days=wkDaysArr(range,logs.map(l=>l.ts));
  const from=days[0], inRange=logs.filter(l=>l.ts>=from);
  const col=n=>css2(n)||'#5B8CFF';
  const bodyCard=(id,field,title,unit,dec,color)=>{
    const {last,prev,all}=wkLatest(field);
    const delta=last&&prev?last[field]-prev[field]:null;
    return `<div class="chart-card wk-chart"><div class="wk-chart-head"><h4>${esc(title)}</h4>
      <div class="wk-cur">${last?`<b>${awNum(last[field],dec)}</b> <span>${unit}</span>`:'<span>—</span>'}${delta!=null&&Math.abs(delta)>=Math.pow(10,-dec)/2?`<em class="${delta>0?'up':'down'}">${delta>0?'▲':'▼'} ${awNum(Math.abs(delta),dec)}</em>`:''}</div></div>
      <canvas id="${id}"></canvas>${last?`<div class="wk-last">${esc(wt('Zuletzt','Last','آخر قيمة'))}: ${esc(awDate(last.ts))}</div>`:`<div class="wk-last">${esc(wt('Noch keine Werte – füge oben neue Werte hinzu.','No values yet – add new values above.','لا توجد قيم بعد – أضف قيمًا جديدة أعلاه.'))}</div>`}</div>`;
  };
  const tot=inRange.reduce((a,l)=>({n:a.n+1,sets:a.sets+(l.sets||0),dur:a.dur+(l.dur||0),vol:a.vol+(l.volume||0)}),{n:0,sets:0,dur:0,vol:0});
  const chartCard=(id,title,cur)=>`<div class="chart-card wk-chart"><div class="wk-chart-head"><h4>${esc(title)}</h4><div class="wk-cur">${cur}</div></div><canvas id="${id}"></canvas></div>`;
  body.innerHTML=`<div class="wk-prog fade">
    <div class="row-between wk-prog-top"><h3 class="section-title" style="margin:0">${esc(wt('Körperwerte','Body stats','قياسات الجسم'))}</h3>
      <button type="button" class="btn-small solid wk-addvals" onclick="wkOpenValues()">+ ${esc(wt('Neue Werte hinzufügen','Add new values','إضافة قيم جديدة'))}</button></div>
    ${wkRangeHtml()}
    ${bodyCard('wkcW','weight',wt('Gewicht','Weight','الوزن'),'kg',1)}
    ${bodyCard('wkcH','height',wt('Größe','Height','الطول'),'cm',1)}
    ${bodyCard('wkcS','steps',wt('Schritte pro Tag','Steps per day','الخطوات يوميًا'),wt('Schritte','steps','خطوة'),0)}
    ${wkHistoryHtml()}
    <h3 class="section-title" style="margin:26px 0 12px">${esc(wt('Training','Training','التدريب'))}</h3>
    <div class="stat-grid wk-stats">
      <div class="stat-card"><div class="num">${tot.n}</div><div class="lbl">${esc(wt('Workouts','Workouts','التمارين'))}</div></div>
      <div class="stat-card"><div class="num">${tot.sets}</div><div class="lbl">${esc(wt('Sätze','Sets','المجموعات'))}</div></div>
      <div class="stat-card"><div class="num">${tot.dur?fmtMin(tot.dur):'0 min'}</div><div class="lbl">${esc(wt('Trainingszeit','Training time','وقت التدريب'))}</div></div>
      <div class="stat-card"><div class="num">${awNum(Math.round(tot.vol),0)} kg</div><div class="lbl">${esc(wt('Gewicht bewegt','Volume lifted','الوزن المرفوع'))}</div></div>
    </div>
    ${chartCard('wkcN',wt('Abgeschlossene Workouts','Completed workouts','التمارين المكتملة'),`<b>${tot.n}</b>`)}
    ${chartCard('wkcF',wt('Trainingshäufigkeit (pro Woche)','Training frequency (per week)','وتيرة التدريب (أسبوعيًا)'),'')}
    ${chartCard('wkcT',wt('Trainingssätze pro Tag','Sets per day','المجموعات يوميًا'),`<b>${tot.sets}</b> <span>${esc(wt('Sätze','sets','مجموعة'))}</span>`)}
    ${chartCard('wkcD',wt('Trainingsdauer pro Tag','Training time per day','مدة التدريب يوميًا'),`<b>${tot.dur?fmtMin(tot.dur):'0 min'}</b>`)}
    ${chartCard('wkcV',wt('Verwendete Gewichte (Volumen)','Weights used (volume)','الأوزان المستخدمة (الحجم)'),`<b>${awNum(Math.round(tot.vol),0)}</b> <span>kg</span>`)}
    <div class="hint wk-volhint ${tot.vol?'hidden':''}">${esc(wt('Tipp: Trage im Training dein Gewicht pro Satz ein, dann erscheint hier dein Verlauf.','Tip: enter your weight for each set during training and your progress shows up here.','نصيحة: أدخل وزنك لكل مجموعة أثناء التدريب ليظهر تقدّمك هنا.'))}</div>
  </div>`;
  // body charts (time axis, auto range)
  const bodySeries=(id,field,dec,color,unit)=>{
    const pts=wkLatest(field).all.filter(b=>range==='all'||b.ts>=Date.now()-range*864e5);
    awChart(document.getElementById(id),{values:pts.map(b=>b[field]),ts:pts.map(b=>b.ts),color,zero:false,name:field==='weight'?wt('Gewicht','Weight','الوزن'):field==='height'?wt('Größe','Height','الطول'):wt('Schritte','Steps','الخطوات'),fmt:v=>awNum(v,dec)+' '+unit,empty:wt('Keine Werte in diesem Zeitraum','No values in this period','لا قيم في هذه الفترة'),animate:true,delay:0});
  };
  bodySeries('wkcW','weight',1,col('--accent'),'kg');
  bodySeries('wkcH','height',1,col('--accent2'),'cm');
  bodySeries('wkcS','steps',0,col('--ok'),wt('Schritte','steps','خطوة'));
  // training charts (per day)
  const D=864e5, idx=ts=>Math.min(days.length-1,Math.max(0,Math.round((sod(ts)-days[0])/D)));
  const perDay=f=>{ const a=days.map(()=>0); inRange.forEach(l=>{ a[idx(l.ts)]+=f(l); }); return a; };
  const cnt=perDay(()=>1);
  const cum=[]; cnt.reduce((s,v,i)=>(cum[i]=s+v),0);
  const freq=days.map(d=>logs.filter(l=>l.ts>=d-6*D&&l.ts<d+D).length);
  const hasData=inRange.length>0;
  const E=wt('Noch keine Trainings in diesem Zeitraum','No trainings in this period yet','لا توجد تمارين في هذه الفترة بعد');
  const base={ts:days,delay:0,animate:true,empty:E};
  awChart(document.getElementById('wkcN'),{...base,values:hasData?cum:[],color:col('--accent'),name:wt('Workouts','Workouts','التمارين'),fmt:v=>awNum(v,0)});
  awChart(document.getElementById('wkcF'),{...base,values:hasData?freq:[],color:col('--accent2'),name:wt('Pro Woche','Per week','أسبوعيًا'),fmt:v=>awNum(v,0)+'×'});
  awChart(document.getElementById('wkcT'),{...base,values:hasData?perDay(l=>l.sets||0):[],type:'bar',color:col('--accent'),name:wt('Sätze','Sets','المجموعات'),fmt:v=>awNum(v,0)});
  awChart(document.getElementById('wkcD'),{...base,values:hasData?perDay(l=>Math.round((l.dur||0)/60)):[],type:'bar',color:col('--accent2'),name:wt('Dauer','Time','المدة'),fmt:v=>awNum(v,0)+' min'});
  awChart(document.getElementById('wkcV'),{...base,values:hasData&&tot.vol?perDay(l=>Math.round(l.volume||0)):[],type:'bar',color:col('--ok'),name:wt('Volumen','Volume','الحجم'),fmt:v=>awNum(v,0)+' kg'});
  WK.progResize=()=>{ if(WK.tab==='progress'&&document.getElementById('wkBody')) wkRenderProgress(true); };
}
let _wkRz; window.addEventListener('resize',()=>{ clearTimeout(_wkRz); _wkRz=setTimeout(()=>{ if(currentView==='workouts'&&WK.progResize&&!WK.run&&!WK.draft) WK.progResize(); },250); });

/* body values history + add */
function wkHistoryHtml(){
  const a=WK.data.body.slice().sort((x,y)=>y.ts-x.ts).slice(0,8);
  if(!a.length) return '';
  return `<div class="card-box wk-hist"><h4>${esc(wt('Verlauf','History','السجل'))}</h4>${a.map(b=>`<div class="wk-hist-row"><span>${esc(awDate(b.ts))}</span>
    <span class="vals">${[b.weight!=null?awNum(b.weight,1)+' kg':'',b.height!=null?awNum(b.height,1)+' cm':'',b.steps!=null?awNum(b.steps,0)+' '+wt('Schritte','steps','خطوة'):''].filter(Boolean).join(' · ')}</span>
    <button type="button" class="audit-del" onclick="wkDeleteBody(${b.ts})">✕</button></div>`).join('')}</div>`;
}
async function wkDeleteBody(ts){
  WK.data.body=WK.data.body.filter(b=>b.ts!==ts); wkRenderProgress(true);
  try{ await wkSave(); }catch(e){ toast(wt('Speichern fehlgeschlagen.','Saving failed.','فشل الحفظ.')); }
}
function wkOpenValues(){
  const w=wkLatest('weight').last, h=wkLatest('height').last, s=wkLatest('steps').last;
  showModal(`<h3>${esc(wt('Neue Werte hinzufügen','Add new values','إضافة قيم جديدة'))}</h3>
    <div class="field"><label>${esc(wt('Gewicht (kg)','Weight (kg)','الوزن (كغ)'))}</label><input id="wkvW" type="number" inputmode="decimal" step="0.1" value="${w?w.weight:''}"></div>
    <div class="field"><label>${esc(wt('Größe (cm)','Height (cm)','الطول (سم)'))}</label><input id="wkvH" type="number" inputmode="decimal" step="0.1" value="${h?h.height:''}"></div>
    <div class="field"><label>${esc(wt('Schritte pro Tag','Steps per day','الخطوات يوميًا'))}</label><input id="wkvS" type="number" inputmode="numeric" step="1" value="${s?s.steps:''}"></div>
    <div class="hint">${esc(wt('Das heutige Datum wird automatisch gespeichert.','Today’s date is saved automatically.','يتم حفظ تاريخ اليوم تلقائيًا.'))}</div>
    <div class="err" id="wkvErr"></div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">${esc(wt('Abbrechen','Cancel','إلغاء'))}</button><button class="btn-primary" style="margin-top:0" onclick="wkSaveValues()">${esc(wt('Speichern','Save','حفظ'))}</button></div>`);
}
async function wkSaveValues(){
  const w=numIn('wkvW'), h=numIn('wkvH'), s=numIn('wkvS'), err=document.getElementById('wkvErr');
  if(w==null&&h==null&&s==null){ err.textContent=wt('Bitte mindestens einen Wert eingeben.','Please enter at least one value.','يرجى إدخال قيمة واحدة على الأقل.'); return; }
  if((w!=null&&(w<20||w>400))||(h!=null&&(h<80||h>260))||(s!=null&&(s<0||s>100000))){ err.textContent=wt('Bitte realistische Werte eingeben.','Please enter realistic values.','يرجى إدخال قيم واقعية.'); return; }
  const e={ts:Date.now()}; if(w!=null) e.weight=w; if(h!=null) e.height=h; if(s!=null) e.steps=Math.round(s);
  WK.data.body=[...WK.data.body,e].slice(-1500);
  closeModal(); wkRenderProgress(true); toast(wt('Werte gespeichert.','Values saved.','تم حفظ القيم.'));
  try{ await wkSave(); }catch(x){ toast(wt('Speichern fehlgeschlagen.','Saving failed.','فشل الحفظ.')); }
}

/* ---------- create / edit wizard ---------- */
const WK_STEPS=['name','weight','height','steps','perweek','days','plan'];
function wkNew(){
  const w=wkLatest('weight').last, h=wkLatest('height').last, s=wkLatest('steps').last;
  WK.draft={id:null,name:'',weight:w?w.weight:'',height:h?h.height:'',steps:s?s.steps:'',perWeek:0,selDays:[],plan:{}};
  WK.step=0; WK.planDay=null; wkRenderWizard();
}
function wkEdit(id){
  const w=WK.data.workouts.find(x=>x.id===id); if(!w) return;
  const plan={}; w.days.forEach(d=>{ plan[d.d]={label:d.label||'',exercises:d.exercises.map(e=>({...e}))}; });
  WK.draft={id:w.id,createdAt:w.createdAt,name:w.name,weight:w.weight??'',height:w.height??'',steps:w.steps??'',perWeek:w.days.length,selDays:w.days.map(d=>d.d).sort((a,b)=>a-b),plan};
  WK.step=0; WK.planDay=null; wkRenderWizard();
}
function wkCancelDraft(){
  const d=WK.draft; if(!d) return;
  if(!d.name&&!d.perWeek){ WK.draft=null; wkRender(); return; }
  showModal(`<h3>${esc(wt('Erstellen abbrechen?','Cancel?','إلغاء؟'))}</h3><div class="hint">${esc(wt('Deine Eingaben gehen verloren.','Your input will be lost.','ستفقد مدخلاتك.'))}</div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">${esc(wt('Weitermachen','Keep going','متابعة'))}</button><button class="btn-primary" style="background:var(--danger);margin-top:0" onclick="closeModal();WK.draft=null;wkRender()">${esc(wt('Verwerfen','Discard','تجاهل'))}</button></div>`);
}
function wkRenderWizard(dir){
  const el=document.getElementById('content'); if(!el||!WK.draft) return;
  const d=WK.draft, step=WK_STEPS[WK.step], last=WK.step===WK_STEPS.length-1;
  const dots=WK_STEPS.map((s,i)=>`<i class="${i<WK.step?'done':''}${i===WK.step?' cur':''}" ${i<WK.step?`onclick="wkGoStep(${i})"`:''}></i>`).join('');
  let inner='';
  const q=t=>`<h2 class="wk-q">${esc(t)}</h2>`;
  if(step==='name') inner=q(wt('Wie soll dein Workout heißen?','What should your workout be called?','ماذا تريد أن تسمي تمرينك؟'))+`<input id="wkName" class="wk-big-input" maxlength="40" placeholder="${esc(wt('Mein Gym Workout','My gym workout','تمرين النادي الخاص بي'))}" value="${esc(d.name)}" onkeydown="if(event.key==='Enter')wkNext()">`;
  if(step==='weight') inner=q(wt('Wie viel wiegst du?','How much do you weigh?','كم وزنك؟'))+`<div class="wk-unit"><input id="wkWeight" class="wk-big-input" type="number" inputmode="decimal" step="0.1" placeholder="79" value="${d.weight}" onkeydown="if(event.key==='Enter')wkNext()"><span>kg</span></div>`;
  if(step==='height') inner=q(wt('Wie groß bist du?','How tall are you?','كم طولك؟'))+`<div class="wk-unit"><input id="wkHeight" class="wk-big-input" type="number" inputmode="decimal" step="0.1" placeholder="170" value="${d.height}" onkeydown="if(event.key==='Enter')wkNext()"><span>cm</span></div>`;
  if(step==='steps') inner=q(wt('Wie aktiv bist du?','How active are you?','ما مدى نشاطك؟'))+`<div class="hint wk-hint">${esc(wt('Wie viele Schritte gehst du durchschnittlich pro Tag?','How many steps do you walk per day on average?','كم خطوة تمشي يوميًا في المتوسط؟'))}</div>
    <div class="wk-unit"><input id="wkSteps" class="wk-big-input" type="number" inputmode="numeric" step="100" placeholder="8000" value="${d.steps}" onkeydown="if(event.key==='Enter')wkNext()"><span>${esc(wt('Schritte','steps','خطوة'))}</span></div>
    <div class="wk-quick">${[3000,6000,8000,10000,12000].map(n=>`<button type="button" onclick="document.getElementById('wkSteps').value=${n}">${awNum(n,0)}</button>`).join('')}</div>`;
  if(step==='perweek') inner=q(wt('Wie oft gehst du pro Woche ins Gym?','How often do you train per week?','كم مرة تتدرب في الأسبوع؟'))+`<div class="wk-nums">${[1,2,3,4,5,6,7].map(n=>`<button type="button" class="${d.perWeek===n?'sel':''}" onclick="wkPickPer(${n})">${n}×</button>`).join('')}</div>`;
  if(step==='days') inner=q(wt('An welchen Tagen möchtest du trainieren?','Which days do you want to train?','في أي أيام تريد التدرب؟'))+`<div class="hint wk-hint" id="wkDayCount"></div><div class="wk-daypick">${[0,1,2,3,4,5,6].map(i=>`<button type="button" class="${d.selDays.includes(i)?'sel':''}" onclick="wkToggleDay(${i})"><span class="ck">✓</span>${esc(dayName(i))}</button>`).join('')}</div>`;
  if(step==='plan') inner=wkPlanHtml();
  const edit=!!d.id;
  el.innerHTML=`<div class="wk-wrap wk-wiz"><div class="wk-wiz-top"><button type="button" class="wk-x" onclick="wkCancelDraft()" aria-label="Close">✕</button><div class="wk-dots">${dots}</div>
      <span class="wk-wiz-tag">${edit?esc(wt('Bearbeiten','Edit','تعديل')):`${WK.step+1}/${WK_STEPS.length}`}</span></div>
    <div class="wk-step ${dir==='back'?'wk-in-back':'wk-in'}" id="wkStepBody">${inner}</div>
    <div class="err wk-err" id="wkErr"></div>
    <div class="wk-wiz-nav">${WK.step>0?`<button type="button" class="btn-ghost" onclick="wkBack()">‹ ${esc(wt('Zurück','Back','رجوع'))}</button>`:'<span></span>'}
      <button type="button" class="btn-primary wk-nextbtn" onclick="wkNext()">${last?esc(wt('Workout speichern','Save workout','حفظ التمرين')):esc(wt('Weiter','Next','التالي'))+' ›'}</button></div>
    ${edit&&!last?`<button type="button" class="linklike wk-jump" onclick="wkJumpPlan()">${esc(wt('Direkt zu den Trainingstagen','Jump to training days','انتقل إلى أيام التدريب'))} ›</button>`:''}</div>`;
  if(step==='days') wkDayCount();
  const f=el.querySelector('.wk-big-input'); if(f&&window.innerWidth>720) setTimeout(()=>f.focus(),60);
  el.scrollTop=0;
}
function wkErr(m){ const e=document.getElementById('wkErr'); if(e){ e.textContent=m||''; if(m){ e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); } } }
function wkCollect(){
  const d=WK.draft, s=WK_STEPS[WK.step];
  if(s==='name'){ const e=document.getElementById('wkName'); if(e) d.name=e.value.trim(); }
  if(s==='weight'){ const v=numIn('wkWeight'); d.weight=v==null?'':v; }
  if(s==='height'){ const v=numIn('wkHeight'); d.height=v==null?'':v; }
  if(s==='steps'){ const v=numIn('wkSteps'); d.steps=v==null?'':Math.round(v); }
  if(s==='plan') wkCollectLabel();
}
function wkValid(s){
  const d=WK.draft;
  if(s==='name'&&d.name.length<1) return wt('Bitte gib deinem Workout einen Namen.','Please give your workout a name.','يرجى إعطاء تمرينك اسمًا.');
  if(s==='weight'&&(d.weight===''||d.weight<20||d.weight>400)) return wt('Bitte gib dein Gewicht ein (20–400 kg).','Please enter your weight (20–400 kg).','يرجى إدخال وزنك (20–400 كغ).');
  if(s==='height'&&(d.height===''||d.height<80||d.height>260)) return wt('Bitte gib deine Größe ein (80–260 cm).','Please enter your height (80–260 cm).','يرجى إدخال طولك (80–260 سم).');
  if(s==='steps'&&(d.steps===''||d.steps<0||d.steps>100000)) return wt('Bitte gib deine durchschnittlichen Schritte ein.','Please enter your average steps.','يرجى إدخال متوسط خطواتك.');
  if(s==='perweek'&&!d.perWeek) return wt('Bitte wähle, wie oft du trainierst.','Please choose how often you train.','يرجى اختيار عدد مرات التدريب.');
  if(s==='days'&&d.selDays.length!==d.perWeek) return wt(`Bitte wähle genau ${d.perWeek} Tage.`,`Please select exactly ${d.perWeek} days.`,`يرجى اختيار ${d.perWeek} أيام بالضبط.`);
  if(s==='plan'){
    for(const i of d.selDays){ const p=d.plan[i]; if(!p||!p.exercises.length) return wt(`${dayName(i)} hat noch keine Übung.`,`${dayName(i)} has no exercise yet.`,`${dayName(i)} لا يحتوي على تمارين بعد.`); }
  }
  return '';
}
function wkNext(){
  wkCollect(); const s=WK_STEPS[WK.step], m=wkValid(s); if(m){ wkErr(m); return; }
  if(s==='plan'){ wkSaveDraft(); return; }
  WK.step++; if(WK_STEPS[WK.step]==='plan'&&WK.planDay==null) WK.planDay=WK.draft.selDays.slice().sort((a,b)=>a-b)[0];
  wkRenderWizard();
}
function wkBack(){ wkCollectSafe(); if(WK.step>0){ WK.step--; wkRenderWizard('back'); } }
function wkCollectSafe(){ try{ wkCollect(); }catch(e){} }
function wkGoStep(i){ wkCollectSafe(); WK.step=i; wkRenderWizard('back'); }
function wkJumpPlan(){
  wkCollect();
  for(let i=0;i<WK_STEPS.length-1;i++){ const m=wkValid(WK_STEPS[i]); if(m){ WK.step=i; wkRenderWizard(); wkErr(m); return; } }
  WK.step=WK_STEPS.length-1; if(WK.planDay==null) WK.planDay=WK.draft.selDays.slice().sort((a,b)=>a-b)[0]; wkRenderWizard();
}
function wkPickPer(n){
  const d=WK.draft; d.perWeek=n; if(d.selDays.length>n) d.selDays=d.selDays.slice(0,n);
  document.querySelectorAll('.wk-nums button').forEach((b,i)=>b.classList.toggle('sel',i+1===n)); wkErr('');
}
function wkDayCount(){ const e=document.getElementById('wkDayCount'),d=WK.draft; if(e) e.textContent=wt(`${d.selDays.length} von ${d.perWeek} Tagen gewählt`,`${d.selDays.length} of ${d.perWeek} days selected`,`تم اختيار ${d.selDays.length} من ${d.perWeek} أيام`); }
function wkToggleDay(i){
  const d=WK.draft, k=d.selDays.indexOf(i);
  if(k>=0) d.selDays.splice(k,1);
  else { if(d.selDays.length>=d.perWeek){ wkErr(wt(`Du hast ${d.perWeek} Tage gewählt – entferne zuerst einen Tag.`,`You chose ${d.perWeek} days – remove one first.`,`اخترت ${d.perWeek} أيام – أزل يومًا أولًا.`)); return; } d.selDays.push(i); }
  d.selDays.sort((a,b)=>a-b);
  document.querySelectorAll('.wk-daypick button').forEach((b,j)=>b.classList.toggle('sel',d.selDays.includes(j)));
  wkDayCount(); wkErr('');
}

/* step 7: what is trained on each day */
function wkPlanHtml(){
  const d=WK.draft, days=d.selDays.slice().sort((a,b)=>a-b);
  if(!days.includes(WK.planDay)) WK.planDay=days[0];
  const cur=WK.planDay; if(!d.plan[cur]) d.plan[cur]={label:'',exercises:[]};
  const p=d.plan[cur];
  return `<h2 class="wk-q">${esc(wt('Was trainierst du an welchem Tag?','What do you train on which day?','ماذا تتدرب في كل يوم؟'))}</h2>
    <div class="wk-daytabs">${days.map(i=>`<button type="button" class="${i===cur?'sel':''}" onclick="wkPlanTab(${i})"><b>${esc(dayName(i))}</b><small>${esc((d.plan[i]&&d.plan[i].label)||'—')}</small></button>`).join('')}</div>
    <div class="wk-daybox" id="wkDayBox">
      <div class="field"><label>${esc(wt('Was trainierst du am','What do you train on','ماذا تتدرب يوم'))} ${esc(dayName(cur))}?</label><input id="wkLabel" maxlength="30" value="${esc(p.label)}" placeholder="${esc(wt('z. B. Pull','e.g. Pull','مثال: Pull'))}" oninput="wkLabelLive()"></div>
      <div class="wk-quick">${WK_LABELS.map(l=>`<button type="button" onclick="wkSetLabel('${l}')">${esc(l)}</button>`).join('')}</div>
      <div class="wk-exlist" id="wkExList">${wkExListHtml(cur)}</div>
      <button type="button" class="wk-addex" onclick="wkOpenExercise(${cur})">+ ${esc(wt('Übung hinzufügen','Add exercise','إضافة تمرين'))}</button>
    </div>`;
}
function wkExListHtml(day){
  const ex=WK.draft.plan[day].exercises;
  if(!ex.length) return `<div class="empty">${esc(wt('Noch keine Übungen an diesem Tag.','No exercises on this day yet.','لا توجد تمارين في هذا اليوم بعد.'))}</div>`;
  return ex.map((e,i)=>`<div class="wk-exrow"><span class="n">${i+1}</span>
    <div class="info"><b>${esc(e.name)}</b><small>${e.sets} ${esc(wt('Sätze','sets','مجموعات'))} × ${e.reps} ${esc(wt('Wiederholungen','reps','تكرارات'))}${e.weight?` · ${awNum(e.weight,1)} kg`:''}</small></div>
    <div class="acts"><button type="button" ${i===0?'disabled':''} onclick="wkMoveEx(${day},${i},-1)" aria-label="Up">↑</button><button type="button" ${i===ex.length-1?'disabled':''} onclick="wkMoveEx(${day},${i},1)" aria-label="Down">↓</button>
    <button type="button" onclick="wkOpenExercise(${day},${i})" aria-label="Edit">✎</button><button type="button" class="del" onclick="wkDelEx(${day},${i})" aria-label="Delete">✕</button></div></div>`).join('');
}
function wkRefreshList(){ const l=document.getElementById('wkExList'); if(l) l.innerHTML=wkExListHtml(WK.planDay); const t=document.querySelector('.wk-daytabs .sel small'); if(t) t.textContent=WK.draft.plan[WK.planDay].label||'—'; }
function wkCollectLabel(){ const e=document.getElementById('wkLabel'); if(e&&WK.draft.plan[WK.planDay]) WK.draft.plan[WK.planDay].label=e.value.trim(); }
function wkLabelLive(){ wkCollectLabel(); const t=document.querySelector('.wk-daytabs .sel small'); if(t) t.textContent=WK.draft.plan[WK.planDay].label||'—'; }
function wkSetLabel(l){ const e=document.getElementById('wkLabel'); e.value=l; wkLabelLive(); }
function wkPlanTab(i){ wkCollectLabel(); WK.planDay=i; const s=document.getElementById('wkStepBody'); s.innerHTML=wkPlanHtml(); s.classList.remove('wk-in'); void s.offsetWidth; s.classList.add('wk-in'); wkErr(''); }
function wkMoveEx(day,i,dir){ const a=WK.draft.plan[day].exercises, j=i+dir; if(j<0||j>=a.length) return; [a[i],a[j]]=[a[j],a[i]]; wkRefreshList(); }
function wkDelEx(day,i){ WK.draft.plan[day].exercises.splice(i,1); wkRefreshList(); }
function wkOpenExercise(day,i){
  wkCollectLabel();
  const e=i!=null?WK.draft.plan[day].exercises[i]:{name:'',sets:3,reps:10,weight:''};
  showModal(`<h3>${esc(i!=null?wt('Übung bearbeiten','Edit exercise','تعديل التمرين'):wt('Übung hinzufügen','Add exercise','إضافة تمرين'))}</h3>
    <div class="field"><label>${esc(wt('Name der Übung','Exercise name','اسم التمرين'))}</label><input id="exName" maxlength="40" placeholder="Lat Pulldown" value="${esc(e.name)}"></div>
    <div class="wk-two"><div class="field"><label>${esc(wt('Sätze','Sets','المجموعات'))}</label>${wkStepper('exSets',e.sets,1,20,1)}</div>
    <div class="field"><label>${esc(wt('Wiederholungen','Reps','التكرارات'))}</label>${wkStepper('exReps',e.reps,1,100,1)}</div></div>
    <div class="field"><label>${esc(wt('Gewicht in kg (optional)','Weight in kg (optional)','الوزن بالكغ (اختياري)'))}</label><input id="exWeight" type="number" inputmode="decimal" step="0.5" min="0" value="${e.weight||''}" placeholder="—"></div>
    <div class="err" id="exErr"></div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">${esc(wt('Abbrechen','Cancel','إلغاء'))}</button><button class="btn-primary" style="margin-top:0" onclick="wkSaveExercise(${day},${i!=null?i:-1})">${esc(wt('Speichern','Save','حفظ'))}</button></div>`);
  setTimeout(()=>{ const f=document.getElementById('exName'); if(f&&!f.value&&window.innerWidth>720) f.focus(); },60);
}
function wkStepper(id,val,min,max,step){
  return `<div class="wk-stepper"><button type="button" onclick="wkStep('${id}',${-step},${min},${max})">−</button><input id="${id}" type="number" inputmode="numeric" value="${val}" min="${min}" max="${max}"><button type="button" onclick="wkStep('${id}',${step},${min},${max})">+</button></div>`;
}
function wkStep(id,delta,min,max){ const e=document.getElementById(id); const v=Math.max(min,Math.min(max,(parseFloat(e.value)||0)+delta)); e.value=Math.round(v*100)/100; }
function wkSaveExercise(day,i){
  const name=document.getElementById('exName').value.trim(), sets=Math.round(numIn('exSets')||0), reps=Math.round(numIn('exReps')||0), wgt=numIn('exWeight')||0;
  const err=document.getElementById('exErr');
  if(!name){ err.textContent=wt('Bitte gib einen Namen ein.','Please enter a name.','يرجى إدخال اسم.'); return; }
  if(sets<1||sets>20||reps<1||reps>100){ err.textContent=wt('Sätze: 1–20, Wiederholungen: 1–100.','Sets: 1–20, reps: 1–100.','المجموعات: 1–20، التكرارات: 1–100.'); return; }
  const a=WK.draft.plan[day].exercises;
  if(i>=0) a[i]={...a[i],name,sets,reps,weight:wgt}; else a.push({id:uid('e'),name,sets,reps,weight:wgt});
  closeModal(); wkRefreshList(); wkErr('');
}
async function wkSaveDraft(){
  const d=WK.draft; if(!d||WK.busy) return; WK.busy=true;
  const days=d.selDays.slice().sort((a,b)=>a-b).map(i=>({d:i,label:(d.plan[i].label||'').trim(),exercises:d.plan[i].exercises.map(e=>({id:e.id||uid('e'),name:e.name,sets:e.sets,reps:e.reps,weight:e.weight||0}))}));
  const w={id:d.id||uid('w'),name:d.name,createdAt:d.createdAt||Date.now(),weight:+d.weight,height:+d.height,steps:+d.steps,perWeek:d.perWeek,days};
  const ws=WK.data.workouts.slice(); const k=ws.findIndex(x=>x.id===w.id); if(k>=0) ws[k]=w; else ws.push(w);
  WK.data.workouts=ws;
  // body values from the wizard feed the progress graphs (only if they changed)
  const lw=wkLatest('weight').last, lh=wkLatest('height').last, ls=wkLatest('steps').last;
  if(!lw||lw.weight!==w.weight||!lh||lh.height!==w.height||!ls||ls.steps!==w.steps) WK.data.body=[...WK.data.body,{ts:Date.now(),weight:w.weight,height:w.height,steps:w.steps}].slice(-1500);
  try{ await wkSave(); WK.draft=null; WK.tab='workouts'; toast(wt('Workout gespeichert.','Workout saved.','تم حفظ التمرين.')); wkRender(); }
  catch(e){ toast(wt('Speichern fehlgeschlagen.','Saving failed.','فشل الحفظ.')); }
  WK.busy=false;
}

/* ---------- start a workout ---------- */
function wkStart(id){
  const w=WK.data.workouts.find(x=>x.id===id); if(!w) return;
  const days=w.days.slice().sort((a,b)=>a.d-b.d);
  if(days.length===1){ wkBegin(id,days[0].d); return; }
  const t=todayIdx(), sug=days.find(x=>x.d===t)||days.find(x=>x.d>t)||days[0];
  showModal(`<h3>${esc(wt('Welcher Tag?','Which day?','أي يوم؟'))}</h3><div class="hint">${esc(w.name)}</div>
    <div class="wk-startdays">${days.map(x=>`<button type="button" class="${x.d===sug.d?'sug':''}" onclick="closeModal();wkBegin('${id}',${x.d})"><b>${esc(dayName(x.d))}${x.d===t?` · ${esc(wt('Heute','Today','اليوم'))}`:''}</b><small>${esc(x.label||'')} · ${x.exercises.length} ${esc(wt('Übungen','exercises','تمارين'))}</small></button>`).join('')}</div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">${esc(wt('Abbrechen','Cancel','إلغاء'))}</button></div>`);
}
function wkBegin(id,d){
  const w=WK.data.workouts.find(x=>x.id===id); if(!w) return;
  const day=w.days.find(x=>x.d===d); if(!day||!day.exercises.length) return;
  WK.run={wid:w.id,wname:w.name,d,label:day.label,start:Date.now(),paused:0,last:Date.now(),
    items:day.exercises.map(e=>({id:e.id,name:e.name,sets:e.sets,reps:e.reps,weight:e.weight||0,status:'open',log:[]})),
    curReps:null,curWeight:null};
  WK.saved=null; wkPersist(); wkRenderRun();
}
function wkPersist(){ try{ if(WK.run){ WK.run.last=Date.now(); LS.set('awake_wk_run_'+user.id,JSON.stringify(WK.run)); } else LS.del('awake_wk_run_'+user.id); }catch(e){} }
function wkResume(){
  const r=WK.saved; if(!r) return;
  const gap=Date.now()-(r.last||Date.now()); if(gap>20*60*1000) r.paused=(r.paused||0)+gap;   // don't count long breaks as training time
  WK.run=r; WK.saved=null; wkPersist(); wkRender();
}
function wkDiscardSaved(){ WK.saved=null; LS.del('awake_wk_run_'+user.id); wkRenderOverview(); }

/* ---------- the training session ---------- */
const wkCur=()=>WK.run&&WK.run.items.find(i=>i.status==='open');
const wkElapsed=()=>WK.run?(Date.now()-WK.run.start-(WK.run.paused||0))/1000:0;
function wkRenderRun(anim){
  const el=document.getElementById('content'); if(!el||!WK.run) return;
  const r=WK.run, cur=wkCur();
  if(!cur){ wkFinish(); return; }
  const open=r.items.filter(i=>i.status!=='skipped'), totalSets=open.reduce((a,i)=>a+i.sets,0), doneSets=open.reduce((a,i)=>a+i.log.length,0);
  const exNo=r.items.filter(i=>i.status==='done').length+1, exTot=r.items.filter(i=>i.status!=='skipped').length;
  const setNo=cur.log.length+1;
  if(r.curReps==null) r.curReps=cur.reps; if(r.curWeight==null) r.curWeight=cur.weight||0;
  const next=r.items.filter(i=>i.status==='open'&&i!==cur);
  el.innerHTML=`<div class="wk-wrap wk-run">
    <div class="wk-run-top"><button type="button" class="wk-x" onclick="wkAskEnd()" aria-label="End">✕</button>
      <div class="wk-run-title"><b>${esc(r.wname)}</b><small>${esc(r.label||dayName(r.d))}</small></div>
      <div class="wk-clock" id="wkClock">${fmtDur(wkElapsed())}</div></div>
    <div class="wk-bar"><i id="wkBarFill" style="width:${totalSets?Math.round(doneSets/totalSets*100):0}%"></i></div>
    <div class="wk-run-meta"><span>${esc(wt('Übung','Exercise','التمرين'))} ${Math.min(exNo,exTot)} / ${exTot}</span><span>${doneSets} / ${totalSets} ${esc(wt('Sätze','sets','مجموعات'))}</span></div>
    <div class="wk-stage ${anim==='next'?'wk-in':anim==='fade'?'wk-pop':''}" id="wkStage">
      <h1 class="wk-exname">${esc(cur.name)}</h1>
      <div class="wk-setpill">${esc(wt('Satz','Set','المجموعة'))} <b>${setNo}</b> / ${cur.sets}</div>
      <div class="wk-dotsets">${Array.from({length:cur.sets},(_,i)=>`<i class="${i<cur.log.length?'d':''}${i===cur.log.length?' c':''}"></i>`).join('')}</div>
      <div class="wk-targets">
        <div class="wk-target"><small>${esc(wt('Wiederholungen','Reps','التكرارات'))}</small>
          <div class="wk-stepper big"><button type="button" onclick="wkAdj('reps',-1)">−</button><b id="wkReps">${r.curReps}</b><button type="button" onclick="wkAdj('reps',1)">+</button></div></div>
        <div class="wk-target"><small>${esc(wt('Gewicht (kg, optional)','Weight (kg, optional)','الوزن (كغ، اختياري)'))}</small>
          <div class="wk-stepper big"><button type="button" onclick="wkAdj('w',-2.5)">−</button><b id="wkW">${r.curWeight?awNum(r.curWeight,1):'—'}</b><button type="button" onclick="wkAdj('w',2.5)">+</button></div></div>
      </div>
      <button type="button" class="wk-done" id="wkDone" onclick="wkSetDone()"><span class="lbl">✓ ${esc(wt('Satz geschafft','Set crushed','أنجزت المجموعة'))}</span><span class="chk">✓</span></button>
      <div class="wk-sec"><button type="button" class="btn-ghost" onclick="wkLater()">⤵ ${esc(wt('Später machen','Do it later','لاحقًا'))}</button>
        <button type="button" class="btn-ghost" onclick="wkAskSkip()">⏭ ${esc(wt('Übung überspringen','Skip exercise','تخطّي التمرين'))}</button></div>
    </div>
    ${next.length?`<div class="wk-next"><small>${esc(wt('Als Nächstes','Up next','التالي'))}</small>${next.map(n=>`<span>${esc(n.name)}</span>`).join('')}</div>`:''}
  </div>`;
  clearInterval(WK.clock); WK.clock=setInterval(()=>{ const c=document.getElementById('wkClock'); if(c) c.textContent=fmtDur(wkElapsed()); else { clearInterval(WK.clock); WK.clock=0; } },1000);
}
function wkAdj(kind,delta){
  const r=WK.run; if(!r) return;
  if(kind==='reps'){ r.curReps=Math.max(1,Math.min(100,(r.curReps||0)+delta)); document.getElementById('wkReps').textContent=r.curReps; }
  else { r.curWeight=Math.max(0,Math.round(((r.curWeight||0)+delta)*100)/100); document.getElementById('wkW').textContent=r.curWeight?awNum(r.curWeight,1):'—'; }
  wkPersist();
}
async function wkSetDone(){
  const r=WK.run, cur=wkCur(); if(!r||!cur||WK.busy) return; WK.busy=true;
  cur.log.push({reps:r.curReps||cur.reps,weight:r.curWeight||0});
  const btn=document.getElementById('wkDone'); if(btn) btn.classList.add('ok');
  const exDone=cur.log.length>=cur.sets; if(exDone) cur.status='done';
  const fill=document.getElementById('wkBarFill'); if(fill){ const open=r.items.filter(i=>i.status!=='skipped'); const t=open.reduce((a,i)=>a+i.sets,0), d=open.reduce((a,i)=>a+i.log.length,0); fill.style.width=Math.round(d/t*100)+'%'; }
  if(navigator.vibrate) try{ navigator.vibrate(18); }catch(e){}
  r.curReps=null; r.curWeight=exDone?null:(cur.log[cur.log.length-1].weight||null);
  wkPersist();
  await aiSleep(exDone?520:420);
  if(!WK.run){ WK.busy=false; return; }
  const stage=document.getElementById('wkStage');
  if(stage&&exDone&&wkCur()){ stage.classList.add('wk-out'); await aiSleep(190); }
  WK.busy=false;
  wkRenderRun(exDone?'next':'fade');
}
function wkLater(){
  const r=WK.run, cur=wkCur(); if(!r||!cur||WK.busy) return;
  const open=r.items.filter(i=>i.status==='open');
  if(open.length<2){ toast(wt('Das ist die letzte offene Übung.','This is the last open exercise.','هذا آخر تمرين متبقٍ.')); return; }
  const stage=document.getElementById('wkStage'); WK.busy=true;
  if(stage) stage.classList.add('wk-out');
  setTimeout(()=>{ const k=r.items.indexOf(cur); r.items.splice(k,1); r.items.push(cur); r.curReps=null; r.curWeight=null; WK.busy=false; wkPersist(); wkRenderRun('next'); toast(wt(`„${cur.name}“ kommt ans Ende.`,`“${cur.name}” moved to the end.`,`تم نقل «${cur.name}» إلى النهاية.`)); },190);
}
function wkAskSkip(){
  const cur=wkCur(); if(!cur) return;
  showModal(`<h3>${esc(wt('Übung überspringen?','Skip exercise?','تخطي التمرين؟'))}</h3><div class="hint">„${esc(cur.name)}“ ${esc(wt('wird übersprungen, bleibt aber in deinem Workout gespeichert.','will be skipped but stays saved in your workout.','سيتم تخطيه لكنه يبقى محفوظًا في تمرينك.'))}</div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">${esc(wt('Abbrechen','Cancel','إلغاء'))}</button><button class="btn-primary" style="margin-top:0" onclick="wkSkip()">${esc(wt('Überspringen','Skip','تخطّي'))}</button></div>`);
}
function wkSkip(){
  const r=WK.run, cur=wkCur(); closeModal(); if(!r||!cur) return;
  cur.status='skipped'; r.curReps=null; r.curWeight=null; wkPersist();
  const stage=document.getElementById('wkStage'); if(stage) stage.classList.add('wk-out');
  setTimeout(()=>wkRenderRun('next'),190);
}
function wkAskEnd(){
  const r=WK.run; if(!r) return;
  const any=r.items.some(i=>i.log.length);
  showModal(`<h3>${esc(wt('Training beenden?','End training?','إنهاء التمرين؟'))}</h3>
    <div class="wk-endopts">
      <button type="button" class="btn-ghost" onclick="closeModal()">${esc(wt('Weitermachen','Keep going','متابعة'))}</button>
      ${any?`<button type="button" class="btn-small solid" onclick="closeModal();wkFinish(true)">${esc(wt('Beenden & speichern','Finish & save','إنهاء وحفظ'))}</button>`:''}
      <button type="button" class="btn-small wk-del" onclick="closeModal();wkAbort()">${esc(wt('Verwerfen','Discard','تجاهل'))}</button></div>`);
}
function wkAbort(){ clearInterval(WK.clock); WK.clock=0; WK.run=null; wkPersist(); wkRender(); }

/* ---------- finished ---------- */
async function wkFinish(early){
  const r=WK.run; if(!r||WK.busy) return; WK.busy=true;
  clearInterval(WK.clock); WK.clock=0;
  const dur=Math.round(wkElapsed());
  const exs=r.items.map(i=>({name:i.name,planned:i.sets,reps:i.reps,status:i.status==='open'?'skipped':i.status,sets:i.log}));
  const sets=r.items.reduce((a,i)=>a+i.log.length,0);
  const volume=r.items.reduce((a,i)=>a+i.log.reduce((s,l)=>s+(l.weight||0)*(l.reps||0),0),0);
  const entry={id:uid('l'),ts:Date.now(),wid:r.wid,wname:r.wname,d:r.d,label:r.label||'',dur,sets,volume:Math.round(volume),exs};
  const doneEx=r.items.filter(i=>i.status==='done').length;
  let quoteIdx=(WK.data.doneCount||0)%WK_QUOTES.length;
  try{ await wkAddLog(entry); }catch(e){ toast(wt('Training konnte nicht gespeichert werden.','Training could not be saved.','تعذّر حفظ التمرين.')); }
  WK.run=null; wkPersist(); WK.busy=false;
  if(currentView!=='workouts') return;
  const q=WK_QUOTES[quoteIdx];
  const el=document.getElementById('content');
  el.innerHTML=`<div class="wk-wrap wk-finish"><div class="wk-confetti" id="wkConf"></div>
    <div class="wk-trophy">🏆</div>
    <h1>${esc(early?wt('Training beendet 💪','Training ended 💪','انتهى التمرين 💪'):wt('Training geschafft, Champ! 💪','Training done, champ! 💪','أنجزت التمرين يا بطل! 💪'))}</h1>
    <p class="wk-quote">${esc(wt(q[0],q[1],q[2]))}</p>
    <div class="wk-fin-stats">
      <div><b>${fmtMin(dur)}</b><small>${esc(wt('Dauer','Time','المدة'))}</small></div>
      <div><b>${sets}</b><small>${esc(wt('Sätze','Sets','مجموعات'))}</small></div>
      <div><b>${doneEx}</b><small>${esc(wt('Übungen','Exercises','تمارين'))}</small></div>
      ${volume?`<div><b>${awNum(Math.round(volume),0)} kg</b><small>${esc(wt('Gewicht bewegt','Volume','الوزن المرفوع'))}</small></div>`:''}
    </div>
    <button type="button" class="btn-primary wk-back" onclick="wkRender()">${esc(wt('Zurück zu Workouts','Back to workouts','العودة إلى التمارين'))}</button></div>`;
  wkConfetti();
}
function wkConfetti(){
  const box=document.getElementById('wkConf'); if(!box||AI_RM) return;
  const cols=[css2('--accent'),css2('--accent2'),css2('--ok'),'#F1E9D8','#FFC857'];
  for(let i=0;i<46;i++){
    const s=document.createElement('i');
    s.style.cssText=`left:${Math.random()*100}%;background:${cols[i%cols.length]};width:${6+Math.random()*7}px;height:${8+Math.random()*10}px;animation-delay:${Math.random()*.5}s;animation-duration:${1.8+Math.random()*1.6}s;--dx:${(Math.random()*160-80).toFixed(0)}px;--rot:${(360+Math.random()*540).toFixed(0)}deg;border-radius:${Math.random()>.5?'50%':'2px'}`;
    box.appendChild(s);
  }
  setTimeout(()=>{ if(box.isConnected) box.remove(); },4200);
}
