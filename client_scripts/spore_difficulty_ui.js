// priority: 1

// 真菌模组难度选择界面脚本

// 难度配置
const DIFFICULTY_CONFIG = {
    1: { name: "简单", description: "真菌怪物基础属性" },
    2: { name: "普通", description: "真菌怪物血量和护甲提升10%" },
    3: { name: "困难", description: "真菌怪物血量和护甲提升20%" },
    4: { name: "专家", description: "真菌怪物血量和护甲提升30%" },
    5: { name: "大师", description: "真菌怪物血量和护甲提升40%" }
};

// 监听游戏加载完成事件
ClientEvents.init(event => {
    console.info("[SporeDifficulty] 真菌模组难度选择界面脚本已加载");
    console.info("[SporeDifficulty] 使用命令设置难度: /sporedifficulty set <1-5>");
    console.info("[SporeDifficulty] 查看当前难度: /sporedifficulty get");
});

// 监听聊天消息，显示难度设置反馈
ClientEvents.chat(event => {
    const message = event.getMessage().getString();
    
    // 处理难度设置反馈
    if (message.startsWith("[SporeDifficulty]")) {
        console.info(`[SporeDifficulty] 收到服务器消息: ${message}`);
    }
});
