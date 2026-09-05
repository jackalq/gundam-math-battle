'use strict';
const WeaponFX=(()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const poseClasses=['sprite-aim','sprite-fire','sprite-melee','sprite-hit','sprite-melee-ready','sprite-melee-strike'];
  function visual(node){return node?.matches?.('.robot')?node:(node?.querySelector?.('.robot')||node)}
  function pose(node,state){const v=visual(node);if(!v)return;v.classList.remove(...poseClasses);if(state)v.classList.add('sprite-'+state)}
  function clearPose(node){const v=visual(node);if(v)v.classList.remove(...poseClasses)}
  function point(root,node,nodeIsEnemy=false){
    const v=visual(node),rr=root.getBoundingClientRect(),r=v.getBoundingClientRect();
    return {x:(r.left+r.width*(nodeIsEnemy?.28:.72))-rr.left,y:(r.top+r.height*.55)-rr.top};
  }
  function el(root,cls,x,y){const n=document.createElement('i');n.className=cls;n.style.left=x+'px';n.style.top=y+'px';root.appendChild(n);return n}
  function attach(node,cls,left,top){const v=visual(node);if(!v)return null;const n=document.createElement('i');n.className=cls;n.style.left=left;n.style.top=top;v.appendChild(n);return n}
  function muzzle(root,node,enemy=false){const p=point(root,node,enemy),m=el(root,'weapon-muzzle'+(enemy?' enemy':''),p.x,p.y);setTimeout(()=>m.remove(),210)}
  function impact(root,node,enemy=false){const p=point(root,node,!enemy),m=el(root,'weapon-impact'+(enemy?' enemy':''),p.x,p.y);pose(node,'hit');setTimeout(()=>{m.remove();clearPose(node)},280)}
  function dashSmoke(root,node,enemy=false){
    const v=visual(node),rr=root.getBoundingClientRect(),r=v.getBoundingClientRect();
    const x=(r.left+r.width*(enemy?.72:.28))-rr.left,y=(r.bottom-r.height*.12)-rr.top;
    const s=el(root,'weapon-dash-smoke'+(enemy?' enemy':''),x,y);setTimeout(()=>s.remove(),360)
  }
  function contactFlash(root,node,enemy=false){
    const p=point(root,node,!enemy),f=el(root,'weapon-contact-flash'+(enemy?' enemy':''),p.x,p.y);setTimeout(()=>f.remove(),260)
  }
  function shot(root,from,to,enemy=false,bullet=false){
    return new Promise(resolve=>{
      const a=point(root,from,enemy),b=point(root,to,!enemy),dx=b.x-a.x,dy=b.y-a.y,ang=Math.atan2(dy,dx)*180/Math.PI;
      const p=el(root,(bullet?'weapon-bullet':'weapon-beam')+(enemy?' enemy':''),a.x,a.y);
      p.style.rotate=ang+'deg';
      const anim=p.animate([{translate:'0 0',opacity:.3},{translate:`${dx*.52}px ${dy*.52}px`,opacity:1,offset:.55},{translate:`${dx}px ${dy}px`,opacity:1}],{duration:bullet?155:245,easing:'linear'});
      anim.onfinish=()=>{p.remove();resolve()};
    });
  }
  async function ranged(root,from,to,enemy=false,{burst=1}={}){
    if(!root||!from||!to)return;
    pose(from,'aim');from.classList.add('weapon-recoil');await wait(75);pose(from,'fire');
    const n=Math.max(1,burst);
    for(let i=0;i<n;i++){muzzle(root,from,enemy);await shot(root,from,to,enemy,enemy);if(i<n-1)await wait(35)}
    impact(root,to,enemy);await wait(120);from.classList.remove('weapon-recoil');clearPose(from)
  }
  async function melee(root,from,to,enemy=false){
    if(!root||!from||!to)return;
    const fv=visual(from),tv=visual(to);if(!fv||!tv)return;
    const fr=fv.getBoundingClientRect(),tr=tv.getBoundingClientRect();
    const fc={x:fr.left+fr.width/2,y:fr.top+fr.height/2},tc={x:tr.left+tr.width/2,y:tr.top+tr.height/2};
    const dir=tc.x>=fc.x?1:-1;
    const stopGap=Math.max(18,(fr.width+tr.width)*.22);
    const travelX=(tc.x-fc.x)-dir*stopGap;
    const travelY=(tc.y-fc.y)*.55;

    pose(from,'melee-ready');
    const blade=attach(from,enemy?'weapon-axe attached':'weapon-saber attached',enemy?'26%':'74%','55%');
    if(blade){
      blade.style.setProperty('--weapon-facing',dir);
      blade.animate([
        {transform:`translate(-50%,-78%) rotate(${enemy?-125:-28}deg) scaleY(.05)`,opacity:0},
        {transform:`translate(-50%,-78%) rotate(${enemy?-105:-12}deg) scaleY(1)`,opacity:1}
      ],{duration:180,easing:'cubic-bezier(.2,.9,.2,1)',fill:'forwards'});
    }
    await wait(135);

    dashSmoke(root,from,enemy);
    const dash=fv.animate([
      {translate:'0 0',scale:1,filter:'brightness(1)'},
      {translate:`${travelX*.22}px ${travelY*.22}px`,scale:1.03,offset:.24},
      {translate:`${travelX*.84}px ${travelY*.84}px`,scale:1.08,filter:'brightness(1.18)',offset:.72},
      {translate:`${travelX}px ${travelY}px`,scale:1.08,filter:'brightness(1.12)'}
    ],{duration:310,easing:'cubic-bezier(.12,.8,.2,1)',fill:'forwards'});
    await dash.finished.catch(()=>{});

    pose(from,'melee-strike');
    const swing=blade?blade.animate([
      {transform:`translate(-50%,-78%) rotate(${enemy?-110:-18}deg) scaleY(1)`},
      {transform:`translate(-50%,-78%) rotate(${enemy?-35:58}deg) scaleY(1.08)`,offset:.52},
      {transform:`translate(-50%,-78%) rotate(${enemy?8:105}deg) scaleY(.94)`}
    ],{duration:270,easing:'cubic-bezier(.15,.85,.18,1)',fill:'forwards'}):Promise.resolve();

    await wait(75);
    const p=point(root,to,!enemy);
    const slash1=el(root,'weapon-slash close'+(enemy?' enemy':''),p.x,p.y);
    slash1.style.rotate=(enemy?32:-32)+'deg';
    const slash2=el(root,'weapon-slash close secondary'+(enemy?' enemy':''),p.x+dir*7,p.y-5);
    slash2.style.rotate=(enemy?-18:18)+'deg';
    contactFlash(root,to,enemy);
    impact(root,to,enemy);
    setTimeout(()=>slash1.remove(),360);setTimeout(()=>slash2.remove(),300);
    await (swing.finished?swing.finished.catch(()=>{}):swing);
    await wait(65);

    pose(from,'melee');
    const retreat=fv.animate([
      {translate:`${travelX}px ${travelY}px`,scale:1.06},
      {translate:`${travelX*.35}px ${travelY*.35}px`,scale:1.02,offset:.58},
      {translate:'0 0',scale:1}
    ],{duration:300,easing:'cubic-bezier(.35,.02,.45,1)',fill:'forwards'});
    await retreat.finished.catch(()=>{});
    if(blade)blade.remove();
    fv.getAnimations().forEach(a=>{if(a.playState==='finished')a.cancel()});
    clearPose(from)
  }
  return{ranged,melee,impact,pose,clearPose};
})();
