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
['Home','Home','الرئيسية'],['Assistent','Assistant','المساعد'],['Anmelden','Sign in','تسجيل الدخول'],['Registrieren','Sign up','إنشاء حساب'],['Name','Name','الاسم'],['Passwort','Password','كلمة المرور'],
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
['Bilder (optional)','Photos (optional)','الصور (اختياري)'],['Titelbild','Cover','الغلاف'],['Als Titelbild festlegen','Set as cover','تعيين كغلاف'],['Maximal 5 Bilder pro Artikel.','Maximum of 5 photos per item.','الحد الأقصى 5 صور لكل منتج.'],
['Die Session ist voll. Entferne Bilder oder alte Artikel.','The session is full. Remove photos or old items.','الجلسة ممتلئة. احذف بعض الصور أو المنتجات القديمة.'],
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
    delete d.sessions; delete d.passHash; delete d.claimProof; delete d.resetOk;
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
  if(firebase.auth) window.fbAuth=firebase.auth();
  const fs=firebase.firestore();
  const clean=o=>JSON.parse(JSON.stringify(o));
  return { doc:p=>{ const r=fs.doc(p); return { get:()=>r.get(), set:d=>r.set(clean(d)), update:d=>r.update(clean(d)), delete:()=>r.delete(), onSnapshot:(a,b)=>r.onSnapshot(a,b), updateRaw:d=>r.update(d), setRaw:d=>r.set(d) }; },
    col:p=>({ get:()=>fs.collection(p).get() }),
    ts:()=>firebase.firestore.FieldValue.serverTimestamp(), del:()=>firebase.firestore.FieldValue.delete() };
}
async function boot(){
  try{ db = await initDb(); }
  catch(e){ document.getElementById('loginErr').textContent='Datenbank nicht konfiguriert (siehe README).'; document.getElementById('regErr').textContent='Datenbank nicht konfiguriert (siehe README).'; return; }
  const notice=LS.get('awake_notice'); if(notice){ LS.del('awake_notice'); document.getElementById('loginErr').textContent=notice; }
  if(!window.fbAuth){ document.getElementById('loginErr').textContent='Firebase Auth fehlt (siehe README).'; return; }
  const un=fbAuth.onAuthStateChanged(async au=>{
    un(); if(!au) return;
    try{ await loginAs(idFromEmail(au.email),true); }
    catch(e){ if(e&&(e.banned||e.user)) document.getElementById('loginErr').textContent=e.message; try{ await fbAuth.signOut(); }catch(_){} }
  });
}
let _rz; window.addEventListener('resize',()=>{clearTimeout(_rz);_rz=setTimeout(()=>{ if(currentView==='session'&&currentTab==='stats'&&currentSession) renderStats(true); },200);});
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

/* ---------- accounts: Firebase Auth (login name -> <id>@awake.app), profile in users/<id> ---------- */
const AUTH_DOMAIN='awake.app';
const emailOf=id=>id+'@'+AUTH_DOMAIN;
const idFromEmail=e=>String(e||'').split('@')[0];
const E=m=>{ const e=new Error(m); e.user=true; return e; };
const isCredErr=e=>e&&['auth/invalid-credential','auth/wrong-password','auth/user-not-found','auth/invalid-login-credentials'].includes(e.code);
function authMsg(e){
  if(e&&e.user) return e.message;
  const c=e&&e.code;
  if(c==='auth/network-request-failed') return 'Keine Verbindung. Bitte versuche es erneut.';
  if(c==='auth/too-many-requests') return 'Zu viele Versuche. Bitte warte kurz.';
  if(c==='auth/operation-not-allowed') return 'Anmeldung ist in Firebase noch nicht aktiviert (Authentication → E-Mail/Passwort).';
  return 'Fehler: '+((e&&e.message)||e);
}
function newProfile(name){ return {name, avatar:'', lang:'en', theme:'dark', friends:[], incoming:[], outgoing:[], snow:false, anim:'off', customAnims:[], customColors:DEFAULT_CUSTOM, createdAt:Date.now()}; }

async function doRegister(e){
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const pass = document.getElementById('regPass').value;
  const errEl = document.getElementById('regErr'); errEl.textContent='';
  if(name.length<2){errEl.textContent='Name braucht mindestens 2 Buchstaben.';return false;}
  if(!/^(?=.*\d).{8,}$/.test(pass)){errEl.textContent='Passwort: mindestens 8 Zeichen und eine Zahl.';return false;}
  const id=safeId(name); let created=false;
  try{
    let cred;
    try{ cred=await fbAuth.createUserWithEmailAndPassword(emailOf(id),pass); created=true; }
    catch(err){
      if(err.code!=='auth/email-already-in-use') throw err;
      // the login exists but may have lost its profile (deleted by an admin) -> allow re-registration with the same password
      try{ cred=await fbAuth.signInWithEmailAndPassword(emailOf(id),pass); }catch(_){ throw E('Dieser Name ist schon vergeben.'); }
    }
    let ex=null; try{ ex=await db.doc('users/'+id).get(); }catch(_){}
    if(ex&&ex.exists){ if(created){ try{ await cred.user.delete(); }catch(_){ await fbAuth.signOut(); } } else await fbAuth.signOut(); throw E('Dieser Name ist schon vergeben.'); }
    await db.doc('users/'+id).set({...newProfile(name), uid:cred.user.uid});
    await loginAs(id);
  }catch(err){ errEl.textContent=authMsg(err); }
  return false;
}

/* an account from before the Firebase login: prove the old password once, then bind the profile to a Firebase login */
async function claimLegacy(id,pass){
  let cred;
  try{ cred=await fbAuth.createUserWithEmailAndPassword(emailOf(id),pass); }
  catch(err){ if(err.code==='auth/email-already-in-use') throw E('Falsches Passwort.'); throw err; }
  const drop=async m=>{ try{ await cred.user.delete(); }catch(_){ try{ await fbAuth.signOut(); }catch(__){} } throw E(m); };
  let snap=null; try{ snap=await db.doc('users/'+id).get(); }catch(_){}
  if(!snap||!snap.exists) return drop('Nutzer nicht gefunden.');
  const d=snap.data();
  if(d.uid&&d.uid!==cred.user.uid) return drop('Falsches Passwort.');
  if(!d.uid){
    const h=await sha256(pass);
    if(!(d.resetOk===true||(d.passHash&&d.passHash===h))) return drop('Falsches Passwort.');
    try{ await db.doc('users/'+id).updateRaw({uid:cred.user.uid, claimProof:h}); }catch(_){ return drop('Anmeldung nicht möglich. Bitte versuche es später erneut.'); }
  }
  return cred;
}

async function doLogin(e){
  e.preventDefault();
  const name = document.getElementById('loginName').value.trim();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginErr'); errEl.textContent='';
  const id=safeId(name);
  try{
    try{ await fbAuth.signInWithEmailAndPassword(emailOf(id),pass); }
    catch(err){ if(!isCredErr(err)) throw err; await claimLegacy(id,pass); }
    try{ await loginAs(id); }
    catch(err){
      // login exists but the profile is gone (account deleted by an admin)
      if(err&&err.message==='not found'){ try{ await fbAuth.signOut(); }catch(_){} throw E('Dieses Konto existiert nicht mehr. Du kannst dich neu registrieren.'); }
      throw err;
    }
  }catch(err){ errEl.textContent=authMsg(err); try{ if(err&&err.banned) await fbAuth.signOut(); }catch(_){} }
  return false;
}

/* ---------- roles / ban / kick / public id (see firestore.rules.admin) ---------- */
async function ensureAuthz(au,id,ud){
  const ref=db.doc('authz/'+au.uid);
  const s=await ref.get();
  if(s.exists) return s.data();
  const a={id, name:ud.name, role:'member', banned:false, joinedAt:ud.createdAt||Date.now()};
  await ref.set(a);
  return a;
}
function genPublicId(){
  const A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', out=[], lim=Math.floor(256/A.length)*A.length;
  while(out.length<22){ const b=crypto.getRandomValues(new Uint8Array(32)); for(const x of b){ if(x<lim&&out.length<22) out.push(A[x%A.length]); } }
  return out.join('');
}
async function ensurePublicId(id){
  if(LS.get('awake_pid_'+id)==='1') return;
  try{
    let has=false;
    try{ const m=await db.doc('adminmeta/'+id).get(); has=m.exists; }catch(e){ /* members may not read it: just try to create */ }
    if(!has){
      for(let i=0;i<3;i++){
        const pid=genPublicId();
        try{ const ex=await db.doc('pubids/'+pid).get(); if(ex.exists) continue; }catch(e){}
        await db.doc('pubids/'+pid).set({id});
        await db.doc('adminmeta/'+id).set({publicId:pid, createdAt:Date.now()});
        break;
      }
    }
    LS.set('awake_pid_'+id,'1');
  }catch(e){ if(e&&e.code==='permission-denied') LS.set('awake_pid_'+id,'1'); }
}
async function migrateSessions(id,ud){
  const ref=db.doc('private/'+id); let list=null, readOk=false;
  try{ const s=await ref.get(); readOk=true; if(s.exists) list=s.data().sessions||[]; }catch(e){}
  if(list===null){
    list=ud.sessions||[];
    if(readOk){ try{ await ref.set({sessions:list}); }catch(e){ readOk=false; } }
  }
  if(readOk&&(ud.sessions!==undefined||ud.passHash!==undefined||ud.claimProof!==undefined)){
    try{ await db.doc('users/'+id).updateRaw({sessions:db.del(), passHash:db.del(), claimProof:db.del()}); }catch(e){}
  }
  return list;
}
async function saveMySessions(){ await db.doc('private/'+user.id).set({sessions:user.sessions||[]}); }
let actTimer=null;
function touchActivity(){ if(!user||document.visibilityState==='hidden') return; db.doc('activity/'+user.id).setRaw({lastActive:db.ts()}).catch(()=>{}); }
function startActivity(){ clearInterval(actTimer); touchActivity(); actTimer=setInterval(touchActivity,4*60*1000); }
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') touchActivity(); });
let unsubAz=null;
function forceLogout(msg){ LS.set('awake_notice',msg); LS.del('awake_user'); (window.fbAuth?fbAuth.signOut():Promise.resolve()).catch(()=>{}).then(()=>location.reload()); }
function subscribeAuthz(){
  if(unsubAz) unsubAz(); if(!user||!user.uid) return;
  unsubAz=db.doc('authz/'+user.uid).onSnapshot(async snap=>{
    if(!snap.exists||!user) return;
    const a=snap.data(); user._az=a;
    if(a.banned){ forceLogout('Dein Konto wurde gesperrt.'+(a.banReason?' Grund: '+a.banReason:'')); return; }
    try{
      const tk=await fbAuth.currentUser.getIdTokenResult(), at=new Date(tk.authTime).getTime();
      const k=a.kickedAt&&a.kickedAt.toMillis?a.kickedAt.toMillis():0;
      if(k&&k>at){ forceLogout('Du wurdest von einem Admin abgemeldet. Bitte melde dich neu an.'); return; }
    }catch(e){}
    if(typeof adminSyncNav==='function') adminSyncNav();
  },()=>{});
}

