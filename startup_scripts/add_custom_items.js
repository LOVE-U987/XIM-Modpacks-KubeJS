// priority: 2

// 自定义物品添加脚本
// 按照KubeJS 6.0文档格式编写，兼容KubeJS 1.6.5

// 配置：要添加的物品列表
const ITEMS_TO_ADD = [
    {
        id: "kubejs:pokopoko_synthion_remix",
        name: "Pokopoko (Synthion Remix)",
        type: "basic",
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
                event.create(itemConfig.id).displayName(itemConfig.name);
                
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