//  动态难度 + 在线配置 + GUI + 帮助
// 普通对象，用来放调试开关
const DEBUG_FLAGS = {
    console: false,
    chat: false
};
// ========== 运行时配置 ==========
function buildConfig() {
    return {
        DETECTION_RADIUS: 32,
        BASE_HEALTH_MULTIPLIER: 1.0,
        BASE_ARMOR_MULTIPLIER: 1.0,
        BASE_DAMAGE_MULTIPLIER: 1.0,
        MAX_HEALTH_MULTIPLIER: 4.0,
        MAX_ARMOR_MULTIPLIER: 3.0,
        MAX_DAMAGE_MULTIPLIER: 2.5,
        HEALTH_PRECISION_FACTOR: 0.03,
        HEALTH_ARMOR_FACTOR: 0.02,
        HEALTH_TOUGHNESS_FACTOR: 0.04,
        HEALTH_SPELL_POWER_FACTOR: 0.05,
        ARMOR_ARMOR_FACTOR: 0.03,
        ARMOR_TOUGHNESS_FACTOR: 0.05,
        DAMAGE_SPELL_POWER_FACTOR: 0.04,
        DAMAGE_PRECISION_FACTOR: 0.02,
        PRECISION_BASE_PER_ITEM: 1.0,
        PRECISION_SPECIAL_ENCHANT_MULTIPLIER: 2.0,
        PRECISION_GOOD_ENCHANT_MULTIPLIER: 1.5,
        PRECISION_NORMAL_ENCHANT_MULTIPLIER: 0.5,
        ARMOR_BASE_BONUS: 2.0,
        ARMOR_ENCHANT_BONUS: 0.5,
        TOUGHNESS_DIAMOND_NETHERITE_BONUS: 2.0,
        TOUGHNESS_ENCHANT_BONUS: 0.25,
        SPELL_POWER_BASE: 5.0,
        SPELL_POWER_ENCHANT_MULTIPLIER: 2.0,
        SPELL_POWER_MANA_FACTOR: 0.01,
        VISUAL_EFFECT_THRESHOLD: 2.0,
        UPDATE_FREQUENCY: 200
    };
}
const CONFIG = buildConfig();   // 现在它是普通对象，可写！

console.log('✅ [difficulty_plus] 动态难度+GUI 版已加载')

// ========== 工具函数 ==========
function safeLog(msg, force) {
    if (force || DEBUG_FLAGS.console) console.log(msg)
}
function shouldSkipEntity(e) {
    if (!e || e.isPlayer() || !e.isAlive()) return true
    const name = e.getType().toString()
    return ['villager', 'animal', 'iron_golem', 'bat', 'marker', 'item', 'arrow', 'projectile',
        'area_effect_cloud', 'painting', 'boat', 'minecart', 'armor_stand', 'item_frame',
        'leash_knot', 'ender_pearl', 'eye_of_ender', 'firework', 'fireball', 'dragon_fireball',
        'wither_skull', 'shulker_bullet', 'llama_spit', 'evoker_fangs', 'fishing_bobber',
        'lightning_bolt', 'tnt', 'falling_block', 'experience_orb', 'experience_bottle',
        'text_display', 'interaction', 'glow_item_frame'].some(v => name.includes(v))
}
function getNearbyPlayers(level, pos, r) {
    const players = []
    if (!level?.players) return players
    level.players.forEach(p => {
        if (p.isAlive()) {
            const dx = p.x - pos.x
            const dy = p.y - pos.y
            const dz = p.z - pos.z
            if (dx * dx + dy * dy + dz * dz <= r * r) players.push(p)
        }
    })
    return players
}

// ========== 属性计算 ==========
// 装备精度
function calculatePlayerPrecision(p) {
    let v = 0;
    const slots = ['head', 'chest', 'legs', 'feet', 'mainhand', 'offhand'];
    
    // 使用forEach替代传统for循环，避免Rhino引擎的变量作用域问题
    slots.forEach(slot => {
        const currentItem = p.getItemBySlot(slot);
        if (currentItem.isEmpty()) return;
        v += CONFIG.PRECISION_BASE_PER_ITEM;
        
        // 已移除物品附魔计算，解决变量作用域冲突
    });
    return Math.max(0, v);
}

