// 我的世界爬塔系统实现
// 与动态难度系统完全兼容的KubeJS 7.x爬塔挑战系统

// 调试标志 - 使用var避免Rhino引擎const变量作用域问题
var TOWER_DEBUG_FLAGS = {
    console: true,
    chat: false // 启用聊天消息日志，用于调试怪物生成提示
};

// 配置项 - 根据README_TOWER_SYSTEM.md中的定义
var TOWER_CONFIG = {
    // 基础配置
    BASE_TOWER_HEIGHT: 1,
    MAX_TOWER_HEIGHT: 100,
    FLOOR_DIFFICULTY_MULTIPLIER: 0.1,
    TOWER_REGION_SIZE: 64,
    DETECTION_RADIUS: 32,
    
    // 难度配置
    MIN_HEALTH_MULTIPLIER: 1.0,
    MAX_HEALTH_MULTIPLIER: 5.0,
    MIN_ARMOR_MULTIPLIER: 1.0,
    MAX_ARMOR_MULTIPLIER: 3.0,
    MIN_DAMAGE_MULTIPLIER: 1.0,
    MAX_DAMAGE_MULTIPLIER: 2.5,
    
    // 奖励配置
    REWARD_INTERVAL: 5,
    BASE_XP_REWARD: 100,
    XP_MULTIPLIER_PER_FLOOR: 0.2,
    
    // 怪物入侵波次配置
    WAVE_COUNT: 6,
    WAVE_SPAWN_INTERVAL: 10,
    TIME_LIMIT_PER_FLOOR: 300,
    
    // 自定义消息配置
    CUSTOM_MESSAGES: {
        SPAWN_COMPLETE: '§a[爬塔系统] 第 {wave}/{totalWaves} 波 {monsterType} 已全部生成，请准备战斗！',
        SPAWN_START: '§6[爬塔系统] 第 {wave}/{totalWaves} 波 {monsterType} 正在生成!',
        // 可以根据需要添加更多自定义消息
    },
    
    // 怪物生成数量配置
    MONSTER_SPAWN_SCALING: {
        BASE_NORMAL_COUNT: 20, // 基础普通怪物数量
        BASE_ELITE_COUNT: 60,  // 基础精英怪物数量
        FLOOR_MULTIPLIER: 0.5, // 每层增加的怪物数量比例
        WAVE_MULTIPLIER: 0.5,   // 每波增加的怪物数量比例
        
        // 基于击杀数的调整配置
        KILL_BASED_SCALING: {
            ENABLED: true, // 是否启用基于击杀数的调整
            MIN_ADJUSTMENT: 0.7, // 最小调整比例（当前击杀数多，怪物减少）
            MAX_ADJUSTMENT: 1.5, // 最大调整比例（当前击杀数少，怪物增加）
            TARGET_KILL_RATE: 2, // 目标击杀率（每分钟击杀数量）
            ADJUSTMENT_FACTOR: 0.1, // 调整因子（控制变化幅度）
        },
        
        // 每层所需击杀数配置
        REQUIRED_KILLS: {
            BASE: 200, // 基础击杀数
            FLOOR_MULTIPLIER: 50, // 每层增加的击杀数
            WAVE_MULTIPLIER: 0.05 // 每波增加的击杀数比例
        },
    },
    
    // 调试配置
    DEBUG: false,
    // 实体检查配置
    // 设置为true时，所有击杀的实体都会被视为塔内怪物，用于调试或特殊玩法
    SKIP_TOWER_MONSTER_CHECK: true,
    // 闪电效果配置
    LIGHTNING_EFFECT: {
        ENABLED: true, // 是否启用闪电效果
        CHANCE: 0.3,   // 闪电生成的概率
        MIN_INTERVAL: 50, // 最小间隔时间（tick，5秒）
        MAX_INTERVAL: 100  // 最大间隔时间（tick，10秒）
    },
    // 怪物生成配置
    MONSTER_SPAWN_CONFIG: {
        MIN_RADIUS: 10,  // 最小生成半径
        MAX_RADIUS: 30,  // 最大生成半径
        PREP_TIME: 10, // 波次开始前的准备时间（秒）
        MONSTER_VARIETY_COUNT: 20 // 每波生成的怪物种类数量
    }
};

// 玩家进度存储 - 使用Map来存储每个玩家的爬塔信息
var playerProgress = new Map();

// 塔区域存储 - 存储每个玩家的塔起点位置
var towerRegions = new Map();

// 波次生成计时器
var waveTimers = new Map();

// 闪电效果计时器
    var lightningTimers = new Map();

    // 自动下一层标记
    var autoNextFloorFlags = new Map();

    // 计分板存储
    var scoreboardPlayers = new Map();

// 导入必要的类
// // const Vec3 = Java.loadClass('net.minecraft.core.Vec3'); // 注释掉，当前版本不支持这个类路径 // 注释掉，当前版本不支持这个类路径

// 工具函数 - 安全日志输出
function towerSafeLog(msg, force) {
    // 强制输出所有日志，用于调试
    console.log(`[爬塔系统] ${msg}`);
}

// 工具函数 - 更新爬塔计分板
function updateTowerScoreboard(player) {
    try {
        var progress = getPlayerProgress(player);
        var playerUUID = player.uuid.toString();
        var scoreboardName = scoreboardPlayers.get(playerUUID);
        
        if (!scoreboardName || !progress.inTower) {
            return;
        }
        
        // 计算剩余时间
        var currentRealTime = new Date().getTime();
        var elapsedTime = Math.floor((currentRealTime - progress.startTime) / 1000);
        var remainingTime = Math.max(0, TOWER_CONFIG.TIME_LIMIT_PER_FLOOR - elapsedTime);
        var remainingMinutes = Math.floor(remainingTime / 60);
        var remainingSeconds = remainingTime % 60;
        var timeString = `${remainingMinutes}:${remainingSeconds.toFixed(0).padStart(2, '0')}`;
        var elapsedMinutes = Math.floor(elapsedTime / 60);
        var elapsedSeconds = elapsedTime % 60;
        var elapsedTimeString = `${elapsedMinutes}:${elapsedSeconds.toFixed(0).padStart(2, '0')}`;
        
        // 计算击杀进度百分比
        var killPercentage = progress.requiredKills > 0 ? Math.floor((progress.killsThisFloor / progress.requiredKills) * 100) : 0;
        
        // 清除旧的计分板项目
        player.server.runCommandSilent(`scoreboard players reset * ${scoreboardName}`);
        
        // 设置新的计分板项目
        player.server.runCommandSilent(`scoreboard players set "当前楼层" ${scoreboardName} ${progress.currentFloor}`);
        player.server.runCommandSilent(`scoreboard players set "当前波次" ${scoreboardName} ${progress.currentWave}`);
        player.server.runCommandSilent(`scoreboard players set "已击杀" ${scoreboardName} ${progress.killsThisFloor}`);
        player.server.runCommandSilent(`scoreboard players set "需击杀" ${scoreboardName} ${progress.requiredKills}`);
        player.server.runCommandSilent(`scoreboard players set "最高记录" ${scoreboardName} ${progress.highestFloor}`);
        player.server.runCommandSilent(`scoreboard players set "剩余时间" ${scoreboardName} ${remainingTime}`);
        player.server.runCommandSilent(`scoreboard players set "已用时间" ${scoreboardName} ${elapsedTime}`);
        player.server.runCommandSilent(`scoreboard players set "波次总数" ${scoreboardName} ${TOWER_CONFIG.WAVE_COUNT}`);
        player.server.runCommandSilent(`scoreboard players set "击杀进度" ${scoreboardName} ${killPercentage}`);
        
        // 设置计分板项目顺序和颜色
        player.server.runCommandSilent(`scoreboard objectives modify ${scoreboardName} displayname {"text":"爬塔进度","color":"gold"}`);
        player.server.runCommandSilent(`scoreboard players set "§6========================" ${scoreboardName} 999`);
        player.server.runCommandSilent(`scoreboard players set "§a🏆 最高记录" ${scoreboardName} 998`);
        player.server.runCommandSilent(`scoreboard players set "§b🌆 当前楼层: ${progress.currentFloor}/${TOWER_CONFIG.MAX_TOWER_HEIGHT}" ${scoreboardName} 997`);
        player.server.runCommandSilent(`scoreboard players set "§c🌊 波次进度: ${progress.currentWave}/${TOWER_CONFIG.WAVE_COUNT}" ${scoreboardName} 996`);
        player.server.runCommandSilent(`scoreboard players set "§e⚔ 击杀统计: ${progress.killsThisFloor}/${progress.requiredKills} (${killPercentage}%)" ${scoreboardName} 995`);
        player.server.runCommandSilent(`scoreboard players set "§d⏱ 已用时间: ${elapsedTimeString}" ${scoreboardName} 994`);
        player.server.runCommandSilent(`scoreboard players set "§5⌛ 剩余时间: ${timeString}" ${scoreboardName} 993`);
        player.server.runCommandSilent(`scoreboard players set "§f⚡ 难度: ${Math.floor(progress.currentFloor * 10)}% 提升" ${scoreboardName} 992`);
        player.server.runCommandSilent(`scoreboard players set "§g🎯 怪物生命倍率: ${Math.floor(calculateDifficultyMultiplier(progress.currentFloor, TOWER_CONFIG.MIN_HEALTH_MULTIPLIER, TOWER_CONFIG.MAX_HEALTH_MULTIPLIER) * 100)}%" ${scoreboardName} 990`);
        player.server.runCommandSilent(`scoreboard players set "§g⚔ 怪物伤害倍率: ${Math.floor(calculateDifficultyMultiplier(progress.currentFloor, TOWER_CONFIG.MIN_DAMAGE_MULTIPLIER, TOWER_CONFIG.MAX_DAMAGE_MULTIPLIER) * 100)}%" ${scoreboardName} 989`);
        player.server.runCommandSilent(`scoreboard players set "§g🛡 怪物护甲倍率: ${Math.floor(calculateDifficultyMultiplier(progress.currentFloor, TOWER_CONFIG.MIN_ARMOR_MULTIPLIER, TOWER_CONFIG.MAX_ARMOR_MULTIPLIER) * 100)}%" ${scoreboardName} 988`);
        player.server.runCommandSilent(`scoreboard players set "§6========================" ${scoreboardName} 987`);
        
        // 添加提示信息
        if (progress.currentWave < TOWER_CONFIG.WAVE_COUNT && progress.killsThisFloor >= progress.requiredKills) {
            player.server.runCommandSilent(`scoreboard players set "§a✓ 可进入下一波!" ${scoreboardName} 990`);
        }
        if (remainingTime <= 60) {
            player.server.runCommandSilent(`scoreboard players set "§4⚠ 时间紧急! 剩余${remainingTime}秒" ${scoreboardName} 989`);
        }
        if (remainingTime <= 30) {
            player.server.runCommandSilent(`scoreboard players set "§4🚨 危险! 剩余${remainingTime}秒" ${scoreboardName} 988`);
        }
        // 添加特殊状态提示
        if (progress.extraDropBonus) {
            player.server.runCommandSilent(`scoreboard players set "§6✨ 掉落物增益 (剩余${progress.extraDropBonusDuration}层)" ${scoreboardName} 987`);
        }
        // 添加下一波准备时间提示
        if (TOWER_CONFIG.MONSTER_SPAWN_CONFIG.PREP_TIME > 0) {
            player.server.runCommandSilent(`scoreboard players set "§7⏸ 波次准备: ${TOWER_CONFIG.MONSTER_SPAWN_CONFIG.PREP_TIME}秒" ${scoreboardName} 986`);
        }
        // 添加完成度提示
        var floorProgress = Math.floor((progress.currentFloor / TOWER_CONFIG.MAX_TOWER_HEIGHT) * 100);
        var waveProgress = Math.floor((progress.currentWave / TOWER_CONFIG.WAVE_COUNT) * 100);
        var overallProgress = Math.floor((floorProgress * 0.7 + waveProgress * 0.3) / 100 * 100);
        player.server.runCommandSilent(`scoreboard players set "§7📊 总体进度: ${overallProgress}%" ${scoreboardName} 985`);
    } catch (error) {
        towerSafeLog(`更新计分板时出错: ${error.message}`, true);
    }
}

