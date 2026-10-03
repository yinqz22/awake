/* =====================================================================
   v5.1 UI helpers: compact header on scroll + professional 404 handling
   - the header shrinks when #content is scrolled
   - ?r=<route> (set by 404.html for known routes like /admin) is only opened if the app allows it,
     otherwise the visitor sees the 404 page. Nothing here grants access – it only decides what to SHOW.
   ===================================================================== */
(function(){
  const content=()=>document.getElementById('content'), top=()=>document.getElementById('topbar');
  let ticking=false;
  function onScroll(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{ ticking=false; const c=content(), t=top(); if(c&&t) t.classList.toggle('compact',c.scrollTop>12); });
  }
  document.addEventListener('scroll',e=>{ if(e.target&&e.target.id==='content') onScroll(); },true);   // #content is re-rendered, so listen at the document
  new MutationObserver(()=>{ const t=top(),c=content(); if(t&&c&&c.scrollTop<=12) t.classList.remove('compact'); }).observe(document.body,{childList:true,subtree:false});

  /* ---------- 404 ---------- */
  window.showNotFound=function(){
    if(document.getElementById('nf')) return;
    const de=(document.documentElement.lang||'en')==='de';
    const d=document.createElement('div'); d.id='nf';
    d.innerHTML=`<div><div class="nf-code">404</div><h1>${de?'Seite nicht gefunden':'Page not found'}</h1><p>${de?'Diese Seite existiert nicht oder du hast keinen Zugriff darauf.':'This page does not exist or you do not have access to it.'}</p><button type="button" id="nfBack">← ${de?'Zurück zur Startseite':'Back to homepage'}</button></div>`;
    document.body.appendChild(d);
    document.getElementById('nfBack').onclick=()=>{ d.remove(); try{ history.replaceState(null,'',location.pathname); }catch(e){} if(typeof user!=='undefined'&&user&&typeof showView==='function') showView('home'); };
  };
  const route=new URLSearchParams(location.search).get('r');
  if(route){
    const KNOWN={};                       // routes the app can open for allowed users – filled in by later modules (e.g. KNOWN.admin)
    window.AWAKE_ROUTES=KNOWN;
    const tryOpen=()=>{
      const open=KNOWN[route];
      if(typeof open==='function'&&typeof user!=='undefined'&&user){ if(open()!==false){ try{ history.replaceState(null,'',location.pathname); }catch(e){} return true; } }
      return false;
    };
    // not signed in -> never reveal anything: 404 straight away
    let saved=null; try{ saved=localStorage.getItem('awake_user'); }catch(e){}
    if(!saved) window.addEventListener('DOMContentLoaded',showNotFound);
    else {
      let n=0; const iv=setInterval(()=>{ n++; if(typeof user!=='undefined'&&user){ clearInterval(iv); setTimeout(()=>{ if(!tryOpen()) showNotFound(); },50); } else if(n>60){ clearInterval(iv); showNotFound(); } },100);
    }
  }
})();
