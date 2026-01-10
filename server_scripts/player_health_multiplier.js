// 玩家自定义怪物血量倍数系统 - 精简版
// 仅保留 /phm get 和 /phm set 命令

// ========== 配置 ==========
const PHM_CONFIG = {
    DEFAULT_MULTIPLIER: 1.0,
    MIN_MULTIPLIER: 0.1,
    MAX_MULTIPLIER: 10.0,
    PERMISSION_NODE: 'difficulty.player_health_multiplier',
    STORAGE_PATH: 'kubejs/player_health_multipliers.json'
};

// 玩家血量倍率存储
var playerHealthMultipliers = {};

// ========== 核心函数 ==========

/**
 * 检查玩家是否具有权限
 */
function phmHasPermission(player) {
    if (!player || player.isOp()) {
        return true;
    }
    return player.hasPermission(PHM_CONFIG.PERMISSION_NODE);
}

/**
 * 加载玩家血量倍率配置
 */
function phmLoadPlayerMultipliers() {
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(global.server.configDir, PHM_CONFIG.STORAGE_PATH);
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(content);
            playerHealthMultipliers = {};
            for (var uuid in data) {
                if (data.hasOwnProperty(uuid)) {
                    playerHealthMultipliers[uuid] = parseFloat(data[uuid]);
                }
            }
        }
    } catch (error) {
        console.log('[PHM] 加载配置失败: ' + error.message);
    }
}

/**
 * 保存玩家血量倍率配置
 */
function phmSavePlayerMultipliers() {
    try {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(global.server.configDir, PHM_CONFIG.STORAGE_PATH);
        
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(playerHealthMultipliers, null, 2), 'utf8');
    } catch (error) {
        console.log('[PHM] 保存配置失败: ' + error.message);
    }
}

/**
 * 获取玩家的血量倍率
 */
function phmGetPlayerMultiplier(player) {
    if (!player) return PHM_CONFIG.DEFAULT_MULTIPLIER;
    
    const uuid = player.uuid.toString();
    return playerHealthMultipliers[uuid] || PHM_CONFIG.DEFAULT_MULTIPLIER;
}

/**
 * 设置玩家的血量倍率
 */
function phmSetPlayerMultiplier(player, multiplier) {
    if (!player) return false;
    
    const clampedMultiplier = Math.max(PHM_CONFIG.MIN_MULTIPLIER, Math.min(PHM_CONFIG.MAX_MULTIPLIER, multiplier));
    
    const uuid = player.uuid.toString();
    playerHealthMultipliers[uuid] = clampedMultiplier;
    
    // 保存配置
    phmSavePlayerMultipliers();
    
    return true;
}

/**
 * 应用玩家自定义血量倍率到怪物
 */
function phmApplyPlayerMultiplier(entity) {
    if (!entity || !entity.isAlive() || entity.isPlayer()) {
        return;
    }
    
    // 检查实体是否有健康属性（跳过物品、掉落物等非生物实体）
    try {
        // 尝试访问健康属性，如果失败则跳过此实体
        if (typeof entity.getMaxHealth === 'undefined' || typeof entity.getHealth === 'undefined') {
            return;
        }
    } catch (error) {
        return;
    }
    
    // 获取附近玩家
    var nearbyPlayers = [];
    for (var i = 0; i < entity.level.players.length; i++) {
        var player = entity.level.players[i];
        if (!player.isAlive()) continue;
        var dx = player.x - entity.x;
        var dy = player.y - entity.y;
        var dz = player.z - entity.z;
        if (dx * dx + dy * dy + dz * dz <= 32 * 32) {
            nearbyPlayers.push(player);
        }
    }
    
    if (nearbyPlayers.length === 0) {
        return;
    }
    
    // 找到最近玩家
    var closestPlayer = null;
    var closestDistance = Infinity;
    
    for (var i = 0; i < nearbyPlayers.length; i++) {
        var player = nearbyPlayers[i];
        var dx = player.x - entity.x;
        var dy = player.y - entity.y;
        var dz = player.z - entity.z;
        var distance = dx * dx + dy * dy + dz * dz;
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestPlayer = player;
        }
    }
    
    if (!closestPlayer) {
        return;
    }
    
    // 应用倍率
    var multiplier = phmGetPlayerMultiplier(closestPlayer);
    var data = entity.persistentData;
    
    if (!data.contains('phm_originalMaxHealth')) {
        // 确保maxHealth和health是有效的数字，否则使用默认值
        var maxHealth = entity.getMaxHealth();
        var health = entity.getHealth();
        data.putDouble('phm_originalMaxHealth', maxHealth);
        data.putDouble('phm_originalHealth', health);
    }
    
    var originalMaxHealth = data.getDouble('phm_originalMaxHealth');
    var newMaxHealth = originalMaxHealth * multiplier;
    
    // 确保health和maxHealth是有效的数字，否则使用安全值
    var currentHealth = entity.getHealth();
    var currentMaxHealth = entity.getMaxHealth();
    
    // 避免除以0
    var healthRatio = currentMaxHealth > 0 ? currentHealth / currentMaxHealth : 1.0;
    
    entity.setMaxHealth(newMaxHealth);
    entity.setHealth(newMaxHealth * healthRatio);
}

