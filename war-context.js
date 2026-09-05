/* =========================
   Scene 3: WarScene
   DCI-style turn context:
   data = Unit models
   context = WarTurnContext
   interactions = temporary attacker/target roles
   ========================= */
class WarUnit{
  constructor(side,index,name,player=false,stats={}){
    this.side=side;
    this.index=index;
    this.name=name;
    this.player=player;
    this.maxHp=stats.maxHp||100;
    this.hp=this.maxHp;
    this.attackScale=stats.attackScale||1;
    this.armor=stats.armor||0;
    this.rank=stats.rank||1;
  }
  get alive(){return this.hp>0}
}
const WarRoles={
  Attacker:{
    damage(attacker,target,min,max){
      const rolled=rand(min,max);
      const powered=Math.max(1,Math.round(rolled*(attacker.attackScale||1)));
      const dmg=Math.max(1,Math.round(powered*(1-(target.armor||0))));
      target.hp=clamp(target.hp-dmg,0,target.maxHp||100);
      return dmg;
    }
  },
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
        const t=s.chooseEnemyTarget(u);
        if(!t) break;
        const range=u.player?[36,46]:[20,29];
        await s.performAttack(u,t,range[0],range[1],false);
      }
      if(s.enemies.some(x=>x.alive)){
        await s.banner('敵軍壓制攻擊','var(--bad)');
        for(const u of shuffle(s.enemies.filter(x=>x.alive)).slice(0,2)){
          const t=s.chooseAllyTarget(true,u);
          if(t) await s.performAttack(u,t,8,14,true);
        }
      }
    }else{
      await s.banner('敵軍總攻擊！','var(--bad)');
      const attackers=shuffle(s.enemies.filter(x=>x.alive)).slice(0,Math.min(4,s.enemies.filter(x=>x.alive).length));
      for(const u of attackers){
        const t=s.chooseAllyTarget(false,u);
        if(t) await s.performAttack(u,t,16,27,true);
      }
      const cover=shuffle(s.allies.filter(x=>x.alive&&!x.player))[0];
      if(cover){
        const foe=s.chooseEnemyTarget(cover);
        if(foe){
          await s.banner('隊友掩護！','var(--cyan)');
          await s.performAttack(cover,foe,10,16,false);
        }
      }
    }
  }
}