// 工具函数 - 发送聊天消息给玩家
function tellPlayer(player, message) {
    if (player && !player.isFake()) {
        player.tell(message);
        if (TOWER_DEBUG_FLAGS.chat) {
            towerSafeLog(`发送消息给玩家 ${player.getName()}: ${message}`);
        }
    }
}

// 工具函数 - 检查实体是否应该跳过（非敌对生物、玩家等）
function towerShouldSkipEntity(entity) {
    if (!entity || entity.isPlayer() || !entity.isAlive()) {
        return true;
    }
    var name = entity.getType().toString(); // 改为var避免Rhino引擎const变量作用域问题
    return ['villager', 'animal', 'iron_golem', 'bat', 'marker', 'item', 'arrow', 'projectile',
        'area_effect_cloud', 'painting', 'boat', 'minecart', 'armor_stand', 'item_frame',
        'leash_knot', 'ender_pearl', 'eye_of_ender', 'firework', 'fireball', 'dragon_fireball',
        'wither_skull', 'shulker_bullet', 'llama_spit', 'evoker_fangs', 'fishing_bobber',
        'lightning_bolt', 'tnt', 'falling_block', 'experience_orb', 'experience_bottle',
        'text_display', 'interaction', 'glow_item_frame'].some(v => name.includes(v));
}

// 工具函数 - 计算难度倍率
function calculateDifficultyMultiplier(floor, baseMultiplier, maxMultiplier) {
    var progress = Math.min((floor - 1) / (TOWER_CONFIG.MAX_TOWER_HEIGHT - 1), 1.0); // 改为var避免Rhino引擎const变量作用域问题
    var multiplier = baseMultiplier + (maxMultiplier - baseMultiplier) * progress * (1 + TOWER_CONFIG.FLOOR_DIFFICULTY_MULTIPLIER); // 改为var避免Rhino引擎const变量作用域问题
    return Math.min(multiplier, maxMultiplier);
}

// 工具函数 - 强化塔内怪物
function scaleTowerMonster(entity, floor) {
    // 检查怪物是否已经被塔系统强化过
    if (entity.persistentData && entity.persistentData.getBoolean('tower_enhanced')) {
        return;
    }
    
    // 标记为塔强化，避免与动态难度系统冲突
    entity.persistentData.putBoolean('tower_enhanced', true);
    
    // 根据楼层计算强化倍率
    var healthMultiplier = calculateDifficultyMultiplier(floor, TOWER_CONFIG.MIN_HEALTH_MULTIPLIER, TOWER_CONFIG.MAX_HEALTH_MULTIPLIER); // 改为var避免Rhino引擎const变量作用域问题
    var armorMultiplier = calculateDifficultyMultiplier(floor, TOWER_CONFIG.MIN_ARMOR_MULTIPLIER, TOWER_CONFIG.MAX_ARMOR_MULTIPLIER); // 改为var避免Rhino引擎const变量作用域问题
    var damageMultiplier = calculateDifficultyMultiplier(floor, TOWER_CONFIG.MIN_DAMAGE_MULTIPLIER, TOWER_CONFIG.MAX_DAMAGE_MULTIPLIER); // 改为var避免Rhino引擎const变量作用域问题
    
    // 应用强化
    var maxHealth = entity.getMaxHealth() * healthMultiplier; // 改为var避免Rhino引擎const变量作用域问题
    entity.setMaxHealth(maxHealth);
    entity.setHealth(maxHealth);
    
    // 增加护甲
    var currentArmor = entity.getArmorValue(); // 改为var避免Rhino引擎const变量作用域问题
    entity.setArmorValue(Math.round(currentArmor * armorMultiplier));
    
    // 增加伤害（需要通过NBT或其他方式实现，这里使用简易方法）
    // 在实体生成事件中设置伤害倍率标记
    entity.persistentData.putDouble('tower_damage_multiplier', damageMultiplier);
    
    towerSafeLog(`强化塔内怪物: ${entity.getType()} 楼层: ${floor} 生命倍率: ${healthMultiplier.toFixed(2)} 护甲倍率: ${armorMultiplier.toFixed(2)} 伤害倍率: ${damageMultiplier.toFixed(2)}`);
}

// 工具函数 - 保存玩家爬塔进度
function savePlayerProgress(player, progress) {
    // 直接使用表达式避免变量声明，减少Rhino引擎作用域问题
    playerProgress.set(player.uuid.toString(), progress);
    
    // 直接使用player.persistentData，完全避免变量声明
    player.persistentData.putBoolean('tower_inProgress', progress.inTower);
    player.persistentData.putInt('tower_currentFloor', progress.currentFloor);
    player.persistentData.putInt('tower_highestFloor', progress.highestFloor);
    player.persistentData.putInt('tower_currentWave', progress.currentWave);
    player.persistentData.putInt('tower_killsThisFloor', progress.killsThisFloor);
    player.persistentData.putInt('tower_requiredKills', progress.requiredKills);
    
    // 保存开始时间到持久化存储（使用毫秒时间戳，避免Minecraft dayTime重置问题）
    if (progress.startTime && progress.inTower) {
        player.persistentData.putLong('tower_startTime', progress.startTime);
    }
    
    // 保存其他需要的进度数据
}