async function loginAs(id, silent){
  const au=window.fbAuth&&fbAuth.currentUser; if(!au) throw new Error('no-auth');
  const udoc = await db.doc('users/'+id).get();
  if(!udoc || !udoc.exists) throw new Error('not found');
  const ud=udoc.data();
  if(ud.uid && ud.uid!==au.uid) throw new Error('uid mismatch');
  const az=await ensureAuthz(au,id,ud);
  if(az.banned){ const e=new Error('Dein Konto wurde gesperrt.'+(az.banReason?' Grund: '+az.banReason:'')); e.banned=true; e.user=true; throw e; }
  const sessions=await migrateSessions(id,ud);
  const u={id, ...ud, sessions, _az:az, uid:au.uid}; delete u.passHash; delete u.claimProof; delete u.resetOk;
  user=u;
  ensurePublicId(id);
  LS.set('awake_user', JSON.stringify({name:ud.name}));
  applyTheme(user.theme||'dark');
  applyLang(user.lang||'en');
  applyAnim(getAnim());
  subscribeMe(); subscribeAuthz(); startActivity();
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('app').classList.add('fade');
  renderTop();
  if(typeof adminSyncNav==='function') adminSyncNav();
  showView('home');
}

function logout(){ LS.del('awake_user'); clearInterval(actTimer); (window.fbAuth?fbAuth.signOut():Promise.resolve()).catch(()=>{}).then(()=>location.reload()); }
async function verifyPassword(pass){
  try{ await fbAuth.currentUser.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(emailOf(user.id),pass)); return true; }
  catch(e){ return false; }
}
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
  document.getElementById('topMid').innerHTML = currentSession ? `<span class="sessionkey">${currentSession.key}<button class="copy-btn" onclick="copyKey()" aria-label="Copy"><span class="ico-copy"></span></button></span>` : '';
}
function copyKey(){
  navigator.clipboard.writeText(currentSession.key).then(()=>toast('Session-ID kopiert.')).catch(()=>toast('Kopieren fehlgeschlagen.'));
}

