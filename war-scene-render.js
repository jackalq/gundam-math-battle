Object.assign(WarScene.prototype,{
  enemyStats(){
    const rank=Math.max(1,game.stage);
    return {
      maxHp:Math.min(220,100+(rank-1)*12),
      attackScale:Math.min(1.90,1+(rank-1)*.08),
      armor:Math.min(.28,(rank-1)*.02),
      rank
    };
  },
  enemyStrengthText(){
    const s=this.enemyStats();
    const atk=Math.round((s.attackScale-1)*100);
    const armor=Math.round(s.armor*100);
    return `薩克 Lv.${s.rank}｜HP ${s.maxHp}｜攻擊 +${atk}%${armor?`｜裝甲 ${armor}%`:''}`;
  },
  isFrontline(u){return u.side==='ally'?u.index%2===1:u.index%2===0},
  rowOf(u){return Math.floor(u.index/2)},
  isAdjacent(attacker,target){
    return attacker.side!==target.side&&this.isFrontline(attacker)&&this.isFrontline(target)&&this.rowOf(attacker)===this.rowOf(target);
  },
  weaponFor(attacker,target){
    const melee=this.isAdjacent(attacker,target);
    if(attacker.side==='enemy')return melee?{type:'melee',name:'熱能斧'}:{type:'ranged',name:'薩克機槍'};
    return melee?{type:'melee',name:'光束軍刀'}:{type:'ranged',name:'光束步槍'};
  },
  start(){
    activateScene('warScene');
    this.allies=[
      new WarUnit('ally',0,'玩家鋼彈',true),
      new WarUnit('ally',1,'隊友 A'),
      new WarUnit('ally',2,'隊友 B'),
      new WarUnit('ally',3,'隊友 C')
    ];
    this.enemies=Array.from({length:4},(_,i)=>new WarUnit('enemy',i,`薩克 ${i+1}`,false,this.enemyStats()));
    this.render();
    this.log.textContent=`4 對 4 展開戰鬥隊形｜${this.enemyStrengthText()}｜雙方各有 2 台預備援軍`;
    this.ask();
  },
  unitMarkup(u){
    const z=u.side==='enemy';
    const role=this.isFrontline(u)?'前排':'後排';
    return `<div class="unit-name"><span class="${u.player?'you':''}">${u.player?'YOU｜':''}${u.name}${z?` <em>Lv.${u.rank}</em>`:''}</span><span>${Math.ceil(u.hp)}/${u.maxHp}</span></div>
      <div class="unit-hp"><i style="width:${(u.hp/u.maxHp)*100}%"></i></div>
      <div class="formation-role">${role}</div>
      <div class="mini-mech ${z?'zaku':'gundam'}">
        <i class="m-backpack"></i><i class="m-antenna"></i><i class="m-head"></i><i class="m-eye"></i>
        <i class="m-neck"></i><i class="m-body"></i><i class="m-core"></i>
        <i class="m-shoulder1"></i><i class="m-shoulder2"></i><i class="m-arm1"></i><i class="m-arm2"></i>
        <i class="m-shield"></i><i class="m-gun"></i><i class="m-blade"></i>
        <i class="m-skirt"></i><i class="m-leg1"></i><i class="m-leg2"></i>
        <i class="m-knee1"></i><i class="m-knee2"></i><i class="m-foot1"></i><i class="m-foot2"></i>
        <i class="m-thruster1"></i><i class="m-thruster2"></i>
      </div>`;
  },
  statusText(side){
    const list=side==='ally'?this.allies:this.enemies;
    const alive=list.filter(x=>x.alive).length;
    const reserve=this.maxUnits-list.length;
    const label=side==='ally'?'我方':'敵軍';
    return `${label} ${alive} / ${list.length}${reserve>0?`｜預備 ${reserve}`:''}`;
  },
  unitClass(u){
    const rankClass=u.side==='enemy'?(u.rank>=6?' elite':u.rank>=3?' veteran':''):'';
    return 'war-unit'+(u.player?' player':'')+(this.isFrontline(u)?' frontline':' rearline')+rankClass+(u.alive?'':' destroyed');
  },
  render(){
    this.allyForm.innerHTML='';
    this.enemyForm.innerHTML='';
    for(const u of this.allies){
      const d=document.createElement('div');
      d.className=this.unitClass(u);
      d.dataset.index=u.index;
      d.innerHTML=this.unitMarkup(u);
      this.allyForm.appendChild(d);
    }
    for(const u of this.enemies){
      const d=document.createElement('div');
      d.className=this.unitClass(u);
      d.dataset.index=u.index;
      d.innerHTML=this.unitMarkup(u);
      this.enemyForm.appendChild(d);
    }
    this.allyStatus.textContent=this.statusText('ally');
    this.enemyStatus.textContent=this.statusText('enemy');
    this.stageTitle.textContent=`戰爭 ${game.stage}｜敵 Lv.${game.stage}`;
  },
  elFor(u){return(u.side==='ally'?this.allyForm:this.enemyForm).querySelector(`[data-index="${u.index}"]`)},
  ask(){
    if(!game.running||game.paused)return;
    game.phase='question';
    game.question=QuestionService.next();
    CommonUI.setMode(game.question.isReview?mode().review:'乘法');
    const tag=`戰爭 ${game.stage}｜敵軍 Lv.${game.stage}｜MISSION ${game.round}｜我方 ${this.allies.filter(x=>x.alive).length}/${this.allies.length} VS 敵軍 ${this.enemies.filter(x=>x.alive).length}/${this.enemies.length}`;
    this.panel.show(game.question,tag,game.question.isReview?'複習題：答完後戰鬥開始。':'前排相鄰會近戰；其他位置使用遠距離武器。');
    this.overlay.classList.add('show');
    this.log.textContent='等待玩家指令…';
  },
  chooseEnemyTarget(attacker){
    const targets=this.enemies.filter(x=>x.alive);
    if(!targets.length)return null;
    const adjacent=targets.find(t=>this.isAdjacent(attacker,t));
    if(adjacent&&Math.random()<.72)return adjacent;
    const front=targets.filter(t=>this.isFrontline(t));
    return shuffle(front.length&&Math.random()<.58?front:targets)[0];
  },
  chooseAllyTarget(light=false,attacker=null){
    const alive=this.allies.filter(x=>x.alive);
    if(!alive.length)return null;
    if(attacker){
      const adjacent=alive.find(t=>this.isAdjacent(attacker,t));
      if(adjacent&&!light&&Math.random()<.68)return adjacent;
    }
    const mates=alive.filter(x=>!x.player);
    const player=this.allies[0];
    if(mates.length&&(light||Math.random()<.72))return mates[rand(0,mates.length-1)];
    return player.alive?player:(mates[0]||null);
  }
});
