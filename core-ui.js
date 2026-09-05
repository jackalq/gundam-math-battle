const CommonUI={
  score:$('#score'),combo:$('#combo'),best:$('#best'),progressText:$('#progressText'),progressFill:$('#progressFill'),modeText:$('#modeText'),streakText:$('#streakText'),
  update(){this.score.textContent=game.score;this.combo.textContent=game.combo;this.best.textContent=game.best;const m=masteryCount();this.progressText.textContent=`${m} / 81`;this.progressFill.style.width=`${m/81*100}%`;this.streakText.textContent=`答對 ${game.correctCount} 題`},
  setMode(extra=''){this.modeText.textContent=`${mode().name}${extra?'｜'+extra:''}`}
};

class QuestionPanel{
  constructor(root,onAnswer){this.root=root;this.round=root.querySelector('.round-tag');this.q=root.querySelector('.question');this.hint=root.querySelector('.hint');this.answers=root.querySelector('.answers');this.onAnswer=onAnswer}
  show(question,tag,hint){this.round.textContent=tag;this.q.textContent=question.text;this.hint.textContent=hint;this.answers.innerHTML='';for(const v of QuestionService.choices(question.answer)){const b=document.createElement('button');b.className='answer';b.textContent=v;b.dataset.value=v;b.onclick=()=>this.onAnswer(v,b);this.answers.appendChild(b)}}
  disable(){[...this.answers.children].forEach(b=>b.disabled=true)}
  mark(value,correctAnswer,btn){if(value===correctAnswer)btn.classList.add('correct');else{btn.classList.add('wrong');[...this.answers.children].forEach(b=>{if(Number(b.dataset.value)===correctAnswer)b.classList.add('correct')})}}
}

function applyAnswerScore(correct){if(correct){game.combo++;game.correctCount++;game.score+=10+Math.min(30,game.combo*2);if(game.question.type==='mul')game.mastery[game.question.key]=(game.mastery[game.question.key]||0)+1;Sound.good()}else{game.combo=0;Sound.bad()}game.best=Math.max(game.best,game.score);save();CommonUI.update();renderTable()}
function questionHint(){return game.question.isReview?'複習題！答對一樣可以攻擊。':game.combo>=3?`連擊 ${game.combo}！繼續命中！`:'答對就能發動攻擊！'}
function activateScene(id){$$('.scene').forEach(x=>x.classList.toggle('active',x.id===id))}
function flashIn(scene,text,color){const el=scene.querySelector('.feedback');el.textContent=text;el.style.color=color;el.classList.remove('show');void el.offsetWidth;el.classList.add('show')}

const AnswerReview=(()=>{
  const overlay=$('#answerReviewOverlay'),eq=$('#answerReviewEquation'),mine=$('#answerReviewMine'),correct=$('#answerReviewCorrect'),tip=$('#answerReviewTip'),btn=$('#answerReviewBtn');
  let resolveCurrent=null;
  function equation(q){
    if(q.type==='mul')return `${q.a} × ${q.b} = ${q.answer}`;
    if(q.type==='add')return `${q.a} + ${q.b} = ${q.answer}`;
    return `${q.a} − ${q.b} = ${q.answer}`;
  }
  function learningTip(q){
    if(q.type==='mul')return `請念一次：${q.a} 乘以 ${q.b} 等於 ${q.answer}。把這一題記起來，下次再遇到就能更快命中。`;
    return `先確認運算符號，再從左到右慢慢算一次。正確答案是 ${q.answer}。`;
  }
  function show(q,chosen){
    cancel(false);
    eq.textContent=equation(q);
    mine.textContent=`你選了 ${chosen}`;
    correct.textContent=`正確是 ${q.answer}`;
    tip.textContent=learningTip(q);
    overlay.classList.add('show');
    btn.focus({preventScroll:true});
    return new Promise(resolve=>{resolveCurrent=resolve});
  }
  function close(){
    if(!overlay.classList.contains('show'))return;
    overlay.classList.remove('show');
    const r=resolveCurrent;resolveCurrent=null;if(r)r();
  }
  function cancel(resolve=true){
    overlay.classList.remove('show');
    const r=resolveCurrent;resolveCurrent=null;if(resolve&&r)r();
  }
  btn.onclick=close;
  return{show,close,cancel};
})();
