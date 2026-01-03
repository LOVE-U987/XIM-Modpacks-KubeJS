// priority: 1

// 定义可配置的物品和方块ID列表
const CONFIG = {
    // 需要删除的物品ID列表
    itemsToRemove: [
        // 示例："minecraft:diamond",
        // 示例："modid:item_id"
    ],
    
    // 需要删除的方块ID列表
    blocksToRemove: [
        // 示例："minecraft:diamond_block",
        // 示例："modid:block_id"
    ]
};

// 记录删除结果
let removeResults = {
    successful: [],
    failed: []
};

// 确保结果摘要只输出一次的标志
let summaryOutput = false;

// 输出删除结果摘要
function outputResultsSummary() {
    if (summaryOutput) return;
    
    console.info("[KubeJS] =======================================");
    console.info("[KubeJS] 物品和方块移除结果摘要:");
    console.info("[KubeJS] 成功移除: " + removeResults.successful.length + " 项");
    removeResults.successful.forEach(item => {
        console.info(`[KubeJS] ✓ ${item}`);
    });
    
    console.info("[KubeJS] 移除失败: " + removeResults.failed.length + " 项");
    removeResults.failed.forEach(item => {
        console.info(`[KubeJS] ✗ ${item}`);
    });
    console.info("[KubeJS] =======================================");
    
    summaryOutput = true;
}

// 初始化日志
console.info("[KubeJS] 初始化物品和方块移除脚本...");
console.info(`[KubeJS] 配置信息: 物品 ${CONFIG.itemsToRemove.length} 个, 方块 ${CONFIG.blocksToRemove.length} 个`);

// 监听物品注册事件，移除指定物品
StartupEvents.registry("item", event => {
    console.info("[KubeJS] 开始处理物品移除...");
    
    CONFIG.itemsToRemove.forEach(itemId => {
        try {
            // 在KubeJS 1.6.5中，移除物品的方法是使用event.remove
            event.remove(itemId);
            removeResults.successful.push(`物品: ${itemId}`);
            console.info(`[KubeJS] 成功移除物品: ${itemId}`);
        } catch (error) {
            removeResults.failed.push(`物品: ${itemId} (错误: ${error.message})`);
            console.error(`[KubeJS] 移除物品时出错: ${itemId}`, error);
        }
    });
});

// 监听方块注册事件，移除指定方块
StartupEvents.registry("block", event => {
    console.info("[KubeJS] 开始处理方块移除...");
    
    CONFIG.blocksToRemove.forEach(blockId => {
        try {
            // 在KubeJS 1.6.5中，移除方块的方法是使用event.remove
            event.remove(blockId);
            removeResults.successful.push(`方块: ${blockId}`);
            console.info(`[KubeJS] 成功移除方块: ${blockId}`);
        } catch (error) {
            removeResults.failed.push(`方块: ${blockId} (错误: ${error.message})`);
            console.error(`[KubeJS] 移除方块时出错: ${blockId}`, error);
        }
    });
    
    // 在方块处理完成后输出结果摘要
    // 方块注册事件通常在物品注册事件之后触发，所以这里输出摘要可以包含所有结果
    outputResultsSummary();
});
