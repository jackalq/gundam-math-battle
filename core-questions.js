const QuestionService={
  choosePair(){const candidates=[];for(const a of mode().multipliers)for(let b=1;b<=9;b++){const key=`${a}x${b}`,m=game.mastery[key]||0,w=m===0?5:m===1?3:1;for(let i=0;i<w;i++)candidates.push([a,b])}return candidates[rand(0,candidates.length-1)]},
  review(){
    const plus=Math.random()<.55;
    const a=rand(0,200),b=rand(0,200);
    if(plus)return{type:'add',a,b,answer:a+b,text:`${a} + ${b} = ?`};
    const hi=Math.max(a,b),lo=Math.min(a,b);
    return{type:'sub',a:hi,b:lo,answer:hi-lo,text:`${hi} − ${lo} = ?`};
  },
  next(){game.round++;const isReview=game.round%5===0;if(isReview)return{...this.review(),isReview:true};const[a,b]=this.choosePair();return{type:'mul',a,b,answer:a*b,text:`${a} × ${b} = ?`,key:`${a}x${b}`,isReview:false}},
  choices(answer){const set=new Set([answer]),scale=answer>=300?100:answer>=100?30:answer>=30?12:6;let guard=0;while(set.size<4&&guard++<100){let d=rand(1,scale);if(Math.random()<.5)d=-d;let v=answer+d;if(v<0)v=answer+Math.abs(d);if(v>=0)set.add(v)}while(set.size<4)set.add(answer+set.size);return shuffle([...set])}
};
