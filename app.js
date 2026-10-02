/* ---------- state ---------- */
let db=null, user=null, currentSession=null, quoteIdx=0, activeFolder='all', activeRange=7, currentTab='lager', currentView='home', curLang='en', unsubMe=null;
const QUOTES=[
 {t:["Erfolg ist die Summe kleiner Anstrengungen, jeden Tag wiederholt.","Success is the sum of small efforts, repeated day in and day out.","النجاح هو مجموع جهود صغيرة تتكرر كل يوم."],a:"Robert Collier"},
 {t:["Der beste Zeitpunkt zum Verkaufen war gestern. Der zweitbeste ist jetzt.","The best time to sell was yesterday. The second best is now.","أفضل وقت للبيع كان أمس، وثاني أفضل وقت هو الآن."],a:"Unbekannt"},
 {t:["Qualität ist keine Handlung, sondern eine Gewohnheit.","Quality is not an act, it is a habit.","الجودة ليست فعلًا بل عادة."],a:"Aristoteles"},
 {t:["Kleine Deals, großes Lager, große Zukunft.","Small deals, big stock, big future.","صفقات صغيرة، مخزون كبير، مستقبل كبير."],a:"Awake"},
 {t:["Wer nichts riskiert, verkauft nichts.","Nothing risked, nothing sold.","من لا يخاطر لا يبيع."],a:"Unbekannt"}
];
const THEMES=[
 {id:'light',label:'Light',c1:'#5B8CFF',c2:'#8B6BFF'},
 {id:'dark',label:'Dark',c1:'#3A3D4D',c2:'#5B8CFF'},
 {id:'navy',label:'Navy',c1:'#101B33',c2:'#4C8DFF'},
 {id:'dark-red',label:'Dark Red',c1:'#2A1719',c2:'#E5484D'},
 {id:'noir',label:'Noir',c1:'#1A1A1A',c2:'#6E6E6E'}
];