// ========== 事件处理器 ==========

/**
 * 服务器加载完成事件
 */
ServerEvents.loaded(function(event) {
    phmLoadPlayerMultipliers();
    console.log('[PHM] 玩家自定义怪物血量倍数系统已加载完成！');
});

/**
 * 实体生成事件
 */
EntityEvents.spawned(function(event) {
    var entity = event.entity;
    
    // 跳过非敌对生物
    if (!entity || entity.isPlayer() || !entity.isAlive()) {
        return;
    }
    
    var entityType = entity.getType().toString();
    var skipTypes = ['villager', 'animal', 'iron_golem', 'bat', 'marker', 'item', 'arrow', 'projectile',
        'area_effect_cloud', 'painting', 'boat', 'minecart', 'armor_stand', 'item_frame',
        'leash_knot', 'ender_pearl', 'eye_of_ender', 'firework', 'fireball', 'dragon_fireball',
        'wither_skull', 'shulker_bullet', 'llama_spit', 'evoker_fangs', 'fishing_bobber',
        'lightning_bolt', 'tnt', 'falling_block', 'experience_orb', 'experience_bottle',
        'text_display', 'interaction', 'glow_item_frame'];
    
    var skip = false;
    for (var i = 0; i < skipTypes.length; i++) {
        if (entityType.includes(skipTypes[i])) {
            skip = true;
            break;
        }
    }
    
    if (skip) {
        return;
    }
    
    try {
        phmApplyPlayerMultiplier(entity);
    } catch (error) {
        console.log('[PHM] 应用玩家血量倍率失败: ' + error.message);
    }
});

/**
 * 监听现有难度系统的怪物生成事件，确保我们的倍率被正确应用
 */
EntityEvents.spawned(function(event) {
    var entity = event.entity;
    
    // 延迟1tick应用，确保现有系统已处理
    entity.level.server.scheduleInTicks(1, function() {
        if (!entity || !entity.isAlive() || entity.isPlayer()) {
            return;
        }
        
        var entityType = entity.getType().toString();
        var skipTypes = ['villager', 'animal', 'iron_golem', 'bat', 'marker', 'item', 'arrow', 'projectile',
            'area_effect_cloud', 'painting', 'boat', 'minecart', 'armor_stand', 'item_frame',
            'leash_knot', 'ender_pearl', 'eye_of_ender', 'firework', 'fireball', 'dragon_fireball',
            'wither_skull', 'shulker_bullet', 'llama_spit', 'evoker_fangs', 'fishing_bobber',
            'lightning_bolt', 'tnt', 'falling_block', 'experience_orb', 'experience_bottle',
            'text_display', 'interaction', 'glow_item_frame'];
        
        var skip = false;
        for (var i = 0; i < skipTypes.length; i++) {
            if (entityType.includes(skipTypes[i])) {
                skip = true;
                break;
            }
        }
        
        if (skip) {
            return;
        }
        
        try {
            phmApplyPlayerMultiplier(entity);
        } catch (error) {
            console.log('[PHM] 应用玩家血量倍率失败: ' + error.message);
        }
    });
});