function showView(v){
  if(currentView==='assistant'&&v!=='assistant') aiLeave();
  if(currentView==='workouts'&&v!=='workouts'&&typeof wkLeave==='function') wkLeave();
  if(v==='admin'&&!(typeof adminAllowed==='function'&&adminAllowed())){ if(typeof showNotFound==='function') showNotFound(); return; }   // UI guard only – the database rules are the real protection
  currentView=v;
  document.getElementById('navHome').classList.toggle('active', v==='home'||v==='session');
  document.getElementById('navSettings').classList.toggle('active', v==='settings');
  const na=document.getElementById('navAssistant'); if(na) na.classList.toggle('active', v==='assistant');
  const nw=document.getElementById('navWorkouts'); if(nw) nw.classList.toggle('active', v==='workouts');
  const nad=document.getElementById('navAdmin'); if(nad) nad.classList.toggle('active', v==='admin');
  if(v==='home'){ currentSession=null; renderTop(); renderHome(); }
  if(v==='settings'){ renderSettings(); }
  if(v==='assistant'){ currentSession=null; renderTop(); renderAssistant(); }
  if(v==='workouts'){ currentSession=null; renderTop(); if(typeof wkRender==='function') wkRender(); }
  if(v==='admin'){ currentSession=null; renderTop(); if(typeof admRender==='function') admRender(); }
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
  await saveMySessions();
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
    await saveMySessions();
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
      <div class="thumb">${itemImages(it)[0]?`<img src="${itemImages(it)[0]}">`:'🏷️'}${itemImages(it).length>1?`<span class="img-count">${itemImages(it).length}</span>`:''}</div>
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

/* ---------- item photos (several per item) ---------- */
const MAX_ITEM_IMGS=5;
let itImgs=[];
function itemImages(it){ return (it&&it.images&&it.images.length)?it.images:(it&&it.image?[it.image]:[]); }
function renderImgStrip(){
  const el=document.getElementById('itImgStrip'); if(!el) return;
  el.innerHTML = itImgs.map((src,i)=>`<div class="img-thumb" onclick="openLightbox(${i})">
      <img src="${src}">
      ${i===0?'<span class="cover-tag">Titelbild</span>':`<button type="button" class="cover-btn" title="Als Titelbild festlegen" onclick="event.stopPropagation();setCover(${i})">★</button>`}
      <button type="button" class="img-del" onclick="event.stopPropagation();removeItemImage(${i})">✕</button>
    </div>`).join('') + (itImgs.length<MAX_ITEM_IMGS?`<button type="button" class="img-add" onclick="document.getElementById('itImg').click()">+</button>`:'');
}
async function addItemImages(e){
  const files=[...e.target.files]; e.target.value='';
  for(const f of files){
    if(itImgs.length>=MAX_ITEM_IMGS){ toast('Maximal 5 Bilder pro Artikel.'); break; }
    const d=await readFileAsDataUrl(f); if(d) itImgs.push(d);
  }
  renderImgStrip();
}
function removeItemImage(i){ itImgs.splice(i,1); renderImgStrip(); }
function setCover(i){ const [x]=itImgs.splice(i,1); itImgs.unshift(x); renderImgStrip(); }
let lbIdx=0;
function openLightbox(i){
  lbIdx=i; closeLightbox();
  const lb=document.createElement('div'); lb.id='lightbox'; lb.className='lightbox';
  lb.onclick=e=>{ if(e.target===lb) closeLightbox(); };
  document.body.appendChild(lb); drawLightbox();
}
function drawLightbox(){
  const lb=document.getElementById('lightbox'); if(!lb) return;
  const n=itImgs.length;
  lb.innerHTML=`<img src="${itImgs[lbIdx]}">
    ${n>1?`<button class="lb-nav lb-prev" onclick="lbStep(-1)">‹</button><button class="lb-nav lb-next" onclick="lbStep(1)">›</button><div class="lb-count">${lbIdx+1} / ${n}</div>`:''}
    <button class="lb-close" onclick="closeLightbox()">✕</button>`;
}
function lbStep(d){ lbIdx=(lbIdx+d+itImgs.length)%itImgs.length; drawLightbox(); }
function closeLightbox(){ const lb=document.getElementById('lightbox'); if(lb) lb.remove(); }

function openItemModal(id){
  const it = id ? currentSession.items.find(i=>i.id===id) : null;
  itImgs = itemImages(it).slice();
  showModal(`<h3>${it?'Artikel bearbeiten':'Artikel hinzufügen'}</h3>
    <div class="field"><label>Name</label><input id="itName" value="${it?it.name:''}"></div>
    <div class="field"><label>Bilder (optional)</label>
      <div class="img-strip" id="itImgStrip"></div>
      <input id="itImg" type="file" accept="image/*" multiple class="hidden" onchange="addItemImages(event)">
    </div>
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
  renderImgStrip();
}
async function saveItem(id){
  const name = document.getElementById('itName').value.trim();
  if(!name){ toast('Name eingeben.'); return; }
  const folderId = document.getElementById('itFolder').value || null;
  const buyPrice = parseFloat(document.getElementById('itBuy').value)||0;
  const sellPrice = parseFloat(document.getElementById('itSell').value)||0;
  const platform = document.getElementById('itPlatform').value;
  const images = itImgs.slice(), image = images[0]||'';
  let items;
  if(id){
    items = currentSession.items.map(i=> i.id===id ? {...i, name, folderId, buyPrice, sellPrice, platform, image, images} : i);
    addAudit(`hat den Artikel „${name}" bearbeitet`);
  } else {
    items = [...currentSession.items, {id:'i'+Date.now(), name, folderId, buyPrice, sellPrice, platform, image, images, status:'lager', createdAt:Date.now()}];
    addAudit(`hat den Artikel „${name}" hinzugefügt`);
  }
  if(JSON.stringify(items).length+JSON.stringify(currentSession.audit||[]).length > 900000){ toast('Die Session ist voll. Entferne Bilder oder alte Artikel.'); return; }  // Firestore doc limit ~1 MB
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
let chartRun=0;
function renderStats(noAnim){
  const items = currentSession.items;
  const sold = items.filter(i=>i.status==='verkauft');
  const profit = sold.reduce((s,i)=>s+(i.sellPrice-i.buyPrice),0);
  const umsatz = sold.reduce((s,i)=>s+i.sellPrice,0);
  const body = document.getElementById('tabBody');
  body.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="num" data-v="${sold.length}" data-dec="0" data-suf="">${sold.length}</div><div class="lbl">Produkte verkauft</div></div>
      <div class="stat-card"><div class="num" data-v="${items.filter(i=>i.status==='lager').length}" data-dec="0" data-suf="">${items.filter(i=>i.status==='lager').length}</div><div class="lbl">Produkte im Lager</div></div>
      <div class="stat-card"><div class="num" data-v="${profit}" data-dec="2" data-suf="€">${profit.toFixed(2)}€</div><div class="lbl">Profit</div></div>
      <div class="stat-card"><div class="num" data-v="${umsatz}" data-dec="2" data-suf="€">${umsatz.toFixed(2)}€</div><div class="lbl">Umsatz</div></div>
    </div>
    <div class="range-tabs" style="margin-bottom:14px">
      ${[7,14,30,'all'].map(r=>`<button class="${activeRange===r?'active':''}" onclick="activeRange=${typeof r==='string'?`'${r}'`:r};renderStats()">${r==='all'?'Alltime':r+' Tage'}</button>`).join('')}
    </div>
    <div class="chart-card"><h4>Verkäufe</h4><canvas id="chSold"></canvas></div>
    <div class="chart-card"><h4>Lagerbestand</h4><canvas id="chStock"></canvas></div>
    <div class="chart-card"><h4>Profit</h4><canvas id="chProfit"></canvas></div>
    <div class="chart-card"><h4>Umsatz</h4><canvas id="chRevenue"></canvas></div>`;
  const rangeDays = activeRange==='all' ? Math.max(1, Math.ceil((Date.now()-(currentSession.createdAt||Date.now()))/86400000)+1) : activeRange;
  const days=[...Array(rangeDays)].map((_,i)=>{ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-(rangeDays-1-i)); return d.getTime(); });
  const cum=(arr,valFn)=>{ let running=0; return days.map(dayTs=>{ const dayEnd=dayTs+86400000; running += arr.filter(i=>{const t=valFn.t(i); return t && t>=dayTs && t<dayEnd;}).reduce((s,i)=>s+valFn.v(i),0); return running; }); };
  const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const stockSeries = days.map(dayEnd=> items.filter(i=>i.createdAt<=dayEnd+86400000 && (i.status!=='verkauft' || i.soldAt>dayEnd+86400000)).length);
  const charts=[
    {id:'chSold',    values:cum(sold,{t:i=>i.soldAt,v:()=>1}), ts:days, color:css('--accent'), name:'Verkäufe', suf:'', dec:0},
    {id:'chStock',   values:stockSeries, ts:days, color:css('--accent2'), name:'Lagerbestand', suf:'', dec:0},
    {id:'chProfit',  values:cum(sold,{t:i=>i.soldAt,v:i=>i.sellPrice-i.buyPrice}), ts:days, color:css('--ok'), name:'Profit', suf:'€', dec:2},
    {id:'chRevenue', values:cum(sold,{t:i=>i.soldAt,v:i=>i.sellPrice}), ts:days, color:css('--accent2'), name:'Umsatz', suf:'€', dec:2}
  ];
  animateStats(charts, !noAnim);
}
/* ---------- interactive charts: hover (desktop) + touch/drag (phone) ----------
   awChart(canvas,{values,ts?,labels?,color,type:'line'|'bar',zero:true|false,fmt,name,delay,animate,empty})  */
const _ease=t=>1-Math.pow(1-t,3);
function css2(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function awLocale(){ return curLang==='de'?'de-DE':curLang==='ar'?'ar-EG-u-nu-latn':'en-GB'; }
function awNum(v,dec){ try{ return new Intl.NumberFormat(awLocale(),{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0}).format(v); }catch(e){ return (+v).toFixed(dec||0); } }
function awDate(ts){ try{ return new Date(ts).toLocaleDateString(awLocale(),{day:'2-digit',month:'2-digit',year:'numeric'}); }catch(e){ return new Date(ts).toLocaleDateString(); } }
function awDateShort(ts){ try{ return new Date(ts).toLocaleDateString(awLocale(),{day:'2-digit',month:'2-digit'}); }catch(e){ return ''; } }
const AW_ACTIVE=new Set(); let awRaf=0, awLast=0;
function awKick(c){ AW_ACTIVE.add(c); if(!awRaf) awRaf=requestAnimationFrame(awLoop); }
function awLoop(now){
  awRaf=0; const dt=Math.min(.05,awLast?(now-awLast)/1000:.016); awLast=now;
  AW_ACTIVE.forEach(c=>{ if(!c.cv.isConnected){ AW_ACTIVE.delete(c); return; } if(!awStep(c,now,dt)) AW_ACTIVE.delete(c); });
  if(AW_ACTIVE.size) awRaf=requestAnimationFrame(awLoop); else awLast=0;
}
function awChart(cv,cfg){
  let c=cv._aw;
  if(!c){
    c=cv._aw={cv,hi:-1,ha:0,hx:0,t0:performance.now(),p:0};
    cv.style.touchAction='pan-y';
    const idxAt=e=>{ const r=cv.getBoundingClientRect(); return awNearest(c,e.clientX-r.left); };
    const show=e=>{ clearTimeout(c.hideT); const i=idxAt(e); if(i!==c.hi){ if(c.hi<0) c.hx=awX(c,i); c.hi=i; awKick(c); } };
    const hide=()=>{ c.hi=-1; awKick(c); };
    cv.addEventListener('pointermove',e=>{ if(e.pointerType==='mouse'||c.touching) show(e); });
    cv.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse'){ c.touching=true; show(e); } });
    const up=e=>{ if(e.pointerType==='mouse') return; c.touching=false; clearTimeout(c.hideT); c.hideT=setTimeout(hide,1600); };
    cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    cv.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse') hide(); });
  }
  Object.assign(c,{values:[],ts:null,labels:null,color:'#5B8CFF',type:'line',zero:true,fmt:v=>awNum(v,0),name:'',delay:0,animate:true,empty:''},cfg);
  const dpr=window.devicePixelRatio||1;
  c.w=cv.clientWidth||cv.offsetWidth||300; c.h=cv.clientHeight||cv.offsetHeight||130;
  cv.width=Math.round(c.w*dpr); cv.height=Math.round(c.h*dpr);
  c.ctx=cv.getContext('2d'); c.ctx.setTransform(dpr,0,0,dpr,0,0);
  c.padT=24; c.padB=22; c.padX=12; c.innerH=c.h-c.padT-c.padB;
  c.border=css2('--border'); c.sub=css2('--sub'); c.txt=css2('--text'); c.bg=css2('--bg');
  const n=c.values.length;
  if(c.zero){ c.min=0; c.max=Math.max(...c.values,1); }
  else if(n){ let lo=Math.min(...c.values), hi=Math.max(...c.values); if(hi-lo<1e-9){ lo-=1; hi+=1; } const pad=(hi-lo)*.15; c.min=lo-pad; c.max=hi+pad; }
  else { c.min=0; c.max=1; }
  c.t0=performance.now(); c.p=c.animate?0:1; c.hi=-1; c.ha=0;
  awKick(c); return c;
}
function awX(c,i){
  const n=c.values.length, W=c.w-c.padX*2;
  if(c.type==='bar') return c.padX+W*(i+.5)/n;
  if(n<2) return c.padX+W/2;
  if(c.ts){ const t0=c.ts[0], t1=c.ts[n-1]; return t1>t0?c.padX+W*(c.ts[i]-t0)/(t1-t0):c.padX+W*i/(n-1); }
  return c.padX+W*i/(n-1);
}
function awNearest(c,x){ let best=-1,bd=1e9; for(let i=0;i<c.values.length;i++){ const d=Math.abs(awX(c,i)-x); if(d<bd){ bd=d; best=i; } } return best; }
function awY(c,v,p){ return c.padT+c.innerH-((v-c.min)/(c.max-c.min))*c.innerH*p; }
/* monotone cubic tangents -> curve passes exactly through every point, never overshoots */
function awTangents(pts){
  const n=pts.length, d=[], m=[];
  for(let i=0;i<n-1;i++) d.push((pts[i+1].y-pts[i].y)/((pts[i+1].x-pts[i].x)||1));
  m[0]=d[0]||0; m[n-1]=d[n-2]||0;
  for(let i=1;i<n-1;i++) m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
  for(let i=0;i<n-1;i++){ if(d[i]===0){ m[i]=0; m[i+1]=0; continue; } const a=m[i]/d[i], b=m[i+1]/d[i], s=a*a+b*b; if(s>9){ const t=3/Math.sqrt(s); m[i]=t*a*d[i]; m[i+1]=t*b*d[i]; } }
  return m;
}
function awCurveY(pts,m,x){
  if(x<=pts[0].x) return pts[0].y; const n=pts.length; if(x>=pts[n-1].x) return pts[n-1].y;
  let i=0; while(i<n-2&&x>pts[i+1].x) i++;
  const h=pts[i+1].x-pts[i].x||1, t=(x-pts[i].x)/h, t2=t*t, t3=t2*t;
  return (2*t3-3*t2+1)*pts[i].y+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*pts[i+1].y+(t3-t2)*h*m[i+1];
}
function awStep(c,now,dt){
  let busy=false;
  if(c.p<1){ c.p=Math.min(1,Math.max(0,(now-c.t0-c.delay)/(c.animate?950:1))); busy=true; if(!c.animate) c.p=1; }
  const ta=c.hi>=0?1:0; c.ha+=(ta-c.ha)*Math.min(1,dt*16); if(Math.abs(ta-c.ha)<.01) c.ha=ta; else busy=true;
  if(c.hi>=0){ const tx=awX(c,c.hi); c.hx+=(tx-c.hx)*Math.min(1,dt*20); if(Math.abs(tx-c.hx)>.2) busy=true; else c.hx=tx; }
  awDraw(c,_ease(c.p));
  return busy||c.ha>0&&c.ha<1;
}
function awRR(ctx,x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function awDraw(c,p){
  const {ctx,w,h,values,color}=c, n=values.length, bottom=c.padT+c.innerH;
  ctx.clearRect(0,0,w,h);
  ctx.save(); ctx.strokeStyle=c.border; ctx.globalAlpha=.55; ctx.lineWidth=1; ctx.setLineDash([3,5]);
  [0,.5,1].forEach(g=>{ const y=c.padT+c.innerH*g; ctx.beginPath(); ctx.moveTo(c.padX,y); ctx.lineTo(w-c.padX,y); ctx.stroke(); });
  ctx.restore();
  ctx.font='600 10.5px Inter, sans-serif'; ctx.fillStyle=c.sub;
  if(!n){ ctx.textAlign='center'; ctx.fillText(tr(c.empty||'Noch keine Daten'),w/2,c.padT+c.innerH/2+4); return; }
  ctx.textAlign='left'; ctx.fillText(c.fmt(c.min+(c.max-c.min)*p),c.padX,c.padT-9);
  // x labels
  const xl=c.xl||(c.ts?[awDateShort(c.ts[0]),awDateShort(c.ts[n-1])]:null);
  if(xl){ ctx.textAlign='left'; ctx.fillText(xl[0],c.padX,h-6); if(n>1){ ctx.textAlign='right'; ctx.fillText(xl[1],w-c.padX,h-6); } }
  const hi=c.hi>=0?c.hi:null;
  if(c.type==='bar'){
    const slot=(w-c.padX*2)/n, bw=Math.max(2,Math.min(26,slot*.62));
    for(let i=0;i<n;i++){
      const y=awY(c,values[i],p), bh=bottom-y; if(bh<.5) continue;
      const act=hi===i?c.ha:0; ctx.globalAlpha=.55+.45*act;
      const g=ctx.createLinearGradient(0,y,0,bottom); g.addColorStop(0,color); g.addColorStop(1,color+'88'); ctx.fillStyle=g;
      awRR(ctx,awX(c,i)-bw/2,y,bw,bh,Math.min(7,bw/2)); ctx.fill();
    }
    ctx.globalAlpha=1;
  } else {
    let pts=values.map((v,i)=>({x:awX(c,i),y:awY(c,v,p)}));
    if(n===1) pts=[{x:c.padX,y:pts[0].y},{x:w-c.padX,y:pts[0].y}];
    const m=awTangents(pts);
    const path=()=>{ ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); for(let i=0;i<pts.length-1;i++){ const dx=(pts[i+1].x-pts[i].x)/3; ctx.bezierCurveTo(pts[i].x+dx,pts[i].y+m[i]*dx,pts[i+1].x-dx,pts[i+1].y-m[i+1]*dx,pts[i+1].x,pts[i+1].y); } };
    path(); ctx.lineTo(pts[pts.length-1].x,bottom); ctx.lineTo(pts[0].x,bottom); ctx.closePath();
    const g=ctx.createLinearGradient(0,c.padT,0,bottom); g.addColorStop(0,color+'55'); g.addColorStop(1,color+'00'); ctx.fillStyle=g; ctx.fill();
    path(); ctx.strokeStyle=color; ctx.lineWidth=3.5; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.shadowColor=color+'88'; ctx.shadowBlur=10; ctx.stroke(); ctx.shadowBlur=0;
    const e=pts[pts.length-1], fade=1-c.ha*.7;
    ctx.globalAlpha=fade; ctx.beginPath(); ctx.arc(e.x-(n>1?3:-0),e.y,6,0,6.283); ctx.fillStyle=color+'33'; ctx.fill(); ctx.beginPath(); ctx.arc(e.x-(n>1?3:0),e.y,3.5,0,6.283); ctx.fillStyle=color; ctx.fill(); ctx.globalAlpha=1;
    c._pts=pts; c._m=m;
  }
  if(c.ha>0.01&&hi!==null) awTip(c,p);
}
function awTip(c,p){
  const {ctx,w}=c, i=c.hi, v=c.values[i], x=c.hx;
  let y; if(c.type==='bar') y=awY(c,v,p); else y=awCurveY(c._pts,c._m,x);
  ctx.save(); ctx.globalAlpha=c.ha;
  if(c.type!=='bar'){
    ctx.strokeStyle=c.color+'88'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(x,c.padT-4); ctx.lineTo(x,c.padT+c.innerH); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(x,y,9,0,6.283); ctx.fillStyle=c.color+'33'; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,5.5,0,6.283); ctx.fillStyle=c.bg; ctx.fill(); ctx.lineWidth=3; ctx.strokeStyle=c.color; ctx.stroke();
  }
  const date=c.labels?c.labels[i]:(c.ts?awDate(c.ts[i]):''), line=`${tr(c.name)}: ${c.fmt(v)}`;
  ctx.font='600 11px Inter, sans-serif'; const w1=ctx.measureText(date).width;
  ctx.font='700 12.5px Inter, sans-serif'; const w2=ctx.measureText(line).width;
  const bw=Math.max(w1,w2)+22, bh=date?44:28; let bx=x-bw/2; bx=Math.max(4,Math.min(w-bw-4,bx));
  let by=y-bh-16; if(by<2) by=y+16;
  ctx.shadowColor='rgba(0,0,0,.28)'; ctx.shadowBlur=14; ctx.shadowOffsetY=4;
  ctx.fillStyle=c.txt; awRR(ctx,bx,by,bw,bh,11); ctx.fill(); ctx.shadowColor='transparent';
  ctx.fillStyle=c.bg; ctx.textAlign='left';
  if(date){ ctx.globalAlpha=c.ha*.7; ctx.font='600 11px Inter, sans-serif'; ctx.fillText(date,bx+11,by+17); ctx.globalAlpha=c.ha; ctx.font='700 12.5px Inter, sans-serif'; ctx.fillText(line,bx+11,by+34); }
  else { ctx.font='700 12.5px Inter, sans-serif'; ctx.fillText(line,bx+11,by+18); }
  ctx.restore();
}
function animateStats(charts, animate){
  const run=++chartRun;
  const nums=[...document.querySelectorAll('.stat-card .num')], start=performance.now();
  charts.forEach((c,i)=>{ const cv=document.getElementById(c.id); if(!cv) return;
    awChart(cv,{values:c.values,ts:c.ts,color:c.color,zero:true,name:c.name,fmt:v=>awNum(v,c.dec)+(c.suf||''),delay:i*110,animate}); });
  function frame(now){
    if(run!==chartRun) return;
    const tn=animate?Math.min(1,(now-start)/900):1;
    nums.forEach(n=>{ const v=parseFloat(n.dataset.v)||0; n.textContent=(v*_ease(tn)).toFixed(+n.dataset.dec)+n.dataset.suf; });
    if(tn<1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
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
  if(!(await verifyPassword(pass))){ document.getElementById('crownErr').textContent='Falsches Passwort.'; return; }
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
async function wipeAccountData(id, publicId){
  // order matters: the profile and login record go last (the rules need them to authorise the earlier deletes)
  try{ if(typeof wkDeleteAll==='function') await wkDeleteAll(id); }catch(e){}
  for(const p of ['private/'+id,'activity/'+id,'adminmeta/'+id].concat(publicId?['pubids/'+publicId]:[])){ try{ await db.doc(p).delete(); }catch(e){} }
}
async function deleteAccountNow(){
  const pass = document.getElementById('delAccPass').value;
  const errEl = document.getElementById('delAccErr');
  if(user._az&&user._az.role==='owner'){ errEl.textContent='Der Owner kann nicht gelöscht werden.'; return; }
  if(!(await verifyPassword(pass))){ errEl.textContent='Falsches Passwort.'; return; }
  await Promise.all((user.friends||[]).map(async f=>{
    try{ const tid=safeId(f); const td=await db.doc('users/'+tid).get();
      if(td.exists) await db.doc('users/'+tid).update({friends:(td.data().friends||[]).filter(n=>n!==user.name)});
    }catch(e){}
  }));
  let pid=null; try{ const m=await db.doc('adminmeta/'+user.id).get(); pid=m.exists?m.data().publicId:null; }catch(e){}
  await wipeAccountData(user.id,pid);
  await db.doc('users/'+user.id).delete();
  try{ await db.doc('authz/'+user.uid).delete(); }catch(e){}
  try{ await fbAuth.currentUser.delete(); }catch(e){}
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
    if(safeId(newName)!==user.id){ toast('Der Anmeldename kann nicht mehr geändert werden – nur Groß-/Kleinschreibung.'); return; }
    updates.name=newName; user.name=newName;
  }
  if(pendingAvatar){ updates.avatar = pendingAvatar; user.avatar = pendingAvatar; pendingAvatar=null; }

  if(newPass){
    if(!oldPass){ toast('Bitte aktuelles Passwort eingeben.'); return; }
    if(!/^(?=.*\d).{8,}$/.test(newPass)){ toast('Neues Passwort: mindestens 8 Zeichen und eine Zahl.'); return; }
    if(!(await verifyPassword(oldPass))){ toast('Aktuelles Passwort ist falsch.'); return; }
    try{ await fbAuth.currentUser.updatePassword(newPass); }catch(e){ toast('Passwort konnte nicht geändert werden. Bitte melde dich neu an und versuche es erneut.'); return; }
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
  await saveMySessions();
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
  await saveMySessions();
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


/* =====================================================================
   AI VOICE ASSISTANT
   Optional: connect a real AI later by defining (e.g. in a <script> tag):
     window.AWAKE_ASSISTANT_PROVIDER = async ({question, lang, data}) => "answer text" // or null -> local engine
   `data` is a compact snapshot of the user's awake data (no images).
   ===================================================================== */
const AI_LOC={de:'de-DE',en:'en-US',ar:'ar-SA'};
const AI_T={
 de:{status:{idle:'Frag mich etwas',listening:'Ich höre zu…',thinking:'Einen Moment…',speaking:'awake spricht…'},
  ph:'Frage auswählen oder eingeben…',scope:'Datenquelle',all:'Alle Sessions',
  sugg:['Erstatte mir Bericht','Was läuft gerade?','Was habe ich heute verkauft?','Wie viel Gewinn habe ich gemacht?','Was befindet sich aktuell im Lager?','Zeig mir meine letzten Verkäufe'],
  noSR:'Spracheingabe wird von diesem Browser nicht unterstützt. Tippe deine Frage ein.',micDenied:'Mikrofonzugriff blockiert. Bitte erlaube ihn in den Browser-Einstellungen.',noSpeech:'Ich habe nichts gehört. Versuch es noch einmal.',micErr:'Spracherkennung fehlgeschlagen.',noTTS:'Sprachausgabe nicht verfügbar – Antwort wird als Text gezeigt.'},
 en:{status:{idle:'Ask me anything',listening:'Listening…',thinking:'One moment…',speaking:'awake is speaking…'},
  ph:'Pick or type a question…',scope:'Data source',all:'All sessions',
  sugg:['Give me a report','What is going on right now?','What did I sell today?','How much profit have I made?','What is currently in stock?','Show me my latest sales'],
  noSR:'Voice input is not supported by this browser. Type your question instead.',micDenied:'Microphone access blocked. Please allow it in your browser settings.',noSpeech:"I didn't hear anything. Please try again.",micErr:'Speech recognition failed.',noTTS:'Speech output not available – showing the answer as text.'},
 ar:{status:{idle:'اسألني أي شيء',listening:'أنا أستمع…',thinking:'لحظة…',speaking:'awake يتحدث…'},
  ph:'اختر سؤالًا أو اكتبه…',scope:'مصدر البيانات',all:'كل الجلسات',
  sugg:['أعطني تقريرًا','ماذا يحدث الآن؟','ماذا بعت اليوم؟','كم ربحت؟','ما الموجود في المخزون حاليًا؟','أظهر لي آخر مبيعاتي'],
  noSR:'الإدخال الصوتي غير مدعوم في هذا المتصفح. اكتب سؤالك.',micDenied:'تم حظر الوصول إلى الميكروفون. يرجى السماح به من إعدادات المتصفح.',noSpeech:'لم أسمع شيئًا. حاول مرة أخرى.',micErr:'فشل التعرف على الصوت.',noTTS:'الإخراج الصوتي غير متاح – سيتم عرض الإجابة كنص.'}
};
const AI_A={
 de:{per:{today:'heute',yesterday:'gestern',week:'in den letzten 7 Tagen',month:'in den letzten 30 Tagen',all:'insgesamt'},
  it:n=>`${n} Artikel`,
  noSess:'Du hast noch keine Session. Erstelle oder tritt einer Session bei, dann kann ich dir Auskunft geben.',
  sold:(n,per,pr,names)=>n?`Du hast ${per} ${n} Artikel verkauft. Dein Gewinn beträgt ${pr}.${names?` Verkauft: ${names}.`:''}`:`Du hast ${per} keine Artikel verkauft.`,
  profit:(n,per,pr)=>n?`Dein Gewinn ${per} beträgt ${pr}, aus ${n} verkauften Artikeln.`:`Es gibt ${per} noch keine Verkäufe, daher auch keinen Gewinn.`,
  revenue:(n,per,rv)=>n?`Dein Umsatz ${per} beträgt ${rv}, aus ${n} verkauften Artikeln.`:`Es gibt ${per} noch keine Verkäufe, daher auch keinen Umsatz.`,
  stock:(c,val,names,off)=>(c?`Aktuell liegen ${c} Artikel im Lager (Einkaufswert ${val}).${names?` Zum Beispiel: ${names}.`:''}`:'Im Lager ist aktuell nichts.')+(off?` Außerdem sind ${off} Artikel offline gestellt.`:''),
  lastH:'Deine letzten Verkäufe:',lastNone:'Du hast noch nichts verkauft.',lastRow:(x)=>`• ${x.name} – ${x.sell} (Gewinn ${x.profit})`,
  best:x=>x?`Dein profitabelster Verkauf ist „${x.name}“ mit ${x.profit} Gewinn.`:'Du hast noch nichts verkauft.',
  offline:n=>n?`${n} Artikel sind aktuell offline gestellt.`:'Aktuell ist kein Artikel offline gestellt.',
  report:r=>['Hier ist dein Bericht:',`• Heute: ${r.today.n} verkauft, Gewinn ${r.today.profit}.`,`• Letzte 7 Tage: ${r.week.n} verkauft, Gewinn ${r.week.profit}.`,`• Insgesamt: ${r.all.n} verkauft, Umsatz ${r.all.revenue}, Gewinn ${r.all.profit}.`,`• Im Lager: ${r.stock.c} Artikel (Einkaufswert ${r.stock.value}).`,r.last?`• Zuletzt verkauft: ${r.last.name} (${r.last.sell}).`:''].filter(Boolean).join('\n'),
  status:(r,lines)=>['Das läuft gerade bei dir:',`• Heute verkauft: ${r.today.n} (Gewinn ${r.today.profit}).`,`• Im Lager: ${r.stock.c} Artikel.`,lines.length?'Letzte Aktivitäten:\n'+lines.join('\n'):''].filter(Boolean).join('\n'),
  help:'Ich kenne dein Lager und deine Verkäufe. Frag mich z. B. nach deinem Bericht, Gewinn, Umsatz, den Verkäufen von heute oder dem Lagerbestand.',
  hi:'Hallo! Wie kann ich dir helfen?',
  unknown:'Dazu habe ich keine Daten in awake. Ich kann dir etwas zu Verkäufen, Gewinn, Umsatz, Lager und Aktivität sagen.',
  error:'Das hat gerade nicht geklappt. Bitte versuch es noch einmal.'},
 en:{per:{today:'today',yesterday:'yesterday',week:'in the last 7 days',month:'in the last 30 days',all:'in total'},
  it:n=>n===1?'1 item':`${n} items`,
  noSess:"You don't have a session yet. Create or join one and I can tell you more.",
  sold:(n,per,pr,names)=>n?`You sold ${n===1?'1 item':n+' items'} ${per}. Your profit is ${pr}.${names?` Sold: ${names}.`:''}`:`You haven't sold any items ${per}.`,
  profit:(n,per,pr)=>n?`Your profit ${per} is ${pr}, from ${n===1?'1 sold item':n+' sold items'}.`:`There are no sales ${per}, so there is no profit yet.`,
  revenue:(n,per,rv)=>n?`Your revenue ${per} is ${rv}, from ${n===1?'1 sold item':n+' sold items'}.`:`There are no sales ${per}, so there is no revenue yet.`,
  stock:(c,val,names,off)=>(c?`You currently have ${c===1?'1 item':c+' items'} in stock (purchase value ${val}).${names?` For example: ${names}.`:''}`:'Nothing is in stock right now.')+(off?` Also, ${off} ${off===1?'item is':'items are'} offline.`:''),
  lastH:'Your latest sales:',lastNone:"You haven't sold anything yet.",lastRow:x=>`• ${x.name} – ${x.sell} (profit ${x.profit})`,
  best:x=>x?`Your most profitable sale is “${x.name}” with ${x.profit} profit.`:"You haven't sold anything yet.",
  offline:n=>n?`${n} ${n===1?'item is':'items are'} currently offline.`:'No item is offline right now.',
  report:r=>['Here is your report:',`• Today: ${r.today.n} sold, profit ${r.today.profit}.`,`• Last 7 days: ${r.week.n} sold, profit ${r.week.profit}.`,`• Total: ${r.all.n} sold, revenue ${r.all.revenue}, profit ${r.all.profit}.`,`• In stock: ${r.stock.c===1?'1 item':r.stock.c+' items'} (purchase value ${r.stock.value}).`,r.last?`• Last sold: ${r.last.name} (${r.last.sell}).`:''].filter(Boolean).join('\n'),
  status:(r,lines)=>["Here's what's going on:",`• Sold today: ${r.today.n} (profit ${r.today.profit}).`,`• In stock: ${r.stock.c===1?'1 item':r.stock.c+' items'}.`,lines.length?'Recent activity:\n'+lines.join('\n'):''].filter(Boolean).join('\n'),
  help:'I know your inventory and your sales. Ask me for your report, profit, revenue, today\'s sales or your stock.',
  hi:'Hi! How can I help you?',
  unknown:"I don't have data about that in awake. I can tell you about sales, profit, revenue, stock and activity.",
  error:'That did not work just now. Please try again.'},
 ar:{per:{today:'اليوم',yesterday:'أمس',week:'خلال آخر 7 أيام',month:'خلال آخر 30 يومًا',all:'إجمالًا'},
  it:n=>`${n} منتج`,
  noSess:'ليست لديك جلسة بعد. أنشئ جلسة أو انضم إلى واحدة وسأخبرك بالمزيد.',
  sold:(n,per,pr,names)=>n?`لقد بعت ${n} منتج ${per}. ربحك ${pr}.${names?` المباع: ${names}.`:''}`:`لم تبع أي منتج ${per}.`,
  profit:(n,per,pr)=>n?`ربحك ${per} هو ${pr} من ${n} منتج مباع.`:`لا توجد مبيعات ${per}، لذلك لا يوجد ربح.`,
  revenue:(n,per,rv)=>n?`إيراداتك ${per} هي ${rv} من ${n} منتج مباع.`:`لا توجد مبيعات ${per}، لذلك لا توجد إيرادات.`,
  stock:(c,val,names,off)=>(c?`لديك حاليًا ${c} منتج في المخزون (قيمة الشراء ${val}).${names?` مثل: ${names}.`:''}`:'لا يوجد شيء في المخزون حاليًا.')+(off?` كما أن ${off} منتج غير معروض.`:''),
  lastH:'آخر مبيعاتك:',lastNone:'لم تبع أي شيء بعد.',lastRow:x=>`• ${x.name} – ${x.sell} (ربح ${x.profit})`,
  best:x=>x?`أربح عملية بيع لديك هي «${x.name}» بربح ${x.profit}.`:'لم تبع أي شيء بعد.',
  offline:n=>n?`${n} منتج غير معروض حاليًا.`:'لا يوجد أي منتج غير معروض حاليًا.',
  report:r=>['هذا تقريرك:',`• اليوم: بيع ${r.today.n}، الربح ${r.today.profit}.`,`• آخر 7 أيام: بيع ${r.week.n}، الربح ${r.week.profit}.`,`• الإجمالي: بيع ${r.all.n}، الإيرادات ${r.all.revenue}، الربح ${r.all.profit}.`,`• في المخزون: ${r.stock.c} منتج (قيمة الشراء ${r.stock.value}).`,r.last?`• آخر عملية بيع: ${r.last.name} (${r.last.sell}).`:''].filter(Boolean).join('\n'),
  status:(r,lines)=>['هذا ما يجري الآن:',`• المبيعات اليوم: ${r.today.n} (الربح ${r.today.profit}).`,`• في المخزون: ${r.stock.c} منتج.`,lines.length?'آخر الأنشطة:\n'+lines.join('\n'):''].filter(Boolean).join('\n'),
  help:'أعرف مخزونك ومبيعاتك. اسألني عن تقريرك أو الربح أو الإيرادات أو مبيعات اليوم أو المخزون.',
  hi:'مرحبًا! كيف يمكنني مساعدتك؟',
  unknown:'ليست لدي بيانات عن ذلك في awake. يمكنني إخبارك عن المبيعات والربح والإيرادات والمخزون والنشاط.',
  error:'لم ينجح ذلك الآن. يرجى المحاولة مرة أخرى.'}
};
const aiT=()=>AI_T[curLang]||AI_T.en, aiA=()=>AI_A[curLang]||AI_A.en;
const AI={mode:'text',scope:'all',phase:'idle',raf:0,last:0,ph:[0,1.7,3.4,5.1],spd:.35,lvl:0,pulse:0,rec:null,run:0,cache:null,typeRaf:0,keyBound:false};
const AI_RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const AI_SVG={
 chat:'<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
 voice:'<svg viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
 chev:'<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>',
 send:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};

function renderAssistant(){
  const T=aiT();
  AI.mode=LS.get('awake_ai_mode')==='voice'?'voice':'text';
  AI.scope=LS.get('awake_ai_scope')||'all';
  AI.phase='idle'; AI.cache=null; AI.run++;
  document.getElementById('content').innerHTML=`<div class="fade ai-wrap">
    <div class="ai-switch" id="aiSwitch" data-mode="${AI.mode}"><span class="pill"></span>
      <button type="button" id="aiBtnText" class="${AI.mode==='text'?'on':''}" onclick="aiSetMode('text')">${AI_SVG.chat}<span>Text</span></button>
      <button type="button" id="aiBtnVoice" class="${AI.mode==='voice'?'on':''}" onclick="aiSetMode('voice')">${AI_SVG.voice}<span>Voice</span></button>
    </div>
    <div class="ai-orb" id="aiOrb" onclick="aiOrbTap()">
      <div class="ai-aura" id="aiAura"></div>
      <div class="ai-ring r1"></div><div class="ai-ring r2"></div>
      <div class="ai-sphere" id="aiSphere"><i class="ai-blob b1"></i><i class="ai-blob b2"></i><i class="ai-blob b3"></i><i class="ai-blob b4"></i><span class="ai-sheen"></span><span class="ai-logo"></span></div>
    </div>
    <div class="ai-status" id="aiStatus">${esc(T.status.idle)}</div>
    <div class="ai-caption" id="aiCaption"></div>
    <div class="ai-input">
      <div class="ai-fieldwrap">
        <div class="ai-menu hidden" id="aiMenu">${T.sugg.map((x,i)=>`<button type="button" onclick="aiPick(${i})">${esc(x)}</button>`).join('')}</div>
        <div class="ai-field">
          <input id="aiInput" type="text" autocomplete="off" enterkeyhint="send" placeholder="${esc(T.ph)}" onkeydown="if(event.key==='Enter'){event.preventDefault();aiSubmit();}">
          <button type="button" class="ai-icon-btn" id="aiChev" onclick="aiToggleMenu(event)" aria-label="Menu">${AI_SVG.chev}</button>
          <button type="button" class="ai-send" onclick="aiSubmit()" aria-label="Send">${AI_SVG.send}</button>
        </div>
      </div>
      <button type="button" class="ai-mic" id="aiMic" onclick="aiToggleMic()" aria-label="Microphone"><span class="ico-mic"></span></button>
    </div>
    <div class="ai-scope"><span>${esc(T.scope)}</span><select id="aiScope" onchange="aiSetScope(this.value)"><option value="all">${esc(T.all)}</option></select></div>
  </div>`;
  if(!AI.keyBound){
    AI.keyBound=true;
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') aiClosePopup(); });
    document.addEventListener('click',e=>{ const m=document.getElementById('aiMenu'); if(m&&!m.classList.contains('hidden')&&!e.target.closest('.ai-fieldwrap')) aiCloseMenu(); });
  }
  AI.last=0; cancelAnimationFrame(AI.raf); AI.raf=requestAnimationFrame(aiFrame);
  aiFillScope();
}
function aiLeave(){
  cancelAnimationFrame(AI.raf); AI.raf=0;
  if(AI.rec){ const r=AI.rec; AI.rec=null; r.onend=r.onresult=r.onerror=null; try{r.abort();}catch(e){} }
  aiStopOutput(); aiEndStopListener(); aiClosePopup(true); AI.phase='idle';
}

/* orb: JS-driven so it reacts instantly to the speech state */
function aiFrame(t){
  const orb=document.getElementById('aiOrb'); if(!orb){ AI.raf=0; return; }
  AI.raf=requestAnimationFrame(aiFrame);
  const dt=Math.min(.05,AI.last?(t-AI.last)/1000:.016); AI.last=t;
  const rm=AI_RM?.4:1;
  const target={idle:.35,thinking:.95,listening:.85,speaking:1.8}[AI.phase]*rm;
  AI.spd+=(target-AI.spd)*Math.min(1,dt*5);
  AI.pulse=Math.max(0,AI.pulse-dt*3.2);
  let tl;
  if(AI.phase==='speaking') tl=.28+.22*(.5+.5*Math.sin(t/85)*Math.sin(t/230+1))+AI.pulse*.45;
  else if(AI.phase==='listening') tl=.12+.08*Math.sin(t/250)+AI.pulse*.4;
  else if(AI.phase==='thinking') tl=.07+.04*Math.sin(t/190);
  else tl=.02+.02*Math.sin(t/1500);
  AI.lvl+=(tl-AI.lvl)*Math.min(1,dt*(tl>AI.lvl?16:7));
  const F=[1.3,1.7,1.1,2.0], amp=26*(1+AI.lvl*1.2);
  const blobs=orb.querySelectorAll('.ai-blob');
  for(let i=0;i<4;i++){
    AI.ph[i]+=dt*AI.spd*F[i];
    const x=Math.sin(AI.ph[i]+i*1.7)*amp, y=Math.cos(AI.ph[i]*.83+i*2.3)*amp, sc=1+.18*Math.sin(AI.ph[i]*1.3+i);
    blobs[i].style.transform=`translate(${x.toFixed(2)}%,${y.toFixed(2)}%) scale(${sc.toFixed(3)})`;
  }
  const lv=AI.lvl*(AI_RM?.5:1);
  document.getElementById('aiSphere').style.transform=`scale(${(1+lv*.13).toFixed(4)})`;
  const au=document.getElementById('aiAura');
  au.style.opacity=Math.min(.95,.35+lv*1.1).toFixed(3);
  au.style.transform=`scale(${(1+lv*.4).toFixed(3)})`;
}
function aiSetPhase(p){
  AI.phase=p;
  aiSyncStopListener();
  const orb=document.getElementById('aiOrb'); if(!orb) return;
  orb.classList.toggle('listening',p==='listening');
  orb.classList.toggle('stoppable',p!=='idle');
  const mic=document.getElementById('aiMic'); if(mic) mic.classList.toggle('on',p==='listening');
  const st=document.getElementById('aiStatus'); if(st) st.textContent=aiT().status[p]||'';
}
function aiCaption(t){ const c=document.getElementById('aiCaption'); if(c) c.textContent=t||''; }

/* mode / scope / menu */
function aiSetMode(m){
  AI.mode=m; LS.set('awake_ai_mode',m);
  document.getElementById('aiSwitch').dataset.mode=m;
  document.getElementById('aiBtnText').classList.toggle('on',m==='text');
  document.getElementById('aiBtnVoice').classList.toggle('on',m==='voice');
  if(m==='text'&&AI.phase==='speaking'){ aiStopOutput(); aiSetPhase('idle'); }
}
function aiSetScope(v){ AI.scope=v; LS.set('awake_ai_scope',v); }
async function aiFillScope(){
  const sel=document.getElementById('aiScope'); if(!sel) return;
  try{
    const list=await aiFetchSessions(); const s2=document.getElementById('aiScope'); if(!s2) return;
    s2.innerHTML=`<option value="all">${esc(aiT().all)}</option>`+list.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');
    s2.value=list.some(s=>s.id===AI.scope)?AI.scope:'all'; AI.scope=s2.value;
  }catch(e){}
}
function aiToggleMenu(e){ e.stopPropagation(); const m=document.getElementById('aiMenu'); const open=m.classList.toggle('hidden')===false; document.getElementById('aiChev').classList.toggle('open',open); }
function aiCloseMenu(){ const m=document.getElementById('aiMenu'); if(m) m.classList.add('hidden'); const c=document.getElementById('aiChev'); if(c) c.classList.remove('open'); }
function aiPick(i){ aiCloseMenu(); aiAsk(aiT().sugg[i]); }
function aiSubmit(){ const inp=document.getElementById('aiInput'); const v=inp.value; if(!v.trim()) return; inp.value=''; inp.blur(); aiCloseMenu(); aiAsk(v); }

/* microphone → speech recognition */
function aiToggleMic(){
  if(AI.phase==='listening'){ if(AI.rec) AI.rec.stop(); return; }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ toast(aiT().noSR); return; }
  aiCloseMenu(); aiStopOutput(); aiClosePopup(true);
  const r=new SR(); r.lang=AI_LOC[curLang]||'en-US'; r.interimResults=true; r.continuous=false; r.maxAlternatives=1;
  let fin='', interim='';
  r.onstart=()=>{ LS.set('awake_ai_micok','1'); aiCaption(''); aiSetPhase('listening'); };
  r.onresult=e=>{
    interim='';
    for(let i=e.resultIndex;i<e.results.length;i++){ const R=e.results[i]; if(R.isFinal) fin+=R[0].transcript; else interim+=R[0].transcript; }
    AI.pulse=1; aiCaption('„'+(fin+interim).trim()+'“');
  };
  r.onerror=e=>{
    if(e.error==='not-allowed'||e.error==='service-not-allowed') toast(aiT().micDenied);
    else if(e.error==='no-speech') toast(aiT().noSpeech);
    else if(e.error!=='aborted') toast(aiT().micErr);
  };
  r.onend=()=>{
    if(AI.rec!==r) return; AI.rec=null;
    const txt=(fin||interim).trim();
    if(txt) aiAsk(txt); else { aiSetPhase('idle'); aiCaption(''); }
  };
  AI.rec=r;
  try{ r.start(); }catch(e){ AI.rec=null; aiSetPhase('idle'); toast(aiT().micErr); }
}

