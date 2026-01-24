// 为自定义物品添加到原版战利品表
// ========== 配置 ==========

// 物品掉落权重与数量计算系统
// ========== 系统配置 ==========

// 掉落配置系统
const DropConfig = {
    // 1. 稀有等级比例系数配置
    rarityFactors: {
        COMMON: 0.005,    // 普通
        UNCOMMON: 0.0025,  // 罕见
        RARE: 0.001,      // 稀有
        EPIC: 0.0005,      // 史诗
        LEGENDARY: 0.00001  // 传说
    },
    
    // 2. 取整方式配置 (floor: 向下取整, round: 四舍五入, ceil: 向上取整)
    roundingMethod: 'floor',
    
    // 3. 计算函数
    
    /**
     * 计算实际掉落权重
     * @param {number} baseWeight - 基础底数
     * @param {string} rarity - 稀有等级 (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY)
     * @returns {number} 实际掉落权重（非负整数）
     */
    calculateWeight: function(baseWeight, rarity) {
        const factor = this.rarityFactors[rarity] || this.rarityFactors.COMMON;
        const weight = baseWeight * factor;
        return Math.max(1, this.round(weight)); // 确保权重至少为1
    },
    
    /**
     * 计算实际掉落数量范围
     * @param {number} minBase - 最低掉落数量（基础值）
     * @param {number} maxDiff - 掉落差值（基础值）
     * @param {number} factor - 比例系数
     * @returns {Array} [minCount, maxCount] 实际掉落数量范围（非负整数数组）
     */
    calculateCountRange: function(minBase, maxDiff, factor) {
        // 计算最大掉落数量
        const maxRaw = (minBase + maxDiff) * factor;
        const maxCount = Math.max(1, this.round(maxRaw)); // 确保最大数量至少为1
        
        // 计算最小掉落数量
        const minRaw = minBase * factor;
        const minCount = Math.max(1, this.round(minRaw)); // 确保最小数量至少为1
        
        // 确保最小数量不大于最大数量
        const finalMin = Math.min(minCount, maxCount);
        const finalMax = Math.max(minCount, maxCount);
        
        return [finalMin, finalMax];
    },
    
    /**
     * 统一的取整函数
     * @param {number} value - 需要取整的值
     * @returns {number} 取整后的值
     */
    round: function(value) {
        switch (this.roundingMethod) {
            case 'ceil':
                return Math.ceil(value);
            case 'round':
                return Math.round(value);
            case 'floor':
            default:
                return Math.floor(value);
        }
    }
};

// ========== 物品配置 ==========

// 物品掉落配置（基础值）
const ItemDropConfigs = {
    // EPIC稀有度物品
    "kubejs:allthemodium_ingot": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 2,
            factor: 1.0
        }
    },
    "kubejs:allthemodium_upgrade_smithing_template": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 0,
            factor: 1.0
        }
    },
    "kubejs:atm_star": {
        weight: {
            base: 1,
            rarity: "LEGENDARY"
        },
        count: {
            minBase: 1,
            maxDiff: 0,
            factor: 1.0
        }
    },
    "kubejs:piglich_heart": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 1,
            factor: 1.0
        }
    },
    "kubejs:unobtainium_allthemodium_alloy_ingot": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 1,
            factor: 1.0
        }
    },
    "kubejs:unobtainium_ingot": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 3,
            factor: 1.0
        }
    },
    "kubejs:unobtainium_upgrade_smithing_template": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 0,
            factor: 1.0
        }
    },
    "kubejs:unobtainium_vibranium_alloy_ingot": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 1,
            factor: 1.0
        }
    },
    "kubejs:vibranium_allthemodium_alloy_ingot": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 1,
            factor: 1.0
        }
    },
    "kubejs:vibranium_upgrade_smithing_template": {
        weight: {
            base: 1,
            rarity: "EPIC"
        },
        count: {
            minBase: 1,
            maxDiff: 0,
            factor: 1.0
        }
    },
    
    // basic稀有度物品
    "kubejs:example_item": {
        weight: {
            base: 1,
            rarity: "COMMON"
        },
        count: {
            minBase: 1,
            maxDiff: 4,
            factor: 1.0
        }
    },
    "kubejs:fluorite": {
        weight: {
            base: 1,
            rarity: "UNCOMMON"
        },
        count: {
            minBase: 5,
            maxDiff: 5,
            factor: 1.0
        }
    },
    "kubejs:ruby": {
        weight: {
            base: 1,
            rarity: "RARE"
        },
        count: {
            minBase: 2,
            maxDiff: 6,
            factor: 1.0
        }
    }
};