// 工具函数 - 获取玩家爬塔进度（带持久化存储恢复）
function getPlayerProgress(player) {
    // 使用var声明避免Rhino引擎的const变量作用域问题
    var playerUuid = player.uuid.toString();
    var progress = null;
    
    if (!playerProgress.has(playerUuid)) {
        // 使用var声明所有变量
        var inTowerCheck = player.persistentData.getBoolean('tower_inProgress') || false;
        var calculatedStartTime = 0;
        
        // 直接使用条件语句，避免自执行函数
        if (inTowerCheck) {
            try {
                var storedTime = player.persistentData.getLong('tower_startTime');
                calculatedStartTime = typeof storedTime === 'number' && storedTime > 0 ? storedTime : new Date().getTime();
            } catch (e) {
                calculatedStartTime = new Date().getTime();
            }
        }
        
        // 创建进度对象
        progress = {
            currentFloor: player.persistentData.getInt('tower_currentFloor') || 0,
            highestFloor: player.persistentData.getInt('tower_highestFloor') || 0,
            killsThisFloor: player.persistentData.getInt('tower_killsThisFloor') || 0,
            // 使用配置的击杀数公式计算所需击杀数
            requiredKills: player.persistentData.getInt('tower_requiredKills') || 
                Math.floor(TOWER_CONFIG.MONSTER_SPAWN_SCALING.REQUIRED_KILLS.BASE + 
                TOWER_CONFIG.MONSTER_SPAWN_SCALING.REQUIRED_KILLS.FLOOR_MULTIPLIER * (player.persistentData.getInt('tower_currentFloor') || 0) + 
                TOWER_CONFIG.MONSTER_SPAWN_SCALING.REQUIRED_KILLS.WAVE_MULTIPLIER * (player.persistentData.getInt('tower_currentWave') || 0)),
            currentWave: inTowerCheck ? Math.max(player.persistentData.getInt('tower_currentWave') || 1, 1) : 0, // 如果在爬塔中，波次至少为1
            startTime: calculatedStartTime,
            inTower: inTowerCheck,
            extraDropBonus: false,
            extraDropBonusDuration: 0
        };
        
        playerProgress.set(playerUuid, progress);
    } else {
        // 获取现有进度并创建副本，避免Rhino引擎的const变量作用域问题
        var existingProgress = playerProgress.get(playerUuid);
        progress = {
            currentFloor: existingProgress.currentFloor,
            highestFloor: existingProgress.highestFloor,
            killsThisFloor: existingProgress.killsThisFloor,
            requiredKills: existingProgress.requiredKills,
            currentWave: existingProgress.currentWave,
            startTime: existingProgress.startTime,
            inTower: existingProgress.inTower,
            extraDropBonus: existingProgress.extraDropBonus,
            extraDropBonusDuration: existingProgress.extraDropBonusDuration
        };
    }
    
    return progress;
}