/* ask → answer → output */
const aiSleep=ms=>new Promise(r=>setTimeout(r,ms));
function aiClean(raw){ return String(raw||'').replace(/^\s*(?:hey|hallo|hi|hello|ok|okay)?[\s,]*awake\b[\s,.!:;-]*/i,'').trim(); }
async function aiAsk(raw){
  if(aiIsStop(raw)){ aiHardStop(); return; }   // spoken/typed "stop" is a command, not a question
  const woke=/^\s*(?:hey|hallo|hi|hello|ok|okay)?[\s,]*awake\b/i.test(String(raw||''));
  let q=aiClean(raw); if(!q&&woke) q='hallo'; if(!q) return;
  aiStopOutput(); aiClosePopup(true);
  const run=++AI.run;
  aiCaption('„'+q+'“'); aiSetPhase('thinking');
  let ans;
  try{ const data=await aiLoadData(); ans=await aiAnswer(q,data); }catch(e){ ans=aiA().error; }
  await aiSleep(200);
  if(run!==AI.run||currentView!=='assistant') return;
  if(AI.mode==='voice'){
    if('speechSynthesis' in window&&window.SpeechSynthesisUtterance){ aiSpeak(ans,run); return; }
    toast(aiT().noTTS);
  }
  aiSetPhase('idle'); aiShowPopup(q,ans);
}
function aiStopOutput(){ AI.run++; try{ if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){} }