// ========== 辅助函数 ==========

/**
 * 获取物品的实际掉落配置
 * @param {string} itemId - 物品ID
 * @returns {Object} 包含实际权重和数量范围的配置对象
 */
function getItemDropConfig(itemId) {
    const config = ItemDropConfigs[itemId];
    if (!config) {
        // 默认配置
        return {
            weight: 1,
            count: [1, 1]
        };
    }
    
    // 计算实际权重
    const weight = DropConfig.calculateWeight(config.weight.base, config.weight.rarity);
    
    // 计算实际数量范围
    const countRange = DropConfig.calculateCountRange(
        config.count.minBase,
        config.count.maxDiff,
        config.count.factor
    );
    
    return {
        weight: weight,
        count: countRange
    };
}

LootJS.lootTables(event => {
    // --------------- EPIC稀有度物品 ---------------
    
    // 全能锭 - 凋灵骷髅、末影龙
    const allthemodiumConfig = getItemDropConfig("kubejs:allthemodium_ingot");
    event.getLootTable("minecraft:entities/wither_skeleton")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:allthemodium_ingot")
    .withWeight(allthemodiumConfig.weight)
    .setCount(allthemodiumConfig.count));
    
    event.getLootTable("minecraft:entities/ender_dragon")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:allthemodium_ingot")
    .withWeight(allthemodiumConfig.weight)
    .setCount(allthemodiumConfig.count));
    
    // 全能锭升级锻造模板 - 凋灵、卫道士
    const allthemodiumTemplateConfig = getItemDropConfig("kubejs:allthemodium_upgrade_smithing_template");
    event.getLootTable("minecraft:entities/wither")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:allthemodium_upgrade_smithing_template")
    .withWeight(allthemodiumTemplateConfig.weight)
    .setCount(allthemodiumTemplateConfig.count));
    
    event.getLootTable("minecraft:entities/vindicator")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:allthemodium_upgrade_smithing_template")
    .withWeight(allthemodiumTemplateConfig.weight)
    .setCount(allthemodiumTemplateConfig.count));
    
    // ATM之星 - 末影龙、唤魔者（最稀有）
    const atmStarConfig = getItemDropConfig("kubejs:atm_star");
    event.getLootTable("minecraft:entities/ender_dragon")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:atm_star")
    .withWeight(atmStarConfig.weight)
    .setCount(atmStarConfig.count));
    
    event.getLootTable("minecraft:entities/evoker")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:atm_star")
    .withWeight(atmStarConfig.weight)
    .setCount(atmStarConfig.count));
    
    // 猪灵之心 - 猪灵蛮兵、凋灵骷髅
    const piglichHeartConfig = getItemDropConfig("kubejs:piglich_heart");
    event.getLootTable("minecraft:entities/piglin_brute")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:piglich_heart")
    .withWeight(piglichHeartConfig.weight)
    .setCount(piglichHeartConfig.count));
    
    event.getLootTable("minecraft:entities/wither_skeleton")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:piglich_heart")
    .withWeight(piglichHeartConfig.weight)
    .setCount(piglichHeartConfig.count));
    
    // 无尽全能合金锭 - 末影龙、唤魔者
    const unobtainiumAllthemodiumConfig = getItemDropConfig("kubejs:unobtainium_allthemodium_alloy_ingot");
    event.getLootTable("minecraft:entities/ender_dragon")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:unobtainium_allthemodium_alloy_ingot")
    .withWeight(unobtainiumAllthemodiumConfig.weight)
    .setCount(unobtainiumAllthemodiumConfig.count));
    
    event.getLootTable("minecraft:entities/evoker")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:unobtainium_allthemodium_alloy_ingot")
    .withWeight(unobtainiumAllthemodiumConfig.weight)
    .setCount(unobtainiumAllthemodiumConfig.count));
    
    // 无尽锭 - 凋灵骷髅、末影龙
    const unobtainiumConfig = getItemDropConfig("kubejs:unobtainium_ingot");
    event.getLootTable("minecraft:entities/wither_skeleton")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:unobtainium_ingot")
    .withWeight(unobtainiumConfig.weight)
    .setCount(unobtainiumConfig.count));
    
    event.getLootTable("minecraft:entities/ender_dragon")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:unobtainium_ingot")
    .withWeight(unobtainiumConfig.weight)
    .setCount(unobtainiumConfig.count));
    
    // 无尽升级锻造模板 - 凋灵、卫道士
    const unobtainiumTemplateConfig = getItemDropConfig("kubejs:unobtainium_upgrade_smithing_template");
    event.getLootTable("minecraft:entities/wither")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:unobtainium_upgrade_smithing_template")
    .withWeight(unobtainiumTemplateConfig.weight)
    .setCount(unobtainiumTemplateConfig.count));
    
    event.getLootTable("minecraft:entities/vindicator")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:unobtainium_upgrade_smithing_template")
    .withWeight(unobtainiumTemplateConfig.weight)
    .setCount(unobtainiumTemplateConfig.count));
    
    // 无尽振动合金锭 - 末影龙、唤魔者
    const unobtainiumVibraniumConfig = getItemDropConfig("kubejs:unobtainium_vibranium_alloy_ingot");
    event.getLootTable("minecraft:entities/ender_dragon")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:unobtainium_vibranium_alloy_ingot")
    .withWeight(unobtainiumVibraniumConfig.weight)
    .setCount(unobtainiumVibraniumConfig.count));
    
    event.getLootTable("minecraft:entities/evoker")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:unobtainium_vibranium_alloy_ingot")
    .withWeight(unobtainiumVibraniumConfig.weight)
    .setCount(unobtainiumVibraniumConfig.count));
    
    // 振动全能合金锭 - 末影龙、唤魔者
    const vibraniumAllthemodiumConfig = getItemDropConfig("kubejs:vibranium_allthemodium_alloy_ingot");
    event.getLootTable("minecraft:entities/ender_dragon")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:vibranium_allthemodium_alloy_ingot")
    .withWeight(vibraniumAllthemodiumConfig.weight)
    .setCount(vibraniumAllthemodiumConfig.count));
    
    event.getLootTable("minecraft:entities/evoker")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:vibranium_allthemodium_alloy_ingot")
    .withWeight(vibraniumAllthemodiumConfig.weight)
    .setCount(vibraniumAllthemodiumConfig.count));
    
    // 振动升级锻造模板 - 凋灵、卫道士
    const vibraniumTemplateConfig = getItemDropConfig("kubejs:vibranium_upgrade_smithing_template");
    event.getLootTable("minecraft:entities/wither")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:vibranium_upgrade_smithing_template")
    .withWeight(vibraniumTemplateConfig.weight)
    .setCount(vibraniumTemplateConfig.count));
    
    event.getLootTable("minecraft:entities/vindicator")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:vibranium_upgrade_smithing_template")
    .withWeight(vibraniumTemplateConfig.weight)
    .setCount(vibraniumTemplateConfig.count));
    
    // --------------- basic稀有度物品 ---------------
    
    // 示例物品 - 僵尸、骷髅
    const exampleItemConfig = getItemDropConfig("kubejs:example_item");
    event.getLootTable("minecraft:entities/zombie")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:example_item")
    .withWeight(exampleItemConfig.weight)
    .setCount(exampleItemConfig.count));
    
    event.getLootTable("minecraft:entities/skeleton")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:example_item")
    .withWeight(exampleItemConfig.weight)
    .setCount(exampleItemConfig.count));
    
    // 萤石 - 爬行者、苦力怕
    const fluoriteConfig = getItemDropConfig("kubejs:fluorite");
    event.getLootTable("minecraft:entities/creeper")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:fluorite")
    .withWeight(fluoriteConfig.weight)
    .setCount(fluoriteConfig.count));
    
    event.getLootTable("minecraft:entities/spider")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:fluorite")
    .withWeight(fluoriteConfig.weight)
    .setCount(fluoriteConfig.count));       
    
    // 红宝石 - 僵尸、骷髅
    const rubyConfig = getItemDropConfig("kubejs:ruby");
    event.getLootTable("minecraft:entities/zombie")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:ruby")
    .withWeight(rubyConfig.weight)
    .setCount(rubyConfig.count));
    
    event.getLootTable("minecraft:entities/skeleton")
    .firstPool()
    .addEntry(LootEntry.of("kubejs:ruby")
    .withWeight(rubyConfig.weight)
    .setCount(rubyConfig.count));
});