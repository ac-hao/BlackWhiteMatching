cc.Class({
    extends: cc.Component,

    properties: {},

    onLoad () {},

    /**
     * 当碰撞产生的时候调用
     * @param  {Collider} other 产生碰撞的另一个碰撞组件
     * @param  {Collider} self  产生碰撞的自身的碰撞组件
     */
    //标签: 0:块  1:黑球  2:白球
    //此组件中，other=0，self=1
    onCollisionEnter: function (other, self) {
        //cc.log('黑的碰了');
        if(self.tag == 1 && other.tag == 0){
            //cc.log('进来了');
            if(other.node.scale != 1){  //防止变道时发生二次碰撞
                return;
            }
            var blackColor =  cc.Color.BLACK;  //黑色
            var blockColor = other.node.color;  //获取碰撞的块的颜色
            if(blackColor.equals(blockColor) == false){  //小球的颜色和碰撞的块的颜色不相等
                //cc.log(blockColor.equals(blackColor));
                game.gameOverUI();
            }
        }
    },

    // update (dt) {},
});