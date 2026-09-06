/* =========================
   Scene 3: WarScene
   DCI turn context:
   data = WarUnit models
   context = WarTurnContext
   roles = attacker / target / counter-attacker / target-selector / weapon-user
   presentation = variant battle presenter
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
  Attacker:{
    damage(attacker,target,min,max){return BattleRoles.Attacker.damage(attacker,target,min,max)},
    plan(context,attacker,target,min,max,enemyShot){
      if(!attacker||!target)return null;
      return {attacker,target,min,max,enemyShot,weapon:WarRoles.WeaponUser.select(context,attacker,target)};
    }
  },
  Target:BattleRoles.Target,
  CounterAttacker:BattleRoles.CounterAttacker,
  TargetSelector:{
    enemy(context,attacker){
      const s=context.scene,targets=s.enemies.filter(WarRoles.Target.alive);
      if(!targets.length)return null;
      const adjacent=targets.find(t=>s.isAdjacent(attacker,t));
      if(adjacent&&Math.random()<.72)return adjacent;
      const front=targets.filter(t=>s.isFrontline(t));
      return shuffle(front.length&&Math.random()<.58?front:targets)[0];
    },
    ally(context,attacker,light=false){
      const s=context.scene,alive=s.allies.filter(WarRoles.Target.alive);
      if(!alive.length)return null;
      if(attacker){
        const adjacent=alive.find(t=>s.isAdjacent(attacker,t));
        if(adjacent&&!light&&Math.random()<.68)return adjacent;
      }
      const mates=alive.filter(x=>!x.player),player=s.allies[0];
      if(mates.length&&(light||Math.random()<.72))return mates[rand(0,mates.length-1)];
      return WarRoles.Target.alive(player)?player:(mates[0]||null);
    }
  },
  WeaponUser:{
    select(context,attacker,target){return context.presenter.warWeapon(context.scene,attacker,target)}
  }
};

class WarTurnContext{
  constructor(scene,correct){
    this.scene=scene;this.correct=correct;this.counterScale=.25;this.presenter=BattlePresentation.current();
  }
  allyPlans(scale=1){
    const s=this.scene;
    return s.allies.filter(WarRoles.Target.alive).map(u=>{
      const t=WarRoles.TargetSelector.enemy(this,u);if(!t)return null;
      const base=u.player?[36,46]:[20,29];
      const min=Math.max(1,Math.round(base[0]*scale)),max=Math.max(1,Math.round(base[1]*scale));
      return WarRoles.Attacker.plan(this,u,t,min,max,false);
    }).filter(Boolean);
  }
  enemyPlans(min,max,light=false,scale=1){
    const s=this.scene,[scaledMin,scaledMax]=scale===1?[min,max]:WarRoles.CounterAttacker.scaleRange(min,max,scale);
    return s.enemies.filter(WarRoles.Target.alive).map(u=>{
      const t=WarRoles.TargetSelector.ally(this,u,light);
      return t?WarRoles.Attacker.plan(this,u,t,scaledMin,scaledMax,true):null;
    }).filter(Boolean);
  }
  async run(){
    const s=this.scene;
    if(this.correct){
      await s.banner('我方全機齊射！','var(--good)');
      await s.performVolley(this.allyPlans(1),'我方全機攻擊');
      if(s.enemies.some(WarRoles.Target.alive)&&WarRoles.Target.alive(s.allies[0])){
        await s.banner('敵軍全機反擊！｜傷害 25%','var(--bad)');
        await s.performVolley(this.enemyPlans(11,17,true,this.counterScale),'敵軍整批反擊');
      }
    }else{
      await s.banner('敵軍全機總攻擊！','var(--bad)');
      await s.performVolley(this.enemyPlans(11,17,false,1),'敵軍整批攻擊');
      if(WarRoles.Target.alive(s.allies[0])&&s.allies.some(WarRoles.Target.alive)&&s.enemies.some(WarRoles.Target.alive)){
        await s.banner('我方全機緊急反擊！｜傷害 25%','var(--cyan)');
        await s.performVolley(this.allyPlans(this.counterScale),'我方整批反擊');
      }
    }
  }
}