// 工具函数 - 生成怪物波次
function spawnMonsterWave(player, floor, wave) {
    // 使用var声明避免Rhino引擎的const变量作用域问题
    var progress = getPlayerProgress(player);
    
    // 调试日志：检查函数调用参数和状态
    towerSafeLog(`[DEBUG] spawnMonsterWave被调用 - 玩家: ${player.getName()}, 楼层: ${floor}, 波次: ${wave}`);
    towerSafeLog(`[DEBUG] 玩家UUID: ${player.uuid.toString()}`);
    
    // 检查towerRegions中是否存在该玩家的记录
    var towerPos = towerRegions.get(player.uuid.toString());
    var hasEntry = towerRegions.has(player.uuid.toString());
    towerSafeLog(`[DEBUG] 玩家状态检查 - inTower: ${progress.inTower}, towerPos: ${towerPos ? `(${towerPos.x}, ${towerPos.y}, ${towerPos.z})` : 'null'}`);
    towerSafeLog(`[DEBUG] towerRegions中存在玩家记录: ${hasEntry}`);
    
    if (!towerPos || !progress.inTower) {
        towerSafeLog(`[DEBUG] spawnMonsterWave提前退出 - 原因: ${!towerPos ? 'towerPos为空' : 'progress.inTower为false'}`);
        
        // 尝试恢复机制：如果towerPos为空但玩家在爬塔中，重新设置塔区域
        if (!towerPos && progress.inTower) {
            towerSafeLog(`[DEBUG] 尝试恢复塔区域 - 玩家: ${player.getName()}`);
            var playerPos = player.position();
            var playerUUID = player.uuid.toString();
            towerRegions.set(playerUUID, {
                x: Math.floor(playerPos.x),
                y: Math.floor(playerPos.y),
                z: Math.floor(playerPos.z)
            });
            towerSafeLog(`[DEBUG] 恢复塔区域成功 - 玩家: ${player.getName()}, 新位置: (${Math.floor(playerPos.x)}, ${Math.floor(playerPos.y)}, ${Math.floor(playerPos.z)})`);
            
            // 重新获取塔位置
            towerPos = towerRegions.get(playerUUID);
        }
        
        // 如果仍然没有towerPos或不在爬塔中，则退出
        if (!towerPos || !progress.inTower) {
            return;
        }
    }
    
    var world = player.level;
    var centerX = towerPos.x;
    var centerZ = towerPos.z;
    var y = towerPos.y;
    
    // 初始基础怪物数量（这个值会被后面的自定义配置覆盖，保留作为后备）
    let monsterCount = 5 + Math.floor(floor * 0.5);
    let monsterType = 'zombie'; // 默认怪物类型
    
    // 获取所有敌对生物类型（包括模组添加的生物），去除水下生物
    function getAllHostileMobs() {
        try {
            // 基础敌对生物列表（去除水下生物：drowned, elder_guardian）
            var baseHostileMobs = [
                // 普通敌对生物
                'zombie', 'skeleton', 'spider', 'creeper', 'enderman', 'witch', 'slime', 
                'cave_spider', 'husk', 'stray', 'phantom', 'pillager',
                // 精英/特殊敌对生物
                'wither_skeleton', 'zombified_piglin', 'ravager', 'evoker', 
                'vex', 'vindicator', 'illusioner', 'zoglin', 'hoglins'
            ];
            
            // 兼容模组生物（生于混沌、灾变等）
            try {
                // 尝试添加模组生物
                var moddedMobs = [
                    // 生于混沌模组生物
                    'chaos:chaos_zombie', 'chaos:chaos_skeleton', 'chaos:chaos_creeper',
                    // 灾变模组生物
                    'cataclysm:ender_dragonling', 'cataclysm:wither_skeleton_archer'
                ];
                
                // 检查模组是否存在
                var modRegistry = Java.loadClass('net.minecraft.core.Registry');
                var entityTypeRegistry = modRegistry.ENTITY_TYPE;
                
                for (var i = 0; i < moddedMobs.length; i++) {
                    var mobId = moddedMobs[i];
                    try {
                        var resourceLocation = Java.loadClass('net.minecraft.resources.ResourceLocation').parse(mobId);
                        if (entityTypeRegistry.containsKey(resourceLocation)) {
                            baseHostileMobs.push(mobId);
                        }
                    } catch (e) {
                        // 模组不存在或生物类型不存在，忽略
                    }
                }
            } catch (modError) {
                towerSafeLog(`尝试加载模组生物时出错: ${modError.message}`);
            }
            
            return baseHostileMobs;
        } catch (error) {
            towerSafeLog(`获取敌对生物列表时出错: ${error.message}`, true);
            return ['zombie', 'skeleton', 'spider', 'creeper'];
        }
    }
    
    // 根据波次类型选择怪物
    var monsterTypes = [];
    if (wave <= 3) {
        // 普通怪物波次
        var allHostileMobs = getAllHostileMobs();
        // 随机选择多种怪物类型
        var varietyCount = Math.min(TOWER_CONFIG.MONSTER_SPAWN_CONFIG.MONSTER_VARIETY_COUNT, allHostileMobs.length);
        
        // 随机抽取指定数量的不同怪物类型
        for (var i = 0; i < varietyCount; i++) {
            var randomIndex = Math.floor(Math.random() * allHostileMobs.length);
            monsterTypes.push(allHostileMobs[randomIndex]);
            // 移除已选择的类型，避免重复
            allHostileMobs.splice(randomIndex, 1);
        }
        
        // 使用自定义配置计算怪物数量
        monsterCount = Math.floor(TOWER_CONFIG.MONSTER_SPAWN_SCALING.BASE_NORMAL_COUNT * 
                             (1 + TOWER_CONFIG.MONSTER_SPAWN_SCALING.FLOOR_MULTIPLIER * (floor - 1)) *
                             (1 + TOWER_CONFIG.MONSTER_SPAWN_SCALING.WAVE_MULTIPLIER * (wave - 1)));
    } else if (wave <= 5) {
        // 精英怪物波次
        var eliteMobs = ['zombie_villager', 'stray', 'cave_spider', 'husk', 'wither_skeleton', 'drowned', 'pillager'];
        // 随机选择多种精英怪物类型
        var varietyCount = Math.min(TOWER_CONFIG.MONSTER_SPAWN_CONFIG.MONSTER_VARIETY_COUNT, eliteMobs.length);
        
        for (var i = 0; i < varietyCount; i++) {
            var randomIndex = Math.floor(Math.random() * eliteMobs.length);
            monsterTypes.push(eliteMobs[randomIndex]);
            eliteMobs.splice(randomIndex, 1);
        }
        
        // 使用自定义配置计算怪物数量
        monsterCount = Math.floor(TOWER_CONFIG.MONSTER_SPAWN_SCALING.BASE_ELITE_COUNT * 
                             (1 + TOWER_CONFIG.MONSTER_SPAWN_SCALING.FLOOR_MULTIPLIER * (floor - 1)) *
                             (1 + TOWER_CONFIG.MONSTER_SPAWN_SCALING.WAVE_MULTIPLIER * (wave - 1)));
    } else {
        // BOSS波次
        var bossMonsters = ['wither_skeleton', 'zombified_piglin', 'ravager'];
        monsterTypes = [bossMonsters[Math.floor(Math.random() * bossMonsters.length)]];
        monsterCount = 1;
    }
        
        // 添加闪电效果（如果启用）
    if (TOWER_CONFIG.LIGHTNING_EFFECT.ENABLED) {
        try {
            var playerUUID = player.uuid.toString();
            var lastLightningTime = lightningTimers.get(playerUUID) || 0;
            var currentTick = server.tickCount;
            
            // 检查是否达到间隔时间
            if (currentTick - lastLightningTime >= TOWER_CONFIG.LIGHTNING_EFFECT.MIN_INTERVAL) {
                // 有一定概率生成闪电
                if (Math.random() < TOWER_CONFIG.LIGHTNING_EFFECT.CHANCE) {
                    // 计算随机位置
                    var range = 8;
                    var lightningX = centerX + (Math.random() * range * 2 - range);
                    var lightningZ = centerZ + (Math.random() * range * 2 - range);
                    
                    // 使用原版指令生成闪电
                    player.server.runCommandSilent(`summon minecraft:lightning_bolt ${Math.floor(lightningX)} ~ ${Math.floor(lightningZ)}`);
                    
                    // 更新闪电计时器
                    lightningTimers.set(playerUUID, currentTick);
                    
                    // 设置下一次闪电的随机间隔
                    var nextInterval = TOWER_CONFIG.LIGHTNING_EFFECT.MIN_INTERVAL + Math.floor(Math.random() * (TOWER_CONFIG.LIGHTNING_EFFECT.MAX_INTERVAL - TOWER_CONFIG.LIGHTNING_EFFECT.MIN_INTERVAL));
                    lightningTimers.set(playerUUID + '_next', currentTick + nextInterval);
                }
            }
        } catch (error) {
            towerSafeLog(`生成闪电效果时出错: ${error.message}`, true);
        }
    }

    // 应用基于击杀数的调整
    if (TOWER_CONFIG.MONSTER_SPAWN_SCALING.KILL_BASED_SCALING.ENABLED && wave > 1) {
        try {
                // 计算实际击杀率（每波的平均击杀数）
                var actualKills = progress.killsThisFloor;
                var timeSpent = ((new Date().getTime() - progress.startTime) / 1000 / 60); // 转换为分钟
                var killRate = timeSpent > 0 ? actualKills / timeSpent : 0;
                
                // 计算调整因子
                var targetRate = TOWER_CONFIG.MONSTER_SPAWN_SCALING.KILL_BASED_SCALING.TARGET_KILL_RATE;
                var adjustmentFactor = TOWER_CONFIG.MONSTER_SPAWN_SCALING.KILL_BASED_SCALING.ADJUSTMENT_FACTOR;
                
                // 计算调整比例（实际击杀率低于目标则增加怪物，高于目标则减少怪物）
                var adjustmentRatio = 1 + adjustmentFactor * (1 - Math.min(killRate / targetRate, 2));
                
                // 限制调整比例在最小值和最大值之间
                adjustmentRatio = Math.max(
                    TOWER_CONFIG.MONSTER_SPAWN_SCALING.KILL_BASED_SCALING.MIN_ADJUSTMENT,
                    Math.min(adjustmentRatio, TOWER_CONFIG.MONSTER_SPAWN_SCALING.KILL_BASED_SCALING.MAX_ADJUSTMENT)
                );
                
                // 应用调整（BOSS波次不调整）
                if (wave <= 5) {
                    var originalCount = monsterCount;
                    monsterCount = Math.max(1, Math.floor(monsterCount * adjustmentRatio));
                    
                    // 记录调整信息
                    towerSafeLog(`[DEBUG] 基于击杀数调整怪物数量 - 原始: ${originalCount}, 调整后: ${monsterCount}, 击杀率: ${killRate.toFixed(2)}/分钟, 目标: ${targetRate}/分钟`);
                }
            } catch (e) {
                towerSafeLog(`[WARN] 基于击杀数调整怪物数量时出错: ${e.message}`);
            }
        }
    
    // 调试日志：怪物生成配置
    towerSafeLog(`[DEBUG] 怪物生成配置 - 类型: ${monsterType}, 数量: ${monsterCount}, 波次: ${wave}/${TOWER_CONFIG.WAVE_COUNT}`);
    
    // 生成前提示
    towerSafeLog(`[DEBUG] 发送生成前提示 - 玩家: ${player.getName()}`);
    // 使用自定义消息
    var monsterTypesStr = monsterTypes.join('、');
    var spawnStartMessage = TOWER_CONFIG.CUSTOM_MESSAGES.SPAWN_START
        .replace('{wave}', wave)
        .replace('{totalWaves}', TOWER_CONFIG.WAVE_COUNT)
        .replace('{monsterType}', monsterTypesStr);
    tellPlayer(player, spawnStartMessage);
    
    // 波次开始前的准备时间
    if (TOWER_CONFIG.MONSTER_SPAWN_CONFIG.PREP_TIME > 0) {
        tellPlayer(player, `§e[爬塔系统] 准备时间: ${TOWER_CONFIG.MONSTER_SPAWN_CONFIG.PREP_TIME} 秒`);
        
        // 使用计时器延迟生成怪物
        var playerUUID = player.uuid.toString();
        if (waveTimers.has(playerUUID)) {
            clearTimeout(waveTimers.get(playerUUID));
        }
        
        waveTimers.set(playerUUID, setTimeout(() => {
            try {
                // 确认玩家仍然在爬塔中
                var currentProgress = getPlayerProgress(player);
                if (!currentProgress.inTower || currentProgress.currentWave !== wave) {
                    return;
                }
                
                // 开始生成怪物
                startSpawningMonsters(player, world, centerX, centerZ, y, floor, wave, monsterCount, monsterTypes);
            } catch (error) {
                towerSafeLog(`延迟生成怪物波次时出错: ${error.message}`, true);
            }
        }, TOWER_CONFIG.MONSTER_SPAWN_CONFIG.PREP_TIME * 20)); // 转换为tick
        
        return; // 跳过直接生成
    } else {
        // 无准备时间，直接生成
        startSpawningMonsters(player, world, centerX, centerZ, y, floor, wave, monsterCount, monsterTypes);
    }
}

