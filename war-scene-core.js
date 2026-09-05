class WarScene{
  constructor(){this.root=$('#warScene');this.field=$('#warField');this.allyForm=$('#allyFormation');this.enemyForm=$('#enemyFormation');this.allyStatus=$('#warAllyStatus');this.enemyStatus=$('#warEnemyStatus');this.stageTitle=$('#warStageTitle');this.log=$('#battleLog');this.overlay=$('#warQuestionOverlay');this.bannerEl=$('#warTurnBanner');this.panel=new QuestionPanel($('#warQuestionPanel'),(v,b)=>this.answer(v,b));this.allies=[];this.enemies=[];this.maxUnits=6}
}