/* ---------- i18n (source strings are German; en/ar via dictionary) ---------- */
const I18N=[
['Home','Home','الرئيسية'],['Anmelden','Sign in','تسجيل الدخول'],['Registrieren','Sign up','إنشاء حساب'],['Name','Name','الاسم'],['Passwort','Password','كلمة المرور'],
['Mindestens 2 Buchstaben, muss einzigartig sein','At least 2 letters, must be unique','حرفان على الأقل، ويجب أن يكون فريدًا'],
['Mindestens 8 Zeichen und eine Zahl','At least 8 characters and one number','8 أحرف على الأقل ورقم واحد'],
['Konto erstellen','Create account','إنشاء الحساب'],
['Name braucht mindestens 2 Buchstaben.','Name needs at least 2 letters.','يجب أن يحتوي الاسم على حرفين على الأقل.'],
['Passwort: mindestens 8 Zeichen und eine Zahl.','Password: at least 8 characters and one number.','كلمة المرور: 8 أحرف على الأقل ورقم واحد.'],
['Dieser Name ist schon vergeben.','This name is already taken.','هذا الاسم مستخدم بالفعل.'],
['Nutzer nicht gefunden.','User not found.','المستخدم غير موجود.'],['Falsches Passwort.','Wrong password.','كلمة المرور غير صحيحة.'],
['Deine Sessions','Your sessions','جلساتك'],['Session beitreten','Join session','الانضمام إلى جلسة'],['+ Session erstellen','+ Create session','+ إنشاء جلسة'],
['Lade…','Loading…','جارٍ التحميل…'],['Freunde','Friends','الأصدقاء'],['Name eingeben…','Enter name…','أدخل الاسم…'],['Zitate','Quotes','اقتباسات'],
['← Zurück','← Back','رجوع'],['Skip →','Skip →','تخطي'],['Noch keine Freunde','No friends yet','لا يوجد أصدقاء بعد'],
['Noch keine Sessions — erstelle deine erste!','No sessions yet — create your first one!','لا توجد جلسات بعد — أنشئ جلستك الأولى!'],['Noch keine Sessions','No sessions yet','لا توجد جلسات بعد'],
['Freundschaftsanfragen','Friend requests','طلبات الصداقة'],['Annehmen','Accept','قبول'],['Ablehnen','Decline','رفض'],['Ausstehend','Pending','قيد الانتظار'],
['— Unbekannt','— Unknown','— غير معروف'],['— Aristoteles','— Aristotle','— أرسطو'],
['Session erstellen','Create session','إنشاء جلسة'],['Session-Name','Session name','اسم الجلسة'],['Bild (optional)','Image (optional)','صورة (اختياري)'],
['Abbrechen','Cancel','إلغاء'],['Erstellen','Create','إنشاء'],['Session-ID','Session ID','معرّف الجلسة'],['16-stelliger Code','16-character code','رمز من 16 خانة'],['Beitreten','Join','انضمام'],
['Session nicht gefunden.','Session not found.','الجلسة غير موجودة.'],
['Session-Name braucht mindestens 2 Zeichen.','Session name needs at least 2 characters.','يجب أن يحتوي اسم الجلسة على حرفين على الأقل.'],
['Lager','Inventory','المخزون'],['Statistiken','Statistics','الإحصائيات'],['Audit Log','Audit log','سجل التدقيق'],
['+ Produkt hinzufügen','+ Add product','+ إضافة منتج'],['Alle','All','الكل'],['+ Ordner','+ Folder','+ مجلد'],
['Noch keine Artikel in diesem Ordner.','No items in this folder yet.','لا توجد منتجات في هذا المجلد بعد.'],
['Ordner erstellen','Create folder','إنشاء مجلد'],['Ordner','Folder','المجلد'],['z.B. Kleidung','e.g. Clothing','مثال: ملابس'],['Kein Ordner','No folder','بدون مجلد'],
['Einkaufspreis (€)','Purchase price (€)','سعر الشراء (€)'],['Verkaufspreis (€)','Selling price (€)','سعر البيع (€)'],['Plattform','Platform','المنصة'],
['Artikel hinzufügen','Add item','إضافة منتج'],['Artikel bearbeiten','Edit item','تعديل المنتج'],['Verkauft','Sold','تم البيع'],['Offline stellen','Take offline','إيقاف العرض'],
['Zurück ins Lager','Back to inventory','العودة إلى المخزون'],['Löschen','Delete','حذف'],['Speichern','Save','حفظ'],['Name eingeben.','Enter a name.','أدخل اسمًا.'],
['sonstiges','other','أخرى'],['lager','in stock','في المخزون'],['verkauft','sold','مباع'],['offline','offline','غير متصل'],
['Produkte verkauft','Products sold','المنتجات المباعة'],['Produkte im Lager','Products in stock','المنتجات في المخزون'],['Profit','Profit','الربح'],['Umsatz','Revenue','الإيرادات'],
['Alltime','All time','كل الأوقات'],['Verkäufe','Sales','المبيعات'],['Lagerbestand','Stock level','مستوى المخزون'],
['Mitwirkende','Contributors','المساهمون'],['Audit Log durchsuchen…','Search audit log…','البحث في سجل التدقيق…'],['Neueste zuerst','Newest first','الأحدث أولًا'],['Älteste zuerst','Oldest first','الأقدم أولًا'],
['Keine Einträge.','No entries.','لا توجد سجلات.'],['Freundschaftsanfrage senden','Send friend request','إرسال طلب صداقة'],['Anfrage annehmen','Accept request','قبول الطلب'],
['Anfrage gesendet','Request sent','تم إرسال الطلب'],['✓ Befreundet','✓ Friends','✓ أصدقاء'],['Admin entfernen','Remove admin','إزالة المشرف'],['Zum Admin ernennen','Make admin','تعيين كمشرف'],
['Krone übergeben','Hand over crown','تسليم التاج'],['Kicken','Kick','طرد'],['Bannen','Ban','حظر'],['Timeout','Timeout','إيقاف مؤقت'],['Nutzer bannen','Ban user','حظر المستخدم'],
['Timeout setzen','Set timeout','تعيين إيقاف مؤقت'],['Dauer (Stunden)','Duration (hours)','المدة (ساعات)'],['Bestätigen','Confirm','تأكيد'],
['Dein Passwort zur Bestätigung','Your password to confirm','كلمة مرورك للتأكيد'],['Übergeben','Hand over','تسليم'],
['besitzer','owner','المالك'],['admin','admin','مشرف'],['mitglied','member','عضو'],['gebannt','banned','محظور'],['timeout','timeout','إيقاف مؤقت'],
['Einstellungen','Settings','الإعدادات'],['Aktuelles Passwort','Current password','كلمة المرور الحالية'],['Neues Passwort','New password','كلمة المرور الجديدة'],
['Passwort vergessen?','Forgot password?','هل نسيت كلمة المرور؟'],['Sprache','Language','اللغة'],['Theme','Theme','السمة'],
['Einstellungen speichern','Save settings','حفظ الإعدادات'],['Abmelden','Log out','تسجيل الخروج'],
['Einstellungen gespeichert.','Settings saved.','تم حفظ الإعدادات.'],['Session-ID kopiert.','Session ID copied.','تم نسخ معرّف الجلسة.'],['Kopieren fehlgeschlagen.','Copy failed.','فشل النسخ.'],
['Das bist du selbst.',"That's you.",'هذا أنت.'],['Freundschaftsanfrage gesendet.','Friend request sent.','تم إرسال طلب الصداقة.'],
['Ihr seid bereits befreundet.','You are already friends.','أنتم أصدقاء بالفعل.'],['Anfrage bereits gesendet.','Request already sent.','تم إرسال الطلب مسبقًا.'],
['Ihr seid jetzt befreundet.','You are now friends.','أصبحتم أصدقاء الآن.'],['Neue Freundschaftsanfrage!','New friend request!','طلب صداقة جديد!'],
['Name zu kurz.','Name too short.','الاسم قصير جدًا.'],['Name bereits vergeben.','Name already taken.','الاسم مستخدم بالفعل.'],
['Bitte aktuelles Passwort eingeben.','Please enter your current password.','يرجى إدخال كلمة المرور الحالية.'],
['Aktuelles Passwort ist falsch.','Current password is wrong.','كلمة المرور الحالية غير صحيحة.'],
['Neues Passwort: mindestens 8 Zeichen und eine Zahl.','New password: at least 8 characters and one number.','كلمة المرور الجديدة: 8 أحرف على الأقل ورقم واحد.'],
['Datenbank nicht konfiguriert (siehe README).','Database not configured (see README).','قاعدة البيانات غير مهيأة (انظر README).'],
['Entfernen','Remove','إزالة'],['Freund entfernt.','Friend removed.','تمت إزالة الصداقة.'],
['Session löschen','Delete session','حذف الجلسة'],['Session verlassen','Leave session','مغادرة الجلسة'],
['Das kann nicht rückgängig gemacht werden. Alle Artikel, Ordner und das Audit-Log gehen verloren.','This cannot be undone. All items, folders and the audit log will be lost.','لا يمكن التراجع عن هذا. ستفقد جميع المنتجات والمجلدات وسجل التدقيق.'],
['Du kannst später mit dem Session-Code erneut beitreten.','You can rejoin later with the session code.','يمكنك الانضمام لاحقًا مرة أخرى باستخدام رمز الجلسة.'],
['Verlassen','Leave','مغادرة'],['Session gelöscht.','Session deleted.','تم حذف الجلسة.'],
['Du hast die Session verlassen.',"You've left the session.",'لقد غادرت الجلسة.'],
['Animation','Animation','الحركة'],['Aus','Off','إيقاف'],['Schneefall','Snowfall','تساقط الثلج'],
['Hauptfarbe','Main color','اللون الرئيسي'],['Zweitfarbe','Second color','اللون الثانوي'],['Eigene Farben','Custom colors','ألوان مخصصة'],
['Hauptfarbe = Hintergrund · Zweitfarbe = Buttons & Akzente','Main color = background · Second color = buttons & accents','اللون الرئيسي = الخلفية · اللون الثانوي = الأزرار والتمييز'],
['Symbol hinzufügen','Add symbol','إضافة رمز'],['Emoji, Buchstabe oder Zahl','Emoji, letter or number','إيموجي أو حرف أو رقم'],['Hinzufügen','Add','إضافة'],
['Bitte ein Zeichen eingeben.','Please enter a character.','يرجى إدخال رمز.'],['Dieses Symbol gibt es schon.','This symbol already exists.','هذا الرمز موجود بالفعل.'],['Maximal 12 eigene Symbole.','Maximum of 12 custom symbols.','الحد الأقصى 12 رمزًا مخصصًا.'],,
['Account löschen','Delete account','حذف الحساب'],['Account endgültig löschen','Permanently delete account','حذف الحساب نهائيًا'],
['Diese Aktion kann nicht rückgängig gemacht werden. Gib dein Passwort ein, um zu bestätigen.','This action cannot be undone. Enter your password to confirm.','لا يمكن التراجع عن هذا الإجراء. أدخل كلمة المرور للتأكيد.'],
['Bist du sicher, dass du dich abmelden willst?','Are you sure you want to log out?','هل أنت متأكد أنك تريد تسجيل الخروج؟'],
['Ja, abmelden','Yes, log out','نعم، تسجيل الخروج'],
['Passwort-Reset per E-Mail ist in dieser Vorschau nicht verfügbar. Bitte aktuelles Passwort verwenden.','Password reset by email is not available in this preview. Please use your current password.','إعادة تعيين كلمة المرور عبر البريد غير متاحة في هذه النسخة. يرجى استخدام كلمة المرور الحالية.']
];
const DICT={en:{},ar:{}}; I18N.forEach(([de,en,ar])=>{DICT.en[de]=en; DICT.ar[de]=ar;});
const stw=(w,l)=>DICT[l][w]||w;
const PATTERNS=[
 [/^(\d+) Mitglieder$/,{en:n=>`${n} members`,ar:n=>`${n} أعضاء`}],
 [/^(\d+) Tage$/,{en:n=>`${n} days`,ar:n=>`${n} أيام`}],
 [/^EK (.*)€ · VK (.*)€ · (.*)$/,{en:(a,b,p)=>`Buy ${a}€ · Sell ${b}€ · ${stw(p,'en')}`,ar:(a,b,p)=>`شراء ${a}€ · بيع ${b}€ · ${stw(p,'ar')}`}],
 [/^Krone übergeben an (.*)\?$/,{en:n=>`Hand over crown to ${n}?`,ar:n=>`تسليم التاج إلى ${n}؟`}],
 [/^Session „(.*)" erstellt$/,{en:n=>`created the session “${n}”`,ar:n=>`أنشأ الجلسة «${n}»`}],
 [/^ist der Session beigetreten$/,{en:()=>'joined the session',ar:()=>'انضم إلى الجلسة'}],
 [/^hat den Artikel „(.*)" hinzugefügt$/,{en:n=>`added the item “${n}”`,ar:n=>`أضاف المنتج «${n}»`}],
 [/^hat den Artikel „(.*)" bearbeitet$/,{en:n=>`edited the item “${n}”`,ar:n=>`عدّل المنتج «${n}»`}],
 [/^hat den Artikel „(.*)" gelöscht$/,{en:n=>`deleted the item “${n}”`,ar:n=>`حذف المنتج «${n}»`}],
 [/^hat „(.*)" als (.*) markiert$/,{en:(n,st)=>`marked “${n}” as ${stw(st,'en')}`,ar:(n,st)=>`وضع «${n}» كـ ${stw(st,'ar')}`}],
 [/^hat den Ordner „(.*)" erstellt$/,{en:n=>`created the folder “${n}”`,ar:n=>`أنشأ المجلد «${n}»`}],
 [/^hat den Ordner „(.*)" gelöscht$/,{en:n=>`deleted the folder “${n}”`,ar:n=>`حذف المجلد «${n}»`}],
 [/^hat die Krone an (.*) übergeben$/,{en:n=>`handed the crown to ${n}`,ar:n=>`سلّم التاج إلى ${n}`}],
 [/^hat (.*) zum Admin ernannt$/,{en:n=>`made ${n} an admin`,ar:n=>`عيّن ${n} مشرفًا`}],
 [/^hat (.*) aus der Session entfernt$/,{en:n=>`removed ${n} from the session`,ar:n=>`أزال ${n} من الجلسة`}],
 [/^Session „(.*)" löschen\?$/,{en:n=>`Delete session "${n}"?`,ar:n=>`حذف الجلسة "${n}"؟`}],
 [/^hat die Session verlassen$/,{en:()=>'left the session',ar:()=>'غادر الجلسة'}]
];
function tr(str){
  if(curLang==='de'||!str) return str;
  const core=str.trim(); if(!core) return str;
  let out=DICT[curLang][core];
  if(out===undefined){ for(const [re,f] of PATTERNS){ const m=core.match(re); if(m){ out=f[curLang](...m.slice(1)); break; } } }
  return out===undefined ? str : str.match(/^\s*/)[0]+out+str.match(/\s*$/)[0];
}
const ORIG=new WeakMap();
function applyText(n){
  const p=n.parentNode; if(!p||p.nodeName==='SCRIPT'||p.nodeName==='STYLE') return;
  if(!ORIG.has(n)) ORIG.set(n,n.nodeValue);
  const v=tr(ORIG.get(n)); if(n.nodeValue!==v) n.nodeValue=v;
}
function applyAttrs(el){
  for(const a of ['placeholder','title']){
    if(el.hasAttribute(a)){ const k='i18n'+a; if(!(k in el.dataset)) el.dataset[k]=el.getAttribute(a); el.setAttribute(a,tr(el.dataset[k])); }
  }
}
function walk(n){
  if(n.nodeType===3){ applyText(n); return; }
  if(n.nodeType!==1||n.nodeName==='SCRIPT'||n.nodeName==='STYLE') return;
  applyAttrs(n); n.childNodes.forEach(walk);
}
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(walk))).observe(document.body,{childList:true,subtree:true});
function applyLang(l){
  curLang=l||'en';
  document.documentElement.lang=curLang;
  document.documentElement.dir=curLang==='ar'?'rtl':'ltr';
  walk(document.body);
  if(document.getElementById('quoteBox')) renderQuote();
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

/* ---------- live own-user doc (friend requests pop up instantly) ---------- */
function subscribeMe(){
  if(unsubMe) unsubMe();
  unsubMe=db.doc('users/'+user.id).onSnapshot(snap=>{
    if(!snap.exists) return;
    const d=snap.data(), before=(user.incoming||[]).length;
    Object.assign(user,d);
    if((d.incoming||[]).length>before) toast('Neue Freundschaftsanfrage!');
    if(currentView==='home'&&document.getElementById('friendList')) renderFriends();
  },()=>{});
}

const LS={get(k){try{return localStorage.getItem(k);}catch(e){return null;}},set(k,v){try{localStorage.setItem(k,v);}catch(e){}},del(k){try{localStorage.removeItem(k);}catch(e){}}};
/* Backend: Claude artifact db when hosted in Claude, otherwise Firebase Firestore (GitHub Pages) */
async function initDb(){
  if(typeof claude!=='undefined' && typeof claude.use==='function') return await claude.use('db');
  const cfg=window.AWAKE_FIREBASE_CONFIG;
  if(!window.firebase||!cfg||!cfg.apiKey||String(cfg.apiKey).startsWith('YOUR_')) throw new Error('not-configured');
  firebase.initializeApp(cfg);
  const fs=firebase.firestore();
  const clean=o=>JSON.parse(JSON.stringify(o));
  return { doc:p=>{ const r=fs.doc(p); return { get:()=>r.get(), set:d=>r.set(clean(d)), update:d=>r.update(clean(d)), delete:()=>r.delete(), onSnapshot:(a,b)=>r.onSnapshot(a,b) }; } };
}
async function boot(){
  try{ db = await initDb(); }
  catch(e){ document.getElementById('loginErr').textContent='Datenbank nicht konfiguriert (siehe README).'; document.getElementById('regErr').textContent='Datenbank nicht konfiguriert (siehe README).'; return; }
  const saved = LS.get('awake_user');
  if(saved){ try{ await loginAs(JSON.parse(saved).name, true);}catch(e){ LS.del('awake_user'); } }
}
let _rz; window.addEventListener('resize',()=>{clearTimeout(_rz);_rz=setTimeout(()=>{ if(currentView==='session'&&currentTab==='stats'&&currentSession) renderStats(); },200);});
if('serviceWorker' in navigator){ window.addEventListener('load',()=>{ navigator.serviceWorker.register('./sw.js').catch(()=>{}); }); }
applyLang('en');
boot();

/* ---------- no zoom, no copying (inputs and the copy button still work) ---------- */
(function(){
  const inField=e=>{ const t=e.target; const el=t&&t.nodeType===1?t:(t&&t.parentElement); return !!(el&&el.closest&&el.closest('input,textarea,select,[contenteditable=true]')); };
  ['gesturestart','gesturechange','gestureend'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));   // iOS pinch
  document.addEventListener('touchmove',e=>{ if(e.touches&&e.touches.length>1) e.preventDefault(); },{passive:false});               // 2-finger pinch
  document.addEventListener('wheel',e=>{ if(e.ctrlKey) e.preventDefault(); },{passive:false});                                      // ctrl + wheel / trackpad pinch
  document.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&['+','-','=','_','0'].includes(e.key)) e.preventDefault(); });
  ['copy','cut','contextmenu','dragstart'].forEach(ev=>document.addEventListener(ev,e=>{ if(!inField(e)) e.preventDefault(); }));
})();

function switchTab(t){
  document.getElementById('tabLogin').classList.toggle('active',t==='login');
  document.getElementById('tabReg').classList.toggle('active',t==='register');
  document.getElementById('loginForm').classList.toggle('hidden',t!=='login');
  document.getElementById('regForm').classList.toggle('hidden',t!=='register');
}

function safeId(name){
  return name.trim().toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'user';
}
async function sha256(str){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function doRegister(e){
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const pass = document.getElementById('regPass').value;
  const errEl = document.getElementById('regErr'); errEl.textContent='';
  if(name.length<2){errEl.textContent='Name braucht mindestens 2 Buchstaben.';return false;}
  if(!/^(?=.*\d).{8,}$/.test(pass)){errEl.textContent='Passwort: mindestens 8 Zeichen und eine Zahl.';return false;}
  try{
    const existing = await db.doc('users/'+safeId(name)).get();
    if(existing && existing.exists){ errEl.textContent='Dieser Name ist schon vergeben.'; return false; }
    const passHash = await sha256(pass);
    const data = {name, passHash, avatar:'', lang:'en', theme:'dark', friends:[], incoming:[], outgoing:[], sessions:[], snow:false, anim:'off', customAnims:[], customColors:DEFAULT_CUSTOM, createdAt:Date.now()};
    await db.doc('users/'+safeId(name)).set(data);
    await loginAs(name);
  }catch(err){ errEl.textContent='Fehler: '+(err.message||err); }
  return false;
}

async function doLogin(e){
  e.preventDefault();
  const name = document.getElementById('loginName').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginErr'); errEl.textContent='';
  try{
    const doc = await db.doc('users/'+safeId(name)).get();
    if(!doc || !doc.exists){ errEl.textContent='Nutzer nicht gefunden.'; return false; }
    const passHash = await sha256(pass);
    if(doc.data().passHash !== passHash){ errEl.textContent='Falsches Passwort.'; return false; }
    await loginAs(name);
  }catch(err){ errEl.textContent='Fehler: '+(err.message||err); }
  return false;
}

async function loginAs(name, silent){
  const doc = await db.doc('users/'+safeId(name)).get();
  if(!doc || !doc.exists) throw new Error('not found');
  user = {id:safeId(name), ...doc.data()};
  LS.set('awake_user', JSON.stringify({name}));
  applyTheme(user.theme||'dark');
  applyLang(user.lang||'en');
  applyAnim(getAnim());
  subscribeMe();
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('app').classList.add('fade');
  renderTop();
  showView('home');
}

function logout(){ LS.del('awake_user'); location.reload(); }
function confirmLogout(){
  showModal(`<h3>Bist du sicher, dass du dich abmelden willst?</h3>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" style="background:var(--danger)" onclick="logout()">Ja, abmelden</button></div>`);
}

/* ---------- theme (incl. custom colors) ---------- */
const THEME_IDS=['light','dark','navy','dark-red','noir','custom'];
const CUSTOM_VARS=['--bg','--surface','--surface2','--text','--sub','--border','--accent','--accent2','--on-accent'];
const DEFAULT_CUSTOM={main:'#1B1F3A',second:'#7C5CFF'};
const _hex2rgb=h=>{h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.substr(i,2),16));};
const _rgb2hex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const _mix=(a,b,t)=>{const x=_hex2rgb(a),y=_hex2rgb(b);return _rgb2hex(x.map((v,i)=>v+(y[i]-v)*t));};
const _lum=h=>{const [r,g,b]=_hex2rgb(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*r+.7152*g+.0722*b;};
function _shiftHue(hex,deg){
  let [r,g,b]=_hex2rgb(hex).map(v=>v/255);
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn; let h=0,sat=0;
  if(d){ sat=l>.5?d/(2-mx-mn):d/(mx+mn); h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4); h*=60; }
  h=(h+deg+360)%360;
  const k=n=>(n+h/30)%12, a=sat*Math.min(l,1-l), f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  return _rgb2hex([f(0)*255,f(8)*255,f(4)*255]);
}
function customVars(c){
  const main=c.main, second=c.second, dark=_lum(main)<.4;
  const text=dark?'#F1E9D8':'#14161F';
  return {
    '--bg':main,
    '--surface':_mix(main,dark?'#ffffff':'#000000',.06),
    '--surface2':_mix(main,dark?'#ffffff':'#000000',.12),
    '--border':_mix(main,dark?'#ffffff':'#000000',.2),
    '--text':text,
    '--sub':_mix(text,main,.45),
    '--accent':second,
    '--accent2':_shiftHue(second,28),
    '--on-accent':_lum(second)>.45?'#14161F':'#F1E9D8'
  };
}
function getCustom(){ return (user&&(user._pendingCustom||user.customColors))||DEFAULT_CUSTOM; }
function applyTheme(t){
  if(!THEME_IDS.includes(t)) t='dark';            // removed/unknown themes (e.g. "nature-green") fall back to dark
  const root=document.documentElement;
  root.setAttribute('data-theme',t);
  CUSTOM_VARS.forEach(v=>root.style.removeProperty(v));
  if(t==='custom'){ const vars=customVars(getCustom()); for(const k in vars) root.style.setProperty(k,vars[k]); }
  requestAnimationFrame(()=>{ const m=document.querySelector('meta[name="theme-color"]'); if(m) m.content=getComputedStyle(document.body).backgroundColor; });
}

/* ---------- animation (snowfall + own symbols) ---------- */
const MAX_CUSTOM_ANIMS=12;
function getAnim(){ return (user&&user._pendingAnim)||(user&&user.anim)||(user&&user.snow?'snow':'off'); }
function getCustomAnims(){ return (user&&(user._pendingAnims||user.customAnims))||[]; }
let snowTimer=null;
function startSnow(sym){
  if(snowTimer) return;
  const layer=document.getElementById('snowLayer'); if(!layer) return;
  const isFlake=!sym;
  snowTimer=setInterval(()=>{
    const f=document.createElement('span');
    f.className='snowflake'; f.textContent=isFlake?'.':sym;
    f.style.left=(Math.random()*100)+'%';
    f.style.fontSize=(isFlake?10+Math.random()*14:16+Math.random()*14)+'px';
    f.style.opacity=(isFlake?0.15+Math.random()*0.35:0.55+Math.random()*0.4).toFixed(2);
    const dur=6+Math.random()*6;
    f.style.animationDuration=dur+'s';
    layer.appendChild(f);
    setTimeout(()=>f.remove(), dur*1000+200);
  }, isFlake?260:420);
}
function stopSnow(){
  if(snowTimer){ clearInterval(snowTimer); snowTimer=null; }
  const layer=document.getElementById('snowLayer'); if(layer) layer.innerHTML='';
}
function applyAnim(a){
  stopSnow();
  if(!a||a==='off') return;
  startSnow(a==='snow'?null:a.slice(2));
}

function initials(n){ return (n||'?').slice(0,2).toUpperCase(); }

function renderTop(){
  const av = document.getElementById('topAvatar');
  av.innerHTML = user.avatar ? `<img src="${user.avatar}">` : initials(user.name);
  document.getElementById('topName').textContent = user.name;
  document.getElementById('topMid').innerHTML = currentSession ? `<span class="sessionkey">${currentSession.key}<button class="copy-btn" onclick="copyKey()">⧉</button></span>` : '';
}
function copyKey(){
  navigator.clipboard.writeText(currentSession.key).then(()=>toast('Session-ID kopiert.')).catch(()=>toast('Kopieren fehlgeschlagen.'));
}

function showView(v){
  currentView=v;
  document.getElementById('navHome').classList.toggle('active', v==='home'||v==='session');
  document.getElementById('navSettings').classList.toggle('active', v==='settings');
  if(v==='home'){ currentSession=null; renderTop(); renderHome(); }
  if(v==='settings'){ renderSettings(); }
}

function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }

/* ---------- HOME ---------- */
async function renderHome(){
  const c = document.getElementById('content');
  c.innerHTML = `<div class="fade home-grid">
    <div class="card-box">
      <div class="row-between">
        <h2 class="section-title" style="font-size:17px;margin:0">Deine Sessions</h2>
        <div class="btn-row">
          <button class="btn-small" onclick="openJoinModal()">Session beitreten</button>
          <button class="btn-small solid" onclick="openCreateModal()">+ Session erstellen</button>
        </div>
      </div>
      <div class="grid" id="sessGrid"><div class="empty">Lade…</div></div>
    </div>

    <div class="home-side">
      <div class="card-box side-box">
        <h3>Freunde</h3>
        <div class="addfriend">
          <input id="friendInput" placeholder="Name eingeben…">
          <button class="btn-small" onclick="addFriend()">+</button>
        </div>
        <div id="friendList"></div>
      </div>

      <div class="card-box side-box quotes-box">
        <h3>Zitate</h3>
        <div class="quote-box fade" id="quoteBox"></div>
        <div class="quote-nav">
          <button class="btn-small" onclick="quoteNav(-1)">← Zurück</button>
          <button class="btn-small" onclick="quoteNav(1)">Skip →</button>
        </div>
      </div>
    </div>
  </div>`;
  renderQuote();
  renderFriends();
  loadSessions();
}

function renderQuote(){
  const q = QUOTES[quoteIdx];
  const txt = q.t[curLang==='de'?0:curLang==='ar'?2:1];
  document.getElementById('quoteBox').innerHTML = `<p>“${txt}”</p><span>— ${q.a}</span>`;
}
function quoteNav(dir){ quoteIdx=(quoteIdx+dir+QUOTES.length)%QUOTES.length; renderQuote(); }

function renderFriends(){
  const el=document.getElementById('friendList'); if(!el) return;
  const friends=user.friends||[], inc=user.incoming||[], out=user.outgoing||[];
  let h='';
  if(inc.length){
    h+='<div class="sub-title">Freundschaftsanfragen</div>'+inc.map(n=>`<div class="friend-row req"><div class="avatar">${initials(n)}</div><b>${esc(n)}</b><div class="req-btns"><button class="btn-small solid" data-n="${esc(n)}" onclick="acceptFriend(this.dataset.n)">Annehmen</button><button class="btn-small" data-n="${esc(n)}" onclick="declineFriend(this.dataset.n)">Ablehnen</button></div></div>`).join('');
  }
  h+=friends.map(f=>`<div class="friend-row"><div class="avatar">${initials(f)}</div><b>${esc(f)}</b><button class="audit-del" data-n="${esc(f)}" title="Entfernen" onclick="removeFriend(this.dataset.n)">✕</button></div>`).join('');
  h+=out.map(f=>`<div class="friend-row"><div class="avatar">${initials(f)}</div><b>${esc(f)}</b><small>Ausstehend</small></div>`).join('');
  el.innerHTML=h||'<div class="empty">Noch keine Freunde</div>';
}

async function removeFriend(name){
  const friends=(user.friends||[]).filter(f=>f!==name);
  await db.doc('users/'+user.id).update({friends});
  user.friends=friends;
  const tid=safeId(name);
  const tdoc=await db.doc('users/'+tid).get();
  if(tdoc.exists){ const tf=(tdoc.data().friends||[]).filter(f=>f!==user.name); await db.doc('users/'+tid).update({friends:tf}); }
  renderFriends();
  toast('Freund entfernt.');
}
async function addFriend(){
  const inp=document.getElementById('friendInput');
  const ok=await sendFriendRequest(inp.value);
  if(ok) inp.value='';
}
async function sendFriendRequest(name){
  name=(name||'').trim(); if(!name) return false;
  const tid=safeId(name);
  if(tid===user.id){ toast('Das bist du selbst.'); return false; }
  const tdoc=await db.doc('users/'+tid).get();
  if(!tdoc.exists){ toast('Nutzer nicht gefunden.'); return false; }
  const t=tdoc.data(), tname=t.name;
  if((user.friends||[]).includes(tname)){ toast('Ihr seid bereits befreundet.'); return false; }
  if((user.incoming||[]).includes(tname)){ await acceptFriend(tname); return true; }
  if((t.incoming||[]).includes(user.name)){ toast('Anfrage bereits gesendet.'); return false; }
  await db.doc('users/'+tid).update({incoming:[...(t.incoming||[]), user.name]});
  const out=[...(user.outgoing||[]), tname];
  await db.doc('users/'+user.id).update({outgoing:out});
  user.outgoing=out; renderFriends();
  toast('Freundschaftsanfrage gesendet.');
  return true;
}
async function acceptFriend(name){
  const tid=safeId(name);
  const tdoc=await db.doc('users/'+tid).get(); if(!tdoc.exists) return;
  const t=tdoc.data();
  const mine={incoming:(user.incoming||[]).filter(n=>n!==name), outgoing:(user.outgoing||[]).filter(n=>n!==name), friends:[...new Set([...(user.friends||[]), t.name])]};
  await db.doc('users/'+user.id).update(mine);
  Object.assign(user,mine);
  await db.doc('users/'+tid).update({friends:[...new Set([...(t.friends||[]), user.name])], incoming:(t.incoming||[]).filter(n=>n!==user.name), outgoing:(t.outgoing||[]).filter(n=>n!==user.name)});
  renderFriends(); toast('Ihr seid jetzt befreundet.');
}
async function declineFriend(name){
  const tid=safeId(name);
  const inc=(user.incoming||[]).filter(n=>n!==name);
  await db.doc('users/'+user.id).update({incoming:inc}); user.incoming=inc;
  const tdoc=await db.doc('users/'+tid).get();
  if(tdoc.exists) await db.doc('users/'+tid).update({outgoing:(tdoc.data().outgoing||[]).filter(n=>n!==user.name)});
  renderFriends();
}

async function loadSessions(){
  const grid = document.getElementById('sessGrid');
  const ids = user.sessions||[];
  if(!ids.length){ grid.innerHTML = '<div class="empty">Noch keine Sessions — erstelle deine erste!</div>'; return; }
  const results = await Promise.all(ids.map(id=>db.doc('sessions/'+id).get().catch(()=>null)));
  grid.innerHTML = results.filter(r=>r&&r.exists).map(r=>{
    const s=r.data();
    return `<div class="card" onclick="openSession('${r.id}')">
      <div class="thumb">${s.image?`<img src="${s.image}">`:'📦'}</div>
      <b>${s.name}</b><small>${s.members.length} Mitglieder</small>
    </div>`;
  }).join('') || '<div class="empty">Noch keine Sessions</div>';
}

/* ---------- CREATE / JOIN SESSION ---------- */
function openCreateModal(){
  showModal(`<h3>Session erstellen</h3>
    <div class="field"><label>Session-Name</label><input id="newSessName" required></div>
    <div class="field"><label>Bild (optional)</label><input id="newSessImg" type="file" accept="image/*"></div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Abbrechen</button>
      <button class="btn-primary" onclick="createSession()">Erstellen</button>
    </div>`);
}
function openJoinModal(){
  showModal(`<h3>Session beitreten</h3>
    <div class="field"><label>Session-ID</label><input id="joinId" placeholder="16-stelliger Code" maxlength="16"></div>
    <div class="err" id="joinErr"></div>
    <div class="modal-actions">
      <button class="btn-ghost" onclick="closeModal()">Abbrechen</button>
      <button class="btn-primary" onclick="joinSession()">Beitreten</button>
    </div>`);
}
function genKey(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let s=''; for(let i=0;i<16;i++) s+=chars[Math.floor(Math.random()*chars.length)];
  return s;
}
async function keyToId(key){ return (await sha256(key)).slice(0,24); }
function readFileAsDataUrl(file,max=256){
  return new Promise(res=>{
    const r=new FileReader();
    r.onerror=()=>res('');
    r.onload=()=>{ const img=new Image(); img.onerror=()=>res('');
      img.onload=()=>{ const k=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(img.width*k)); c.height=Math.max(1,Math.round(img.height*k));
        const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0,c.width,c.height);
        res(c.toDataURL('image/jpeg',0.7)); };
      img.src=r.result; };
    r.readAsDataURL(file);
  });
}

