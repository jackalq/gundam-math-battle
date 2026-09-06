Object.assign(WarScene.prototype,{
  async banner(text,color){
    this.bannerEl.textContent=text;this.bannerEl.style.color=color;
    this.bannerEl.classList.remove('show');void this.bannerEl.offsetWidth;this.bannerEl.classList.add('show');
    this.log.textContent=text;await delay(560);
  },
  attackPlan(attacker,target,min,max,enemyShot,weapon=null){
    const presenter=BattlePresentation.current();
    return {attacker,target,min,max,enemyShot,weapon:weapon||presenter.warWeapon(this,attacker,target)};
  },
  async animateAttackPlan(plan){
    return BattlePresentation.current().warAnimate(this,plan);
  },
  async performVolley(plans,label='全機攻擊'){
    const active=plans
      .filter(p=>p&&WarRoles.Target.alive(p.attacker)&&WarRoles.Target.alive(p.target))
      .map(p=>this.attackPlan(p.attacker,p.target,p.min,p.max,p.enemyShot,p.weapon));
    if(!active.length)return;
    const enemyVolley=active.every(p=>p.enemyShot);
    this.field.classList.add(enemyVolley?'enemy-volley':'ally-volley');
    this.log.textContent=`${label}｜${active.length} 機同時出手`;
    Sound.shot(enemyVolley);

    // Every plan is locked before animation so the whole formation acts at once.
    await Promise.all(active.map(p=>this.animateAttackPlan(p)));

    const targetSummary=new Map();
    for(const p of active){
      const dmg=WarRoles.Attacker.damage(p.attacker,p.target,p.min,p.max);
      const old=targetSummary.get(p.target)||{damage:0,hits:0};old.damage+=dmg;old.hits++;targetSummary.set(p.target,old);
    }
    const impacted=[...targetSummary.keys()];
    for(const t of impacted){const e=this.elFor(t);if(e){e.classList.add('unit-hit');this.updateOne(t)}}
    await Promise.all(impacted.map(t=>{const e=this.elFor(t);return e?this.explode(e,!WarRoles.Target.alive(t)):Promise.resolve()}));
    await delay(170);

    for(const p of active){const a=this.elFor(p.attacker);if(a)a.classList.remove('firing','using-melee','using-ranged','weapon-recoil')}
    for(const t of impacted){const e=this.elFor(t);if(e)e.classList.remove('unit-hit')}
    this.field.classList.remove('enemy-volley','ally-volley');

    const down=impacted.filter(t=>!WarRoles.Target.alive(t)),total=[...targetSummary.values()].reduce((n,x)=>n+x.damage,0);
    this.log.textContent=down.length?`${label}完成｜總傷害 ${total}｜擊破 ${down.map(x=>x.name).join('、')}`:`${label}完成｜總傷害 ${total}`;
    if(down.length)await delay(230);
  },
  async performAttack(attacker,target,min,max,enemyShot){
    return this.performVolley([{attacker,target,min,max,enemyShot}],`${attacker.name} 攻擊`);
  },
  updateOne(u){
    const e=this.elFor(u);if(!e)return;
    const hp=e.querySelector('.unit-hp i'),n=e.querySelector('.unit-name span:last-child');
    if(hp)hp.style.width=((u.hp/u.maxHp)*100)+'%';if(n)n.textContent=`${Math.ceil(u.hp)}/${u.maxHp}`;
    if(!WarRoles.Target.alive(u))e.classList.add('destroyed');
  },
  explode(target,big=false){
    return new Promise(resolve=>{
      const fr=this.field.getBoundingClientRect(),r=target.getBoundingClientRect(),e=document.createElement('i');
      e.className='explosion';e.style.left=(r.left+r.width/2-fr.left-9)+'px';e.style.top=(r.top+r.height/2-fr.top-9)+'px';this.field.appendChild(e);
      const anim=e.animate([{transform:'scale(.2)',opacity:0},{transform:`scale(${big?3.3:1.8})`,opacity:1},{transform:`scale(${big?4.6:2.5})`,opacity:0}],{duration:big?520:330,easing:'ease-out'});
      anim.onfinish=()=>{e.remove();resolve()};
    });
  },
  pauseChanged(){if(game.paused)this.overlay.classList.remove('show');else if(game.phase==='question')this.overlay.classList.add('show')}
});
