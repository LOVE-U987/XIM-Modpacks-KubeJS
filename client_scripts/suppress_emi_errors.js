// EMI错误抑制脚本 - 兼容KubeJS 2101.7.1

console.log('🔧 [EMI错误抑制] 开始加载脚本...');

// 核心错误处理逻辑
function setupErrorHandler() {
    try {
        const Thread = Java.type('java.lang.Thread');
        const originalHandler = Thread.getDefaultUncaughtExceptionHandler();
        
        Thread.setDefaultUncaughtExceptionHandler({
            uncaughtException: function(thread, throwable) {
                const errorMsg = throwable.toString();
                
                // 检查EMI相关错误
                if (errorMsg.includes('EMI') && 
                   (errorMsg.includes('NBT') || 
                    errorMsg.includes('NoSuchElement'))) {
                    console.log('⚡ 已拦截EMI错误');
                    return;
                }
                
                // 传递其他错误
                if (originalHandler) {
                    originalHandler.uncaughtException(thread, throwable);
                }
            }
        });
        
        console.log('✅ 错误抑制功能已激活');
    } catch (e) {
        console.log('❌ 初始化失败: ' + e.toString());
    }
}

// 客户端事件监听
ClientEvents.loggedIn(event => {
    console.log('🎮 玩家登录，初始化错误抑制');
    setupErrorHandler();
});

// 立即执行一次
setupErrorHandler();

console.log('✅ EMI错误抑制脚本加载完成');