async function createSession(){
  const name = document.getElementById('newSessName').value.trim();
  if(name.length<2){ toast('Session-Name braucht mindestens 2 Zeichen.'); return; }
  const fileInput = document.getElementById('newSessImg');
  let image='';
  if(fileInput.files[0]) image = await readFileAsDataUrl(fileInput.files[0]);
  const key = genKey();
  const id = await keyToId(key);
  const data = {key, name, image, ownerName:user.name, admins:[], members:[{name:user.name, avatar:user.avatar||'', role:'besitzer'}], folders:[], items:[], audit:[{ts:Date.now(),actor:user.name,action:`Session „${name}" erstellt`}], createdAt:Date.now()};
  await db.doc('sessions/'+id).set(data);
  user.sessions = [...(user.sessions||[]), id];
  await db.doc('users/'+user.id).update({sessions:user.sessions});
  closeModal();
  openSession(id);
}

async function joinSession(){
  const typedKey = document.getElementById('joinId').value.trim();
  const errEl = document.getElementById('joinErr');
  const id = await keyToId(typedKey);
  const doc = await db.doc('sessions/'+id).get();
  if(!doc || !doc.exists){ errEl.textContent='Session nicht gefunden.'; return; }
  const s = doc.data();
  if(!s.members.find(m=>m.name===user.name)){
    const members=[...s.members, {name:user.name, avatar:user.avatar||'', role:'mitglied'}];
    const audit=[...(s.audit||[]), {ts:Date.now(),actor:user.name,action:'ist der Session beigetreten'}];
    await db.doc('sessions/'+id).update({members, audit});
  }
  if(!(user.sessions||[]).includes(id)){
    user.sessions = [...(user.sessions||[]), id];
    await db.doc('users/'+user.id).update({sessions:user.sessions});
  }
  closeModal();
  openSession(id);
}

