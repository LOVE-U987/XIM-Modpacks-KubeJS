# Iron's Spellbooks KubeJS 扩展教程（1.21.1 版本）

本文档是 Iron's Spellbooks 模组 KubeJS 扩展的 1.21.1 版本使用教程，帮助你通过 JavaScript 创建自定义法术、法术书、法杖和魔法剑。

> **重要提示**：1.21.1 版本与 1.20.1 版本 API 有较大变化，本文档专门针对 1.21.1 版本编写。

---

## 目录

1. [版本差异说明](#版本差异说明)
2. [基础概念](#基础概念)
3. [事件监听](#事件监听)
4. [炼金术士大锅配方](#炼金术士大锅配方)
5. [创建自定义属性](#创建自定义属性)
6. [创建自定义法术学派](#创建自定义法术学派)
7. [创建自定义法术](#创建自定义法术)
8. [创建法术书和装备](#创建法术书和装备)
9. [实用技巧与最佳实践](#实用技巧与最佳实践)
10. [常见问题排查](#常见问题排查)

---

## 版本差异说明

### 1.21.1 版本主要变化

| 功能 | 1.20.1 版本 | 1.21.1 版本 |
|------|-------------|-------------|
| **事件监听** | `PlayerEvents.changeMana` | `ISSEvents.changeMana` |
| **炼金术士大锅** | `AlchemistCauldronRecipeBuilder` | `ServerEvents.recipes` 中的配方类型 |
| **属性运算** | `multiply_total` | `add_multiplied_total` |
| **法术书属性** | `addDefaultAttribute` | `addAttribute` |
| **法杖/武器等级** | 直接设置数值 | `setTier` 使用预设模板 |

### 文件位置变化

```
1.20.1:
- startup_scripts/  - 炼金术士大锅配方
- server_scripts/   - 事件监听

1.21.1:
- startup_scripts/  - 属性、学派、法术、物品注册
- server_scripts/   - 事件监听、炼金术士大锅配方
```

---

## 基础概念

### 脚本存放位置

| 文件夹 | 用途 | 执行时机 |
|--------|------|----------|
| `startup_scripts` | 注册属性、学派、法术、物品 | 游戏启动时执行一次 |
| `server_scripts` | 游戏逻辑、事件监听、配方 | 服务器运行时持续监听 |

### 常用术语

| 术语 | 英文 | 释义 |
|------|------|------|
| **法术槽位** | Spell Slots | 法术书可以容纳的法术数量上限 |
| **法术学派** | School | 法术的属性分类，如血魔法、火焰、冰霜等 |
| **施法焦点** | Focus | 手持时可以增强特定学派法术的物品 |
| **亲和法术** | Affinity Spell | 法术书的特殊法术，通常有额外效果 |
| **属性运算** | Attribute Operation | 属性值的计算方式（加法/乘法） |
| **游戏刻** | Tick | Minecraft 的时间单位，20 ticks = 1秒 |
| **流体单位** | mB/B | 毫桶/桶，1B = 1000mB |

---

## 事件监听

**文件位置**: `server_scripts`

### 1. 法力值变化事件

```javascript
// ISSEvents.changeMana - 当玩家法力值发生变化时触发
ISSEvents.changeMana(event => {
    // event.entity - 触发事件的实体（玩家）
    console.log(event.entity)
    
    // event.magicData - 玩家的魔法数据
    console.log(event.magicData)
    
    // event.magicData.casting - 是否正在施法中
    if (!event.magicData.casting) {
        // event.oldMana - 变化前的法力值
        console.log(event.oldMana)
        
        // setNewMana - 设置新的法力值
        event.setNewMana(event.oldMana + 0.5)
        
        // event.newMana - 变化后的法力值
        console.log(event.newMana)
    }
})
```

### 2. 法术施放前事件

```javascript
// ISSEvents.spellPreCast - 在法术即将施放前触发
// 可以取消施法或修改施法参数
ISSEvents.spellPreCast(event => {
    // event.entity - 施法者实体
    console.log(event.entity)
    
    // event.spellId - 法术ID，格式 "modid:spell_name"
    console.log(event.spellId)
    
    // event.schoolType - 法术所属学派
    console.log(event.schoolType)
    
    // event.spellLevel - 法术等级
    console.log(event.spellLevel)
    
    // event.castSource - 施法来源
    console.log(event.castSource)
})
```

### 3. 法术施放事件

```javascript
// ISSEvents.spellOnCast - 在法术施放时触发
ISSEvents.spellOnCast(event => {
    console.log(event.entity)
    console.log(event.spellId)
    console.log(event.schoolType)
    
    // event.originalSpellLevel - 原始法术等级
    console.log("Old Spell Level: " + event.originalSpellLevel)
    
    // setSpellLevel - 修改法术等级
    event.setSpellLevel(event.originalSpellLevel + 1)
    
    // event.spellLevel - 修改后的法术等级
    console.log("New Spell Level: " + event.spellLevel)
    
    // event.manaCost - 法力消耗
    console.log("Old Mana Cost: " + event.manaCost)
    
    // setManaCost - 修改法力消耗
    event.setManaCost(event.manaCost + 1)
    console.log("New Mana Cost: " + event.manaCost)
})
```

### 4. 法术施放后事件

```javascript
// ISSEvents.spellPostCast - 在法术施放完成后触发
ISSEvents.spellPostCast(event => {
    console.log(event.entity)
    console.log(event.spell)        // 法术对象
    console.log(event.spellLevel)
    console.log(event.level)        // 世界/维度对象
    console.log(event.magicData)
})
```

### 5. 法术选择事件

```javascript
// ISSEvents.spellSelection - 当法术选择轮盘变化时触发
ISSEvents.spellSelection(event => {
    console.log(event.entity)       // 玩家实体
    console.log(event.manager)      // 法术管理器
})
```

---

## 炼金术士大锅配方

**文件位置**: `server_scripts`

> **重要变化**：1.21.1 版本改用 KubeJS 原生配方系统，不再使用 `AlchemistCauldronRecipeBuilder`

### 1. 酿造配方 (brew)

将物品和流体在大锅中转化为其他流体。

```javascript
ServerEvents.recipes(event => {
    let brew = event.recipes.irons_spellbooks.alchemist_cauldron_brew
    
    // 参数说明：
    // 1. results - 产出的流体列表（在大锅中生成）
    // 2. input - 消耗的物品（玩家手持）
    // 3. base_fluid - 大锅中需要消耗的流体
    // 4. byproduct - 副产物（可选，返还给玩家）
    
    // 示例：消耗白色陶瓦和 1000mB 水，产出 500mB 牛奶
    // "0.5B" = 500mB, "1B" = 1000mB
    brew(["0.5B x minecraft:milk"], "minecraft:white_terracotta", "1B x minecraft:water")
    
    // 带副产物版本：
    // brew(["0.5B x minecraft:milk"], "minecraft:white_terracotta", "1B x minecraft:water", "minecraft:terracotta")
})
```

### 2. 清空配方 (empty)

将大锅中的流体转化为物品。

```javascript
ServerEvents.recipes(event => {
    let empty = event.recipes.irons_spellbooks.alchemist_cauldron_empty
    
    // 参数说明：
    // 1. result - 产出的物品（返还给玩家）
    // 2. input - 消耗的物品（玩家手持）
    // 3. fluid - 大锅中需要消耗的流体
    // 4. sound - 播放的音效（可选）
    
    // 示例：消耗泥土和 250mB 牛奶，产出白色混凝土
    empty("minecraft:white_concrete", "minecraft:dirt", "250x minecraft:milk")
    
    // 带自定义音效版本：
    // empty("minecraft:white_concrete", "minecraft:dirt", "250x minecraft:milk", "irons_spellbooks:cast.generic.lightning")
})
```

### 3. 填充配方 (fill)

将玩家手持的流体容器倒入大锅。

```javascript
ServerEvents.recipes(event => {
    let fill = event.recipes.irons_spellbooks.alchemist_cauldron_fill
    
    // 参数说明：
    // 1. result - 返还的空容器（返还给玩家）
    // 2. input - 消耗的流体容器（玩家手持）
    // 3. fluid - 倒入大锅的流体
    // 4. mustFitAll - 是否必须完全容纳（可选，默认 true）
    // 5. sound - 播放的音效（可选）
    
    // 示例：消耗牛奶桶，向大锅倒入 1000mB 牛奶，返还空桶
    fill("1000x minecraft:milk", "minecraft:milk_bucket", "minecraft:bucket")
    
    // mustFitAll 设为 false 表示即使不能完全容纳也会倒入部分
    // fill("1000x minecraft:milk", "minecraft:milk_bucket", "minecraft:bucket", false)
})
```

---

## 创建自定义属性

**文件位置**: `startup_scripts`

属性必须在学派注册之前创建，因为学派需要引用这些属性。

```javascript
StartupEvents.registry("attribute", event => {
    // 创建法术强度属性
    // "spell" 类型表示这是一个法术相关属性
    event.create("test_spell_power", "spell")
        // .range(显示值, 最小值, 最大值)
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
```

---

## 创建自定义法术学派

**文件位置**: `startup_scripts`

```javascript
StartupEvents.registry("irons_spellbooks:schools", event => {
    event.create("test")
        // 设置学派显示名称
        .setName(Component.of("Test"))
        
        // 添加施法焦点物品标签
        // 手持这些物品时增强该学派法术
        .addFocusItemTags("minecraft:planks")
        
        // 添加具体的施法焦点物品
        .addFocusItems(["minecraft:diamond_ore", "minecraft:apple"])
        
        // 设置默认焦点标签（通常不需要修改）
        .setDefaultFocusTag("some_mod_id:some_path")
        
        // 设置学派的法术强度属性
        .setPowerAttribute("kubejs:test_spell_power")
        
        // 设置学派的法术抗性属性
        .setResistanceAttribute("kubejs:test_spell_resistance")
        
        // 设置默认施法音效
        .setDefaultCastSound('minecraft:entity.chicken.death')
        
        // 设置伤害类型
        .setDamageType("irons_spellbooks:ender_magic")
        
        // 禁止从战利品中获取该学派的法术
        .disableLooting()
        
        // 需要学习才能使用该学派的法术
        .requiresLearning()
})
```

---

## 创建自定义法术

**文件位置**: `startup_scripts`

```javascript
StartupEvents.registry('irons_spellbooks:spells', event => {
    
    // 瞬发类型法术
    event.create('kubejs:test_with_ctx')
        .setCastTime(20)                    // 施法时间（ticks）
        .setCooldownSeconds(5)              // 冷却时间（秒）
        .setBaseManaCost(1)                 // 基础法力消耗
        .setManaCostPerLevel(1)             // 每级额外法力消耗
        .setCastType('instant')             // 施法类型
        .setSchool('kubejs:test')           // 所属学派
        .canBeCraftedBy(player => true)     // 可制作条件
        .onCast(ctx => {
            // ctx 上下文对象包含：
            // - ctx.level: 世界对象
            // - ctx.spellLevel: 法术等级
            // - ctx.entity: 施法者实体
            // - ctx.castSource: 施法来源
            // - ctx.playerMagicData: 玩家魔法数据
            
            ctx.entity.heal(1)  // 恢复1点生命值
        })

    // 持续施法类型
    event.create('kubejs:test_with_ctx_2')
        .setCastTime(10)
        .setCooldownSeconds(8)
        .setBaseManaCost(1)
        .setManaCostPerLevel(15)
        .setCastType('continuous')          // 持续施法
        .setSchool("irons_spellbooks:fire")
        .onCast(ctx => {
            ctx.entity.heal(3)
        })
})
```

---

## 创建法术书和装备

**文件位置**: `startup_scripts`

### 1. 基础法术书

```javascript
StartupEvents.registry("item", event => {
    event.create("test_spellbook", "spellbook")
        .setMaxSpellSlots(3)
        .rarity("UNCOMMON")
})
```

### 2. 带属性的法术书

```javascript
event.create("test_attribute_spellbook", "spellbook")
    .setMaxSpellSlots(8)
    // 添加属性：属性ID, 数值, 运算类型
    // 运算类型："add_value", "add_multiplied_base", "add_multiplied_total"
    .addAttribute("kubejs:test_spell_power", 2.0, "add_multiplied_total")
    .addAttribute("kubejs:test_spell_resistance", 5.0, "add_value")
    .rarity("RARE")
```

### 3. 独特法术书（带默认法术）

```javascript
event.create("test_unique_spellbook", "spellbook")
    .setMaxSpellSlots(4)
    .addAttribute("kubejs:test_spell_power", 4.0, "add_multiplied_total")
    .addAttribute("kubejs:test_spell_resistance", 2.0, "add_value")
    .addSpell("irons_spellbooks:firebolt", 1)  // 添加默认法术
    .rarity("EPIC")
```

### 4. 亲和法术书

```javascript
event.create("test_affinity_spellbook", "spellbook")
    .setMaxSpellSlots(3)
    .addAttribute("kubejs:test_spell_power", 2.0, "add_multiplied_total")
    .addAttribute("kubejs:test_spell_resistance", 5.0, "add_value")
    .addSpell("irons_spellbooks:firebolt", 3)
    .setAffinitySpell("irons_spellbooks:raise_dead")  // 设置亲和法术
    .rarity("EPIC")
```

### 5. 自定义法杖

```javascript
event.create("test_staff", "staff")
    .setEnchantmentValue(30)
    .setTier(tier => {
        // 可用的基础等级：
        // GRAYBEARD, ARTIFICER, ICE_STAFF, LIGHTNING_ROD, BLOOD_STAFF
        tier.useBaseTier("ICE_STAFF", true)
            .addAttribute("kubejs:test_spell_power", 2.0, "add_multiplied_total")
            .addAttribute("kubejs:test_spell_resistance", 5.0, "add_value")
            .setSpeed(-2)
            .setDamage(42)
    })
```

### 6. 自定义魔法剑

```javascript
event.create("test_magic_sword", "magic_sword")
    .addSpell("irons_spellbooks:firebolt", 1)
    .addSpell("irons_spellbooks:raise_dead", 2)
    .setTier(tier => {
        // 可用的基础等级：
        // HELLRAZOR, LEGIONNAIRE_FLAMBERGE, DECREPIT_FLAMBERGE,
        // DECREPIT_SCYTHE, DREADSWORD, MISERY,
        // METAL_MAGEHUNTER, CRYSTAL_MAGEHUNTER, SPELLBREAKER, TRUTHSEEKER,
        // CLAYMORE, AMETHYST_RAPIER
        tier.useBaseTier("CRYSTAL_MAGEHUNTER", true)
            .addAttribute("kubejs:test_spell_power", 2.0, "add_multiplied_total")
            .setUses(666)                    // 耐久度
            .setDamage(12)                   // 伤害
            .setSpeed(-3)                    // 攻击速度
            .setEnchantmentValue(6)
            .setIncorrectBlocksForDrops("minecraft:incorrect_for_gold_tool")
            .setRepairIngredient(() => Ingredient.of("minecraft:gold_ingot"))
    })
    .food(builder => {                      // 可以吃的剑！
        builder.nutrition(4)
            .saturation(0.4)
            .alwaysEdible()
            .eatSeconds(3)
            .usingConvertsTo("minecraft:bucket")
            .effect("minecraft:invisibility", 100, 0, 0.5)
            .eaten(ctx => ctx.entity.tell("Did you just eat a sword, fam?"))
    })
    .maxStackSize(1)
    .maxDamage(500)
    .rarity("epic")
    .fireResistant()
```

---

## 实用技巧与最佳实践

### 1. 法术工具类

```javascript
// 在 postInit 中使用 Spell 工具类
StartupEvents.postInit(event => {
    // Spell.of - 获取法术对象（无效ID返回 null）
    console.log("Invalid Spell: " + Spell.of("asdasdasd"))
    console.log("Valid Spell: " + Spell.of("irons_spellbooks:raise_dead"))
    
    // Spell.ofHolder - 以 Holder 形式获取法术
    console.log("As Holder Spell: " + Spell.ofHolder("irons_spellbooks:raise_dead"))
    
    // Spell.exists - 检查法术是否存在
    console.log("Exists Spell: " + Spell.exists("irons_spellbooks:raise_dead"))
    
    // Spell.isSpell - 检查对象是否为法术
    console.log("Is Spell: " + Spell.isSpell(Spell.of("irons_spellbooks:raise_dead")))
})
```

### 2. 属性运算类型对比

| 运算类型 | 说明 | 计算公式 | 适用场景 |
|----------|------|----------|----------|
| `add_value` | 加法 | 最终值 = 基础值 + 属性值 | 固定数值加成 |
| `add_multiplied_base` | 基础乘法 | 最终值 = 基础值 × (1 + 属性值) | 基于基础值的百分比 |
| `add_multiplied_total` | 总乘法 | 最终值 = 当前值 × (1 + 属性值) | 基于总值的百分比 |

### 3. 施法类型说明

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `instant` | 瞬间施放 | 治疗、瞬移等即时效果 |
| `continuous` | 按住持续施法 | 持续伤害、持续治疗 |
| `long` | 长施法（需持续按住） | 强力法术，需要准备时间 |

---

## 常见问题排查

### 问题1: 法术/物品没有显示

**排查步骤**：
1. 确认文件放在正确的文件夹（`startup_scripts`）
2. 检查游戏日志（logs/latest.log）
3. 使用 `/kubejs export` 导出调试信息

### 问题2: 炼金术士大锅配方不生效

**注意**：1.21.1 版本配方必须放在 `server_scripts` 中，使用 `ServerEvents.recipes`

### 问题3: 属性不生效

**检查**：
- 属性是否已注册（在学派之前）
- 属性是否附加到玩家（`.attachToPlayers()`）
- 运算类型是否正确

### 问题4: 法杖/武器没有伤害

**注意**：1.21.1 版本必须使用 `setTier` 设置基础模板，直接设置数值无效。

---

## 参考资源

- [KubeJS 官方 Wiki](https://kubejs.com/)
- [Iron's Spellbooks CurseForge](https://www.curseforge.com/minecraft/mc-mods/irons-spellbooks)
- [Minecraft 属性系统文档](https://minecraft.wiki/w/Attribute)

---

*本文档基于 Iron's Spellbooks 1.21.1 版本 KubeJS 扩展示例生成*