// 护甲值
function calculatePlayerArmor(p) {
    let v = p.armorValue;
    const slots = ['head', 'chest', 'legs', 'feet'];
    
    // 使用forEach替代传统for循环，避免Rhino引擎的变量作用域问题
    slots.forEach(slot => {
        const currentArmorItem = p.getItemBySlot(slot);
        if (currentArmorItem.isEmpty()) return;
        v += CONFIG.ARMOR_BASE_BONUS;
        
        // 已移除护甲附魔计算，解决变量作用域冲突
    });
    return Math.max(0, v);
}

// 韧性
function calculatePlayerToughness(p) {
    let v = 0;
    const slots = ['head', 'chest', 'legs', 'feet'];
    
    // 使用forEach替代传统for循环，避免Rhino引擎的变量作用域问题
    slots.forEach(slot => {
        const currentToughnessItem = p.getItemBySlot(slot);
        if (currentToughnessItem.isEmpty()) return;
        const id = currentToughnessItem.id;
        if (id.includes('diamond') || id.includes('netherite')) {
            v += CONFIG.TOUGHNESS_DIAMOND_NETHERITE_BONUS;
        }
        
        // 已移除韧性附魔计算，解决变量作用域冲突
        
        const nbt = currentToughnessItem.nbt;
        if (nbt && nbt.contains('toughness')) v += nbt.getInt('toughness');
    });
    return Math.max(0, v);
}

// 法术强度：读游戏内已计算好的属性（兼容任何重定位）
function calculatePlayerSpellPower(p) {
    let v = 0;

    // 1. 武器基础加成
    const hands = ['mainhand', 'offhand'];
    // 使用forEach替代传统for循环，避免Rhino引擎的变量作用域问题
    hands.forEach(handslot => {
        const currentSpellItem = p.getItemBySlot(handslot);
        if (currentSpellItem.isEmpty()) return;
        const id = currentSpellItem.id;
        if (id.startsWith('cataclysm_spellbooks:') ||
            id.startsWith('irons_spellbooks:')   ||
            id.includes('spell') || id.includes('wand') || id.includes('mage')) {
            v += CONFIG.SPELL_POWER_BASE;
            
            // 已移除法术强度附魔计算，解决变量作用域冲突
        }
    });

    // 2. 用属性注册名读取（不依赖类路径）
    const attr = p.getAttribute('irons_spellbooks:spell_power');
    if (attr) v += attr.getValue();

    return Math.max(0, v);
}
function calculatePlayerStats(players) {
    let precision = 0, armor = 0, toughness = 0, spellPower = 0, n = 0
    players.forEach(p => {
        if (!p.isAlive()) return
        precision += calculatePlayerPrecision(p)
        armor += calculatePlayerArmor(p)
        toughness += calculatePlayerToughness(p)
        spellPower += calculatePlayerSpellPower(p)
        n++
    })
    if (n === 0) return { precision: 0, armor: 0, toughness: 0, spellPower: 0, combined: 0 }
    return {
        precision: precision / n,
        armor: armor / n,
        toughness: toughness / n,
        spellPower: spellPower / n,
        combined: (precision + armor + toughness + spellPower) / (n * 4)
    }
}