// 辅助函数：开始生成怪物
function startSpawningMonsters(player, world, centerX, centerZ, y, floor, wave, monsterCount, monsterTypes) {
    // 生成怪物
    towerSafeLog(`[DEBUG] 开始生成怪物 - 数量: ${monsterCount}`);
    var spawnedCount = 0;
    
    for (let i = 0; i < monsterCount; i++) {
        // 随机选择一种怪物类型
        var randomMonsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
        
        // 随机生成位置（使用配置的生成半径）
        var angle = Math.random() * Math.PI * 2;
        var radius = TOWER_CONFIG.MONSTER_SPAWN_CONFIG.MIN_RADIUS + Math.random() * (TOWER_CONFIG.MONSTER_SPAWN_CONFIG.MAX_RADIUS - TOWER_CONFIG.MONSTER_SPAWN_CONFIG.MIN_RADIUS);
        var spawnX = centerX + Math.cos(angle) * radius;
        var spawnZ = centerZ + Math.sin(angle) * radius;
        
        // 找到合适的Y坐标
        let spawnY = y;
        for (let dy = 0; dy < 10; dy++) {
            var blockAbove = world.getBlock(spawnX, spawnY + dy, spawnZ);
            var blockBelow = world.getBlock(spawnX, spawnY + dy - 1, spawnZ);
            
            // 使用正确的方法检查方块类型
            if (blockAbove && blockAbove.id === 'minecraft:air' && 
                blockBelow && blockBelow.material === 'solid') {
                spawnY += dy;
                break;
            }
        }
        
        // 生成怪物
        try {
            // 使用var声明避免Rhino引擎的const变量作用域问题
            // 尝试使用玩家所在维度的spawnEntity方法生成实体
            // 在KubeJS中，这是一种常见的实体生成方式
            var entity = player.level.dimension.spawnEntity(randomMonsterType, {x: spawnX, y: spawnY, z: spawnZ});
            if (entity) {
                // 强化怪物
                scaleTowerMonster(entity, floor);
                
                // 设置怪物目标为玩家
                entity.setTarget(player);
                
                // 为怪物添加塔标记
                entity.persistentData.putBoolean('in_tower', true);
                entity.persistentData.putString('tower_owner', player.uuid.toString());
                
                // 添加详细调试日志
                towerSafeLog(`[DEBUG] 生成塔内怪物 - 类型: ${randomMonsterType}, 位置: (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)}, ${spawnZ.toFixed(1)}), 玩家: ${player.getName()}`);
                spawnedCount++;
            } else {
                towerSafeLog(`[DEBUG] 实体生成失败，返回null`);
            }
        } catch (error) {
            towerSafeLog(`生成怪物 ${randomMonsterType} 失败: ${error.message}`, true);
            
            // 如果第一个方法失败，尝试使用替代方案
            try {
                // 尝试通过命令生成实体
                towerSafeLog(`[DEBUG] 尝试使用命令生成实体`);
                player.server.runCommand(`summon ${randomMonsterType} ${spawnX} ${spawnY} ${spawnZ}`);
                towerSafeLog(`[DEBUG] 命令生成实体成功`);
                spawnedCount++;
                
                // 注意：命令生成的实体需要在EntityEvents.spawned中进行强化
            } catch (cmdError) {
                towerSafeLog(`命令生成实体 ${randomMonsterType} 失败: ${cmdError.message}`, true);
            }
        }
    }
    
    // 调试日志：怪物生成完成
    towerSafeLog(`[DEBUG] 怪物生成完成 - 计划生成: ${monsterCount}个, 实际生成: ${spawnedCount}个, 玩家: ${player.getName()}`);
    
    // 怪物生成完成提示
    towerSafeLog(`[DEBUG] 发送生成完成提示 - 玩家: ${player.getName()}`);
    // 使用自定义消息
    var monsterTypesStr = monsterTypes.join('、');
    var spawnCompleteMessage = TOWER_CONFIG.CUSTOM_MESSAGES.SPAWN_COMPLETE
        .replace('{wave}', wave)
        .replace('{totalWaves}', TOWER_CONFIG.WAVE_COUNT)
        .replace('{monsterType}', monsterTypesStr);
    tellPlayer(player, spawnCompleteMessage);
    
    if (spawnedCount < monsterCount) {
        tellPlayer(player, `§c[爬塔系统] 警告：部分怪物生成失败，实际生成 ${spawnedCount}/${monsterCount} 个怪物。`);
    }
    return true;
}

// 工具函数 - 给予玩家奖励
function grantRewards(player, floor) {
    // 每5层给予经验奖励
    if (floor % TOWER_CONFIG.REWARD_INTERVAL === 0) {
        // 使用var声明避免Rhino引擎的const变量作用域问题
        var xpReward = Math.floor(TOWER_CONFIG.BASE_XP_REWARD * Math.pow(1 + TOWER_CONFIG.XP_MULTIPLIER_PER_FLOOR, floor - 1));
        player.giveExperiencePoints(xpReward);
        tellPlayer(player, `§a[爬塔系统] 恭喜到达第 ${floor} 层！获得 ${xpReward} 点经验值奖励！`);
        towerSafeLog(`${player.getName()} 在第 ${floor} 层获得了 ${xpReward} 点经验值`);
    }
    
    // 每10层给予额外的特殊奖励
    if (floor % 10 === 0) {
        // 给予当前塔层BOSS的战利品表中的随机物品
        // 使用var声明避免Rhino引擎的const变量作用域问题
        var lootTables = ['minecraft:chests/simple_dungeon', 'minecraft:chests/abandoned_mineshaft', 'minecraft:chests/stronghold_corridor'];
        var randomLootTable = lootTables[Math.floor(Math.random() * lootTables.length)];
        
        // 生成随机物品
        var itemStack = player.level.getLootTable(randomLootTable).rollItemStack();
        if (itemStack && !itemStack.isEmpty()) {
            player.giveItemStack(itemStack);
            tellPlayer(player, `§a[爬塔系统] 额外奖励！获得了特殊物品: ${itemStack.getDisplayName().getString()}`);
        towerSafeLog(`${player.getName()} 在第 ${floor} 层获得了特殊物品: ${itemStack.getDisplayName().getString()}`);
        }
    }
    
    // 每20层给予额外的特殊奖励，如增加接下来塔层怪物的掉落物
    if (floor % 20 === 0) {
        var progress = getPlayerProgress(player);
        progress.extraDropBonus = true;
        progress.extraDropBonusDuration = 5; // 5层
        savePlayerProgress(player, progress);
        tellPlayer(player, `§a[爬塔系统] 特殊增益！接下来5层的怪物掉落物将会增加！`);
        towerSafeLog(`${player.getName()} 在第 ${floor} 层获得了5层的掉落物增益`);
    }
}

// 工具函数 - 开始新的爬塔挑战
function startTowerChallenge(player) {
    // 添加详细调试日志：挑战开始前检查
    towerSafeLog(`[DEBUG] 开始爬塔挑战检查 - 玩家: ${player.getName()}`);
    
    // 检查玩家是否已经在爬塔中
    // 使用var声明避免Rhino引擎的const变量作用域问题
    var progress = getPlayerProgress(player);
    towerSafeLog(`[DEBUG] 玩家当前状态 - 已在爬塔中: ${progress.inTower}, 楼层: ${progress.currentFloor}, 波次: ${progress.currentWave}`);
    
    if (progress.inTower) {
        tellPlayer(player, `§c[爬塔系统] 你已经在爬塔挑战中了！使用 /tower end 结束当前挑战。`);
        towerSafeLog(`[DEBUG] 爬塔挑战开始失败 - 玩家 ${player.getName()} 已经在爬塔中`);
        return false;
    }
    
    // 记录塔的起始位置
    var playerPos = player.position();
    var playerUUID = player.uuid.toString();
    towerSafeLog(`[DEBUG] 准备设置塔区域 - 玩家UUID: ${playerUUID}, 位置: (${Math.floor(playerPos.x)}, ${Math.floor(playerPos.y)}, ${Math.floor(playerPos.z)})`);
    
    // 设置天气为雷暴
    towerSafeLog(`[DEBUG] 设置天气为雷暴 - 世界: ${player.level.dimension.id}`);
    player.server.runCommandSilent(`weather thunder 999999`);
    
    // 创建计分板
    var scoreboardName = `tower_${playerUUID.substring(0, 8)}`;
    scoreboardPlayers.set(playerUUID, scoreboardName);
    player.server.runCommandSilent(`scoreboard objectives add ${scoreboardName} dummy "爬塔进度"`);
    player.server.runCommandSilent(`scoreboard objectives setdisplay sidebar ${scoreboardName}`);
    
    // 初始更新计分板
    updateTowerScoreboard(player);
    
    towerRegions.set(playerUUID, {
        x: Math.floor(playerPos.x),
        y: Math.floor(playerPos.y),
        z: Math.floor(playerPos.z)
    });
    
    // 验证设置是否成功
    var verifyEntry = towerRegions.has(playerUUID);
    var verifyPos = towerRegions.get(playerUUID);
    towerSafeLog(`[DEBUG] 塔区域设置验证 - 玩家: ${player.getName()}, 存在记录: ${verifyEntry}, 存储位置: ${verifyPos ? `(${verifyPos.x}, ${verifyPos.y}, ${verifyPos.z})` : 'null'}`);
    towerSafeLog(`[DEBUG] 塔区域已设置 - 玩家: ${player.getName()}, 位置: (${Math.floor(playerPos.x)}, ${Math.floor(playerPos.y)}, ${Math.floor(playerPos.z)})`)
    
    // 初始化玩家进度
    towerSafeLog(`[DEBUG] 初始化玩家进度 - 玩家: ${player.getName()}`);
    progress.currentFloor = 1;
    progress.killsThisFloor = 0;
    progress.requiredKills = 10;
    progress.currentWave = 1; // 直接从第一波开始
    progress.startTime = new Date().getTime(); // 使用实际时间，避免Minecraft dayTime重置问题
    progress.inTower = true;
    
    towerSafeLog(`[DEBUG] 进度初始化完成 - 玩家: ${player.getName()}, 楼层: ${progress.currentFloor}, 波次: ${progress.currentWave}, 击杀数: ${progress.killsThisFloor}/${progress.requiredKills}`);
    
    savePlayerProgress(player, progress);
    towerSafeLog(`[DEBUG] 玩家进度已保存 - 玩家: ${player.getName()}`);
    
    tellPlayer(player, `§6[爬塔系统] 爬塔挑战开始！当前楼层：1/${TOWER_CONFIG.MAX_TOWER_HEIGHT}`);
    tellPlayer(player, `§6[爬塔系统] 当前波次：1/${TOWER_CONFIG.WAVE_COUNT}`);
    tellPlayer(player, `§6[爬塔系统] 每完成一波怪物入侵，使用 /tower next_wave 进入下一波。`);
    tellPlayer(player, `§6[爬塔系统] 完成所有 ${TOWER_CONFIG.WAVE_COUNT} 波后，使用 /tower next_floor 前往下一层。`);
    
    // 开始第一波
    towerSafeLog(`[DEBUG] 立即生成第一波怪物 - 玩家: ${player.getName()}`);
    spawnMonsterWave(player, 1, 1);
    
    towerSafeLog(`${player.getName()} 开始了爬塔挑战，起点位置: ${Math.floor(playerPos.x)}, ${Math.floor(playerPos.y)}, ${Math.floor(playerPos.z)}`);
    return true;
}