async function openSession(id){
  const doc = await db.doc('sessions/'+id).get();
  if(!doc || !doc.exists){ toast('Session nicht gefunden.'); return; }
  currentSession = {id, ...doc.data()};
  currentView='session';
  currentSession.folders = currentSession.folders||[];
  currentSession.items = currentSession.items||[];
  activeFolder='all'; activeRange=7;
  renderTop();
  document.getElementById('navHome').classList.add('active');
  renderSessionTab('lager');
}

async function saveSession(patch){
  Object.assign(currentSession, patch);
  await db.doc('sessions/'+currentSession.id).update(patch);
}
function addAudit(action){
  currentSession.audit = [...(currentSession.audit||[]), {ts:Date.now(), actor:user.name, action}];
}
function myMember(){ return currentSession.members.find(m=>m.name===user.name); }
function myRole(){ return myMember()?.role || 'mitglied'; }
function isOwner(){ return myRole()==='besitzer'; }
function isAdminOrOwner(){ return myRole()==='besitzer'||myRole()==='admin'; }
function isRestricted(){ const m=myMember(); if(!m) return false; if(m.banned) return true; if(m.timeoutUntil && m.timeoutUntil>Date.now()) return true; return false; }

function renderSessionTab(tab){
  currentTab=tab;
  const c = document.getElementById('content');
  c.innerHTML = `<div class="fade">
    <div class="row-between" style="margin-bottom:18px">
      <button class="btn-small" onclick="showView('home')">← Zurück</button>
      ${isOwner()
        ? `<button class="btn-small" style="color:var(--danger);border-color:var(--danger)" onclick="confirmDeleteSession()">Session löschen</button>`
        : `<button class="btn-small" onclick="confirmLeaveSession()">Session verlassen</button>`}
    </div>
    <div class="tabs" style="max-width:440px;margin-bottom:22px">
      <button class="${tab==='lager'?'active':''}" onclick="renderSessionTab('lager')">Lager</button>
      <button class="${tab==='stats'?'active':''}" onclick="renderSessionTab('stats')">Statistiken</button>
      <button class="${tab==='audit'?'active':''}" onclick="renderSessionTab('audit')">Audit Log</button>
    </div>
    <div id="tabBody"></div>
  </div>`;
  if(tab==='lager') renderLager();
  if(tab==='stats') renderStats();
  if(tab==='audit') renderAudit();
}

