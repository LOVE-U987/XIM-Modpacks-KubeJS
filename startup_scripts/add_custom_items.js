// priority: 2

// 自定义物品添加脚本
// 按照KubeJS 6.0文档格式编写，兼容KubeJS 1.6.5

// 配置：要添加的物品列表
const ITEMS_TO_ADD = [
    {
        id: "kubejs:allthemodium_ingot",
        name: "全能锭",
        type: "EPIC",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:allthemodium_upgrade_smithing_template",
        name: "全能锭升级锻造模板",
        type: "EPIC",
        maxStackSize: 1,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:atm_star",
        name: "ATM之星",
        type: "EPIC",
        maxStackSize: 1,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:example_item",
        name: "示例物品",
        type: "basic",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:fluorite",
        name: "萤石",
        type: "basic",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:piglich_heart",
        name: "猪灵之心",
        type: "EPIC",
        maxStackSize: 16,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:ruby",
        name: "红宝石",
        type: "basic",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:unobtainium_allthemodium_alloy_ingot",
        name: "无尽全能合金锭",
        type: "EPIC",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:unobtainium_ingot",
        name: "无尽锭",
        type: "EPIC",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:unobtainium_upgrade_smithing_template",
        name: "无尽升级锻造模板",
        type: "EPIC",
        maxStackSize: 1,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:unobtainium_vibranium_alloy_ingot",
        name: "无尽振动合金锭",
        type: "EPIC",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:vibranium_allthemodium_alloy_ingot",
        name: "振动全能合金锭",
        type: "EPIC",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:vibranium_upgrade_smithing_template",
        name: "振动升级锻造模板",
        type: "EPIC",
        maxStackSize: 1,
        creativeTab: "minecraft:misc"
    },
    {
        id: "kubejs:aluminum_crystal",
        name: "经验水晶",
        type: "UNCOMMON",
        maxStackSize: 64,
        creativeTab: "minecraft:misc"
    }
];

// 记录添加结果
let addResults = {
    successful: [],
    failed: []
};

// 输出结果摘要
function outputResultsSummary() {
    console.info("[KubeJS] =======================================");
    console.info("[KubeJS] 自定义物品添加结果摘要:");
    // 使用字符串拼接替代模板字符串
    console.info("[KubeJS] 成功添加: " + addResults.successful.length + " 项");
    addResults.successful.forEach(function(item) {
        console.info("[KubeJS] ✓ " + item);
    });
    
    console.info("[KubeJS] 添加失败: " + addResults.failed.length + " 项");
    addResults.failed.forEach(function(item) {
        console.info("[KubeJS] ✗ " + item);
    });
    console.info("[KubeJS] =======================================");
}

// 初始化日志
console.info("[KubeJS] 初始化自定义物品添加脚本...");
console.info("[KubeJS] 配置信息: 计划添加 " + ITEMS_TO_ADD.length + " 个物品");

// 监听物品注册事件，添加自定义物品
StartupEvents.registry("item", function(event) {
    console.info("[KubeJS] 开始处理自定义物品添加...");
    
    // 使用普通for循环替代forEach，避免箭头函数和回调函数问题
    for (var i = 0; i < ITEMS_TO_ADD.length; i++) {
        var itemConfig = ITEMS_TO_ADD[i];
        
        try {
            // 简化创建过程，不使用try-catch嵌套
            if (event && typeof event.create === 'function') {
                // 直接调用create方法创建物品
            var itemBuilder = event.create(itemConfig.id).displayName(itemConfig.name);
            
            // 设置纹理
            if (itemConfig.texture) {
                itemBuilder.texture(itemConfig.texture);
            }
            
            // 设置最大堆叠数量
            if (itemConfig.maxStackSize) {
                itemBuilder.maxStackSize(itemConfig.maxStackSize);
            }
            
            // 设置稀有度
            if (itemConfig.id === "kubejs:pokopoko_synthion_remix") {
                // 特殊处理：为Synthion Remix设置EPIC稀有度
                itemBuilder.rarity('EPIC');
            } else {
                // 根据类型设置稀有度
                if (itemConfig.type === "EPIC") {
                    itemBuilder.rarity('EPIC');
                } else if (itemConfig.type === "basic") {
                    itemBuilder.rarity('COMMON');
                }
            }
            
            // 移除了不支持的creativeTab方法
            
            // 记录成功
            addResults.successful.push("物品: " + itemConfig.id + " (" + itemConfig.name + ")");
            console.info("[KubeJS] 成功添加物品: " + itemConfig.id + " - " + itemConfig.name);
            } else {
                // 记录错误
                var errorMsg = itemConfig.id + " (" + itemConfig.name + ") - 错误: 事件对象没有create方法";
                addResults.failed.push(errorMsg);
                console.error("[KubeJS] 添加物品时出错: " + errorMsg);
            }
        } catch (e) {
            // 捕获所有错误
            var errorStr = itemConfig.id + " (" + itemConfig.name + ") - 错误: " + e;
            addResults.failed.push(errorStr);
            console.error("[KubeJS] 添加物品时出错: " + errorStr);
        }
    }
    
    // 输出结果摘要
    outputResultsSummary();
});

// 监听方块注册事件（如果需要添加方块）
StartupEvents.registry("block", function(event) {
    // 这里可以添加方块的添加逻辑，类似于物品添加
    console.info("[KubeJS] 方块注册事件触发 - 目前没有配置要添加的方块");
});

console.info("[KubeJS] 自定义物品添加脚本初始化完成");