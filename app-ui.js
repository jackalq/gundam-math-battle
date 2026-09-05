const scenes={duel:new DuelScene(),campaign:new CampaignScene(),war:new WarScene()};
function currentScene(){return game.level==='war'?scenes.war:game.level==='battle'?scenes.campaign:scenes.duel}

function resetSession(){AnswerReview.cancel();game.running=true;game.paused=false;game.score=0;game.combo=0;game.correctCount=0;game.round=0;game.question=null;game.phase='idle';CommonUI.update();$('#pauseBtn').textContent='暫停';$('#startOverlay').classList.add('hidden');$('#endOverlay').classList.add('hidden');currentScene().start()}
function finish(victory,data={}){
  AnswerReview.cancel();game.running=false;game.phase='ended';game.question=null;
  const title=$('#endTitle'),text=$('#endText'),next=$('#nextBtn');
  if(game.level==='war'){
    const nextRank=game.stage+1;
    if(victory){
      title.textContent='戰爭任務勝利！';
      text.innerHTML=`我方存活 <b>${data.alliesLeft} / 6</b> 台，敵軍 6 台全部擊破。<br>本關薩克強度 <b>Lv.${game.stage}</b>。下一關將提升到 <b>Lv.${nextRank}</b>。<br>本次答對 <b>${game.correctCount}</b> 題，得到 <b>${game.score}</b> 分。<br>九九熟練度：<b>${masteryCount()} / 81</b>。`;
    }else{
      title.textContent='玩家機撤退！';
      text.innerHTML=`玩家鋼彈被擊破。本次已擊破 <b>${data.enemyDown||0} / 6</b> 隻薩克。<br>敵軍強度：<b>Lv.${game.stage}</b>。<br>答對 <b>${game.correctCount}</b> 題。九九熟練度：<b>${masteryCount()} / 81</b>。`;
    }
    next.textContent=`下一關（戰爭 ${game.stage+1}）`;
  }else if(game.level==='battle'){
    title.textContent=victory?'實戰任務完成！':'整備後再出擊！';
    text.innerHTML=victory?`成功連續擊破 <b>5</b> 隻薩克。<br>本次答對 <b>${game.correctCount}</b> 題，得到 <b>${game.score}</b> 分。`:`本次已擊破 <b>${data.defeated||0} / 5</b> 隻薩克。<br>答對 <b>${game.correctCount}</b> 題。`;
    next.textContent='下一關（進入戰爭模式）';
  }else{
    title.textContent=victory?'薩克擊破！':'整備後再出擊！';
    text.innerHTML=`本次答對 <b>${game.correctCount}</b> 題，得到 <b>${game.score}</b> 分。<br>目前九九熟練度：<b>${masteryCount()} / 81</b>。`;
    next.textContent='下一關';
  }
  $('#endOverlay').classList.remove('hidden');
}
function goSelection(){AnswerReview.cancel();game.running=false;game.paused=false;game.phase='idle';game.question=null;$('#endOverlay').classList.add('hidden');$('#tableOverlay').classList.add('hidden');$('#warQuestionOverlay').classList.remove('show');$('#startOverlay').classList.remove('hidden');syncLevelButtons();CommonUI.setMode('選關');CommonUI.update()}
function nextLevel(){const i=LEVEL_ORDER.indexOf(game.level);if(game.level==='war'){game.stage++}else if(i>=0&&i<LEVEL_ORDER.length-1){game.level=LEVEL_ORDER[i+1];game.stage=1}else{game.level='war';game.stage++}syncLevelButtons();resetSession()}
function syncLevelButtons(){$$('[data-level]').forEach(b=>b.classList.toggle('on',b.dataset.level===game.level))}
function renderTable(){const grid=$('#tableGrid');grid.innerHTML='';for(let a=1;a<=9;a++)for(let b=1;b<=9;b++){const d=document.createElement('div'),key=`${a}x${b}`,m=game.mastery[key]||0;d.className='table-cell'+(m>=2?' mastered':'')+(game.question?.key===key?' current':'');d.textContent=`${a}×${b}`;d.title=`${a} × ${b} = ${a*b}（答對 ${m} 次）`;grid.appendChild(d)}}

$$('[data-level]').forEach(btn=>btn.onclick=()=>{$$('[data-level]').forEach(b=>b.classList.remove('on'));btn.classList.add('on');game.level=btn.dataset.level;game.stage=1});
$('#startBtn').onclick=resetSession;$('#nextBtn').onclick=nextLevel;$('#backSelectBtn').onclick=goSelection;$('#selectBtn').onclick=goSelection;
$('#tableBtn').onclick=()=>{renderTable();$('#tableOverlay').classList.remove('hidden')};$('#closeTable').onclick=()=>$('#tableOverlay').classList.add('hidden');
$('#pauseBtn').onclick=()=>{if(!game.running)return;game.paused=!game.paused;$('#pauseBtn').textContent=game.paused?'繼續':'暫停';currentScene().pauseChanged?.()};
$('#soundBtn').onclick=()=>{game.sound=!game.sound;$('#soundBtn').textContent='音效：'+(game.sound?'開':'關');if(game.sound)Sound.tap()};
$('#resetBtn').onclick=()=>{if(confirm('要重新開始這一場嗎？九九熟練度會保留。'))resetSession()};
window.addEventListener('keydown',e=>{if(['1','2','3','4'].includes(e.key)&&game.running&&!game.paused&&game.phase==='question'){const root=game.level==='war'?$('#warQuestionPanel'):game.level==='battle'?$('#campaignQuestionPanel'):$('#duelQuestionPanel');const b=root.querySelectorAll('.answer')[Number(e.key)-1];if(b&&!b.disabled)b.click()}if(e.key===' '&&game.running){e.preventDefault();$('#pauseBtn').click()}});
CommonUI.update();CommonUI.setMode('選關');renderTable();activateScene('duelScene');
