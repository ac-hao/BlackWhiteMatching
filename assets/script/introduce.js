cc.Class({
    extends: cc.Component,

    properties: {
        block_introduce:cc.Node,
        introduce_anim:cc.Node,
        anim_1:cc.Node,
        anim_2:cc.Node,
        anim_3:cc.Node,
        after:cc.Node,
        before:cc.Node,
    },

    onLoad () {
        this.introduce_anim.active = false;
        this.anim_1.active = false;
        this.anim_2.active = false;
        this.anim_3.active = false;

        this.after.active = false;
        this.before.active = false;

        this.onlyCreate = true;  //每次只能生成一个块(只有值为true时才可以生成)
        this.can_After_Before =true;  //能否点击下一页或上一页按钮
    },

    clickButton:function(sender, str){
        if(str == 'goIntroduce'){
            game.gameType = 5;  //游戏状态为教程
            game.canClickButton = true;
            game.anim_number = 1;

            //初始化控制按钮的状态
            game.rotationType = 1;  
            game.routeLeftType = 2;  
            game.routeRightType = 1;
            game.blackBall.setPosition(cc.v2(-60, game.ballY));
            game.whiteBall.setPosition(cc.v2(60, game.ballY));
            game.btn_black.setPosition(cc.v2(-120, -280));
            game.btn_white.setPosition(cc.v2(120, -280)); 

            this.onlyCreate = true;

            var anim = this.node.parent.getChildByName('introduce_UI').
                        getChildByName('bg_introduce').getComponent(cc.Animation);
            anim.play('introduceUI_scale_2');
            game.canPlayAnim_introduce = 0;
            anim.animOver_2 = function(){             
                game.introduce_UI.active = false;
            }.bind(this);
            
            // 开启碰撞检测系统，未开启时无法检测
            cc.director.getCollisionManager().enabled = false;

            this.introduce_anim.active = true;
            game.controlUI.active = true;
            game.gameBegin.active = false;

        }else if(str == 'back_begin'){
            game.gameType = 0;  //退出游戏教程，游戏状态切换为开始界面状态

            // 开启碰撞检测系统，未开启时无法检测
            cc.director.getCollisionManager().enabled = true;

            //移除节点上所有的预制块
            var children = this.block_introduce.children;
            for (let i = children.length - 1; i >= 0; i--) {
                this.block_introduce.removeChild(children[i]);
            }

            this.introduce_anim.active = false;
            game.controlUI.active = false;
            game.gameBegin.active = true;

            this.anim_1.active = false;
            this.anim_2.active = false;
            this.anim_3.active = false;

            this.after.active = false;
            this.before.active = false;

        }else if(str == 'after'){
            if(this.can_After_Before == true){
                if(game.anim_number == 1){
                    //初始化控制按钮的状态
                    game.rotationType = 2;  
                    game.routeLeftType = 2;
                    game.routeRightType = 1;
                    game.blackBall.setPosition(cc.v2(60, game.ballY));
                    game.whiteBall.setPosition(cc.v2(-60, game.ballY));
                    game.btn_black.setPosition(cc.v2(120, -280));
                    game.btn_white.setPosition(cc.v2(-120, -280));

                    game.canClickButton = true;
                    game.anim_number = 2;
                    this.onlyCreate = true;
                    this.removeBlock();
                }else if(game.anim_number == 2){
                    //初始化控制按钮的状态
                    game.rotationType = 2;  
                    game.routeLeftType = 2;
                    game.routeRightType = 2;
                    game.blackBall.setPosition(cc.v2(180, game.ballY));
                    game.whiteBall.setPosition(cc.v2(-60, game.ballY));
                    game.btn_black.setPosition(cc.v2(120, -280));
                    game.btn_white.setPosition(cc.v2(-120, -280));

                    game.canClickButton = true;
                    game.anim_number = 3;
                    this.onlyCreate = true;
                    this.removeBlock();
                }
            }
            
        }else if(str == 'before'){
            if(this.can_After_Before == true){
                if(game.anim_number == 2){
                    //初始化控制按钮的状态
                    game.rotationType = 1;  
                    game.routeLeftType = 2;  
                    game.routeRightType = 1;
                    game.blackBall.setPosition(cc.v2(-60, game.ballY));
                    game.whiteBall.setPosition(cc.v2(60, game.ballY));
                    game.btn_black.setPosition(cc.v2(-120, -280));
                    game.btn_white.setPosition(cc.v2(120, -280));

                    game.canClickButton = true;
                    game.anim_number = 1;
                    this.onlyCreate = true;
                    this.removeBlock();
                }else if(game.anim_number == 3){
                    //初始化控制按钮的状态
                    game.rotationType = 2;  
                    game.routeLeftType = 2;
                    game.routeRightType = 1;
                    game.blackBall.setPosition(cc.v2(60, game.ballY));
                    game.whiteBall.setPosition(cc.v2(-60, game.ballY));
                    game.btn_black.setPosition(cc.v2(120, -280));
                    game.btn_white.setPosition(cc.v2(-120, -280));

                    game.canClickButton = true;
                    game.anim_number = 2;
                    this.onlyCreate = true;
                    this.removeBlock();
                }
            }
            
        }
    },

    removeBlock:function(){
        var children = this.block_introduce.children;
        for (let i = children.length - 1; i >= 0; i--) {
            this.block_introduce.removeChild(children[i]);
        }
    },

    createBlock:function(number){
        block = cc.instantiate(game.pre_block);
        block.parent = this.block_introduce;
        block.setPosition(cc.v2(0, 250));
        this.createBlockColor(number, block);
    },

    createBlockColor:function(number, block){
        var children = block.children;
        var color1 = cc.Color.BLACK;  //黑色
        var color2 = cc.Color.WHITE;  //白色
        if(number == 1){
            children[0].color = color1;
            children[1].color = color2;
            children[2].color = color1;
            children[3].color = color2;
        }else if(number == 2){
            children[0].color = color1;
            children[1].color = color2;
            children[2].color = color2;
            children[3].color = color1;
        }else if(number == 3){
            children[0].color = color2;
            children[1].color = color1;
            children[2].color = color2;
            children[3].color = color1;
        }
    },    

    blockMove:function(){  //块移动
        var block = this.block_introduce.getChildByName('block');
        block.y = block.y - 2;
        //cc.log(block.y);
        if(block.y <= -60){
            game.canMove = false;
            this.can_After_Before = true;
        }
    },

    update (dt) {
        if(game.gameType == 5 && game.anim_number == 1){
            //cc.log('00000');
            this.before.active = false;
            this.after.active = true;
            this.anim_1.active = true;
            this.anim_2.active = false;
            this.anim_3.active = false;

            if(this.onlyCreate == true){
                this.createBlock(game.anim_number);
                this.onlyCreate = false;  //不可以生成块了
            }
            //cc.log('11111');
            //cc.log(game.canMove + 'introduce');
            if(game.canMove == true){  //可以移动
                //cc.log('能移动');
                this.can_After_Before = false;
                this.blockMove();
            }
            
        }else if(game.gameType == 5 && game.anim_number == 2){
            this.before.active = true;
            this.after.active = true;
            this.anim_2.active = true;
            this.anim_1.active = false;
            this.anim_3.active = false;

            if(this.onlyCreate == true){
                this.createBlock(game.anim_number);
                this.onlyCreate = false;  //不可以生成块了
            }
            if(game.canMove == true){  //可以移动
                //cc.log('能移动');
                this.can_After_Before = false;
                this.blockMove();
            }

        }else if(game.gameType == 5 && game.anim_number == 3){
            this.before.active = true;
            this.after.active = false;
            this.anim_3.active = true;
            this.anim_1.active = false;
            this.anim_2.active = false;

            if(this.onlyCreate == true){
                this.createBlock(game.anim_number);
                this.onlyCreate = false;  //不可以生成块了
            }
            if(game.canMove == true){  //可以移动
                //cc.log('能移动');
                this.can_After_Before = false;
                this.blockMove();
            }
        }
    },
});