'use strict';
/*
 * Shared DCI layer for battle interactions.
 *
 * Data: lightweight combatant state / WarUnit models.
 * Context: DuelTurnContext, CampaignTurnContext, WarTurnContext.
 * Roles: Attacker, Target, CounterAttacker and TargetSelector.
 * Presentation: variant-specific battle presenter.
 *
 * Contexts contain the interaction order. Presenters contain theme-specific
 * wording and animation. Scenes remain responsible for DOM layout only.
 */

class CombatantState{
  constructor(hp=100){this.maxHp=hp;this.hp=hp}
  reset(){this.hp=this.maxHp}
  get alive(){return this.hp>0}
}

const BattleRoles={
  Attacker:{
    damage(attacker,target,min,max){
      const rolled=rand(min,max);
      const powered=Math.max(1,Math.round(rolled*((attacker&&attacker.attackScale)||1)));
      const armor=(target&&target.armor)||0;
      const dmg=Math.max(1,Math.round(powered*(1-armor)));
      target.hp=clamp(target.hp-dmg,0,target.maxHp||100);
      return dmg;
    },
    flatDamage(target,amount){
      const dmg=Math.max(0,Math.round(amount));
      target.hp=clamp(target.hp-dmg,0,target.maxHp||100);
      return dmg;
    }
  },
  Target:{
    alive(target){return !!target&&target.hp>0}
  },
  CounterAttacker:{
    scaleRange(min,max,scale=.25){
      const scaledMin=Math.max(1,Math.round(min*scale));
      return [scaledMin,Math.max(scaledMin,Math.round(max*scale))];
    }
  }
};

class MechaBattlePresenter{
  async duelAttack(scene,enemy=false){
    flashIn(scene.root,enemy?'薩克機槍反擊！':'光束步槍命中！',enemy?'var(--bad)':'var(--good)');
    Sound.shot(enemy);
    await WeaponFX.ranged(scene.root,enemy?scene.enemy:scene.hero,enemy?scene.hero:scene.enemy,enemy,{burst:enemy?3:1});
  }
  campaignWeapon(correct){
    if(correct){
      const melee=game.combo>=3&&game.combo%3===0;
      return melee?{type:'melee',name:'光束軍刀'}:{type:'ranged',name:'光束步槍'};
    }
    const melee=game.round%4===0;
    return melee?{type:'melee',name:'熱能斧'}:{type:'ranged',name:'薩克機槍'};
  }
  async campaignAttack(scene,correct){
    const weapon=this.campaignWeapon(correct),enemy=!correct;
    flashIn(scene.root,`${weapon.name}${enemy?'反擊！':'！'}`,enemy?'var(--bad)':'var(--good)');
    Sound.shot(enemy);
    if(weapon.type==='melee')await WeaponFX.melee(scene.root,enemy?scene.enemy:scene.hero,enemy?scene.hero:scene.enemy,enemy);
    else await WeaponFX.ranged(scene.root,enemy?scene.enemy:scene.hero,enemy?scene.hero:scene.enemy,enemy,{burst:enemy?3:1});
    return weapon;
  }
  warWeapon(scene,attacker,target){
    const melee=scene.isAdjacent(attacker,target);
    if(attacker.side==='enemy')return melee?{type:'melee',name:'熱能斧'}:{type:'ranged',name:'薩克機槍'};
    return melee?{type:'melee',name:'光束軍刀'}:{type:'ranged',name:'光束步槍'};
  }
  async warAnimate(scene,plan){
    const {attacker,target,enemyShot,weapon}=plan,a=scene.elFor(attacker),t=scene.elFor(target);
    if(!a||!t)return;
    a.classList.add(weapon.type==='melee'?'using-melee':'using-ranged');
    if(weapon.type==='melee')await WeaponFX.melee(scene.field,a,t,enemyShot);
    else{
      a.classList.add('firing');
      await WeaponFX.ranged(scene.field,a,t,enemyShot,{burst:enemyShot?3:1});
    }
  }
}

/*
 * Blocks starts with the same combat timing while its art/gameplay is being
 * introduced. New block-specific weapons and animations override only this
 * presenter instead of cloning Duel/Campaign/War contexts.
 */
class BlocksBattlePresenter extends MechaBattlePresenter{}

const BattlePresentation=(()=>{
  const presenters={mecha:new MechaBattlePresenter(),blocks:new BlocksBattlePresenter()};
  return {
    current(){
      const id=(window.GameVariant&&window.GameVariant.id)||'mecha';
      return presenters[id]||presenters.mecha;
    },
    for(id){return presenters[id]||presenters.mecha}
  };
})();

class DuelTurnContext{
  constructor(scene,correct,selected){
    this.scene=scene;this.correct=correct;this.selected=selected;this.presenter=BattlePresentation.current();
  }
  async run(){
    const s=this.scene;
    if(this.correct){
      await this.presenter.duelAttack(s,false);
      const damage=game.combo>=5?24:game.combo>=3?20:16;
      BattleRoles.Attacker.flatDamage(s.enemyState,damage);
      s.enemy.classList.add('hit');
      return;
    }
    await delay(220);
    await AnswerReview.show(game.question,this.selected);
    if(!game.running)return;
    await this.presenter.duelAttack(s,true);
    BattleRoles.Attacker.flatDamage(s.heroState,18);
    s.hero.classList.add('hit');
  }
}

class CampaignTurnContext{
  constructor(scene,correct,selected){
    this.scene=scene;this.correct=correct;this.selected=selected;this.presenter=BattlePresentation.current();
  }
  async run(){
    const s=this.scene;
    if(this.correct){
      await this.presenter.campaignAttack(s,true);
      BattleRoles.Attacker.flatDamage(s.enemyState,34);
      s.enemy.classList.add('hit');
      return;
    }
    await delay(220);
    await AnswerReview.show(game.question,this.selected);
    if(!game.running)return;
    await this.presenter.campaignAttack(s,false);
    BattleRoles.Attacker.flatDamage(s.heroState,12);
    s.hero.classList.add('hit');
  }
}
