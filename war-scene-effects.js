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
      await WeaponFX.melee(this.field,a,t,enemyShot);
    }else{
      a.classList.add('firing');
      await WeaponFX.ranged(this.field,a,t,enemyShot,{burst:enemyShot?3:1});
    }

    const dmg=WarRoles.Attacker.damage(attacker,target,min,max);
    this.log.textContent=`${attacker.name}【${weapon.name}】→ ${target.name}　-${dmg} HP`;
    t.classList.add('unit-hit');
    this.updateOne(target);
    await this.explode(t,target.hp<=0);
    await delay(190);
    a.classList.remove('firing','using-melee','using-ranged','weapon-recoil');
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
