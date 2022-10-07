cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad () {},

    initBlock:function(){  //初始化从对象池取出的块
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

        if(game.gameType == 2){
            //this.node.y = this.node.y - 2;
            //cc.log('此时为' + game.gameType);
            if(this.node.y >= 0){
                this.node.y = this.node.y - 2;
            }else{
                this.node.y = this.node.y - 2.5;
            }
        }
        if(this.node.y <= 60 && this.canPlayAnim == true){
            this.canPlayAnim = false;
            this.playBlockScale();
            if(this.canAddScore == true){
                this.canAddScore = false;
                game.addScore(1);
            }
        }
        //块的y轴坐标小于等于负的canvas高度的一半加上块高度的一半(即恰好块完全移出屏幕)
        if(this.node.y <= -(768 / 2 + 350 / 2)){  
            game.onBlockKilled(this.node);
            //cc.log('回收了一个块');
        }
    },
});