/* ---------- LAGER ---------- */
function renderLager(){
  const body = document.getElementById('tabBody');
  const folders = currentSession.folders;
  const items = currentSession.items.filter(i=> activeFolder==='all' || i.folderId===activeFolder);
  body.innerHTML = `
    <div class="row-between">
      <h2 class="section-title" style="font-size:16px;margin:0">Lager</h2>
      ${isRestricted()?'':'<button class="btn-small solid" onclick="openItemModal()">+ Produkt hinzufügen</button>'}
    </div>
    <div class="folder-row" id="folderRow"></div>
    <div class="grid" id="itemGrid"></div>`;
  const fr = document.getElementById('folderRow');
  fr.innerHTML = `<div class="chip ${activeFolder==='all'?'active':''}" onclick="activeFolder='all';renderLager()">Alle</div>` +
    folders.map(f=>`<div class="chip ${activeFolder===f.id?'active':''}"><span onclick="activeFolder='${f.id}';renderLager()">${f.name}</span>${isAdminOrOwner()?`<span class="x" onclick="event.stopPropagation();deleteFolder('${f.id}')">✕</span>`:''}</div>`).join('') +
    (isAdminOrOwner()?`<div class="chip" onclick="openFolderModal()">+ Ordner</div>`:'');
  const grid = document.getElementById('itemGrid');
  grid.innerHTML = items.length? items.map(it=>`
    <div class="item-card" onclick="openItemModal('${it.id}')">
      <div class="thumb">${it.image?`<img src="${it.image}">`:'🏷️'}</div>
      <span class="badge ${it.status}">${it.status}</span>
      <b>${it.name}</b>
      <div class="prices">EK ${it.buyPrice}€ · VK ${it.sellPrice}€ · ${it.platform}</div>
    </div>`).join('') : '<div class="empty">Noch keine Artikel in diesem Ordner.</div>';
}

function openFolderModal(){
  showModal(`<h3>Ordner erstellen</h3>
    <div class="field"><label>Name</label><input id="folderName" placeholder="z.B. Kleidung"></div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" onclick="createFolder()">Erstellen</button></div>`);
}
async function createFolder(){
  const name = document.getElementById('folderName').value.trim();
  if(!name){ toast('Name eingeben.'); return; }
  const folders = [...currentSession.folders, {id:'f'+Date.now(), name}];
  addAudit(`hat den Ordner „${name}" erstellt`);
  await saveSession({folders, audit:currentSession.audit});
  closeModal(); renderLager();
}
async function deleteFolder(id){
  const f = currentSession.folders.find(x=>x.id===id);
  const folders = currentSession.folders.filter(x=>x.id!==id);
  const items = currentSession.items.map(i=> i.folderId===id? {...i, folderId:null} : i);
  addAudit(`hat den Ordner „${f?.name}" gelöscht`);
  if(activeFolder===id) activeFolder='all';
  await saveSession({folders, items, audit:currentSession.audit});
  renderLager();
}