/**
 * 命令注册事件
 */
ServerEvents.commandRegistry(function(event) {
    var Commands = event.commands;
    var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType');
    var DoubleArgumentType = Java.loadClass('com.mojang.brigadier.arguments.DoubleArgumentType');
    var Component = Java.loadClass('net.minecraft.network.chat.Component');
    
    // ========== 玩家命令: /phm ==========
    event.register(
        Commands.literal('phm')
            // 查看当前倍率
            .then(Commands.literal('get')
                .executes(function(ctx) {
                    var source = ctx.source;
                    var player = source.player;
                    
                    if (!player) {
                        source.sendFeedback(Component.literal('❌ 此命令只能由玩家执行！'), false);
                        return 1;
                    }
                    
                    var currentMultiplier = phmGetPlayerMultiplier(player);
                    
                    player.tell(Component.literal('📊 当前怪物血量倍率: x' + currentMultiplier.toFixed(2)));
                    player.tell(Component.literal('📏 允许范围: ' + PHM_CONFIG.MIN_MULTIPLIER + ' - ' + PHM_CONFIG.MAX_MULTIPLIER));
                    
                    return 1;
                })
            )
            // 设置倍率
            .then(Commands.literal('set')
                .then(Commands.argument('multiplier', DoubleArgumentType.doubleArg())
                    .executes(function(ctx) {
                        var source = ctx.source;
                        var player = source.player;
                        var multiplier = DoubleArgumentType.getDouble(ctx, 'multiplier');
                        
                        if (!player) {
                            source.sendFeedback(Component.literal('❌ 此命令只能由玩家执行！'), false);
                            return 1;
                        }
                        
                        // 权限检查
                        if (!phmHasPermission(player)) {
                            player.tell(Component.literal('❌ 你没有权限使用此命令！'));
                            return 1;
                        }
                        
                        // 检查倍率范围
                        if (multiplier < PHM_CONFIG.MIN_MULTIPLIER || multiplier > PHM_CONFIG.MAX_MULTIPLIER) {
                            player.tell(Component.literal('❌ 倍率必须在 ' + PHM_CONFIG.MIN_MULTIPLIER + ' - ' + PHM_CONFIG.MAX_MULTIPLIER + ' 之间！'));
                            return 1;
                        }
                        
                        // 设置倍率
                        var clampedMultiplier = phmGetPlayerMultiplier(player);
                        phmSetPlayerMultiplier(player, multiplier);
                        
                        player.tell(Component.literal('✅ 怪物血量倍率已设置为: x' + clampedMultiplier.toFixed(2)));
                        player.tell(Component.literal('💡 新生成的怪物将应用此倍率！'));
                        
                        return 1;
                    })
                )
            )
            // 简化命令别名 - 只保留必要的帮助
            .executes(function(ctx) {
                var source = ctx.source;
                var player = source.player;
                
                if (player) {
                    player.tell(Component.literal('§e§m          §e[ §6§l玩家自定义怪物血量倍数 §e]§e§m          '));
                    player.tell(Component.literal('§b/phm get §7- 查看当前怪物血量倍率'));
                    player.tell(Component.literal('§b/phm set <倍率> §7- 设置怪物血量倍率（0.1-10.0）'));
                }
                
                return 1;
            })
    );
    
    // 简化命令别名
    event.register(
        Commands.literal('怪物血量')
            .executes(function(ctx) {
                var source = ctx.source;
                var player = source.player;
                
                if (player) {
                    var currentMultiplier = phmGetPlayerMultiplier(player);
                    
                    player.tell(Component.literal('§e§m          §e[ §6§l玩家自定义怪物血量倍数 §e]§e§m          '));
                    player.tell(Component.literal('§b当前倍率: §f x' + currentMultiplier.toFixed(2)));
                    player.tell(Component.literal('§b使用 §f/phm set <倍率> §b来修改'));
                    player.tell(Component.literal('§b允许范围: §f ' + PHM_CONFIG.MIN_MULTIPLIER + ' - ' + PHM_CONFIG.MAX_MULTIPLIER));
                }
                
                return 1;
            })
    );
});
