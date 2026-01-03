// Apotheosis神化模组兼容的动态难度调整
console.log('🔧 [apotheosis] 脚本开始加载...')

EntityEvents.spawned(event => {
    const entity = event.getEntity()

    if (!entity) {
        console.log('❌ [apotheosis] 实体不存在，跳过')
        return
    }

    // ... 类似的调试信息添加到每个关键函数中
})

// 在 calculatePlayerApotheosisPower 函数中添加调试
function calculatePlayerApotheosisPower(player) {
    console.log(`🔍 [apotheosis] 计算玩家神化力量: ${player.name}`)
    let apotheosisPower = 0

    const equipmentSlots = ['head', 'chest', 'legs', 'feet', 'mainhand', 'offhand']

    equipmentSlots.forEach(slot => {
        const item = player.getItemBySlot(slot)
        if (!item.isEmpty()) {
            console.log(`📦 [apotheosis] 检查装备槽位: ${slot}`)
            const nbt = item.nbt

            // 检测Apotheosis特有的NBT数据
            if (nbt) {
                console.log(`🔍 [apotheosis] 物品有NBT数据`)
                // ... 其他代码
            }
        }
    })

    console.log(`📊 [apotheosis] 玩家神化力量总计: ${apotheosisPower}`)
    return Math.max(0, apotheosisPower)
}

// 在 applyMonsterScaling 函数中添加调试
function applyMonsterScaling(monster, playerStats) {
    console.log(`🔧 [apotheosis] applyMonsterScaling 开始: ${monster.getType().toString()}`)

    // 添加类似的严格检查
    if (!monster || monster.isRemoved() || !monster.isAlive()) {
        console.log('❌ [apotheosis] 实体无效、已移除或已死亡，跳过')
        return
    }

    // ... 其他调试信息
}

console.log('✅ [apotheosis] Apotheosis神化模组兼容的动态难度调整脚本已加载')