// 工具函数 - 前往下一层
function goToNextFloor(player) {
    var progress = getPlayerProgress(player); // 改为var避免Rhino引擎const变量作用域问题
    
    // 检查玩家是否在爬塔中
    if (!progress.inTower) {
        tellPlayer(player, `§c[爬塔系统] 你不在爬塔挑战中！使用 /tower start 开始挑战。`);
        return false;
    }
    
    // 检查是否完成了当前楼层的所有波次
        if (progress.currentWave < TOWER_CONFIG.WAVE_COUNT) {
            tellPlayer(player, `§c[爬塔系统] 你还没有完成当前楼层的所有波次！`);
            return false;
        }
    
    // 检查是否达到最大楼层
    if (progress.currentFloor >= TOWER_CONFIG.MAX_TOWER_HEIGHT) {
        tellPlayer(player, `§c[爬塔系统] 你已经到达了最高楼层！恭喜完成挑战！`);
        endTowerChallenge(player);
        return false;
    }
    
    // 更新玩家进度
    progress.currentFloor++;
    progress.killsThisFloor = 0;
    progress.requiredKills = 10 + Math.floor(progress.currentFloor * 2); // 增加每层所需击杀数，避免显示异常
    progress.currentWave = 1; // 直接设置为第一波
    progress.startTime = new Date().getTime(); // 使用实际时间，避免Minecraft dayTime重置问题
    
    // 确保波次在持久化存储中被正确保存
    player.persistentData.putInt('tower_currentWave', 1); // 直接设置持久化存储中的波次值
    
    // 更新最高记录
    if (progress.currentFloor > progress.highestFloor) {
        progress.highestFloor = progress.currentFloor;
    }
    
    // 减少掉落物增益持续时间
    if (progress.extraDropBonus && progress.extraDropBonusDuration > 0) {
        progress.extraDropBonusDuration--;
        if (progress.extraDropBonusDuration <= 0) {
            progress.extraDropBonus = false;
            tellPlayer(player, `§6[爬塔系统] 掉落物增益效果已结束。`);
        }
    }
    
    savePlayerProgress(player, progress);
    
    // 给予奖励
    grantRewards(player, progress.currentFloor);
    
    tellPlayer(player, `§6[爬塔系统] 进入第 ${progress.currentFloor}/${TOWER_CONFIG.MAX_TOWER_HEIGHT} 层！`);
    
    // 开始新楼层的第一波
    spawnMonsterWave(player, progress.currentFloor, 1);
    
    towerSafeLog(`${player.getName()} 进入了第 ${progress.currentFloor} 层`);
    return true;
}

// 工具函数 - 前往下一波
function goToNextWave(player) {
    // 使用var声明避免Rhino引擎的const变量作用域问题
    var progress = getPlayerProgress(player);
    
    // 检查玩家是否在爬塔中
    if (!progress.inTower) {
        tellPlayer(player, `§c[爬塔系统] 你不在爬塔挑战中！使用 /tower start 开始挑战。`);
        return false;
    }
    
    // 检查是否可以进入下一波
    if (progress.currentWave >= TOWER_CONFIG.WAVE_COUNT) {
        tellPlayer(player, `§c[爬塔系统] 无法进入下一波！已经是最后一波了。`);
        return false;
    }
    
    // 防御性检查：如果波次为0，自动纠正
    if (progress.currentWave === 0) {
        progress.currentWave = 1;
        savePlayerProgress(player, progress);
        tellPlayer(player, `§a[爬塔系统] 波次信息已纠正，当前波次：1/${TOWER_CONFIG.WAVE_COUNT}`);
    }
    
    // 更新波次
    progress.currentWave++;
    progress.killsThisFloor = 0;
    savePlayerProgress(player, progress);
    
    if (progress.currentWave <= TOWER_CONFIG.WAVE_COUNT) {
        tellPlayer(player, `§6[爬塔系统] 准备进入第 ${progress.currentWave}/${TOWER_CONFIG.WAVE_COUNT} 波！`);
        
        // 生成下一波怪物
        spawnMonsterWave(player, progress.currentFloor, progress.currentWave);
    }
    
    // 如果是最后一波，提示玩家完成楼层
    if (progress.currentWave === TOWER_CONFIG.WAVE_COUNT) {
        tellPlayer(player, `§6[爬塔系统] 这是最后一波！击败BOSS后使用 /tower next_floor 前往下一层。`);
    }
    
    towerSafeLog(`${player.getName()} 进入了第 ${progress.currentFloor} 层的第 ${progress.currentWave} 波`);
    return true;
}

// 工具函数 - 结束爬塔挑战
function endTowerChallenge(player) {
    var progress = getPlayerProgress(player); // 改为var避免Rhino引擎const变量作用域问题
    
    // 检查玩家是否在爬塔中
    if (!progress.inTower) {
        tellPlayer(player, `§c[爬塔系统] 你不在爬塔挑战中！`);
        return false;
    }
    
    // 清理数据
    progress.inTower = false;
    savePlayerProgress(player, progress);
    
    // 清除计时器
    var timerKey = player.uuid.toString(); // 改为var避免Rhino引擎const变量作用域问题
    if (waveTimers.has(timerKey)) {
        clearTimeout(waveTimers.get(timerKey));
        waveTimers.delete(timerKey);
    }
    
    // 移除计分板
    var scoreboardName = scoreboardPlayers.get(player.uuid.toString());
    if (scoreboardName) {
        player.server.runCommandSilent(`scoreboard objectives remove ${scoreboardName}`);
        scoreboardPlayers.delete(player.uuid.toString());
    }

    // 重置天气为晴天
    player.server.runCommandSilent(`weather clear`);

    tellPlayer(player, `§6[爬塔系统] 爬塔挑战已结束！你的最高楼层是: ${progress.highestFloor}`);
    towerSafeLog(`${player.getName()} 结束了爬塔挑战，最高楼层: ${progress.highestFloor}`);
    return true;
}

// 工具函数 - 显示爬塔状态
function showTowerStatus(player) {
    // 使用var声明避免Rhino引擎的const变量作用域问题
    var progress = getPlayerProgress(player);
    
    if (!progress.inTower) {
        tellPlayer(player, `§6[爬塔系统] 你当前不在爬塔挑战中。`);
        tellPlayer(player, `§6[爬塔系统] 最高记录: ${progress.highestFloor} 层`);
        return;
    }
    
    tellPlayer(player, `§6[爬塔系统] 当前状态：`);
    tellPlayer(player, `§6- 当前楼层: ${progress.currentFloor}/${TOWER_CONFIG.MAX_TOWER_HEIGHT}`);
    tellPlayer(player, `§6- 当前波次: ${progress.currentWave}/${TOWER_CONFIG.WAVE_COUNT}`);
    tellPlayer(player, `§6- 已击杀: ${progress.killsThisFloor}/${progress.requiredKills}`);
    
    // 计算剩余时间（使用实际时间，避免Minecraft dayTime重置问题）
    if (progress.startTime > 0) {
        var currentRealTime = new Date().getTime();
        var elapsedTime = Math.floor((currentRealTime - progress.startTime) / 1000);
        var remainingTime = Math.max(0, TOWER_CONFIG.TIME_LIMIT_PER_FLOOR - elapsedTime);
        tellPlayer(player, `§6- 剩余时间: ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toFixed(0).padStart(2, '0')}`);
    } else {
        tellPlayer(player, `§6- 剩余时间: 计算中...`);
    }
    
    // 显示特殊状态
    if (progress.extraDropBonus) {
        tellPlayer(player, `§6- 特殊状态: 掉落物增益 (剩余 ${progress.extraDropBonusDuration} 层)`);
    }
}

