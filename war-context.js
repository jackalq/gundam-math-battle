/* =========================
   Scene 3: WarScene
   DCI-style turn context:
   data = Unit models
   context = WarTurnContext
   interactions = temporary attacker/target roles
   ========================= */
class WarUnit{
  constructor(side,index,name,player=false){this.side=side;this.index=index;this.name=name;this.player=player;this.hp=100}
  get alive(){return this.hp>0}
}
const WarRoles={
  Attacker:{damage(target,min,max){const dmg=rand(min,max);target.hp=clamp(target.hp-dmg,0,100);return dmg}},
  Target:{alive(unit){return unit.hp>0}}
};
class WarTurnContext{
  constructor(scene,correct){
    this.scene=scene;
    this.correct=correct;
  }
  async run(){
    const s=this.scene;
    if(this.correct){
      await s.banner('我方全隊攻擊！','var(--good)');
      for(const u of s.allies.filter(x=>x.alive)){
        const targets=s.enemies.filter(x=>x.alive);
        if(!targets.length) break;
        const t=targets[rand(0,targets.length-1)];
        const range=u.player?[36,46]:[20,29];
        await s.performAttack(u,t,range[0],range[1],false);
      }
      if(s.enemies.some(x=>x.alive)){
        await s.banner('敵軍壓制射擊','var(--bad)');
        for(const u of shuffle(s.enemies.filter(x=>x.alive)).slice(0,2)){
          const t=s.chooseAllyTarget(true);
          if(t) await s.performAttack(u,t,8,14,true);
        }
      }
    }else{
      await s.banner('敵軍總攻擊！','var(--bad)');
      const attackers=shuffle(s.enemies.filter(x=>x.alive)).slice(0,Math.min(4,s.enemies.filter(x=>x.alive).length));
      for(const u of attackers){
        const t=s.chooseAllyTarget(false);
        if(t) await s.performAttack(u,t,16,27,true);
      }
      const cover=shuffle(s.allies.filter(x=>x.alive&&!x.player))[0];
      const foe=shuffle(s.enemies.filter(x=>x.alive))[0];
      if(cover&&foe){
        await s.banner('隊友掩護！','var(--cyan)');
        await s.performAttack(cover,foe,10,16,false);
      }
    }
  }
}
