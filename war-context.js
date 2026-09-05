/* =========================
   Scene 3: WarScene
   DCI-style turn context:
   data = Unit models
   context = WarTurnContext
   interactions = temporary attacker/target roles
   ========================= */
class WarUnit{
  constructor(side,index,name,player=false,stats={}){
    this.side=side;this.index=index;this.name=name;this.player=player;
    this.maxHp=stats.maxHp||100;this.hp=this.maxHp;
    this.attackScale=stats.attackScale||1;this.armor=stats.armor||0;this.rank=stats.rank||1;
  }
  get alive(){return this.hp>0}
}
const WarRoles={
  Attacker:{damage(attacker,target,min,max){
    const rolled=rand(min,max),powered=Math.max(1,Math.round(rolled*(attacker.attackScale||1)));
    const dmg=Math.max(1,Math.round(powered*(1-(target.armor||0))));
    target.hp=clamp(target.hp-dmg,0,target.maxHp||100);return dmg;
  }},
  Target:{alive(unit){return unit.hp>0}}
};
class WarTurnContext{
  constructor(scene,correct){this.scene=scene;this.correct=correct;this.counterScale=.25}
  allyPlans(scale=1){
    const s=this.scene;
    return s.allies.filter(x=>x.alive).map(u=>{
      const t=s.chooseEnemyTarget(u);if(!t)return null;
      const base=u.player?[36,46]:[20,29];
      return {attacker:u,target:t,min:Math.max(1,Math.round(base[0]*scale)),max:Math.max(1,Math.round(base[1]*scale)),enemyShot:false};
    }).filter(Boolean);
  }
  enemyPlans(min,max,light=false,scale=1){
    const s=this.scene;
    const scaledMin=Math.max(1,Math.round(min*scale));
    const scaledMax=Math.max(scaledMin,Math.round(max*scale));
    return s.enemies.filter(x=>x.alive).map(u=>{
      const t=s.chooseAllyTarget(light,u);return t?{attacker:u,target:t,min:scaledMin,max:scaledMax,enemyShot:true}:null;
    }).filter(Boolean);
  }
  async run(){
    const s=this.scene;
    if(this.correct){
      await s.banner('我方全機齊射！','var(--good)');
      await s.performVolley(this.allyPlans(1),'我方全機攻擊');
      if(s.enemies.some(x=>x.alive)&&s.allies[0].alive){
        await s.banner('敵軍全機反擊！｜傷害 25%','var(--bad)');
        await s.performVolley(this.enemyPlans(11,17,true,this.counterScale),'敵軍整批反擊');
      }
    }else{
      await s.banner('敵軍全機總攻擊！','var(--bad)');
      await s.performVolley(this.enemyPlans(11,17,false,1),'敵軍整批攻擊');
      if(s.allies[0].alive&&s.allies.some(x=>x.alive)&&s.enemies.some(x=>x.alive)){
        await s.banner('我方全機緊急反擊！｜傷害 25%','var(--cyan)');
        await s.performVolley(this.allyPlans(this.counterScale),'我方整批反擊');
      }
    }
  }
}