// ========== 怪物缩放 ==========
function calculateHealthMultiplier(s) {
    return Math.min(CONFIG.MAX_HEALTH_MULTIPLIER,
        CONFIG.BASE_HEALTH_MULTIPLIER +
        s.precision * CONFIG.HEALTH_PRECISION_FACTOR +
        s.armor * CONFIG.HEALTH_ARMOR_FACTOR +
        s.toughness * CONFIG.HEALTH_TOUGHNESS_FACTOR +
        s.spellPower * CONFIG.HEALTH_SPELL_POWER_FACTOR)
}
function calculateArmorMultiplier(s) {
    return Math.min(CONFIG.MAX_ARMOR_MULTIPLIER,
        CONFIG.BASE_ARMOR_MULTIPLIER +
        s.armor * CONFIG.ARMOR_ARMOR_FACTOR +
        s.toughness * CONFIG.ARMOR_TOUGHNESS_FACTOR)
}
function calculateDamageMultiplier(s) {
    return Math.min(CONFIG.MAX_DAMAGE_MULTIPLIER,
        CONFIG.BASE_DAMAGE_MULTIPLIER +
        s.spellPower * CONFIG.DAMAGE_SPELL_POWER_FACTOR +
        s.precision * CONFIG.DAMAGE_PRECISION_FACTOR)
}
function getScalingType(s) {
    if (s.spellPower > s.precision && s.spellPower > s.armor) return '法术强化'
    if (s.armor > s.precision) return '防御强化'
    return '精准强化'
}
function applyMonsterScaling(mob, stats) {
    if (!mob || mob.isRemoved() || !mob.isAlive() || mob.maxHealth <= 0) return
    const data = mob.persistentData
    if (!data.contains('originalMaxHealth')) {
        data.putDouble('originalMaxHealth', mob.maxHealth)
        data.putDouble('originalHealth', mob.health)
        data.putDouble('originalArmor', mob.armorValue)
    }
    const originalMaxHealth = data.getDouble('originalMaxHealth')
    const originalArmor = data.getDouble('originalArmor')

    const hm = calculateHealthMultiplier(stats)
    const am = calculateArmorMultiplier(stats)
    const dm = calculateDamageMultiplier(stats)

    const newMax = originalMaxHealth * hm
    if (Math.abs(mob.maxHealth - newMax) > 0.1) {
        const ratio = mob.health / mob.maxHealth
        mob.maxHealth = newMax
        mob.health = newMax * ratio
    }
    data.putDouble('healthMultiplier', hm)
    data.putDouble('armorMultiplier', am)
    data.putDouble('damageMultiplier', dm)
    data.putString('scalingType', getScalingType(stats))

    if (hm > CONFIG.VISUAL_EFFECT_THRESHOLD) {
        const pos = mob.position
        mob.level.runCommandSilent(`particle minecraft:enchanted_hit ${pos.x} ${pos.y + 1} ${pos.z} 0.3 0.3 0.3 0.1 5`)
    }
}
function scaleMonsterBasedOnPlayerStats(mob) {
    if (!mob || !mob.isAlive() || mob.isRemoved()) return
    const level = mob.level
    const players = getNearbyPlayers(level, mob.blockPosition(), CONFIG.DETECTION_RADIUS)
    if (players.length === 0) return
    applyMonsterScaling(mob, calculatePlayerStats(players))
}

// ========== 事件 ==========
EntityEvents.spawned(event => {
    const e = event.entity
    if (shouldSkipEntity(e)) return
    safeLog(`🔍 [生成] 检测到敌对生物: ${e.type}`)
    try { scaleMonsterBasedOnPlayerStats(e) } catch (err) { safeLog(`❌ 调整失败: ${err.message}`, true) }
})
ServerEvents.tick(event => {
    const server = event.server
    if (server.tickCount % CONFIG.UPDATE_FREQUENCY !== 0) return
    const level = server.getLevel(0)
    if (!level) return
    level.entities.forEach(e => {
        if (shouldSkipEntity(e)) return
        try { scaleMonsterBasedOnPlayerStats(e) } catch (_) {}
    })
})

