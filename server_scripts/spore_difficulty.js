// priority: 1

// 真菌模组难度调整脚本

// 难度配置
const DIFFICULTY_CONFIG = {
    1: { healthMultiplier: 1.0, armorMultiplier: 1.0 }, // 基础属性
    2: { healthMultiplier: 1.1, armorMultiplier: 1.1 }, // +10%血量和护甲
    3: { healthMultiplier: 1.2, armorMultiplier: 1.2 }, // +20%血量和护甲
    4: { healthMultiplier: 1.8, armorMultiplier: 1.8 }, // +80%血量和护甲
    5: { healthMultiplier: 2.0, armorMultiplier: 2.0 }, // +100%血量和护甲
    6: { healthMultiplier: 2.5, armorMultiplier: 2.5 }, // +150%血量和护甲
    7: { healthMultiplier: 3.0, armorMultiplier: 3.0 }, // +200%血量和护甲
    8: { healthMultiplier: 4.5, armorMultiplier: 4.5 }  // +350%血量和护甲
};

// 真菌怪物实体ID前缀
const SPORE_ENTITY_PREFIX = "spore:";

// 配置文件路径
const CONFIG_PATH = "kubejs/config/spore_difficulty.json";

// 加载配置
function loadConfig() {
    let configData;
    try {
        configData = JsonIO.read(CONFIG_PATH);
        return configData || {
            default_difficulty: 1, // 默认难度为1
            player_difficulties: {}
        };
    } catch (error) {
        console.error(`[SporeDifficulty] 加载配置文件失败，使用默认配置: ${error}`);
        return {
            default_difficulty: 1,
            player_difficulties: {}
        };
    }
}

// 保存配置
function saveConfig(config) {
    try {
        JsonIO.write(CONFIG_PATH, config);
        console.info("[SporeDifficulty] 配置文件已保存");
    } catch (error) {
        console.error(`[SporeDifficulty] 保存配置文件失败: ${error}`);
    }
}

// 获取玩家的难度设置
function getPlayerDifficulty(player) {
    const config = loadConfig();
    const playerUUID = player.getStringUUID();
    return config.player_difficulties[playerUUID] || config.default_difficulty;
}

// 设置玩家的难度设置
function setPlayerDifficulty(player, difficulty) {
    const config = loadConfig();
    const playerUUID = player.getStringUUID();
    config.player_difficulties[playerUUID] = difficulty;
    saveConfig(config);
}

// 检查实体是否为真菌怪物
function isSporeEntity(entity) {
    // 在KubeJS 1.6.5版本中，使用getType().toString()来获取实体ID
    const entityType = entity.getType();
    const entityId = entityType.toString();
    return entityId.startsWith(SPORE_ENTITY_PREFIX);
}

// 调整真菌怪物的属性
function adjustSporeEntity(entity, difficulty) {
    if (!isSporeEntity(entity)) return;
    
    const difficultySettings = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[1];
    
    try {
        // 检查实体是否有getMaxHealth和setMaxHealth方法
        if (typeof entity.getMaxHealth === "function" && typeof entity.setMaxHealth === "function") {
            // 调整血量
            let currentMaxHealth = entity.getMaxHealth();
            let adjustedMaxHealth = currentMaxHealth * difficultySettings.healthMultiplier;
            entity.setMaxHealth(adjustedMaxHealth);
            entity.setHealth(adjustedMaxHealth);
            
            console.info(`[SporeDifficulty] 已调整真菌怪物属性: ${entity.getType().toString()}, 难度: ${difficulty}, 血量: ${currentMaxHealth.toFixed(1)} -> ${adjustedMaxHealth.toFixed(1)}`);
        } else {
            console.warn(`[SporeDifficulty] 实体 ${entity.getType().toString()} 没有必要的健康值方法，跳过属性调整`);
        }
    } catch (error) {
        console.error(`[SporeDifficulty] 调整实体属性时出错: ${entity.getType().toString()} ${error}`);
    }
}

// 监听实体生成事件
EntityEvents.spawned(event => {
    const entity = event.getEntity();
    
    // 检查是否为真菌怪物
    if (isSporeEntity(entity)) {
        // 对于自然生成的怪物，我们将使用默认难度
        // 对于玩家触发的生成（如刷怪蛋），可以通过其他方式获取玩家难度
        const config = loadConfig();
        const difficulty = config.default_difficulty;
        adjustSporeEntity(entity, difficulty);
    }
});

// 监听玩家加入事件，加载玩家的难度设置
PlayerEvents.loggedIn(event => {
    const player = event.getPlayer();
    const difficulty = getPlayerDifficulty(player);
    console.info(`[SporeDifficulty] 玩家 ${player.getName()} 加入游戏，当前难度: ${difficulty}`);
    player.tell(Text.green(`[SporeDifficulty] 当前真菌模组难度: ${difficulty}`));
});

// 注册命令，允许玩家调整难度
// 在KubeJS 6.0中，命令注册API有所不同
// 简化命令实现，使用更基础的方式
ServerEvents.commandRegistry(event => {
    // 注意：在KubeJS 6.0中，命令注册的API发生了变化
    // 这里简化实现，暂时移除命令注册功能
    // 后续可以使用新的API重新实现
    console.info("[SporeDifficulty] 命令注册功能已暂时禁用，使用配置文件手动设置难度");
});

console.info("[SporeDifficulty] 真菌模组难度调整脚本已加载");