/* ---------- stop controls: tap the orb / say "stop" ---------- */
const AI_STOP_VOICE=true;   // false = disable the "stop" voice command while awake speaks (orb tap always works)
const AI_STOP_RE=/^[\s,.!?¡¿-]*(?:(?:hey|hallo|hi|ok|okay)[\s,]+)?(?:awake[\s,]+)?(?:stop|stopp|stoppen|stopp es|halt|hör auf|hoer auf|aufhören|aufhoeren|ruhe|pause|genug|قف|توقف|كفى)[\s,.!?]*$/i;
function aiIsStop(t){ return AI_STOP_RE.test(String(t||'')); }
function aiAbortRec(){
  if(AI.rec){ const r=AI.rec; AI.rec=null; r.onend=r.onresult=r.onerror=r.onstart=null; try{ r.abort(); }catch(e){} }
}
function aiHardStop(){
  aiStopOutput();            // cancels speech + invalidates any running answer
  aiAbortRec();              // mic off
  aiClosePopup(true);
  aiCaption('');
  aiSetPhase('idle');
}
function aiOrbTap(){
  if(AI.phase==='idle') return;          // nothing running: orb behaves as before
  aiHardStop();
}
/* while awake speaks, a light listener waits for the word "stop" (only if the mic was already allowed) */
function aiSyncStopListener(){
  if(AI.phase==='speaking'&&AI_STOP_VOICE) aiStartStopListener(); else aiEndStopListener();
}
function aiEndStopListener(){
  if(AI.stopRec){ const r=AI.stopRec; AI.stopRec=null; r.onend=r.onresult=r.onerror=null; try{ r.abort(); }catch(e){} }
}
async function aiStartStopListener(){
  if(AI.stopRec||AI.stopBlocked) return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return;
  try{
    let ok=LS.get('awake_ai_micok')==='1';
    if(navigator.permissions&&navigator.permissions.query){
      try{ const st=await navigator.permissions.query({name:'microphone'}); if(st.state==='denied'){ AI.stopBlocked=true; return; } if(st.state==='granted') ok=true; }catch(e){}
    }
    if(!ok||AI.phase!=='speaking'||AI.stopRec) return;        // never trigger a new permission prompt
    const r=new SR(); r.lang=AI_LOC[curLang]||'en-US'; r.continuous=true; r.interimResults=true; r.maxAlternatives=1;
    r.onresult=e=>{
      for(let i=e.resultIndex;i<e.results.length;i++){
        const tx=e.results[i][0].transcript||'';
        if(aiIsStop(tx)||/\b(?:stop|stopp|halt)\s*[.!]?$/i.test(tx.trim())&&tx.trim().split(/\s+/).length<=3){ aiHardStop(); return; }
      }
    };
    r.onerror=e=>{ if(e.error==='not-allowed'||e.error==='service-not-allowed'){ AI.stopBlocked=true; } };
    r.onend=()=>{ if(AI.stopRec!==r) return; AI.stopRec=null; if(AI.phase==='speaking'&&!AI.stopBlocked) setTimeout(aiStartStopListener,150); };
    AI.stopRec=r; r.start();
  }catch(e){ AI.stopRec=null; }
}