function openItemModal(id){
  const it = id ? currentSession.items.find(i=>i.id===id) : null;
  showModal(`<h3>${it?'Artikel bearbeiten':'Artikel hinzufügen'}</h3>
    <div class="field"><label>Name</label><input id="itName" value="${it?it.name:''}"></div>
    <div class="field"><label>Bild (optional)</label><input id="itImg" type="file" accept="image/*"></div>
    <div class="field"><label>Ordner</label><select id="itFolder">
      <option value="">Kein Ordner</option>
      ${currentSession.folders.map(f=>`<option value="${f.id}" ${it&&it.folderId===f.id?'selected':''}>${f.name}</option>`).join('')}
    </select></div>
    <div class="field"><label>Einkaufspreis (€)</label><input id="itBuy" type="number" step="0.01" value="${it?it.buyPrice:''}"></div>
    <div class="field"><label>Verkaufspreis (€)</label><input id="itSell" type="number" step="0.01" value="${it?it.sellPrice:''}"></div>
    <div class="field"><label>Plattform</label><select id="itPlatform">
      ${['vinted','kleinanzeigen','sonstiges'].map(p=>`<option value="${p}" ${it&&it.platform===p?'selected':''}>${p}</option>`).join('')}
    </select></div>
    ${it?`<div class="btn-row" style="margin-top:6px">
      ${it.status!=='verkauft'?`<button class="btn-small" style="color:var(--ok)" onclick="setItemStatus('${it.id}','verkauft')">Verkauft</button>`:''}
      ${it.status!=='offline'?`<button class="btn-small" onclick="setItemStatus('${it.id}','offline')">Offline stellen</button>`:''}
      ${it.status!=='lager'?`<button class="btn-small" onclick="setItemStatus('${it.id}','lager')">Zurück ins Lager</button>`:''}
      <button class="btn-small" style="color:var(--danger)" onclick="deleteItem('${it.id}')">Löschen</button>
    </div>`:''}
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" onclick="saveItem('${it?it.id:''}')">Speichern</button></div>`);
}
async function saveItem(id){
  const name = document.getElementById('itName').value.trim();
  if(!name){ toast('Name eingeben.'); return; }
  const folderId = document.getElementById('itFolder').value || null;
  const buyPrice = parseFloat(document.getElementById('itBuy').value)||0;
  const sellPrice = parseFloat(document.getElementById('itSell').value)||0;
  const platform = document.getElementById('itPlatform').value;
  const fileInput = document.getElementById('itImg');
  let image = id ? (currentSession.items.find(i=>i.id===id)?.image||'') : '';
  if(fileInput.files[0]) image = await readFileAsDataUrl(fileInput.files[0]);
  let items;
  if(id){
    items = currentSession.items.map(i=> i.id===id ? {...i, name, folderId, buyPrice, sellPrice, platform, image} : i);
    addAudit(`hat den Artikel „${name}" bearbeitet`);
  } else {
    items = [...currentSession.items, {id:'i'+Date.now(), name, folderId, buyPrice, sellPrice, platform, image, status:'lager', createdAt:Date.now()}];
    addAudit(`hat den Artikel „${name}" hinzugefügt`);
  }
  await saveSession({items, audit:currentSession.audit});
  closeModal(); renderLager();
}
async function setItemStatus(id, status){
  const items = currentSession.items.map(i=> i.id===id ? {...i, status, soldAt: status==='verkauft'?Date.now():i.soldAt} : i);
  const it = items.find(i=>i.id===id);
  addAudit(`hat „${it.name}" als ${status} markiert`);
  await saveSession({items, audit:currentSession.audit});
  closeModal(); renderLager();
}
async function deleteItem(id){
  const it = currentSession.items.find(i=>i.id===id);
  const items = currentSession.items.filter(i=>i.id!==id);
  addAudit(`hat den Artikel „${it.name}" gelöscht`);
  await saveSession({items, audit:currentSession.audit});
  closeModal(); renderLager();
}

/* ---------- STATS ---------- */
function renderStats(){
  const items = currentSession.items;
  const sold = items.filter(i=>i.status==='verkauft');
  const profit = sold.reduce((s,i)=>s+(i.sellPrice-i.buyPrice),0);
  const umsatz = sold.reduce((s,i)=>s+i.sellPrice,0);
  const body = document.getElementById('tabBody');
  body.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="num">${sold.length}</div><div class="lbl">Produkte verkauft</div></div>
      <div class="stat-card"><div class="num">${items.filter(i=>i.status==='lager').length}</div><div class="lbl">Produkte im Lager</div></div>
      <div class="stat-card"><div class="num">${profit.toFixed(2)}€</div><div class="lbl">Profit</div></div>
      <div class="stat-card"><div class="num">${umsatz.toFixed(2)}€</div><div class="lbl">Umsatz</div></div>
    </div>
    <div class="range-tabs" style="margin-bottom:14px">
      ${[7,14,30,'all'].map(r=>`<button class="${activeRange===r?'active':''}" onclick="activeRange=${typeof r==='string'?`'${r}'`:r};renderStats()">${r==='all'?'Alltime':r+' Tage'}</button>`).join('')}
    </div>
    <div class="chart-card"><h4>Verkäufe</h4><canvas id="chSold" height="70"></canvas></div>
    <div class="chart-card"><h4>Lagerbestand</h4><canvas id="chStock" height="70"></canvas></div>
    <div class="chart-card"><h4>Profit</h4><canvas id="chProfit" height="70"></canvas></div>
    <div class="chart-card"><h4>Umsatz</h4><canvas id="chRevenue" height="70"></canvas></div>`;
  const rangeDays = activeRange==='all' ? Math.max(1, Math.ceil((Date.now()-(currentSession.createdAt||Date.now()))/86400000)+1) : activeRange;
  const days=[...Array(rangeDays)].map((_,i)=>{ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-(rangeDays-1-i)); return d.getTime(); });
  const cum=(arr,valFn)=>{ let running=0; return days.map(dayTs=>{ const dayEnd=dayTs+86400000; running += arr.filter(i=>{const t=valFn.t(i); return t && t>=dayTs && t<dayEnd;}).reduce((s,i)=>s+valFn.v(i),0); return running; }); };
  drawChart('chSold', cum(sold,{t:i=>i.soldAt,v:()=>1}), getComputedStyle(document.documentElement).getPropertyValue('--accent'));
  const stockSeries = days.map(dayEnd=> items.filter(i=>i.createdAt<=dayEnd+86400000 && (i.status!=='verkauft' || i.soldAt>dayEnd+86400000)).length);
  drawChart('chStock', stockSeries, getComputedStyle(document.documentElement).getPropertyValue('--accent2'));
  drawChart('chProfit', cum(sold,{t:i=>i.soldAt,v:i=>i.sellPrice-i.buyPrice}), getComputedStyle(document.documentElement).getPropertyValue('--ok'));
  drawChart('chRevenue', cum(sold,{t:i=>i.soldAt,v:i=>i.sellPrice}), '#8B6BFF');
}
function drawChart(id, values, color){
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.offsetWidth; const h = canvas.height = 70;
  ctx.clearRect(0,0,w,h);
  const max = Math.max(...values,1);
  const step = w/(values.length-1||1);
  ctx.beginPath();
  values.forEach((v,i)=>{ const x=i*step; const y=h-6-(v/max)*(h-16); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
  ctx.strokeStyle=color.trim()||'#5B8CFF'; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.stroke();
  ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath();
  ctx.fillStyle=(color.trim()||'#5B8CFF')+'22'; ctx.fill();
}

/* ---------- AUDIT ---------- */
function renderAudit(){
  const body = document.getElementById('tabBody');
  body.innerHTML = `
    <h3 class="section-title" style="font-size:14px">Mitwirkende</h3>
    <div class="card-box" style="margin-bottom:20px" id="memberList"></div>
    <div class="row-between" style="gap:10px">
      <input class="audit-search" id="auditSearch" placeholder="Audit Log durchsuchen…" oninput="renderAuditList()" style="margin:16px 0 10px;flex:1">
      <select id="auditSort" onchange="renderAuditList()" style="margin-top:16px;padding:10px 12px;border-radius:11px;border:1px solid var(--border);background:var(--bg);color:var(--text)">
        <option value="newest">Neueste zuerst</option>
        <option value="oldest">Älteste zuerst</option>
      </select>
    </div>
    <div class="card-box" id="auditList"></div>`;
  document.getElementById('memberList').innerHTML = currentSession.members.map((m,idx)=>`
    <div class="member-row">
      <div class="avatar">${m.avatar?`<img src="${m.avatar}">`:initials(m.name)}</div>
      <div><b>${m.name}</b><br><span class="role"><span>${m.role}</span>${m.banned?' · <span>gebannt</span>':(m.timeoutUntil&&m.timeoutUntil>Date.now())?' · <span>timeout</span>':''}</span></div>
      ${m.name!==user.name?`<button class="dots" onclick="toggleMenu(event,${idx})">⋯</button><div class="menu hidden" id="menu${idx}"></div>`:''}
    </div>`).join('');
  currentSession.members.forEach((m,idx)=>{ if(m.name===user.name) return; buildMenu(idx,m); });
  renderAuditList();
}
function buildMenu(idx,m){
  const el = document.getElementById('menu'+idx); if(!el) return;
  const friends = user.friends||[];
  const isFriend = friends.includes(m.name);
  const gotReq=(user.incoming||[]).includes(m.name), sentReq=(user.outgoing||[]).includes(m.name);
  let html = isFriend ? `<button disabled style="opacity:.7">✓ Befreundet</button>`
    : sentReq ? `<button disabled style="opacity:.7">Anfrage gesendet</button>`
    : `<button data-n="${esc(m.name)}" onclick="friendFromAudit(this.dataset.n)">${gotReq?'Anfrage annehmen':'Freundschaftsanfrage senden'}</button>`;
  if(isOwner() && m.role!=='besitzer'){
    html += `<button onclick="setRole('${m.name}','${m.role==='admin'?'mitglied':'admin'}')">${m.role==='admin'?'Admin entfernen':'Zum Admin ernennen'}</button>`;
    html += `<button onclick="transferCrown('${m.name}')">Krone übergeben</button>`;
  }
  if(isAdminOrOwner() && m.role!=='besitzer' && !(myRole()==='admin' && m.role==='admin')){
    html += `<button onclick="kickMember('${m.name}')">Kicken</button>`;
    html += `<button class="danger" onclick="banOrTimeout('${m.name}','ban')">Bannen</button>`;
    html += `<button onclick="banOrTimeout('${m.name}','timeout')">Timeout</button>`;
  }
  el.innerHTML = html;
}
function toggleMenu(e,idx){ e.stopPropagation(); document.querySelectorAll('.menu').forEach(m=>{ if(m.id!=='menu'+idx) m.classList.add('hidden'); }); document.getElementById('menu'+idx).classList.toggle('hidden'); }
document.addEventListener('click', ()=>document.querySelectorAll('.menu').forEach(m=>m.classList.add('hidden')));

async function friendFromAudit(name){ await sendFriendRequest(name); renderAudit(); }
async function setRole(name, role){
  const members = currentSession.members.map(m=> m.name===name? {...m, role}: m);
  addAudit(`hat ${name} zum ${role==='admin'?'Admin ernannt':'Mitglied zurückgestuft'}`);
  await saveSession({members, audit:currentSession.audit});
  renderAudit();
}
async function kickMember(name){
  const members = currentSession.members.filter(m=>m.name!==name);
  addAudit(`hat ${name} aus der Session entfernt`);
  await saveSession({members, audit:currentSession.audit});
  renderAudit();
}
function banOrTimeout(name, kind){
  showModal(`<h3>${kind==='ban'?'Nutzer bannen':'Timeout setzen'}</h3>
    <div class="field"><label>Dauer (Stunden)</label><input id="durHrs" type="number" value="24" min="1"></div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" onclick="confirmBanTimeout('${name}','${kind}')">Bestätigen</button></div>`);
}
async function confirmBanTimeout(name, kind){
  const hrs = parseFloat(document.getElementById('durHrs').value)||24;
  const until = Date.now()+hrs*3600000;
  const members = currentSession.members.map(m=> m.name===name ? (kind==='ban'?{...m,banned:true,banUntil:until}:{...m,timeoutUntil:until}) : m);
  addAudit(`hat ${name} für ${hrs}h ${kind==='ban'?'gebannt':'in Timeout gesetzt'}`);
  await saveSession({members, audit:currentSession.audit});
  closeModal(); renderAudit();
}
function transferCrown(name){
  showModal(`<h3>Krone übergeben an ${name}?</h3>
    <div class="field"><label>Dein Passwort zur Bestätigung</label><input id="crownPass" type="password"></div>
    <div class="err" id="crownErr"></div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" onclick="confirmCrown('${name}')">Übergeben</button></div>`);
}
async function confirmCrown(name){
  const pass = document.getElementById('crownPass').value;
  const hash = await sha256(pass);
  if(hash !== user.passHash){ document.getElementById('crownErr').textContent='Falsches Passwort.'; return; }
  const members = currentSession.members.map(m=>{
    if(m.name===user.name) return {...m, role:'admin'};
    if(m.name===name) return {...m, role:'besitzer'};
    return m;
  });
  addAudit(`hat die Krone an ${name} übergeben`);
  await saveSession({members, audit:currentSession.audit});
  closeModal(); renderAudit();
}
function renderAuditList(){
  const q = (document.getElementById('auditSearch')?.value||'').toLowerCase();
  const sort = document.getElementById('auditSort')?.value || 'newest';
  let list = (currentSession.audit||[]).slice().filter(a=> (a.actor+' '+a.action).toLowerCase().includes(q));
  list.sort((a,b)=> sort==='newest' ? b.ts-a.ts : a.ts-b.ts);
  document.getElementById('auditList').innerHTML = list.length ? list.map(a=>`
    <div class="audit-item"><div><b>${a.actor}</b> ${a.action}<br><span class="t">${new Date(a.ts).toLocaleString()}</span></div>
    ${isOwner()?`<button class="audit-del" onclick="deleteAuditEntry(${a.ts})">✕</button>`:''}</div>`).join('') : '<div class="empty">Keine Einträge.</div>';
}
async function deleteAuditEntry(ts){
  const audit = currentSession.audit.filter(a=>a.ts!==ts);
  await saveSession({audit});
  renderAuditList();
}

