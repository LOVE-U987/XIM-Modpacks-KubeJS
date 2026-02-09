// 将此文件放在 startup_scripts 文件夹中
// 这是 Iron's Spellbooks 1.21.1 版本的完整示例，演示如何创建：
// - 自定义属性
// - 自定义法术学派
// - 自定义法术
// - 自定义法术书、法杖和魔法剑

console.info('Hello, World! (Loaded startup TEST example script)')

// ==================== 属性注册 ====================
// 属性必须在学派注册之前创建，因为学派需要引用这些属性
StartupEvents.registry("attribute", event => {
    // 创建法术强度属性
    // "spell" 类型表示这是一个法术相关属性
    event.create("test_spell_power", "spell")
        // .range(显示值, 最小值, 最大值)
        // 显示值是默认显示的值，实际范围是 0-10
        .range(6.0, 0, 10)
        // 附加到玩家，使玩家可以使用这个属性
        .attachToPlayers()

    // 创建法术抗性属性
    event.create("test_spell_resistance", "spell")
        .range(4.0, 0, 10)
        .attachToPlayers()

    // 创建默认法术属性（不附加到玩家）
    event.create("test_spell_default", "spell")
        .range(2.0, 0, 10)
})

// ==================== 法术学派注册 ====================
// 学派是法术的分类，每个法术都属于一个学派
StartupEvents.registry("irons_spellbooks:schools", event => {
    event.create("test")
        // 设置学派显示名称
        // Component.of 创建文本组件，支持样式和翻译键
        .setName(Component.of("Test"))
        
        // 添加施法焦点物品标签
        // 这些物品可以作为该学派的施法焦点（手持时增强法术）
        .addFocusItemTags("minecraft:planks")
        
        // 添加具体的施法焦点物品
        .addFocusItems(["minecraft:diamond_ore", "minecraft:apple"])
        
        // 设置默认焦点标签
        // 默认是 `kubejs:test_focus`，只有在你知道自己在做什么时才修改
        .setDefaultFocusTag("some_mod_id:some_path")
        
        // 设置学派的法术强度属性
        // 这个属性会影响该学派所有法术的伤害/效果
        .setPowerAttribute("kubejs:test_spell_power")
        
        // 设置学派的法术抗性属性
        // 这个属性会影响玩家受到该学派法术的伤害减免
        .setResistanceAttribute("kubejs:test_spell_resistance")
        
        // 设置默认施法音效
        .setDefaultCastSound('minecraft:entity.chicken.death')
        
        // 设置伤害类型
        // 用于伤害计算和死亡消息
        .setDamageType("irons_spellbooks:ender_magic")
        
        // 禁止从战利品中获取该学派的法术
        .disableLooting()
        
        // 需要学习才能使用该学派的法术
        // 通常用于特殊或禁忌学派
        .requiresLearning()
})

// ==================== 法术注册 ====================
StartupEvents.registry('irons_spellbooks:spells', event => {
    
    // ---------- 测试法术 1（瞬发类型）----------
    event.create('kubejs:test_with_ctx')
        // 施法时间：20 ticks = 1秒
        .setCastTime(20)
        
        // 冷却时间：5秒
        .setCooldownSeconds(5)
        
        // 基础法力消耗：1点
        .setBaseManaCost(1)
        
        // 每级额外法力消耗：1点
        .setManaCostPerLevel(1)
        
        // 施法类型：瞬发
        // 可选值：'instant'（瞬发）、'continuous'（持续）、'long'（长施法）
        .setCastType('instant')
        
        // 设置所属学派
        .setSchool('kubejs:test')
        
        // 设置哪些玩家可以制作此法术
        .canBeCraftedBy(player => true)
        
        // 施法时的回调函数
        // ctx 是施法上下文对象，包含施法相关信息
        .onCast(ctx => {
            // ctx.level - 世界/维度对象
            console.log(ctx.level)
            
            // ctx.spellLevel - 法术等级
            console.log(ctx.spellLevel)
            
            // ctx.entity - 施法者实体
            console.log(ctx.entity)
            
            // ctx.castSource - 施法来源
            console.log(ctx.castSource)
            
            // ctx.playerMagicData - 玩家魔法数据
            console.log(ctx.playerMagicData)
            
            console.log("From onCast With Context")
            
            // 为施法者恢复1点生命值
            ctx.entity.heal(1)
        })

    // ---------- 测试法术 2（持续施法类型）----------
    event.create('kubejs:test_with_ctx_2')
        .setCastTime(10)
        .setCooldownSeconds(8)
        .setBaseManaCost(1)
        .setManaCostPerLevel(15)
        
        // 持续施法类型：按住施法键持续生效
        .setCastType('continuous')
        
        // 使用火焰学派
        .setSchool("irons_spellbooks:fire")
        
        .onCast(ctx => {
            console.log(ctx.level)
            console.log(ctx.spellLevel)
            console.log(ctx.entity)
            console.log(ctx.castSource)
            console.log(ctx.playerMagicData)
            console.log("From onCast With Context 2")
            
            // 恢复3点生命值
            ctx.entity.heal(3)
        })
})

