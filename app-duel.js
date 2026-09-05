/* =========================
   Scene 1: DuelScene
   Newbie + skilled levels only.
   ========================= */
class DuelScene{
  constructor(){this.root=$('#duelScene');this.heroHP=$('#duelHeroHP');this.enemyHP=$('#duelEnemyHP');this.hero=$('#duelHeroRobot');this.enemy=$('#duelEnemyRobot');this.panel=new QuestionPanel($('#duelQuestionPanel'),(v,b)=>this.answer(v,b));this.hpHero=100;this.hpEnemy=100}
  start(){activateScene('duelScene');this.hpHero=100;this.hpEnemy=100;this.paint();this.ask()}
  paint(){this.heroHP.style.width=this.hpHero+'%';this.enemyHP.style.width=this.hpEnemy+'%'}
  ask(){if(!game.running||game.paused)return;game.phase='question';game.question=QuestionService.next();CommonUI.setMode(game.question.isReview?mode().review:'乘法');this.panel.show(game.question,`MISSION ${game.round}`,questionHint())}
  async answer(value,btn){
    if(game.phase!=='question'||game.paused)return;
    game.phase='acting';this.panel.disable();
    const ok=value===game.question.answer;
    this.panel.mark(value,game.question.answer,btn);applyAnswerScore(ok);
    if(ok){
      flashIn(this.root,'光束步槍命中！','var(--good)');
      Sound.shot(false);
      await WeaponFX.ranged(this.root,this.hero,this.enemy,false,{burst:1});
      this.hpEnemy=clamp(this.hpEnemy-(game.combo>=5?24:game.combo>=3?20:16),0,100);
      this.enemy.classList.add('hit');
    }else{
      await delay(220);await AnswerReview.show(game.question,value);if(!game.running)return;
      flashIn(this.root,'薩克機槍反擊！','var(--bad)');
      Sound.shot(true);
      await WeaponFX.ranged(this.root,this.enemy,this.hero,true,{burst:3});
      this.hpHero=clamp(this.hpHero-18,0,100);
      this.hero.classList.add('hit');
    }
    this.paint();await delay(300);
    this.hero.classList.remove('attackHero','attackEnemy','hit','weapon-recoil');
    this.enemy.classList.remove('attackHero','attackEnemy','hit','weapon-recoil');
    if(this.hpHero<=0||this.hpEnemy<=0){finish(this.hpEnemy<=0,{hero:this.hpHero});return}
    this.ask();
  }
  pauseChanged(){if(!game.paused&&game.phase==='idle')this.ask()}
}

/* =========================
   Scene 2: CampaignScene
   Sequential 1-v-5 only.
   ========================= */
class CampaignScene{
  constructor(){this.root=$('#campaignScene');this.heroHP=$('#campaignHeroHP');this.enemyHP=$('#campaignEnemyHP');this.hero=$('#campaignHeroRobot');this.enemy=$('#campaignEnemyRobot');this.enemyName=$('#campaignEnemyName');this.squad=$('#campaignSquad');this.panel=new QuestionPanel($('#campaignQuestionPanel'),(v,b)=>this.answer(v,b));this.hpHero=100;this.hpEnemy=100;this.enemyIndex=1;this.enemyTotal=5}
  start(){activateScene('campaignScene');this.hpHero=100;this.hpEnemy=100;this.enemyIndex=1;this.paint();this.ask()}
  paint(){this.heroHP.style.width=this.hpHero+'%';this.enemyHP.style.width=this.hpEnemy+'%';this.enemyName.textContent=`薩克實戰兵 ${this.enemyIndex} 號`;this.squad.innerHTML=`<span>敵軍 ${this.enemyIndex} / ${this.enemyTotal}</span>`;for(let i=1;i<=this.enemyTotal;i++){const d=document.createElement('i');d.className='zaku-dot'+(i<this.enemyIndex?' down':i===this.enemyIndex?' current':'');this.squad.appendChild(d)}}
  ask(){if(!game.running||game.paused)return;game.phase='question';game.question=QuestionService.next();CommonUI.setMode(game.question.isReview?mode().review:'乘法');this.panel.show(game.question,`實戰 ${game.stage}｜MISSION ${game.round}｜薩克 ${this.enemyIndex}/${this.enemyTotal}`,questionHint())}
  async answer(value,btn){
    if(game.phase!=='question'||game.paused)return;
    game.phase='acting';this.panel.disable();
    const ok=value===game.question.answer;
    this.panel.mark(value,game.question.answer,btn);applyAnswerScore(ok);
    if(ok){
      const melee=game.combo>=3&&game.combo%3===0;
      flashIn(this.root,melee?'光束軍刀！':'光束步槍！','var(--good)');
      Sound.shot(false);
      if(melee)await WeaponFX.melee(this.root,this.hero,this.enemy,false);
      else await WeaponFX.ranged(this.root,this.hero,this.enemy,false,{burst:1});
      this.hpEnemy=clamp(this.hpEnemy-34,0,100);
      this.enemy.classList.add('hit');
    }else{
      await delay(220);await AnswerReview.show(game.question,value);if(!game.running)return;
      const melee=game.round%4===0;
      flashIn(this.root,melee?'熱能斧反擊！':'薩克機槍反擊！','var(--bad)');
      Sound.shot(true);
      if(melee)await WeaponFX.melee(this.root,this.enemy,this.hero,true);
      else await WeaponFX.ranged(this.root,this.enemy,this.hero,true,{burst:3});
      this.hpHero=clamp(this.hpHero-12,0,100);
      this.hero.classList.add('hit');
    }
    this.paint();await delay(300);
    this.hero.classList.remove('attackHero','attackEnemy','hit','weapon-recoil');
    this.enemy.classList.remove('attackHero','attackEnemy','hit','weapon-recoil');
    if(this.hpHero<=0){finish(false,{defeated:this.enemyIndex-1,total:5});return}
    if(this.hpEnemy<=0){if(this.enemyIndex>=this.enemyTotal){finish(true,{defeated:5,total:5});return}await this.spawnNext();return}
    this.ask();
  }
  async spawnNext(){game.phase='acting';this.enemyIndex++;this.hpEnemy=100;this.paint();flashIn(this.root,'薩克增援！','var(--gold)');Sound.next();this.enemy.animate([{opacity:0,translate:'100px 0'},{opacity:1,translate:'0 0'}],{duration:430,easing:'ease-out'});await delay(450);this.ask()}
  pauseChanged(){if(!game.paused&&game.phase==='idle')this.ask()}
}