/* ---------- SETTINGS ---------- */
function renderSettings(){
  const c = document.getElementById('content');
  c.innerHTML = `<div class="fade settings-block">
    <h2 class="section-title" style="font-size:17px">Einstellungen</h2>
    <div class="avatar-pick" id="avPreview" onclick="document.getElementById('avFile').click()">${user.avatar?`<img src="${user.avatar}">`:initials(user.name)}</div>
    <input type="file" id="avFile" accept="image/*" class="hidden" onchange="pickAvatar(event)">
    <div class="field"><label>Name</label><input id="setName" value="${user.name}"></div>

    <h3>Passwort</h3>
    <div class="field"><label>Aktuelles Passwort</label><input id="oldPass" type="password"></div>
    <div class="field"><label>Neues Passwort</label><input id="newPass" type="password"></div>
    <button class="linklike" onclick="toast('Passwort-Reset per E-Mail ist in dieser Vorschau nicht verfügbar. Bitte aktuelles Passwort verwenden.')">Passwort vergessen?</button>

    <h3>Sprache</h3>
    <select id="setLang" onchange="applyLang(this.value)" style="padding:9px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--text)">
      <option value="en" ${user.lang==='en'?'selected':''}>English</option>
      <option value="de" ${user.lang==='de'?'selected':''}>Deutsch</option>
      <option value="ar" ${user.lang==='ar'?'selected':''}>العربية</option>
    </select>

    <h3>Theme</h3>
    <div class="theme-grid" id="themeGrid"></div>
    <div class="custom-colors hidden" id="customColors">
      <div class="color-row"><label for="colMain">Hauptfarbe</label><input type="color" id="colMain" oninput="pickCustomColor()"></div>
      <div class="color-row"><label for="colSecond">Zweitfarbe</label><input type="color" id="colSecond" oninput="pickCustomColor()"></div>
      <div class="hint" style="margin:0">Hauptfarbe = Hintergrund · Zweitfarbe = Buttons & Akzente</div>
    </div>

    <h3>Animation</h3>
    <div class="anim-grid" id="animGrid"></div>

    <button class="btn-primary" style="margin-top:26px" onclick="saveSettings()">Einstellungen speichern</button>
    <button class="btn-ghost" style="width:100%;margin-top:10px;color:var(--danger);border-color:var(--danger)" onclick="confirmLogout()">Abmelden</button>
    <button class="btn-ghost" style="width:100%;margin-top:10px;color:var(--danger);border-color:var(--danger);background:color-mix(in srgb, var(--danger) 10%, transparent)" onclick="confirmDeleteAccount()">Account löschen</button>
  </div>`;
  const tg = document.getElementById('themeGrid');
  user._pendingTheme = undefined; user._pendingCustom = undefined; user._pendingAnim = undefined; user._pendingAnims = undefined;
  applyTheme(user.theme||'dark'); applyAnim(getAnim());   // drop any unsaved preview from a previous visit
  renderThemeGrid();
  renderAnimGrid();
}
function renderThemeGrid(){
  const tg = document.getElementById('themeGrid'); if(!tg) return;
  const cur = user._pendingTheme || user.theme;
  const c = getCustom();
  tg.innerHTML = THEMES.map(t=>`<div class="theme-swatch ${cur===t.id?'sel':''}" data-theme-id="${t.id}" style="background:linear-gradient(135deg,${t.c1},${t.c2})" onclick="pickTheme('${t.id}')"></div>`).join('')
    + `<div class="theme-swatch custom-sw ${cur==='custom'?'sel':''}" data-theme-id="custom" title="Eigene Farben" style="${cur==='custom'?`background:linear-gradient(135deg,${c.main},${c.second})`:''}" onclick="pickTheme('custom')">✎</div>`;
  const box = document.getElementById('customColors');
  if(box){
    box.classList.toggle('hidden', cur!=='custom');
    document.getElementById('colMain').value = c.main;
    document.getElementById('colSecond').value = c.second;
  }
}
function pickCustomColor(){
  user._pendingCustom = {main:document.getElementById('colMain').value, second:document.getElementById('colSecond').value};
  user._pendingTheme = 'custom';
  applyTheme('custom');
  const sw=document.querySelector('.theme-swatch.custom-sw');
  if(sw){ const c=user._pendingCustom; sw.style.background=`linear-gradient(135deg,${c.main},${c.second})`; }
}