/* text-to-speech */
function aiPickVoice(){
  try{
    const l=curLang, vs=(speechSynthesis.getVoices()||[]).filter(v=>(v.lang||'').toLowerCase().startsWith(l));
    return vs.find(v=>/natural|google|online|premium|enhanced/i.test(v.name))||vs.find(v=>v.default)||vs[0]||null;
  }catch(e){ return null; }
}
function aiSpeak(text,run){
  const synth=speechSynthesis; synth.cancel();
  const clean=text.replace(/[•·]/g,'').replace(/\n+/g,'. ').replace(/\s+/g,' ').trim();
  const parts=clean.replace(/([.!?؟])\s+/g,'$1|').split('|').map(x=>x.trim()).filter(Boolean);
  const voice=aiPickVoice(); let fin=false;
  const end=()=>{ if(fin||run!==AI.run) return; fin=true; aiSetPhase('idle'); };
  parts.forEach((p,idx)=>{
    const u=new SpeechSynthesisUtterance(p); u.lang=AI_LOC[curLang]||'en-US'; if(voice) u.voice=voice; u.rate=1.03;
    u.onstart=()=>{ if(run===AI.run&&AI.phase!=='speaking') aiSetPhase('speaking'); };
    u.onboundary=()=>{ if(run===AI.run) AI.pulse=1; };
    u.onerror=end;
    if(idx===parts.length-1) u.onend=end;
    synth.speak(u);
  });
  aiSetPhase('speaking');
  setTimeout(()=>{ if(run===AI.run&&AI.phase==='speaking'&&!synth.speaking&&!synth.pending) end(); },1500);  // TTS silently failed
}

