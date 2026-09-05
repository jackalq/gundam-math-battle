'use strict';
const WeaponFX=(()=>{
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  function point(root,node,nodeIsEnemy=false){
    const rr=root.getBoundingClientRect(),r=node.getBoundingClientRect();
    return {
      x:(r.left+r.width*(nodeIsEnemy ? .28 : .72))-rr.left,
      y:(r.top+r.height*.54)-rr.top
    };
  }
  function el(root,cls,x,y){
    const n=document.createElement('i');n.className=cls;n.style.left=x+'px';n.style.top=y+'px';root.appendChild(n);return n;
  }
  function muzzle(root,node,enemy=false){
    const p=point(root,node,enemy),m=el(root,'weapon-muzzle'+(enemy?' enemy':''),p.x,p.y);
    m.animate([{transform:'translate(-50%,-50%) scale(.25)',opacity:0},{transform:'translate(-50%,-50%) scale(1.4)',opacity:1},{transform:'translate(-50%,-50%) scale(.4)',opacity:0}],{duration:150,easing:'ease-out'}).onfinish=()=>m.remove();
  }
  function impact(root,node,enemy=false){
    const p=point(root,node,!enemy),m=el(root,'weapon-impact'+(enemy?' enemy':''),p.x,p.y);
    m.animate([{transform:'translate(-50%,-50%) scale(.2) rotate(0deg)',opacity:0},{transform:'translate(-50%,-50%) scale(1.25) rotate(65deg)',opacity:1},{transform:'translate(-50%,-50%) scale(1.8) rotate(115deg)',opacity:0}],{duration:230,easing:'ease-out'}).onfinish=()=>m.remove();
  }
  function shot(root,from,to,enemy=false,bullet=false){
    return new Promise(resolve=>{
      const a=point(root,from,enemy),b=point(root,to,!enemy),dx=b.x-a.x,dy=b.y-a.y;
      const ang=Math.atan2(dy,dx)*180/Math.PI;
      const p=el(root,(bullet?'weapon-bullet':'weapon-beam')+(enemy?' enemy':''),a.x,a.y);
      p.style.transform=`translate(-50%,-50%) rotate(${ang}deg)`;
      const anim=p.animate([
        {translate:'0 0',opacity:.25},
        {translate:`${dx*.52}px ${dy*.52}px`,opacity:1,offset:.55},
        {translate:`${dx}px ${dy}px`,opacity:1}
      ],{duration:bullet?155:245,easing:'linear'});
      anim.onfinish=()=>{p.remove();resolve()};
    });
  }
  async function ranged(root,from,to,enemy=false,{burst=1}={}){
    if(!root||!from||!to)return;
    from.classList.add('weapon-recoil');
    const n=Math.max(1,burst);
    for(let i=0;i<n;i++){
      muzzle(root,from,enemy);
      await shot(root,from,to,enemy,enemy);
      if(i<n-1)await wait(45);
    }
    impact(root,to,enemy);
    await wait(150);
    from.classList.remove('weapon-recoil');
  }
  async function melee(root,from,to,enemy=false){
    if(!root||!from||!to)return;
    const fr=from.getBoundingClientRect(),tr=to.getBoundingClientRect();
    const dx=(tr.left+tr.width/2-(fr.left+fr.width/2))*.43;
    const dy=(tr.top+tr.height/2-(fr.top+fr.height/2))*.32;
    const blade=el(root,enemy?'weapon-axe':'weapon-saber',0,0);
    const rp=root.getBoundingClientRect();
    blade.style.left=(fr.left+fr.width/2-rp.left)+'px';
    blade.style.top=(fr.top+fr.height*.55-rp.top)+'px';
    const move=from.animate([
      {translate:'0 0'},
      {translate:`${dx}px ${dy}px`,offset:.46},
      {translate:`${dx}px ${dy}px`,offset:.66},
      {translate:'0 0'}
    ],{duration:620,easing:'cubic-bezier(.2,.85,.25,1)'});
    const slashAt=point(root,to,!enemy);
    await wait(245);
    const slash=el(root,'weapon-slash'+(enemy?' enemy':''),slashAt.x,slashAt.y);
    slash.animate([
      {transform:'translate(-50%,-50%) rotate(-58deg) scaleY(.15)',opacity:0},
      {transform:'translate(-50%,-50%) rotate(20deg) scaleY(1.2)',opacity:1},
      {transform:'translate(-50%,-50%) rotate(72deg) scaleY(1.45)',opacity:0}
    ],{duration:270,easing:'ease-out'}).onfinish=()=>slash.remove();
    blade.animate([
      {transform:`translate(-50%,-50%) rotate(${enemy?-135:-35}deg) scaleY(.25)`,opacity:0},
      {transform:`translate(-50%,-50%) rotate(${enemy?-50:50}deg) scaleY(1.15)`,opacity:1},
      {transform:`translate(-50%,-50%) rotate(${enemy?15:110}deg) scaleY(.7)`,opacity:0}
    ],{duration:330,easing:'ease-out'}).onfinish=()=>blade.remove();
    impact(root,to,enemy);
    await move.finished.catch(()=>{});
  }
  return{ranged,melee,impact};
})();
