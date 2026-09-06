'use strict';
(async()=>{
  window.GameVariant={id:'mecha',brand:'機甲',title:'機甲九九大作戰',short_name:'機甲九九'};
  try{
    const response=await fetch('./variant.json',{cache:'no-store'});
    if(response.ok)window.GameVariant={...window.GameVariant,...await response.json()};
  }catch{}

  const scripts=[
    'core-domain.js','core-questions.js','core-ui.js','weapon-effects.js','battle-dci.js','app-duel.js',
    'war-context.js','war-scene-core.js','war-scene-render.js','war-scene-turn.js','war-scene-effects.js','app-ui.js','pwa.js'
  ];
  for(const src of scripts){
    await new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src='./'+src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
    });
  }
})().catch(console.error);