// ==================== 物品注册 ====================
StartupEvents.registry("item", event => {
    
    // ---------- 基础法术书 ----------
    event.create("test_spellbook", "spellbook")
        // 设置最大法术槽位数
        .setMaxSpellSlots(3)
        // 设置稀有度
        .rarity("UNCOMMON")

    // ---------- 带属性的法术书 ----------
    event.create("test_attribute_spellbook", "spellbook")
        .setMaxSpellSlots(8)
        // 添加属性
        // 参数：属性ID, 数值, 运算类型
        // 运算类型："add_value"（加法）、"add_multiplied_base"（基础乘法）、"add_multiplied_total"（总乘法）
        .addAttribute("kubejs:test_spell_power", 2.0, "add_multiplied_total")
        .addAttribute("kubejs:test_spell_resistance", 5.0, "add_value")
        .rarity("RARE")

    // ---------- 独特法术书（带默认法术）----------
    event.create("test_unique_spellbook", "spellbook")
        .setMaxSpellSlots(4)
        .addAttribute("kubejs:test_spell_power", 4.0, "add_multiplied_total")
        .addAttribute("kubejs:test_spell_resistance", 2.0, "add_value")
        // 添加默认法术（玩家获得时自动学会）
        .addSpell("irons_spellbooks:firebolt", 1)
        .rarity("EPIC")

    // ---------- 亲和法术书（带亲和法术）----------
    event.create("test_affinity_spellbook", "spellbook")
        .setMaxSpellSlots(3)
        .addAttribute("kubejs:test_spell_power", 2.0, "add_multiplied_total")
        .addAttribute("kubejs:test_spell_resistance", 5.0, "add_value")
        .addSpell("irons_spellbooks:firebolt", 3)
        // 设置亲和法术
        // 亲和法术通常有特殊效果或减耗
        .setAffinitySpell("irons_spellbooks:raise_dead")
        .rarity("EPIC")

    // ---------- 自定义法杖 ----------
    event.create("test_staff", "staff")
        // 设置附魔能力（决定获得高级附魔的概率）
        .setEnchantmentValue(30)
        // 设置法杖等级/模板
        .setTier(tier => {
            // 可用的基础等级：
            // GRAYBEARD（灰胡子）、ARTIFICER（工匠）、ICE_STAFF（冰霜法杖）、
            // LIGHTNING_ROD（雷电法杖）、BLOOD_STAFF（血魔法杖）
            // 
            // 第二个参数：是否合并基础等级的属性
            tier.useBaseTier("ICE_STAFF", true)
                // 添加自定义属性
                .addAttribute("kubejs:test_spell_power", 2.0, "add_multiplied_total")
                .addAttribute("kubejs:test_spell_resistance", 5.0, "add_value")
                // 设置攻击速度（负值表示较慢）
                .setSpeed(-2)
                // 设置攻击伤害
                .setDamage(42)
        })

    // ---------- 自定义魔法剑 ----------
    event.create("test_magic_sword", "magic_sword")
        // 添加默认法术
        .addSpell("irons_spellbooks:firebolt", 1)
        .addSpell("irons_spellbooks:raise_dead", 2)
        // 设置武器等级/模板
        .setTier(tier => {
            // 可用的基础等级：
            // HELLRAZOR（地狱剃刀）、LEGIONNAIRE_FLAMBERGE（军团火焰剑）、
            // DECREPIT_FLAMBERGE（腐朽火焰剑）、DECREPIT_SCYTHE（腐朽镰刀）、
            // DREADSWORD（恐惧之剑）、MISERY（苦难）、
            // METAL_MAGEHUNTER（金属猎法者）、CRYSTAL_MAGEHUNTER（水晶猎法者）、
            // SPELLBREAKER（破法者）、TRUTHSEEKER（寻真者）、
            // CLAYMORE（阔剑）、AMETHYST_RAPIER（紫水晶刺剑）
            tier.useBaseTier("CRYSTAL_MAGEHUNTER", true)
                .addAttribute("kubejs:test_spell_power", 2.0, "add_multiplied_total")
                // 设置耐久度
                .setUses(666)
                // 设置伤害
                .setDamage(12)
                // 设置攻击速度
                .setSpeed(-3)
                // 设置附魔能力
                .setEnchantmentValue(6)
                // 设置不正确的挖掘方块（用于工具类型）
                .setIncorrectBlocksForDrops("minecraft:incorrect_for_gold_tool")
                // 设置修复材料
                .setRepairIngredient(() => Ingredient.of("minecraft:gold_ingot"))
        })
        // 设置为食物（可以吃的剑！）
        .food(builder => {
            // 设置营养值
            builder.nutrition(4)
                // 设置饱和度
                .saturation(0.4)
                // 总是可以食用（即使饥饿值满）
                .alwaysEdible()
                // 食用时间（秒）
                .eatSeconds(3)
                // .fastToEat() // 快速食用（0.8秒）
                // 食用后返还的物品
                .usingConvertsTo("minecraft:bucket")
                // 食用后给予的效果：效果ID, 持续时间(ticks), 等级, 概率
                .effect("minecraft:invisibility", 100, 0, 0.5)
                // 食用后的回调
                .eaten(ctx => ctx.entity.tell("Did you just eat a sword, fam?"))
        })
        // .component("...", value) // 可以添加自定义组件数据
        // 设置最大堆叠数量
        .maxStackSize(1)
        // 设置最大耐久度
        .maxDamage(500)
        // 设置容器物品（用于合成时保留）
        .containerItem("minecraft:acacia_boat")
        // 设置稀有度
        .rarity("epic")
        // 防火（不会在岩浆中烧毁）
        .fireResistant()
        // 禁止修复
        .disableRepair()
        // 设置为唱片机可播放（播放音乐）
        .jukeboxPlayable("minecraft:cat", true)
})