/* text answer popup with live typing */
function aiShowPopup(q,text){
  aiClosePopup(true);
  const ov=document.createElement('div'); ov.id='aiPop'; ov.className='ai-pop-overlay';
  ov.innerHTML=`<div class="ai-pop" role="dialog" aria-live="polite">
    <button type="button" class="ai-x" aria-label="Close" onclick="aiClosePopup()">✕</button>
    <div class="ai-pop-head"><span class="ai-mark"></span><b>awake</b></div>
    <div class="ai-pop-q"></div>
    <div class="ai-pop-a" dir="auto"><span id="aiTyped"></span><i class="ai-caret" id="aiCaret"></i></div></div>`;
  ov.querySelector('.ai-pop-q').textContent='„'+q+'“';
  ov.onclick=e=>{ if(e.target===ov) aiClosePopup(); };
  document.body.appendChild(ov);
  const node=document.createTextNode(''); document.getElementById('aiTyped').appendChild(node);
  const pop=ov.querySelector('.ai-pop'), cps=Math.max(70,Math.min(170,text.length/2)), t0=performance.now(); let shown=0;
  const step=now=>{
    const n=Math.min(text.length,Math.floor((now-t0)/1000*cps)+1);
    if(n!==shown){ node.nodeValue=text.slice(0,n); shown=n; pop.scrollTop=pop.scrollHeight; }
    if(n<text.length) AI.typeRaf=requestAnimationFrame(step);
    else { AI.typeRaf=0; const c=document.getElementById('aiCaret'); if(c) c.remove(); }
  };
  AI.typeRaf=requestAnimationFrame(step);
}
function aiClosePopup(now){
  cancelAnimationFrame(AI.typeRaf); AI.typeRaf=0;
  const ov=document.getElementById('aiPop'); if(!ov) return;
  ov.removeAttribute('id');
  if(now){ ov.remove(); return; }
  ov.classList.add('closing'); setTimeout(()=>ov.remove(),190);
}