// 工具函数 - 显示爬塔设置
function showTowerSettings(player) {
    tellPlayer(player, `§6[爬塔系统] 当前设置：`);
    tellPlayer(player, `§6- 最大楼层: ${TOWER_CONFIG.MAX_TOWER_HEIGHT}`);
    tellPlayer(player, `§6- 每层波次数: ${TOWER_CONFIG.WAVE_COUNT}`);
    tellPlayer(player, `§6- 每层时间限制: ${Math.floor(TOWER_CONFIG.TIME_LIMIT_PER_FLOOR / 60)} 分钟`);
    tellPlayer(player, `§6- 奖励间隔: ${TOWER_CONFIG.REWARD_INTERVAL} 层`);
}

// 工具函数 - 打开爬塔系统主菜单
function openTowerMenu(player) {
    // 使用var声明避免Rhino引擎的const变量作用域问题
    var Component = Java.loadClass('net.minecraft.network.chat.Component');
    var ClickEvent = Java.loadClass('net.minecraft.network.chat.ClickEvent');
    var HoverEvent = Java.loadClass('net.minecraft.network.chat.HoverEvent');
    // const Vec3 = Java.loadClass('net.minecraft.core.Vec3'); // 注释掉，当前版本不支持这个类路径
    
    tellPlayer(player, `§6===== 爬塔系统 =====`);
    
    // 开始爬塔按钮
    var startButton = Component.literal('§a[开始爬塔挑战]')
        .setStyle(Component.empty().style
            .withClickEvent(new ClickEvent(ClickEvent.Action.RUN_COMMAND, '/tower start'))
            .withHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, Component.literal('点击开始新的爬塔挑战'))));
    player.tell(startButton);
    
    // 查看状态按钮
    var statusButton = Component.literal('§e[查看状态]')
        .setStyle(Component.empty().style
            .withClickEvent(new ClickEvent(ClickEvent.Action.RUN_COMMAND, '/tower status'))
            .withHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, Component.literal('查看当前爬塔状态'))));
    player.tell(statusButton);
    
    // 查看设置按钮
    var settingsButton = Component.literal('§b[查看设置]')
        .setStyle(Component.empty().style
            .withClickEvent(new ClickEvent(ClickEvent.Action.RUN_COMMAND, '/tower settings'))
            .withHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, Component.literal('查看爬塔系统设置'))));
    player.tell(settingsButton);
    
    tellPlayer(player, `§6=================`);
}

// 事件注册 - 实体生成事件
EntityEvents.spawned(event => {
    // 使用var声明避免Rhino引擎的const变量作用域问题
    var entity = event.entity;
    
    // 跳过不需要处理的实体
    if (towerShouldSkipEntity(entity)) {
        return;
    }
    
    // 检查实体是否在塔内生成（这里简化处理，实际应该根据区域检查）
    // 注意：这里只是为了示例，实际实现需要根据塔区域进行更精确的检查
});

// 事件注册 - 实体死亡事件
EntityEvents.death(event => {
    try {
        var entity = event.entity;
        var source = event.source;
        
        // 检查是否是塔内怪物
        var isTowerMonster = entity.persistentData && entity.persistentData.getBoolean('in_tower');
        
        // 根据配置决定是否跳过检查
        if (!TOWER_CONFIG.SKIP_TOWER_MONSTER_CHECK && !isTowerMonster) {
            return;
        }
        
        // 在爬塔期间，只让怪物掉落经验
        if (isTowerMonster || TOWER_CONFIG.SKIP_TOWER_MONSTER_CHECK) {
            // 清除所有物品掉落
            event.cancel();
            
            // 只保留经验掉落（根据怪物类型设置合适的经验值）
            var expAmount = 5; // 基础经验值
            
            // 根据怪物类型调整经验值
            var entityType = entity.getType();
            if (entityType.includes('boss') || entityType.includes('ravager') || entityType.includes('wither_skeleton')) {
                expAmount = 20;
            } else if (entityType.includes('elder_guardian') || entityType.includes('evoker') || entityType.includes('vindicator')) {
                expAmount = 15;
            } else if (entityType.includes('wither') || entityType.includes('ender_dragon')) {
                expAmount = 50;
            }
            
            // 生成经验球
            entity.level.spawnAtLocation('experience_bottle', expAmount / 7, entity.position());
        }
    } catch (e) {
        towerSafeLog(`处理实体死亡掉落时出错: ${e.message}`);
    }
});

// 重新注册实体死亡事件用于处理击杀计数（保持原有逻辑）
EntityEvents.death(event => {
    try {
        // 使用var声明避免Rhino引擎的const变量作用域问题
        var entity = event.entity;
        var source = event.source;
        
        // 检查是否是塔内怪物
        var isTowerMonster = entity.persistentData && entity.persistentData.getBoolean('in_tower');
        towerSafeLog(`[DEBUG] 实体死亡检查 - 类型: ${entity.getType()}, 是塔内怪物: ${isTowerMonster}`);
        
        // 根据配置决定是否跳过检查
        if (!TOWER_CONFIG.SKIP_TOWER_MONSTER_CHECK && !isTowerMonster) {
            towerSafeLog(`[DEBUG] 实体不是塔内怪物，跳过击杀计数处理`);
            return;
        }
        
        // 如果跳过检查，添加一条日志记录
        if (TOWER_CONFIG.SKIP_TOWER_MONSTER_CHECK && !isTowerMonster) {
            towerSafeLog(`[DEBUG] 实体不是塔内怪物，但已跳过检查，继续处理`);
        }
        
        // 添加日志记录，帮助调试
        towerSafeLog(`检测到塔内怪物被击杀: ${entity.getType()}`);
        
        // 根据用户要求，简化伤害来源判定逻辑
        // 只要伤害类型是player，就直接更新所有爬塔中的玩家的击杀计数
        try {
            towerSafeLog(`[DEBUG] 伤害来源类型: ${source.getType()}`);
            
            // 检查伤害来源是否是玩家
            if (source.getType() === 'player') {
                towerSafeLog(`[DEBUG] 伤害来源是玩家，直接添加击杀计数`);
                
                // 获取所有在线玩家
                try {
                    // 使用正确的方法获取在线玩家
                    var onlinePlayers = event.server.getPlayers();
                    
                    // 遍历所有在线玩家
                    for (var i = 0; i < onlinePlayers.length; i++) {
                        var player = onlinePlayers[i];
                        
                        try {
                            // 使用var声明避免Rhino引擎的const变量作用域问题
                            var progress = getPlayerProgress(player);
                            
                            // 检查玩家是否在爬塔中
                            towerSafeLog(`[DEBUG] 玩家爬塔状态检查 - 玩家: ${player.getName()}, inTower: ${progress.inTower}`);
                            
                            if (progress && progress.inTower) {
                                // 添加更多调试信息
                                towerSafeLog(`[DEBUG] 开始更新击杀计数 - 当前值: ${progress.killsThisFloor}`);
                                
                                // 记录更新前的击杀数
                    var beforeKills = progress.killsThisFloor;
                    
                    // 详细调试信息：更新前的完整状态
                    towerSafeLog(`[DEBUG] 击杀前状态 - 玩家: ${player.getName()}, 楼层: ${progress.currentFloor}, 波次: ${progress.currentWave}/${TOWER_CONFIG.WAVE_COUNT}, 击杀数: ${beforeKills}/${progress.requiredKills}`);
                    
                    // 更新击杀计数
                    progress.killsThisFloor++;
                    
                    // 详细调试信息：更新后的完整状态
                    towerSafeLog(`[DEBUG] 击杀后状态 - 玩家: ${player.getName()}, 楼层: ${progress.currentFloor}, 波次: ${progress.currentWave}/${TOWER_CONFIG.WAVE_COUNT}, 击杀数: ${progress.killsThisFloor}/${progress.requiredKills}`);
                    towerSafeLog(`玩家 ${player.getName()} 击杀计数更新: ${beforeKills} -> ${progress.killsThisFloor}`);
                    
                    // 更新计分板
                    updateTowerScoreboard(player);
                    
                    // 检查是否达到了所需击杀数，如果是则自动进入下一波
                    if (progress.currentWave < TOWER_CONFIG.WAVE_COUNT - 1 && progress.killsThisFloor >= progress.requiredKills) {
                        tellPlayer(player, `§a[爬塔系统] 已达到击杀数要求！自动进入下一波。`);
                        // 立即执行下一波
                        setTimeout(() => {
                            goToNextWave(player);
                        }, 10); // 短暂延迟确保状态正确更新
                    }
                                
                                // 保存进度
                                towerSafeLog(`[DEBUG] 准备保存进度 - 击杀数: ${progress.killsThisFloor}`);
                                savePlayerProgress(player, progress);
                                towerSafeLog(`[DEBUG] 进度保存完成`);
                                
                                // 从持久化存储重新加载进度，验证是否正确保存
                                var reloadedProgress = getPlayerProgress(player);
                                towerSafeLog(`[DEBUG] 保存验证 - 重新加载的击杀数: ${reloadedProgress.killsThisFloor}`);
                                
                                // 显示进度
                                if (progress.currentWave < TOWER_CONFIG.WAVE_COUNT - 1) {
                                    var remainingKills = progress.requiredKills - progress.killsThisFloor;
                                    if (remainingKills <= 5 && remainingKills > 0) {
                                        tellPlayer(player, `§6[爬塔系统] 还需要击杀 ${remainingKills} 个怪物才能进入下一波！`);
                                    }
                                }
                                
                                // 如果是最后一波（BOSS波），完成当前楼层
        if (progress.currentWave === TOWER_CONFIG.WAVE_COUNT) {
            towerSafeLog(`[DEBUG] BOSS被击败 - 玩家: ${player.getName()}, 楼层: ${progress.currentFloor}, 波次: ${progress.currentWave}/${TOWER_CONFIG.WAVE_COUNT}`);
            tellPlayer(player, `§a[爬塔系统] BOSS已击败！第${progress.currentFloor}层挑战完成！`);
            tellPlayer(player, `§6[爬塔系统] 使用 /tower next_floor 前往下一层。`);
            progress.currentWave++;
            savePlayerProgress(player, progress);
            
            // 已移除自动前往下一层的逻辑，需要玩家手动操作
        }
                                
                                // 应用额外掉落物增益
                                if (progress.extraDropBonus) {
                                    // 增加额外掉落物
                                    var world = player.level;
                                    var pos = entity.position();
                                    
                                    // 有一定几率额外掉落物品
                                    if (Math.random() < 0.3) {
                                        var extraItems = ['iron_ingot', 'gold_ingot', 'diamond', 'emerald', 'experience_bottle'];
                                        var randomItem = extraItems[Math.floor(Math.random() * extraItems.length)];
                                        world.dropItem(randomItem, 1, pos.x, pos.y, pos.z);
                                    }
                                }
                            }
                        } catch (error) {
                            towerSafeLog(`更新玩家 ${player.getName()} 击杀数时出错: ${error.message}`, true);
                        }
                    }
                } catch (error) {
                    towerSafeLog(`[DEBUG] 获取在线玩家列表时出错: ${error.message}`, true);
                }
            } else {
                towerSafeLog(`[DEBUG] 伤害来源不是玩家，跳过击杀计数处理`);
            }
        } catch (error) {
            towerSafeLog(`[DEBUG] 检查伤害来源时出错: ${error.message}`, true);
        }
    } catch (error) {
        towerSafeLog(`处理实体死亡事件时出错: ${error.message}`, true);
    }
});