// ==================== 法术选择事件 ====================
// ISSEvents.spellSelection - 当法术选择轮盘发生变化时触发
ISSEvents.spellSelection(event => {
	console.log("-- @" + event.entity.scriptType)
	console.log("-- SPELL-SELECTION --")
	
	// event.entity - 玩家实体
	console.log(event.entity ?? undefined)
	
	// event.manager - 法术管理器
	console.log(event.manager ?? undefined)
})

// ==================== 服务器启动后初始化 ====================
StartupEvents.postInit(event => {
	// Spell.of - 获取法术对象（无效ID返回 null）
	console.log("Invalid Spell: " + Spell.of("asdasdasd"))
	
	// Spell.of - 获取有效法术
	console.log("Valid Spell: " + Spell.of("irons_spellbooks:raise_dead"))
	
	// Spell.ofHolder - 以 Holder 形式获取法术（内部使用）
	console.log("As Holder Spell: " + Spell.ofHolder("irons_spellbooks:raise_dead"))
	
	// 转换测试
	console.log("What? " + Spell.of(Spell.ofHolder("irons_spellbooks:raise_dead")))
	
	// Spell.exists - 检查法术是否存在
	console.log("Exists Spell: " + Spell.exists("irons_spellbooks:raise_dead"))
	
	// Spell.isSpell - 检查对象是否为法术
	console.log("Is Spell: " + Spell.isSpell(Spell.of("irons_spellbooks:raise_dead")))
})