/* data */
async function aiFetchSessions(force){
  if(!force&&AI.cache&&Date.now()-AI.cache.ts<15000) return AI.cache.list;
  const ids=user.sessions||[];
  const docs=await Promise.all(ids.map(id=>db.doc('sessions/'+id).get().catch(()=>null)));
  const list=docs.filter(d=>d&&d.exists).map(d=>{ const s=d.data(); return {id:d.id,name:s.name,items:s.items||[],folders:s.folders||[],audit:s.audit||[]}; });
  AI.cache={ts:Date.now(),list}; return list;
}
async function aiLoadData(){
  const all=await aiFetchSessions();
  const use=AI.scope==='all'?all:all.filter(s=>s.id===AI.scope);
  const items=[], audit=[];
  use.forEach(s=>{
    const fm={}; s.folders.forEach(f=>fm[f.id]=f.name);
    s.items.forEach(i=>items.push({name:i.name,status:i.status,buyPrice:+i.buyPrice||0,sellPrice:+i.sellPrice||0,platform:i.platform,folder:fm[i.folderId]||'',session:s.name,createdAt:i.createdAt,soldAt:i.soldAt}));
    s.audit.forEach(a=>audit.push(a));
  });
  return {sessions:use.map(s=>({id:s.id,name:s.name})),items,audit};
}
function aiSnapshot(d){ return {now:new Date().toISOString(),currency:'EUR',sessions:d.sessions,items:d.items,recentActivity:d.audit.slice().sort((a,b)=>b.ts-a.ts).slice(0,20)}; }
async function aiAnswer(q,data){
  const p=window.AWAKE_ASSISTANT_PROVIDER;
  if(typeof p==='function'){
    try{ const r=await p({question:q,lang:curLang,data:aiSnapshot(data)}); if(r&&String(r).trim()) return String(r).trim(); }catch(e){}
  }
  return aiLocal(q,data);
}

/* local intent engine – answers only from real awake data */
function aiEur(n){
  try{ return new Intl.NumberFormat(curLang==='de'?'de-DE':curLang==='ar'?'ar-EG-u-nu-latn':'en-US',{style:'currency',currency:'EUR'}).format(n); }
  catch(e){ return n.toFixed(2)+' €'; }
}
function aiPeriod(s){
  const d=new Date(); d.setHours(0,0,0,0); const T=d.getTime(), D=864e5;
  if(/heute|today|اليوم/.test(s)) return {k:'today',from:T,to:Infinity};
  if(/gestern|yesterday|أمس|امس/.test(s)) return {k:'yesterday',from:T-D,to:T};
  if(/woche|week|أسبوع|اسبوع/.test(s)) return {k:'week',from:T-6*D,to:Infinity};
  if(/monat|month|شهر/.test(s)) return {k:'month',from:T-29*D,to:Infinity};
  return {k:'all',from:-Infinity,to:Infinity};
}
function aiStats(items,p){
  const sold=items.filter(i=>i.status==='verkauft'&&(p.k==='all'||(i.soldAt>=p.from&&i.soldAt<p.to)));
  return {sold,n:sold.length,profit:sold.reduce((a,i)=>a+(i.sellPrice-i.buyPrice),0),revenue:sold.reduce((a,i)=>a+i.sellPrice,0)};
}
function aiLocal(q,data){
  const L=aiA(), s=q.toLowerCase(), has=re=>re.test(s);
  if(has(/^(hallo|hi|hey|hello|مرحبا|اهلا|أهلا)\b/)&&s.length<20) return L.hi;
  if(!data.sessions.length) return L.noSess;
  const p=aiPeriod(s), st=aiStats(data.items,p), per=L.per[p.k];
  const soldAll=data.items.filter(i=>i.status==='verkauft').sort((a,b)=>(b.soldAt||0)-(a.soldAt||0));
  const stock=data.items.filter(i=>i.status==='lager').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  const off=data.items.filter(i=>i.status==='offline').length;
  const stockVal=stock.reduce((a,i)=>a+i.buyPrice,0);
  const mini=pk=>{ const x=aiStats(data.items,aiPeriod(pk)); return {n:x.n,profit:aiEur(x.profit),revenue:aiEur(x.revenue)}; };
  const summary=()=>({today:mini('today'),week:mini('week'),all:mini('total'),stock:{c:stock.length,value:aiEur(stockVal)},last:soldAll[0]?{name:soldAll[0].name,sell:aiEur(soldAll[0].sellPrice)}:null});
  if(has(/bericht|report|zusammenfassung|überblick|ueberblick|summary|overview|briefing|تقرير|ملخص/)) return L.report(summary());
  if(has(/läuft|laeuft|going on|what.?s up|happening|status|يحدث|صاير|الجديد/)){
    const lines=data.audit.slice().sort((a,b)=>b.ts-a.ts).slice(0,4).map(a=>`• ${a.actor} ${tr(a.action)}`);
    return L.status(summary(),lines);
  }
  if(has(/letzt|neueste|last|recent|latest|آخر/)&&has(/verkauf|sale|sold|sell|بيع|مبيع/)&&p.k==='all'){
    if(!soldAll.length) return L.lastNone;
    return L.lastH+'\n'+soldAll.slice(0,5).map(i=>L.lastRow({name:i.name,sell:aiEur(i.sellPrice),profit:aiEur(i.sellPrice-i.buyPrice)})).join('\n');
  }
  if(has(/\bbeste[rsn]?\b|profitabel|meisten gewinn|most profitable|best.?sell|أفضل|أربح/)){
    const b=soldAll.slice().sort((a,c)=>(c.sellPrice-c.buyPrice)-(a.sellPrice-a.buyPrice))[0];
    return L.best(b?{name:b.name,profit:aiEur(b.sellPrice-b.buyPrice)}:null);
  }
  if(has(/gewinn|profit|verdien|earned|margin|ربح|أرباح|ارباح/)) return L.profit(st.n,per,aiEur(st.profit));
  if(has(/umsatz|revenue|einnahmen|turnover|إيراد|دخل/)) return L.revenue(st.n,per,aiEur(st.revenue));
  if(has(/offline/)) return L.offline(off);
  if(has(/lager|bestand|stock|inventor|مخزون|المخزن/)) return L.stock(stock.length,aiEur(stockVal),stock.slice(0,5).map(i=>i.name).join(', '),off);
  if(has(/verkauf|verkauft|sold|sales|\bsell\b|بيع|مبيع|بعت/)) return L.sold(st.n,per,aiEur(st.profit),st.n&&st.n<=5?st.sold.map(i=>i.name).join(', '):'');
  if(has(/hilfe|help|was kannst|what can you|مساعدة/)) return L.help;
  return L.unknown;
}
