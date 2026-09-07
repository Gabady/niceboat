/* 競艇物語 v85.1 — optional iPhone entrypoint support; no game-rule changes. */
(function(root){
'use strict';
function viewportHeight(viewport,innerHeight){
  // Ignore pinch zoom; resizing the playfield while zooming would move the controls.
  const h=viewport&&Math.abs((viewport.scale||1)-1)<.01?viewport.height:innerHeight;
  return Number.isFinite(h)&&h>0?Math.round(h):null;
}
async function shareBackup(text,filename,env=root){
  const n=env.navigator||{};
  if(!env.isSecureContext||typeof env.File!=='function'||typeof n.canShare!=='function'||typeof n.share!=='function')return 'unsupported';
  try{
    const files=[new env.File([text],filename,{type:'application/json'})];
    if(!n.canShare({files}))return 'unsupported';
    // Invoke in the original tap, before any await, to retain user activation.
    await n.share({files});
    return 'shared';
  }catch(e){return e&&e.name==='AbortError'?'cancelled':'failed';}
}
const api={viewportHeight,shareBackup};root.KM_IPHONE=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(!root.document)return;
const doc=root.document;doc.documentElement.classList.add('iphone-safe');
let queued=false;
function sync(){queued=false;const h=viewportHeight(root.visualViewport,root.innerHeight);if(h)doc.documentElement.style.setProperty('--iphone-height',h+'px');}
function schedule(){if(queued)return;queued=true;root.requestAnimationFrame(sync);}
sync();root.addEventListener('resize',schedule);root.addEventListener('pageshow',schedule);
if(root.visualViewport)root.visualViewport.addEventListener('resize',schedule);
})(typeof window!=='undefined'?window:globalThis);
