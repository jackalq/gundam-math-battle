Object.assign(WarScene.prototype,{
  async banner(text,color){
    this.bannerEl.textContent=text;
    this.bannerEl.style.color=color;
    this.bannerEl.classList.remove('show');
    void this.bannerEl.offsetWidth;
    this.bannerEl.classList.add('show');
    this.log.textContent=text;
    await delay(650);
  },
  async performAttack(attacker,target,min,max,enemyShot){
    if(!WarRoles.Target.alive(attacker)||!WarRoles.Target.alive(target))return;
    const a=this.elFor(attacker),t=this.elFor(target);
    if(!a||!t)return;
    const weapon=this.weaponFor(attacker,target);
    a.classList.add(weapon.type==='melee'?'using-melee':'using-ranged');
    this.log.textContent=`${attacker.name} 使用 ${weapon.name} → ${target.name}`;
    Sound.shot(enemyShot);
    if(weapon.type==='melee'){
      await this.meleeStrike(a,t,enemyShot);
    }else{
      a.classList.add('firing');
      await this.projectile(a,t,enemyShot);
    }
    const dmg=WarRoles.Attacker.damage(attacker,target,min,max);
    this.log.textContent=`${attacker.name}【${weapon.name}】→ ${target.name}　-${dmg} HP`;
    t.classList.add('unit-hit');
    this.updateOne(target);
    await this.explode(t,target.hp<=0);
    await delay(190);
    a.classList.remove('firing','using-melee','using-ranged');
    t.classList.remove('unit-hit');
    if(target.hp<=0){
      this.log.textContent=`${target.name} 被擊破！`;
      await delay(240);
    }
  },
  updateOne(u){
    const e=this.elFor(u);
    if(!e)return;
    const hp=e.querySelector('.unit-hp i'),n=e.querySelector('.unit-name span:last-child');
    hp.style.width=((u.hp/u.maxHp)*100)+'%';
    n.textContent=`${Math.ceil(u.hp)}/${u.maxHp}`;
    if(u.hp<=0)e.classList.add('destroyed');
  },
  projectile(from,to,enemyShot){
    return new Promise(resolve=>{
      const fr=this.field.getBoundingClientRect(),a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
      const p=document.createElement('i');
      p.className='war-projectile'+(enemyShot?' enemy-shot':'');
      const sx=a.left+a.width/2-fr.left,sy=a.top+a.height*.53-fr.top,ex=b.left+b.width/2-fr.left,ey=b.top+b.height*.53-fr.top;
      p.style.left=sx+'px';
      p.style.top=sy+'px';
      this.field.appendChild(p);
      const anim=p.animate([{transform:'translate(0,0) scaleX(.7)',opacity:.2},{transform:`translate(${ex-sx}px,${ey-sy}px) scaleX(1.4)`,opacity:1}],{duration:280,easing:'ease-in'});
      anim.onfinish=()=>{p.remove();resolve()};
    });
  },
  async meleeStrike(from,to,enemy){
    const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
    const dx=(b.left+b.width/2-(a.left+a.width/2))*.56;
    const dy=(b.top+b.height/2-(a.top+a.height/2))*.56;
    const anim=from.animate([
      {transform:'translate(0,0) scale(1)'},
      {transform:`translate(${dx}px,${dy}px) scale(1.08)`,offset:.46},
      {transform:`translate(${dx*.92}px,${dy*.92}px) scale(1.12)`,offset:.60},
      {transform:'translate(0,0) scale(1)'}
    ],{duration:620,easing:'cubic-bezier(.2,.85,.25,1)'});
    await delay(265);
    await this.slash(to,enemy);
    await anim.finished.catch(()=>{});
  },
  slash(target,enemy=false){
    return new Promise(resolve=>{
      const fr=this.field.getBoundingClientRect(),r=target.getBoundingClientRect(),s=document.createElement('i');
      s.className='war-slash'+(enemy?' enemy-slash':'');
      s.style.left=(r.left+r.width/2-fr.left-5)+'px';
      s.style.top=(r.top+r.height/2-fr.top-36)+'px';
      this.field.appendChild(s);
      const anim=s.animate([
        {transform:'rotate(-48deg) scaleY(.15)',opacity:0},
        {transform:'rotate(38deg) scaleY(1.15)',opacity:1},
        {transform:'rotate(62deg) scaleY(1.35)',opacity:0}
      ],{duration:240,easing:'ease-out'});
      anim.onfinish=()=>{s.remove();resolve()};
    });
  },
  explode(target,big=false){
    return new Promise(resolve=>{
      const fr=this.field.getBoundingClientRect(),r=target.getBoundingClientRect(),e=document.createElement('i');
      e.className='explosion';
      e.style.left=(r.left+r.width/2-fr.left-9)+'px';
      e.style.top=(r.top+r.height/2-fr.top-9)+'px';
      this.field.appendChild(e);
      const anim=e.animate([{transform:'scale(.2)',opacity:0},{transform:`scale(${big?3.3:1.8})`,opacity:1},{transform:`scale(${big?4.6:2.5})`,opacity:0}],{duration:big?520:330,easing:'ease-out'});
      anim.onfinish=()=>{e.remove();resolve()};
    });
  },
  pauseChanged(){
    if(game.paused)this.overlay.classList.remove('show');
    else if(game.phase==='question')this.overlay.classList.add('show');
  }
});
