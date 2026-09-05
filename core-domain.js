'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const rand=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const shuffle=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);

/* =========================
   Shared domain / data modules
   ========================= */
const MODES={
  beginner:{name:'新手區',multipliers:[1,10],review:'一位數加減法'},
  level1:{name:'熟手 Level 1',multipliers:[2,3],review:'一／二位數加減法'},
  level2:{name:'熟手 Level 2',multipliers:[2,3,4,5],review:'一／二位數加減法'},
  level3:{name:'熟手 Level 3',multipliers:[2,3,4,5,6,7],review:'100 以內加減法'},
  battle:{name:'實戰模式',multipliers:[1,2,3,4,5,6,7,8,9],review:'三位數 ± 二位數'},
  war:{name:'戰爭模式',multipliers:[1,2,3,4,5,6,7,8,9],review:'三位數 ± 二位數'}
};
const LEVEL_ORDER=['beginner','level1','level2','level3','battle','war'];
const game={running:false,paused:false,sound:true,level:'beginner',stage:1,score:0,combo:0,correctCount:0,round:0,question:null,phase:'idle',best:Number(localStorage.gundamMathBest||0),mastery:JSON.parse(localStorage.gundamMathMastery||'{}')};
function save(){localStorage.gundamMathBest=String(game.best);localStorage.gundamMathMastery=JSON.stringify(game.mastery)}
function masteryCount(){let c=0;for(let a=1;a<=9;a++)for(let b=1;b<=9;b++)if((game.mastery[`${a}x${b}`]||0)>=2)c++;return c}
function mode(){return MODES[game.level]}

const Sound=(()=>{let ctx=null;function beep(f=440,d=.07,t='square',g=.022){if(!game.sound)return;try{ctx||=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),x=ctx.createGain();o.type=t;o.frequency.value=f;x.gain.value=g;o.connect(x);x.connect(ctx.destination);o.start();o.stop(ctx.currentTime+d)}catch{}}return{good(){beep(660);setTimeout(()=>beep(880,.09),65)},bad(){beep(180,.15,'sawtooth')},shot(enemy=false){beep(enemy?240:720,.06,enemy?'sawtooth':'square',.016)},next(){beep(420);setTimeout(()=>beep(540,.08),70)},tap(){beep(500,.05)}}})();