// ========== 命令注册 ==========
// ========== 命令注册 ==========
ServerEvents.commandRegistry(function(event) {
    const Commands = event.commands
    const StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    const DoubleArgumentType = Java.loadClass('com.mojang.brigadier.arguments.DoubleArgumentType')
    const Component   = Java.loadClass('net.minecraft.network.chat.Component')
    const ClickEvent  = Java.loadClass('net.minecraft.network.chat.ClickEvent')
    const HoverEvent  = Java.loadClass('net.minecraft.network.chat.HoverEvent')

    // 1. 在线改配置
    event.register(
        Commands.literal('difficulty_config')
            .then(Commands.literal('set')
                .then(Commands.argument('key', StringArgumentType.string())
                    .then(Commands.argument('value', DoubleArgumentType.doubleArg())
                        .executes(ctx => {
                            const key   = StringArgumentType.getString(ctx, 'key')
                            const value = DoubleArgumentType.getDouble(ctx, 'value')
                            if (CONFIG.hasOwnProperty(key)) {
                                CONFIG[key] = value
                                const p = ctx.source.player
                                if (p) p.tell(Component.literal(`✅ 配置已更新: ${key} = ${value}`))
                                console.log(`⚙️ 运行时修改: ${key} = ${value}`)
                            } else {
                                const p = ctx.source.player
                                if (p) p.tell(Component.literal(`❌ 无效的配置项: ${key}`))
                            }
                            return 1
                        })
                    )
                )
            )
            .then(Commands.literal('get')
                .then(Commands.argument('key', StringArgumentType.string())
                    .executes(ctx => {
                        const key = StringArgumentType.getString(ctx, 'key')
                        const p   = ctx.source.player
                        if (CONFIG.hasOwnProperty(key)) {
                            if (p) p.tell(Component.literal(`📋 ${key} = ${CONFIG[key]}`))
                        } else {
                            if (p) p.tell(Component.literal(`❌ 无效的配置项: ${key}`))
                        }
                        return 1
                    })
                )
            )
            .executes(ctx => {
                const p = ctx.source.player
                if (p) {
                    p.tell(Component.literal('§3用法：'))
                    p.tell(Component.literal('§b/difficulty_config set <key> <value>'))
                    p.tell(Component.literal('§b/difficulty_config get <key>'))
                    p.tell(Component.literal('§7示例：§f/difficulty_config set MAX_HEALTH_MULTIPLIER 6.0'))
                }
                return 1
            })
    )

    // 2. 帮助
    event.register(
        Commands.literal('diffhelp')
            .executes(ctx => {
                const p = ctx.source.player
                if (p) {
                    p.tell(Component.literal('§e§m          §e[ §6§l动态难度帮助 §e]§e§m          '))
                    p.tell(Component.literal('§b/diffhelp §7- 查看这条帮助'))
                    p.tell(Component.literal('§b/diffgui §7- 打开图形菜单'))
                    p.tell(Component.literal('§b/difficulty_config set/get §7- 在线改/查配置'))
                    p.tell(Component.literal('§b/difficulty_debug §7- 调试管理'))
                    p.tell(Component.literal('§b/debug_stats §7- 查看自己属性与附近怪物强化'))
                }
                return 1
            })
    )

    // 3. GUI
    event.register(
        Commands.literal('diffgui')
            .executes(ctx => {
                const p = ctx.source.player
                if (!p) return 1
                p.tell(Component.literal('§e§m          §e[ §6§l动态难度控制中心 §e]§e§m          '))
                p.tell(
                    Component.literal('  §a▶ §b点击查看我的属性')
                        .setStyle(Component.empty().style
                            .withClickEvent(new ClickEvent(ClickEvent.Action.RUN_COMMAND, '/debug_stats'))
                            .withHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, Component.literal('§7查看你的装备强度与附近怪物强化'))))
                )
                p.tell(
                    Component.literal('  §a▶ §e调试开关菜单')
                        .setStyle(Component.empty().style
                            .withClickEvent(new ClickEvent(ClickEvent.Action.RUN_COMMAND, '/difficulty_debug'))
                            .withHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, Component.literal('§7开关控制台/聊天栏调试'))))
                )
                p.tell(
                    Component.literal('  §a▶ §d修改配置菜单')
                        .setStyle(Component.empty().style
                            .withClickEvent(new ClickEvent(ClickEvent.Action.RUN_COMMAND, '/difficulty_config'))
                            .withHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, Component.literal('§7无需翻文件，在线改倍率'))))
                )
                p.tell(
                    Component.literal('  §c▶ §8关闭菜单')
                        .setStyle(Component.empty().style
                            .withClickEvent(new ClickEvent(ClickEvent.Action.RUN_COMMAND, '/say 菜单已关闭'))
                            .withHoverEvent(new HoverEvent(HoverEvent.Action.SHOW_TEXT, Component.literal('§7点击关闭'))))
                )
                p.tell(Component.literal('§7提示：所有按钮均可直接点击执行命令'))
                return 1
            })
    )

    // 4. 查看玩家属性
    event.register(
        Commands.literal('debug_stats')
            .executes(ctx => {
                const p = ctx.source.player
                if (!p) return 1
                const precision = calculatePlayerPrecision(p)
                const armor     = calculatePlayerArmor(p)
                const toughness = calculatePlayerToughness(p)
                const spellPower= calculatePlayerSpellPower(p)
                const combined  = (precision + armor + toughness + spellPower) / 4
                p.tell(Component.literal('=== §6玩家属性统计§f ==='))
                p.tell(Component.literal(`装备精度: ${precision.toFixed(2)}`))
                p.tell(Component.literal(`护甲值: ${armor.toFixed(2)}`))
                p.tell(Component.literal(`韧性值: ${toughness.toFixed(2)}`))
                p.tell(Component.literal(`法术强度: ${spellPower.toFixed(2)}`))
                p.tell(Component.literal(`综合强度: ${combined.toFixed(2)}`))

                // 附近强化怪物
                const level     = p.level
                const playerPos = p.blockPosition()
                let count = 0
                level.entities.forEach(e => {
                    if (e.isPlayer() || !e.isAlive() || shouldSkipEntity(e)) return
                    const dx = e.x - playerPos.x, dy = e.y - playerPos.y, dz = e.z - playerPos.z
                    if (dx * dx + dy * dy + dz * dz > 16 * 16) return
                    const data = e.persistentData
                    if (data.contains('healthMultiplier')) {
                        const hm   = data.getDouble('healthMultiplier')
                        const type = data.contains('scalingType') ? data.getString('scalingType') : '未知'
                        p.tell(Component.literal(`${e.name.string}: ${type} 生命x${hm.toFixed(2)}`))
                        count++
                    }
                })
                if (count === 0) p.tell(Component.literal('附近没有已强化的怪物'))
                return 1
            })
    )

    // 5. 调试主菜单
    event.register(
        Commands.literal('difficulty_debug')
            .then(Commands.literal('console')
                .then(Commands.literal('on').executes(ctx => {
                    DEBUG_FLAGS.console = true
                    const p = ctx.source.player
                    if (p) p.tell(Component.literal('🔧 控制台调试已开启'))
                    console.log('🔧 [指令] 控制台调试已开启')
                    return 1
                }))
                .then(Commands.literal('off').executes(ctx => {
                    DEBUG_FLAGS.console = false
                    const p = ctx.source.player
                    if (p) p.tell(Component.literal('🔧 控制台调试已关闭'))
                    console.log('🔧 [指令] 控制台调试已关闭')
                    return 1
                }))
                .executes(ctx => {
                    const p = ctx.source.player
                    if (p) p.tell(Component.literal('🔧 控制台调试: ' + (DEBUG_FLAGS.console ? '开启' : '关闭')))
                    return 1
                })
            )
            .then(Commands.literal('chat')
                .then(Commands.literal('on').executes(ctx => {
                    DEBUG_FLAGS.chat = true
                    const p = ctx.source.player
                    if (p) p.tell(Component.literal('💬 聊天栏调试已开启'))
                    return 1
                }))
                .then(Commands.literal('off').executes(ctx => {
                    DEBUG_FLAGS.chat = false
                    const p = ctx.source.player
                    if (p) p.tell(Component.literal('💬 聊天栏调试已关闭'))
                    return 1
                }))
                .executes(ctx => {
                    const p = ctx.source.player
                    if (p) p.tell(Component.literal('💬 聊天调试: ' + (DEBUG_FLAGS.chat ? '开启' : '关闭')))
                    return 1
                })
            )
            .then(Commands.literal('config').executes(ctx => {
                const p = ctx.source.player
                if (p) {
                    p.tell(Component.literal('⚙️ 当前配置：'))
                    p.tell(Component.literal(`📏 检测半径: ${CONFIG.DETECTION_RADIUS} 格`))
                    p.tell(Component.literal(`❤️ 最大生命倍率: x${CONFIG.MAX_HEALTH_MULTIPLIER}`))
                    p.tell(Component.literal(`🛡️ 最大护甲倍率: x${CONFIG.MAX_ARMOR_MULTIPLIER}`))
                    p.tell(Component.literal(`⚔️ 最大伤害倍率: x${CONFIG.MAX_DAMAGE_MULTIPLIER}`))
                    p.tell(Component.literal(`⏱️ 更新频率: ${CONFIG.UPDATE_FREQUENCY} ticks`))
                }
                return 1
            }))
            .then(Commands.literal('status').executes(ctx => {
                const p = ctx.source.player
                if (p) {
                    p.tell(Component.literal('📊 调试状态：'))
                    p.tell(Component.literal(`🔧 控制台: ${DEBUG_FLAGS.console ? '开启' : '关闭'}`))
                    p.tell(Component.literal(`💬 聊天栏: ${DEBUG_FLAGS.chat ? '开启' : '关闭'}`))
                }
                return 1
            }))
            .executes(ctx => {
                const p = ctx.source.player
                if (p) {
                    p.tell(Component.literal('🔧 动态难度调试命令：'))
                    p.tell(Component.literal('/difficulty_debug console on/off - 控制台调试'))
                    p.tell(Component.literal('/difficulty_debug chat on/off - 聊天栏调试'))
                    p.tell(Component.literal('/difficulty_debug config - 查看配置'))
                    p.tell(Component.literal('/difficulty_debug status - 查看状态'))
                    p.tell(Component.literal('/debug_stats - 查看玩家属性'))
                }
                return 1
            })
    )
})

// ========== 全局调试开关 ==========
DEBUG_FLAGS.console = false
DEBUG_FLAGS.chat = false

console.log('✅ [difficulty_plus] 全部功能加载完成！试试 /diffgui 或 /diffhelp')