// 事件注册 - 服务器tick事件（处理时间限制）
ServerEvents.tick(event => {
    var server = event.server; // 改为var避免Rhino引擎const变量作用域问题
    
    // 每5秒检查一次时间限制和更新计分板
    if (server.tickCount % 100 !== 0) { // 20 ticks/second * 5 seconds = 100 ticks
        return;
    }
    
    // 获取当前实际时间（毫秒）
    var currentRealTime = new Date().getTime();
    
    // 检查所有在线玩家的爬塔时间
    server.getPlayers().forEach(player => {
        // 使用var声明避免Rhino引擎的const变量作用域问题
        var progress = getPlayerProgress(player);
        
        if (progress.inTower && progress.startTime > 0) {
            // 计算经过的秒数
            var elapsedTime = Math.floor((currentRealTime - progress.startTime) / 1000);
            
            // 检查时间限制
            if (elapsedTime > TOWER_CONFIG.TIME_LIMIT_PER_FLOOR) {
                tellPlayer(player, `§c[爬塔系统] 时间到！当前楼层挑战失败。请使用 /tower start 重新开始。`);
                
                // 不自动重新开始，结束当前挑战
                endTowerChallenge(player);
            } else {
                // 更新计分板
                updateTowerScoreboard(player);
                
                // 剩余时间提示（减少频率：只在特定时间点提示）
                var remainingTime = TOWER_CONFIG.TIME_LIMIT_PER_FLOOR - elapsedTime;
                if (remainingTime <= 60 && remainingTime > 30 && remainingTime % 15 === 0) {
                    tellPlayer(player, `§6[爬塔系统] 警告：当前楼层剩余时间不足 ${remainingTime} 秒！`);
                } else if (remainingTime <= 30 && remainingTime > 10 && remainingTime % 10 === 0) {
                    tellPlayer(player, `§6[爬塔系统] 警告：当前楼层剩余时间不足 ${remainingTime} 秒！`);
                } else if (remainingTime <= 10 && remainingTime > 0) {
                    tellPlayer(player, `§c[爬塔系统] 紧急：当前楼层剩余时间不足 ${remainingTime} 秒！`);
                }
            }
        }
    });
});

// 事件注册 - 命令注册
ServerEvents.commandRegistry(function(event) {
    // 使用var声明避免Rhino引擎的const变量作用域问题
    var Commands = event.commands;
    var Component = Java.loadClass('net.minecraft.network.chat.Component');
    
    // 注册爬塔系统主命令
    event.register(
        Commands.literal('tower')
            .requires(source => source.hasPermission(0)) // 所有玩家都可以使用
            .executes(ctx => {
                var player = ctx.source.getPlayer();
                if (player) {
                    openTowerMenu(player);
                }
                return 1;
            })
            .then(Commands.literal('start')
                .executes(ctx => {
                    var player = ctx.source.getPlayer();
                    if (player) {
                        startTowerChallenge(player);
                    }
                    return 1;
                })
            )
            .then(Commands.literal('next_floor')
                .executes(ctx => {
                    var player = ctx.source.getPlayer();
                    if (player) {
                        goToNextFloor(player);
                    }
                    return 1;
                })
            )
            .then(Commands.literal('next_wave')
                .executes(ctx => {
                    var player = ctx.source.getPlayer();
                    if (player) {
                        goToNextWave(player);
                    }
                    return 1;
                })
            )
            .then(Commands.literal('end')
                .executes(ctx => {
                    // 使用var声明避免Rhino引擎的const变量作用域问题
                    var player = ctx.source.getPlayer();
                    if (player) {
                        endTowerChallenge(player);
                    }
                    return 1;
                })
            )
            .then(Commands.literal('status')
                .executes(ctx => {
                    // 使用var声明避免Rhino引擎的const变量作用域问题
                    var player = ctx.source.getPlayer();
                    if (player) {
                        showTowerStatus(player);
                    }
                    return 1;
                })
            )
            .then(Commands.literal('settings')
                .executes(ctx => {
                    // 使用var声明避免Rhino引擎的const变量作用域问题
                    var player = ctx.source.getPlayer();
                    if (player) {
                        showTowerSettings(player);
                    }
                    return 1;
                })
            )
            .then(Commands.literal('debug')
                .requires(source => source.hasPermission(2)) // 需要管理员权限
                .then(Commands.literal('console')
                    .then(Commands.literal('on').executes(ctx => {
                        TOWER_DEBUG_FLAGS.console = true;
                    // 使用var声明避免Rhino引擎的const变量作用域问题
                    var player = ctx.source.getPlayer();
                    if (player) player.tell(Component.literal('§6[爬塔系统] 控制台调试已开启'));
                    towerSafeLog(`控制台调试已开启`);
                    return 1;
                }))
                .then(Commands.literal('off').executes(ctx => {
                    TOWER_DEBUG_FLAGS.console = false;
                    // 使用var声明避免Rhino引擎的const变量作用域问题
                    var player = ctx.source.getPlayer();
                    if (player) player.tell(Component.literal('§6[爬塔系统] 控制台调试已关闭'));
                    towerSafeLog(`控制台调试已关闭`);
                    return 1;
                }))
                )
                .then(Commands.literal('chat')
                    .then(Commands.literal('on').executes(ctx => {
                        TOWER_DEBUG_FLAGS.chat = true;
                    // 使用var声明避免Rhino引擎的const变量作用域问题
                    var player = ctx.source.getPlayer();
                    if (player) player.tell(Component.literal('§6[爬塔系统] 聊天栏调试已开启'));
                    return 1;
                }))
                .then(Commands.literal('off').executes(ctx => {
                    TOWER_DEBUG_FLAGS.chat = false;
                    // 使用var声明避免Rhino引擎的const变量作用域问题
                    var player = ctx.source.getPlayer();
                    if (player) player.tell(Component.literal('§6[爬塔系统] 聊天栏调试已关闭'));
                    return 1;
                }))
                )
            )
    );
});

// 脚本加载完成时的提示
console.log(`§6✅ [爬塔系统] 已成功加载！使用 /tower 命令开始爬塔挑战。`);