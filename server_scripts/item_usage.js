// 物品使用事件处理 - 适配KubeJS 1.6.5版本

// 使用正确的KubeJS事件名称
ItemEvents.rightClicked(function(event) {
    var player = event.entity;
    var itemStack = event.item;
    
    // 检查是否是我们的自定义物品
    if (itemStack && itemStack.id === 'kubejs:aluminum_crystal') {
        // 消耗一个物品
        itemStack.count--;
        
        // 生成1500到2500之间的随机经验值
        var minExp = 1500;
        var maxExp = 2500;
        var exp = Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp;
        
        // 给玩家添加经验（使用MC原版方法）
            player.giveExperiencePoints(exp);
            
            // 给玩家发送提示消息
            player.tell('✨ 获得了 ' + exp + ' 点经验值！');
        
        // 取消默认的使用行为
        event.cancel();
    }
});