/* animation picker */
function renderAnimGrid(){
  const g=document.getElementById('animGrid'); if(!g) return;
  const cur=getAnim(), list=getCustomAnims();
  g.innerHTML =
    `<div class="anim-opt ${cur==='off'?'sel':''}" onclick="pickAnim('off')"><span class="ic">✕</span>Aus</div>`+
    `<div class="anim-opt ${cur==='snow'?'sel':''}" onclick="pickAnim('snow')"><span class="ic">·</span>Schneefall</div>`+
    list.map((sym,i)=>`<div class="anim-opt ${cur==='c:'+sym?'sel':''}" onclick="pickAnim(${i},true)"><span class="ic">${esc(sym)}</span><button class="del" type="button" onclick="event.stopPropagation();deleteAnim(${i})">✕</button></div>`).join('')+
    (list.length<MAX_CUSTOM_ANIMS?`<button class="anim-add" type="button" onclick="openAddSymbol()" title="Symbol hinzufügen">+</button>`:'');
}
function pickAnim(v,custom){
  const list=getCustomAnims();
  user._pendingAnim = custom ? 'c:'+list[v] : v;
  applyAnim(user._pendingAnim);
  renderAnimGrid();
}
function deleteAnim(i){
  const list=[...getCustomAnims()]; const sym=list[i]; if(sym===undefined) return;
  list.splice(i,1); user._pendingAnims=list;
  if(getAnim()==='c:'+sym){ user._pendingAnim='snow'; applyAnim('snow'); }   // default snowfall itself can never be removed
  renderAnimGrid();
}
const SYMBOLS=['❄️','⭐','❤️','🔥','🌸','🍂','🎃','💎','💸','👟','🎄','✨','🌧️','☀️','🍀','🦋','🎈','⚡','1','7','$','€','A','*'];
function firstGrapheme(str){
  str=(str||'').trim(); if(!str) return '';
  if(window.Intl&&Intl.Segmenter){ const it=new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(str)[Symbol.iterator]().next(); return it.value?it.value.segment:''; }
  return Array.from(str)[0]||'';
}
function openAddSymbol(){
  showModal(`<h3>Symbol hinzufügen</h3>
    <input class="sym-input" id="symInput" placeholder="Emoji, Buchstabe oder Zahl" autocomplete="off" oninput="this.value=firstGrapheme(this.value)">
    <div class="sym-grid">${SYMBOLS.map((x,i)=>`<button type="button" onclick="document.getElementById('symInput').value=SYMBOLS[${i}]">${x}</button>`).join('')}</div>
    <div class="err" id="symErr"></div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" style="margin-top:0" onclick="addSymbolNow()">Hinzufügen</button></div>`);
  setTimeout(()=>{ const i=document.getElementById('symInput'); if(i) i.focus(); },50);
}
function addSymbolNow(){
  const sym=firstGrapheme(document.getElementById('symInput').value);
  const err=document.getElementById('symErr');
  const list=[...getCustomAnims()];
  if(!sym){ err.textContent='Bitte ein Zeichen eingeben.'; return; }
  if(sym==='.'||list.includes(sym)){ err.textContent='Dieses Symbol gibt es schon.'; return; }
  if(list.length>=MAX_CUSTOM_ANIMS){ err.textContent='Maximal 12 eigene Symbole.'; return; }
  list.push(sym); user._pendingAnims=list; user._pendingAnim='c:'+sym;
  applyAnim(user._pendingAnim);
  closeModal(); renderAnimGrid();
}
function confirmDeleteAccount(){
  showModal(`<h3>Account löschen</h3>
    <div class="hint">Diese Aktion kann nicht rückgängig gemacht werden. Gib dein Passwort ein, um zu bestätigen.</div>
    <div class="field"><label>Passwort</label><input id="delAccPass" type="password"></div>
    <div class="err" id="delAccErr"></div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" style="background:var(--danger)" onclick="deleteAccountNow()">Account endgültig löschen</button></div>`);
}
async function deleteAccountNow(){
  const pass = document.getElementById('delAccPass').value;
  const errEl = document.getElementById('delAccErr');
  const hash = await sha256(pass);
  if(hash !== user.passHash){ errEl.textContent='Falsches Passwort.'; return; }
  await Promise.all((user.friends||[]).map(async f=>{
    try{ const tid=safeId(f); const td=await db.doc('users/'+tid).get();
      if(td.exists) await db.doc('users/'+tid).update({friends:(td.data().friends||[]).filter(n=>n!==user.name)});
    }catch(e){}
  }));
  await db.doc('users/'+user.id).delete();
  LS.del('awake_user');
  location.reload();
}

let pendingAvatar=null;
async function pickAvatar(e){
  const f = e.target.files[0]; if(!f) return;
  pendingAvatar = await readFileAsDataUrl(f);
  document.getElementById('avPreview').innerHTML = `<img src="${pendingAvatar}">`;
}
function pickTheme(id){
  user._pendingTheme = id;
  applyTheme(id);
  renderThemeGrid();
}

async function saveSettings(){
  const newName = document.getElementById('setName').value.trim();
  const oldPass = document.getElementById('oldPass').value;
  const newPass = document.getElementById('newPass').value;
  const lang = document.getElementById('setLang').value;
  const theme = THEME_IDS.includes(user._pendingTheme||user.theme) ? (user._pendingTheme||user.theme) : 'dark';
  const anim = getAnim();
  const customAnims = getCustomAnims();
  const customColors = getCustom();
  const updates = {lang, theme, anim, customAnims, customColors, snow: anim!=='off'};

  if(newName && newName !== user.name){
    if(newName.length<2){ toast('Name zu kurz.'); return; }
    const newId = safeId(newName), oldId = user.id;
    if(newId!==oldId){
      const exists = await db.doc('users/'+newId).get();
      if(exists.exists){ toast('Name bereits vergeben.'); return; }
    }
    const fullDoc = await db.doc('users/'+oldId).get();
    await db.doc('users/'+newId).set({...fullDoc.data(), name:newName});
    if(newId!==oldId) await db.doc('users/'+oldId).delete();
    user.id = newId; subscribeMe();
    LS.set('awake_user', JSON.stringify({name:newName}));
    user.name = newName;
  }
  if(pendingAvatar){ updates.avatar = pendingAvatar; user.avatar = pendingAvatar; pendingAvatar=null; }

  if(newPass){
    if(!oldPass){ toast('Bitte aktuelles Passwort eingeben.'); return; }
    const oldHash = await sha256(oldPass);
    if(oldHash !== user.passHash){ toast('Aktuelles Passwort ist falsch.'); return; }
    if(!/^(?=.*\d).{8,}$/.test(newPass)){ toast('Neues Passwort: mindestens 8 Zeichen und eine Zahl.'); return; }
    updates.passHash = await sha256(newPass);
    user.passHash = updates.passHash;
  }

  await db.doc('users/'+user.id).update(updates);
  user.lang = lang; user.theme = theme; user.anim = anim; user.customAnims = customAnims; user.customColors = customColors; user.snow = anim!=='off';
  user._pendingTheme = user._pendingCustom = user._pendingAnim = user._pendingAnims = undefined;
  renderTop();
  toast('Einstellungen gespeichert.');
}

/* ---------- DELETE / LEAVE SESSION ---------- */
function confirmDeleteSession(){
  showModal(`<h3>Session „${esc(currentSession.name)}" löschen?</h3>
    <div class="hint">Das kann nicht rückgängig gemacht werden. Alle Artikel, Ordner und das Audit-Log gehen verloren.</div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" style="background:var(--danger)" onclick="deleteSessionNow()">Löschen</button></div>`);
}
async function deleteSessionNow(){
  await db.doc('sessions/'+currentSession.id).delete();
  user.sessions=(user.sessions||[]).filter(id=>id!==currentSession.id);
  await db.doc('users/'+user.id).update({sessions:user.sessions});
  closeModal();
  showView('home');
  toast('Session gelöscht.');
}
function confirmLeaveSession(){
  showModal(`<h3>Session verlassen?</h3>
    <div class="hint">Du kannst später mit dem Session-Code erneut beitreten.</div>
    <div class="modal-actions"><button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" onclick="leaveSessionNow()">Verlassen</button></div>`);
}
async function leaveSessionNow(){
  const members=currentSession.members.filter(m=>m.name!==user.name);
  const audit=[...(currentSession.audit||[]), {ts:Date.now(),actor:user.name,action:'hat die Session verlassen'}];
  await db.doc('sessions/'+currentSession.id).update({members, audit});
  user.sessions=(user.sessions||[]).filter(id=>id!==currentSession.id);
  await db.doc('users/'+user.id).update({sessions:user.sessions});
  closeModal();
  showView('home');
  toast('Du hast die Session verlassen.');
}

/* ---------- MODAL ---------- */
function showModal(html){
  const ov = document.createElement('div');
  ov.className='overlay'; ov.id='overlay';
  ov.innerHTML = `<div class="modal fade">${html}</div>`;
  ov.onclick = (e)=>{ if(e.target===ov) closeModal(); };
  document.body.appendChild(ov);
}
function closeModal(){ const ov=document.getElementById('overlay'); if(ov) ov.remove(); }
