cc.Class({
    extends: cc.Component,

    properties: {
        pre_block:cc.Prefab,  //块预制体

        label_readyTime:cc.Label,  //倒计时label

        //放置预制块
        startBlock:cc.Node,
        blockParent:cc.Node,

        //各个界面
        gameBegin:cc.Node,
        gameReady:cc.Node,
        gamePlay:cc.Node,
        gamePause:cc.Node,
        gameOver:cc.Node,

        //游戏控制按钮和黑白球界面
        controlUI:cc.Node,
        
        //查看得分界面
        bestScore_UI:cc.Node,
        see_bestScoreNumber:cc.Label,

        //文字介绍界面
        introduce_UI:cc.Node,

        //黑白球
        blackBall:cc.Node,
        whiteBall:cc.Node,

        //黑白按钮
        btn_black:cc.Node,
        btn_white:cc.Node,

        //继续 暂停游戏按钮图片
        btn_pause_bg:cc.Sprite,
        btn_pause_1:cc.SpriteFrame,
        btn_pause_2:cc.SpriteFrame,

        //播放 暂停音乐按钮图片
        btn_music_bg:cc.Sprite,
        btn_playMusic:cc.SpriteFrame,
        btn_pauseMusic:cc.SpriteFrame,

        //分数
        label_current_score:cc.Label,
        label_best_score:cc.Label,
        label_gameOver_getScore:cc.Label,

        // //背景音乐
        // music_bg:{
        //     type:cc.AudioClip,
        //     default:null,
        // },
    },

    onLoad () {
        window.game = this;  //定义全局变量

        // cc.audioEngine.play(this.music_bg, true, 1);  //播放背景音乐

        //游戏状态:0:gameBegin 1:gameReady 2:gamePlay 3:gamePause 4:gameOver 5:gameIntroduce
        this.gameType = 0;    

        this.gameBegin.active = true;
        this.gameReady.active = false;
        this.gamePlay.active = false;
        this.gamePause.active = false;
        this.gameOver.active = false;

        this.controlUI.active = false;

        this.bestScore_UI.active = false;
        this.introduce_UI.active = false;

        this.ballY = -80;   //黑白球的y轴坐标为-80

        this.blockPool = new cc.NodePool();  //声明块的对象池
        this.blockGap = 347.9;  //两个块之间的坐标大概相差一个子块的高度

        // 开启碰撞检测系统，未开启时无法检测
        cc.director.getCollisionManager().enabled = true;

        this.delayTime = 0;  //初始化延时器的时间

        this.current_score = 0;  //初始化当前分数为0

        //控制查看最佳成绩动画只能触发一次
        this.canPlayAnim_score = 0;  
        this.canPlayAnim_introduce = 0;

        this.canClickButton = false;  //教程界面是否可以点击控制按钮: true:可以  false:不可以
        this.anim_number = 0;  //教程动画序号,0表示无状态
        this.canMove = false;  //教程中子块是否可以移动: true:可以  false:不可以
    },

    initPosition:function(){  //初始化按钮和黑白球的位置(状态)
        this.rotationType = 1;  //旋转状态: 1:黑球在左，白球在右  2:白球在左，黑球在右
        this.routeLeftType = 2;  //路线状态(中间为分割线，左右两侧各两条路线): 左1道  左2道
        this.routeRightType = 1;  //右1道  右2道

        this.blackBall.setPosition(cc.v2(-60, this.ballY));
        this.whiteBall.setPosition(cc.v2(60, this.ballY));
        this.btn_black.setPosition(cc.v2(-120, -280));
        this.btn_white.setPosition(cc.v2(120, -280));
    },

    clickButton:function(sender, str){
        if(str == 'blackChange'){  //黑球变道
            if(this.gameType == 2){
                this.blackChange();
            }

            if(this.gameType == 5 && this.canClickButton == true){  //true表示可以点击按钮
                //cc.log('进来了');

                this.blackChange();
                this.canClickButton = false;
                this.canMove = true;
            }

        }else if(str == 'whiteChange'){  //白球变道
            if(this.gameType == 2){
                this.whiteChange();
            }            

            if(this.gameType == 5 && this.canClickButton == true){  //true表示可以点击按钮
                //cc.log('进来了');
                
                this.whiteChange();
                this.canClickButton = false;
                this.canMove = true;
            }

        }else if(str == 'rotation'){  //旋转
            if(this.gameType == 2){
                this.rotationChange();
            }           

            if(this.gameType == 5 && this.canClickButton == true){  //true表示可以点击按钮
                //cc.log('进来了');

                this.rotationChange();
                this.canClickButton = false;
                this.canMove = true;
                //cc.log(this.canMove);
            }

        }else if(str == 'play'){  //开始界面play按钮
            this.gameType = 1;  //gameReady
            this.gameBegin.active = false;
            this.gameReady.active = true;
            this.readyTime();  //游戏前倒计时3秒
            this.initPosition();
            this.startBlock.getComponent('startBlock').initStartBlock();
            this.btn_pause_bg.spriteFrame = this.btn_pause_1;

        }else if(str == 'pause'){
            this.gameType = 3;
            this.btn_pause_bg.spriteFrame = this.btn_pause_2;
            if(this.gameOver.active == false){
                this.gamePause.active = true;
            }

        }else if(str == 'continue'){
            this.gameType = 2;
            this.btn_pause_bg.spriteFrame = this.btn_pause_1;
            this.gamePause.active = false;

        }else if(str == 'replay'){
            this.gameType = 1;  //gameReady
            this.gameReady.active = true;
            this.gamePlay.active = false;
            this.controlUI.active = false;
            this.gamePause.active = false;
            this.gameOver.active = false;
            this.removeAllBlocks();
            this.readyTime();  //重新开始游戏前倒计时3秒
            this.initPosition();
            this.startBlock.getComponent('startBlock').initStartBlock();
            this.btn_pause_bg.spriteFrame = this.btn_pause_1;

            this.current_score = 0;  //初始化当前分数为0
            this.label_current_score.string = 0;  //初始化label的string值

            //this.delayTime = 0;  //重新开始游戏重置延时器的时间

        }else if(str == 'backHome'){
            this.gameType = 0;  //gameBegin
            this.gameBegin.active = true;
            this.gamePlay.active = false;
            if(this.gamePause.active == true){
                this.gamePause.active = false;
            }
            this.gameOver.active = false;
            this.controlUI.active = false;  //控制按钮隐藏
            this.removeAllBlocks();

            this.current_score = 0;  //初始化当前分数为0
            this.label_current_score.string = 0;  //初始化label的string值

            //this.delayTime = 0;  //重新开始游戏重置延时器的时间

        }/*else if(str == 'music'){
            if(this.btn_music_bg.spriteFrame == this.btn_playMusic){
                //cc.log('图片进来了');
                //cc.audioEngine.stop(this.bgMusic);
                cc.audioEngine.stopAll();
                this.btn_music_bg.spriteFrame = this.btn_pauseMusic;
            }else if(this.btn_music_bg.spriteFrame == this.btn_pauseMusic){
                //cc.log('第二次进来了');
                cc.audioEngine.play(this.music_bg, true, 1);
                this.btn_music_bg.spriteFrame = this.btn_playMusic;
                //cc.log('看看它执行了没');
            }

        }*/else if(str == 'bestScore'){
            //cc.log('进来了');
            this.bestScore_UI.active = true;
            if(this.canPlayAnim_score == 0){  //可播放动画
                //cc.log('可以放动画');
                var anim = this.bestScore_UI.getChildByName('bg_score').getComponent(cc.Animation);
                anim.play('bestScoreUI_scale_1');
                this.canPlayAnim_score = 1;  //关闭动画效果
            }
            this.see_bestScore = cc.sys.localStorage.getItem('taiji_bestScore');
            if(this.see_bestScore == null){
                this.see_bestScoreNumber.string = 0;
            }else{
                this.see_bestScoreNumber.string = this.see_bestScore;
            }

        }else if(str == 'back_score'){
            if(this.canPlayAnim_score == 1){
                var anim = this.bestScore_UI.getChildByName('bg_score').getComponent(cc.Animation);
                anim.play('bestScoreUI_scale_2');
                this.canPlayAnim_score = 0;
                anim.animOver_1 = function(){            
                    this.bestScore_UI.active = false;
                }.bind(this);
            }
            
        }else if(str == 'introduce'){
            this.introduce_UI.active = true;
            if(this.canPlayAnim_introduce == 0){  //可播放动画
                //cc.log('可以放动画');
                var anim = this.introduce_UI.getChildByName('bg_introduce').getComponent(cc.Animation);
                anim.play('introduceUI_scale_1');
                this.canPlayAnim_introduce = 1;  //关闭动画效果
            }
        }else if(str == 'back_introduce'){
            if(this.canPlayAnim_introduce == 1){
                var anim = this.introduce_UI.getChildByName('bg_introduce').getComponent(cc.Animation);
                anim.play('introduceUI_scale_2');
                this.canPlayAnim_introduce = 0;
                //cc.log('进来了');
                anim.animOver_2 = function(){             
                    this.introduce_UI.active = false;
                }.bind(this);
            }
        }
    },

    readyTime:function(){
        this.timeNum = 3;  //倒计时3秒
        this.label_readyTime.string = 3;
        var timer = function(){
            this.label_readyTime.string = --this.timeNum;
            if(this.timeNum == 0){
                this.gameType = 2;  //gamePlay
                this.gameReady.active = false;
                this.gamePlay.active = true;
                this.controlUI.active = true;  //控制按钮显示
                this.delayTime = 0;  //重新开始游戏重置延时器的时间
                this.unschedule(timer);
            }
        };
        this.schedule(timer, 1);
    },

    addScore:function(getScore){
        this.current_score = this.current_score + getScore;
        //cc.log(this.current_score);
        this.label_current_score.string = this.current_score;
    },

    getBestScore:function(){
        this.best_score = cc.sys.localStorage.getItem('taiji_bestScore');
        if(this.best_score == null){
            this.best_score = 0;
        }
        if(this.best_score <= this.current_score){
            this.best_score = this.current_score;
        }
        this.label_best_score.string = this.best_score;
        cc.sys.localStorage.setItem('taiji_bestScore', this.best_score);
    },

    gameOverUI:function(){  //游戏结束界面
        this.gameType = 4;  //gameOver
        if(this.gamePause.active == false){
            this.gameOver.active = true;
        }
        this.label_gameOver_getScore.string = this.current_score;
    },

    createBlockColor:function(block){  //生成子块的随机颜色
        var children = block.children;
        var blackNum = 0;
        var whiteNum = 0;
        for (let i = 0; i < children.length; i++) {  //随机生成黑白块
            var randomColorNum = Math.random();  //随机产生一个0-1之间的数字:[0,1)
            if(randomColorNum >= 0 && randomColorNum < 0.5){
                children[i].color = new cc.Color(0, 0, 0);
                blackNum++;
            }else{
                children[i].color = new cc.Color(255, 255, 255);
                whiteNum++;
            }
        }
        //如果四个子块的颜色相同
        if(blackNum == 4 || whiteNum == 4){
            var color1 = cc.Color.BLACK;  //黑色
            var color2 = cc.Color.WHITE;  //白色
            var blockColor = children[0].color;  //子块的颜色
            var randomBlock = Math.random() * 4;  //随机产生一个0-4之间的数字:[0,4)
            if(blockColor.equals(color1)){  //如果子块的颜色为黑色
                if(randomBlock >= 0 && randomBlock < 1){
                    children[0].color = color2;
                }else if(randomBlock < 2){
                    children[1].color = color2;
                }else if(randomBlock < 3){
                    children[2].color = color2;
                }else{
                    children[3].color = color2;
                }
            }else if(blockColor.equals(color2)){  //如果子块的颜色为白色
                if(randomBlock >= 0 && randomBlock < 1){
                    children[0].color = color1;
                }else if(randomBlock < 2){
                    children[1].color = color1;
                }else if(randomBlock < 3){
                    children[2].color = color1;
                }else{
                    children[3].color = color1;
                }
            }
        }
    },

    createBlock: function (pos) {  //创建块
        let block = null;
        if (this.blockPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            block = this.blockPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            block = cc.instantiate(this.pre_block);
        }

        this.createBlockColor(block);
        //cc.log('生成了一个块');
        block.getComponent('block').initBlock();  //初始化对象池的敌机块

        block.parent = this.blockParent; // 将生成的敌人加入节点树
        block.setPosition(pos);
        //cc.log(pos);
    },

    onBlockKilled: function (block) {  //销毁块
        // block 应该是一个 cc.Node
        this.blockPool.put(block); // 和初始化时的方法一样，将节点放进对象池，这个方法会同时调用节点的 removeFromParent
    },

    removeAllBlocks:function(){  //游戏结束或重新开始
        var children = this.blockParent.children;
        for (let i = children.length - 1; i >= 0; i--) {
            var blockJS = children[i].getComponent('block');
            if(blockJS){
                this.onBlockKilled(children[i]);
            }
        }
    },

    isCreateBlock:function(){  //判断是否生成块
        var children = this.blockParent.children;
        var blockNum = 0;
        var randomY = [210];
        for (let i = 0; i < children.length; i++) {
            var blockJS = children[i].getComponent('block');
            if(blockJS){
                blockNum++;
                randomY.push(children[i].y);
            }     
        }
        if(blockNum < 5){
            var blockX = 0;
            var blockY = randomY[randomY.length - 1] + this.blockGap;
            //cc.log('blockY:' + blockY);
            this.createBlock(cc.v2(blockX, blockY));
        }
    },

    blackChange:function(){  //黑球变道方法
        if(this.rotationType == 1){  //黑左白右
            if(this.routeLeftType == 1){  //黑球在左1
                this.blackBall.stopAllActions();
                var act_toLeft2 = cc.moveTo(0.1, cc.v2(-60, this.ballY));
                this.blackBall.runAction(act_toLeft2);
                this.routeLeftType = 2;
            }else if(this.routeLeftType == 2){  //黑球在左2
                this.blackBall.stopAllActions();
                var act_toLeft1 = cc.moveTo(0.1, cc.v2(-180, this.ballY));
                this.blackBall.runAction(act_toLeft1);
                this.routeLeftType = 1;
            }
        }else if(this.rotationType == 2){  //黑右白左
            if(this.routeRightType == 1){  //黑球在右1
                this.blackBall.stopAllActions();
                var act_toRight2 = cc.moveTo(0.1, cc.v2(180, this.ballY));
                this.blackBall.runAction(act_toRight2);
                this.routeRightType = 2;
            }else if(this.routeRightType == 2){  //黑球在右2
                this.blackBall.stopAllActions();
                var act_toRight1 = cc.moveTo(0.1, cc.v2(60, this.ballY));
                this.blackBall.runAction(act_toRight1);
                this.routeRightType = 1;
            }
        }
    },

    whiteChange:function(){  //白球变道方法
        if(this.rotationType == 2){  //白左黑右
            if(this.routeLeftType == 1){  //白球在左1
                this.whiteBall.stopAllActions();
                var act_toLeft2 = cc.moveTo(0.1, cc.v2(-60, this.ballY));
                this.whiteBall.runAction(act_toLeft2);
                this.routeLeftType = 2;
            }else if(this.routeLeftType == 2){  //白球在左2
                this.whiteBall.stopAllActions();
                var act_toLeft1 = cc.moveTo(0.1, cc.v2(-180, this.ballY));
                this.whiteBall.runAction(act_toLeft1);
                this.routeLeftType = 1;
            }
        }else if(this.rotationType == 1){  //白右黑左
            if(this.routeRightType == 1){  //白球在右1
                this.whiteBall.stopAllActions();
                var act_toRight2 = cc.moveTo(0.1, cc.v2(180, this.ballY));
                this.whiteBall.runAction(act_toRight2);
                this.routeRightType = 2;
            }else if(this.routeRightType == 2){  //白球在右2
                this.whiteBall.stopAllActions();
                var act_toRight1 = cc.moveTo(0.1, cc.v2(60, this.ballY));
                this.whiteBall.runAction(act_toRight1);
                this.routeRightType = 1;
            }
        }
    },

    rotationChange:function(){
        if(this.rotationType == 1){  //黑左白右
            if(this.routeLeftType == 1){  //黑球在左1
                if(this.routeRightType == 1){  //白球在右1
                    this.blackBall.stopAllActions();
                    this.whiteBall.stopAllActions();
                    var act_black = cc.moveTo(0.2, cc.v2(60, this.ballY));
                    var act_white = cc.moveTo(0.2, cc.v2(-180, this.ballY));
                    this.blackBall.runAction(act_black);
                    this.whiteBall.runAction(act_white);
                    //this.routeRightType = 2;
                }else if(this.routeRightType == 2){  //白球在右2
                    this.blackBall.stopAllActions();
                    this.whiteBall.stopAllActions();
                    var act_black = cc.moveTo(0.2, cc.v2(180, this.ballY));
                    var act_white = cc.moveTo(0.2, cc.v2(-180, this.ballY));
                    this.blackBall.runAction(act_black);
                    this.whiteBall.runAction(act_white);
                    //this.routeRightType = 1;
                }
            }else if(this.routeLeftType == 2){  //黑球在左2
                if(this.routeRightType == 1){  //白球在右1
                    this.blackBall.stopAllActions();
                    this.whiteBall.stopAllActions();
                    var act_black = cc.moveTo(0.2, cc.v2(60, this.ballY));
                    var act_white = cc.moveTo(0.2, cc.v2(-60, this.ballY));
                    this.blackBall.runAction(act_black);
                    this.whiteBall.runAction(act_white);
                    //this.routeRightType = 2;
                }else if(this.routeRightType == 2){  //白球在右2
                    this.blackBall.stopAllActions();
                    this.whiteBall.stopAllActions();
                    var act_black = cc.moveTo(0.2, cc.v2(180, this.ballY));
                    var act_white = cc.moveTo(0.2, cc.v2(-60, this.ballY));
                    this.blackBall.runAction(act_black);
                    this.whiteBall.runAction(act_white);
                    //this.routeRightType = 1;
                }
            }

            //黑白按钮互换
            this.btn_black.stopAllActions();
            this.btn_white.stopAllActions();
            var act_blackBtn = cc.moveTo(0.1, cc.v2(120, -280));
            var act_whiteBtn = cc.moveTo(0.1, cc.v2(-120, -280));
            this.btn_black.runAction(act_blackBtn);
            this.btn_white.runAction(act_whiteBtn);

            this.rotationType = 2;  //旋转状态变为2
        }else if(this.rotationType == 2){  //白左黑右
            if(this.routeLeftType == 1){  //白球在左1
                if(this.routeRightType == 1){  //黑球在右1
                    this.blackBall.stopAllActions();
                    this.whiteBall.stopAllActions();
                    var act_black = cc.moveTo(0.2, cc.v2(-180, this.ballY));
                    var act_white = cc.moveTo(0.2, cc.v2(60, this.ballY));
                    this.blackBall.runAction(act_black);
                    this.whiteBall.runAction(act_white);
                    //this.routeRightType = 2;
                }else if(this.routeRightType == 2){  //黑球在右2
                    this.blackBall.stopAllActions();
                    this.whiteBall.stopAllActions();
                    var act_black = cc.moveTo(0.2, cc.v2(-180, this.ballY));
                    var act_white = cc.moveTo(0.2, cc.v2(180, this.ballY));
                    this.blackBall.runAction(act_black);
                    this.whiteBall.runAction(act_white);
                    //this.routeRightType = 1;
                }
            }else if(this.routeLeftType == 2){  //白球在左2
                if(this.routeRightType == 1){  //黑球在右1
                    this.blackBall.stopAllActions();
                    this.whiteBall.stopAllActions();
                    var act_black = cc.moveTo(0.2, cc.v2(-60, this.ballY));
                    var act_white = cc.moveTo(0.2, cc.v2(60, this.ballY));
                    this.blackBall.runAction(act_black);
                    this.whiteBall.runAction(act_white);
                    //this.routeRightType = 2;
                }else if(this.routeRightType == 2){  //黑球在右2
                    this.blackBall.stopAllActions();
                    this.whiteBall.stopAllActions();
                    var act_black = cc.moveTo(0.2, cc.v2(-60, this.ballY));
                    var act_white = cc.moveTo(0.2, cc.v2(180, this.ballY));
                    this.blackBall.runAction(act_black);
                    this.whiteBall.runAction(act_white);
                    //this.routeRightType = 1;
                }
            }

            //黑白按钮互换
            this.btn_black.stopAllActions();
            this.btn_white.stopAllActions();
            var act_blackBtn = cc.moveTo(0.1, cc.v2(-120, -280));
            var act_whiteBtn = cc.moveTo(0.1, cc.v2(120, -280));
            this.btn_black.runAction(act_blackBtn);
            this.btn_white.runAction(act_whiteBtn);

            this.rotationType = 1;  //旋转状态变为1
        }
    },

    update (dt) {
        if(this.gameType == 2){
            this.isCreateBlock();
            this.getBestScore();
        }
    },
});