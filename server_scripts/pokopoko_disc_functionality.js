// priority: 3

// 为自定义唱片添加功能脚本

// 1. 添加唱片到音乐唱片标签
ServerEvents.tags('item', function(event) {
    // 确保自定义唱片被识别为音乐唱片
    event.add('minecraft:music_discs', 'kubejs:pokopoko_synthion_remix');
    event.add('c:music_discs', 'kubejs:pokopoko_synthion_remix');
    
    console.info('[KubeJS] 已将自定义唱片添加到音乐唱片标签');
});

// 2. 监听唱片机事件
BlockEvents.rightClicked('minecraft:jukebox', function(event) {
    console.info('[KubeJS] 唱片机被右键点击');
    
    // 获取玩家手持的物品
    var player = event.player;
    var handItem = player.getMainHandItem();
    
    console.info('[KubeJS] 玩家手持物品: ' + handItem.id);
    
    // 检查是否是自定义唱片
    if (handItem.id === 'kubejs:pokopoko_synthion_remix') {
        console.info('[KubeJS] 检测到自定义唱片: ' + handItem.id);
        
        // 获取唱片机方块
        var jukebox = event.block;
        
        console.info('[KubeJS] 唱片机当前状态: ' + jukebox);
        
        // 检查唱片机是否已经有唱片
        var hasRecord = jukebox.has_record;
        console.info('[KubeJS] 唱片机是否有唱片: ' + hasRecord);
        
        if (!hasRecord) {
            // 记录播放日志
            console.info('[KubeJS] 准备播放自定义唱片: ' + handItem.id);
            console.info('[KubeJS] 唱片机位置: ' + jukebox.pos);
            
            // 尝试通过设置方块状态来放入唱片
            try {
                // 获取唱片机的方块实体
                var blockEntity = jukebox.entity;
                console.info('[KubeJS] 唱片机方块实体: ' + blockEntity);
                
                if (blockEntity) {
                    // 尝试设置唱片
                    console.info('[KubeJS] 尝试设置唱片机唱片');
                    
                    // 方法1: 尝试使用setItem方法
                    try {
                        blockEntity.setItem(0, handItem);
                        console.info('[KubeJS] 方法1 - 成功将唱片放入唱片机');
                    } catch (e1) {
                        console.error('[KubeJS] 方法1 - 设置唱片机物品时出错: ' + e1);
                        
                        // 方法2: 尝试使用NBT数据
                        try {
                            // 获取当前NBT
                            var nbt = blockEntity.getNbt();
                            console.info('[KubeJS] 唱片机当前NBT: ' + nbt);
                            
                            // 设置唱片NBT
                            nbt.recordItem = handItem;
                            blockEntity.setNbt(nbt);
                            console.info('[KubeJS] 方法2 - 成功将唱片放入唱片机');
                        } catch (e2) {
                            console.error('[KubeJS] 方法2 - 设置唱片机NBT时出错: ' + e2);
                            
                            // 方法3: 尝试直接修改方块状态
                            try {
                                jukebox.set('has_record', true);
                                console.info('[KubeJS] 方法3 - 成功设置唱片机状态为有唱片');
                            } catch (e3) {
                                console.error('[KubeJS] 方法3 - 设置唱片机状态时出错: ' + e3);
                            }
                        }
                    }
                    
                    // 从玩家手中移除唱片
                    player.setMainHandItem(handItem.copy().withCount(0));
                } else {
                    console.error('[KubeJS] 无法获取唱片机方块实体');
                }
            } catch (e) {
                console.error('[KubeJS] 设置唱片机物品时出错: ' + e);
            }
        } else {
            console.info('[KubeJS] 唱片机已经有物品，无法放入新唱片');
        }
    } else {
        console.info('[KubeJS] 手持物品不是自定义唱片');
    }
});

// 添加物品使用事件监听
ItemEvents.rightClicked('kubejs:pokopoko_synthion_remix', function(event) {
    console.info('[KubeJS] 自定义唱片被右键点击');
    
    // 检查event.block是否存在
    if (event.block) {
        console.info('[KubeJS] 点击位置: ' + event.block.pos);
        console.info('[KubeJS] 方块类型: ' + event.block.id);
    } else {
        console.info('[KubeJS] 未点击任何方块');
    }
});

// 3. 监听唱片机方块状态变化事件
BlockEvents.placed('minecraft:jukebox', function(event) {
    console.info('[KubeJS] 唱片机被放置: ' + event.block.pos);
});

// 4. 物品属性已经在startup_scripts中设置，这里不再重复设置

console.info('[KubeJS] 自定义唱片功能脚本初始化完成');