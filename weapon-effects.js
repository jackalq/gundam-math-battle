'use strict';
const WeaponFX=(()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const poseClasses=['sprite-aim','sprite-fire','sprite-melee','sprite-hit'];
  function visual(node){return node?.matches?.('.robot')?node:(node?.querySelector?.('.robot')||node)}
  function pose(node,state){const v=visual(node);if(!v)return;v.classList.remove(...poseClasses);if(state)v.classList.add('sprite-'+state)}
  function clearPose(node){const v=visual(node);if(v)v.classList.remove(...poseClasses)}
  function point(root,node,nodeIsEnemy=false){
    const v=visual(node),rr=root.getBoundingClientRect(),r=v.getBoundingClientRect();
    return {x:(r.left+r.width*(nodeIsEnemy?.28:.72))-rr.left,y:(r.top+r.height*.55)-rr.top};
  }
  function el(root,cls,x,y){const n=document.createElement('i');n.className=cls;n.style.left=x+'px';n.style.top=y+'px';root.appendChild(n);return n}
  function muzzle(root,node,enemy=false){const p=point(root,node,enemy),m=el(root,'weapon-muzzle'+(enemy?' enemy':''),p.x,p.y);setTimeout(()=>m.remove(),210)}
  function impact(root,node,enemy=false){const p=point(root,node,!enemy),m=el(root,'weapon-impact'+(enemy?' enemy':''),p.x,p.y);pose(node,'hit');setTimeout(()=>{m.remove();clearPose(node)},280)}
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
    const fv=visual(from),tv=visual(to),fr=fv.getBoundingClientRect(),tr=tv.getBoundingClientRect();
    const dx=(tr.left+tr.width/2-(fr.left+fr.width/2))*.44,dy=(tr.top+tr.height/2-(fr.top+fr.height/2))*.32;
    pose(from,'melee');
    const rp=root.getBoundingClientRect(),blade=el(root,enemy?'weapon-axe':'weapon-saber',fr.left+fr.width/2-rp.left,fr.top+fr.height*.58-rp.top);
    const move=from.animate([{translate:'0 0'},{translate:`${dx}px ${dy}px`,offset:.45},{translate:`${dx}px ${dy}px`,offset:.68},{translate:'0 0'}],{duration:620,easing:'cubic-bezier(.2,.85,.25,1)'});
    await wait(235);
    const p=point(root,to,!enemy),slash=el(root,'weapon-slash'+(enemy?' enemy':''),p.x,p.y);
    slash.style.rotate=(enemy?35:-35)+'deg';
    impact(root,to,enemy);
    setTimeout(()=>slash.remove(),320);setTimeout(()=>blade.remove(),380);
    await move.finished.catch(()=>{});clearPose(from)
  }
  return{ranged,melee,impact,pose,clearPose};
})();
