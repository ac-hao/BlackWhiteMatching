cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad () {},

    initStartBlock:function(){
        //cc.log('开始块初始化');
        this.node.setPosition(cc.v2(0, 2));
        this.canPlayAnim = true;
        this.playBlockNormal();

        this.canAddScore = true;
    },

    playBlockNormal:function(){  //播放块正常动画
        var anim = this.node.getComponent(cc.Animation);
        anim.play('blockNormal');
    },

    playBlockScale:function(){  //播放块缩放动画
        var anim = this.node.getComponent(cc.Animation);
        anim.play('blockScale');
    },

    update (dt) {
        //自制延时器(延迟大概2秒)
        game.delayTime++;
        if(game.delayTime < 120){
            return;
        }
        if(game.delayTime >= 120){
            game.delayTime = 120;
        }

        if(game.gameType == 2 && this.node.y >= -768){
            //cc.log('startBlock在移动');
            this.node.y = this.node.y - 2; 
        }
        if(this.node.y < -80 && this.canPlayAnim == true){
            this.canPlayAnim = false;
            this.playBlockScale();
            if(this.canAddScore == true){
                this.canAddScore = false;
                game.addScore(1);
            }
        }
    },
});