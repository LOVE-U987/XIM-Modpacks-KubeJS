# EntityJS 完整开发文档 📚

> **EntityJS** 是一个强大的 KubeJS 扩展模组，为 Minecraft 提供全面的自定义实体创建、动画和配置功能。
>
> 本文档是 EntityJS Wiki 的核心指南，包含所有功能的详细说明、API 参考和实用示例。

---

## 📑 目录

1. [简介与特性](#简介与特性)
2. [快速开始](#快速开始)
3. [核心功能模块](#核心功能模块)
   - [实体注册](#实体注册)
   - [属性系统](#属性系统)
   - [AI 行为](#AI-行为)
   - [动画系统](#动画系统)
   - [生成控制](#生成控制)
4. [API 参考](#API-参考)
5. [实用示例](#实用示例)
6. [常见问题](#常见问题)
7. [相关链接](#相关链接)

---

## 简介与特性

### 🔧 核心特性

| 特性 | 描述 |
|------|------|
| **动态实体注册** | 使用 JavaScript 轻松注册自定义实体并定义其属性 |
| **行为定义** | 精细控制实体行为的自定义方式 |
| **Geckolib 风格动画** | 使用 LioLib（Geckolib 4 分支）实现流畅逼真的动画 |
| **实体修改** | 通过 `EntityJSEvents.modifyEntity` 事件直接修改实体 |
| **生成控制** | 精确控制实体的生成条件、速率和位置 |
| **属性修改** | 微调关键属性以平衡游戏中的实体 |
| **完整 AI 支持** | 访问广泛的 AI 行为和功能，支持修改/添加/控制现有实体 AI |

### 🎯 适用场景

- 创建全新的自定义生物（动物、怪物、NPC）
- 修改原版实体的行为和属性
- 添加复杂的 AI 行为模式
- 实现流畅的实体动画
- 控制实体在世界的生成规则

---

## 快速开始

### 安装要求

```bash
# 前置模组
- KubeJS（必需）
- EntityJS（本模组）
- LioLib（用于动画，可选但推荐）
```

### 基础脚本结构

```javascript
// startup_scripts/entity_registry.js
StartupEvents.registry('entity_type', event => {
    event.create('custom_entity', 'entityjs:animal')
        .sized(1.0, 1.5)
        .mobCategory('creature')
})
```

---

## 核心功能模块

### 实体注册

#### 基础实体类型

```javascript
StartupEvents.registry('entity_type', event => {
    // 动物类型
    event.create('custom_cow', 'entityjs:animal')
        .sized(1.0, 1.5)
        .mobCategory('creature')
        .isFood(['minecraft:wheat'])
    
    // 可驯服类型
    event.create('pet_dragon', 'entityjs:tamable')
        .sized(1.5, 1.0)
        .tamableFood(['minecraft:golden_apple'])
        .fireImmune(true)
    
    // 敌对生物类型
    event.create('dark_knight', 'entityjs:mob')
        .sized(0.8, 2.0)
        .mobCategory('monster')
})
```

#### 可用实体类型

| 类型 | 说明 |
|------|------|
| `entityjs:animal` | 动物，可被驯服和繁殖 |
| `entityjs:tamable` | 可驯服生物 |
| `entityjs:mob` | 基础敌对生物 |
| `entityjs:creature` | 友好生物 |
| `entityjs:water_animal` | 水生生物 |

---

### 属性系统

#### 创建属性（Startup 脚本）

```javascript
// 为新实体创建属性
EntityJSEvents.createAttributes(event => {
    event.create("kubejs:wyrm", attribute => {
        attribute.add("minecraft:generic.max_health", 40)
        attribute.add("minecraft:generic.attack_damage", 8)
        attribute.add("minecraft:generic.movement_speed", 0.25)
        attribute.add("minecraft:generic.armor", 4)
    })
})
```

#### 修改现有实体属性

```javascript
// server_scripts/attribute_modification.js
EntityJSEvents.attributes(event => {
    // 增强僵尸
    event.modify('minecraft:zombie', attribute => {
        attribute.add('minecraft:generic.max_health', 40)
        attribute.add('minecraft:generic.attack_damage', 5)
        attribute.add('minecraft:generic.movement_speed', 0.28)
    })
    
    // 增强骷髅射程
    event.modify('minecraft:skeleton', attribute => {
        attribute.add('minecraft:generic.follow_range', 48)
    })
})
```

#### 常用属性列表

| 属性 | 说明 | 默认值参考 |
|------|------|-----------|
| `minecraft:generic.max_health` | 最大生命值 | 20 |
| `minecraft:generic.attack_damage` | 攻击伤害 | 2-8 |
| `minecraft:generic.movement_speed` | 移动速度 | 0.23-0.35 |
| `minecraft:generic.armor` | 护甲值 | 0-20 |
| `minecraft:generic.follow_range` | 追踪范围 | 16-48 |
| `minecraft:generic.knockback_resistance` | 击退抗性 | 0-1 |

---

### AI 行为

#### 添加目标选择器（Goal Selectors）

```javascript
// server_scripts/ai_goals.js
EntityJSEvents.addGoalSelectors('kubejs:custom_mob', event => {
    // 恐慌行为（受到伤害时逃跑）
    event.panic(1, 1.5)
    
    // 近战攻击
    event.meleeAttack(2, 1.0, true)
    
    // 游泳
    event.floatSwim(1)
    
    // 跳跃攻击
    event.leapAtTarget(3, 0.4)
    
    // 随机游荡
    event.waterAvoidingRandomStroll(3, 1.0)
    
    // 看向玩家
    event.lookAtPlayer(4, 8.0)
    
    // 随机环顾
    event.randomLookAround(5)
})
```

#### 添加目标（Targeting）

```javascript
EntityJSEvents.addGoals('kubejs:custom_mob', event => {
    // 攻击最近的玩家
    event.nearestAttackableTarget(1, 'minecraft:player', 10, true, false)
    
    // 被攻击时反击
    event.hurtByTarget(2, [], false, [])
    
    // 攻击特定实体类型
    let Cow = Java.loadClass('net.minecraft.world.entity.animal.Cow')
    event.nearestAttackableTarget(2, Cow, 5, false, false)
})
```

#### 自定义 AI 目标

```javascript
EntityJSEvents.addGoalSelectors('kubejs:smart_mob', event => {
    event.customGoal(
        'follow_owner',
        1,                                          // 优先级
        mob => mob.isTame(),                       // 启用条件
        mob => true,                               // 继续条件
        true,                                       // 是否需要目标
        mob => {},                                 // 开始执行
        mob => mob.getNavigation().stop(),        // 停止执行
        true,                                       // 是否持续执行
        mob => {                                   // 每 tick 执行
            let owner = mob.getOwner()
            if (owner && mob.distanceToEntity(owner) > 5) {
                mob.getNavigation().moveTo(owner.x, owner.y, owner.z, 1.2)
            }
        }
    )
})
```

#### 移除 AI 目标

```javascript
EntityJSEvents.addGoalSelectors('kubejs:wyrm', event => {
    // 通过类移除
    let $PanicGoal = Java.loadClass("net.minecraft.world.entity.ai.goal.PanicGoal")
    event.removeGoal($PanicGoal)
    
    // 通过条件移除
    event.removeGoals(context => {
        const { goal, entity } = context
        return goal.getClass() == $PanicGoal
    })
})
```

---

### 动画系统

#### 基础动画控制器

```javascript
StartupEvents.registry('entity_type', event => {
    let builder = event.create('wyrm', 'entityjs:animal')
    
    builder.addAnimationController('main_controller', 1, event => {
        if (event.entity.hurtTime > 0) {
            event.thenPlayAndHold('hurt')
        } else if (event.entity.isMoving()) {
            event.thenLoop('walk')
        } else {
            event.thenLoop('idle')
        }
        return true
    })
})
```

#### 可触发动画

```javascript
StartupEvents.registry('entity_type', event => {
    let builder = event.create('wyrm', 'entityjs:animal')
    
    builder.addAnimationController('action_controller', 5, event => {
        // 注册可触发动画
        event.addTriggerableAnimation('attack', 'attack_animation', 'play_once')
        
        if (event.entity.isMoving()) {
            event.thenPlay("walk")
        } else {
            event.thenLoop("idle")
        }
        return true
    })
    
    // 在跳跃时触发动画
    builder.onLivingJump(entity => {
        entity.triggerAnimation('action_controller', 'attack_animation')
    })
})
```

#### 简化版可触发动画

```javascript
StartupEvents.registry('entity_type', event => {
    event.create('wyrm', 'entityjs:animal')
        .addTriggerableAnimationController(
            'simple_controller',    // 控制器名称
            5,                      // 过渡时间
            'spawn',               // 动画名称
            'spawning',            // 触发器名称
            'play_once'            // 循环类型
        )
})
```

#### 外部事件触发动画

```javascript
// server_scripts/animation_triggers.js
EntityEvents.hurt('kubejs:wyrm', event => {
    event.entity.triggerAnimation('action_controller', 'attack_animation')
})
```

---

### 生成控制

#### 生物群系生成（Biome Spawns）

```javascript
// server_scripts/spawn_control.js
EntityJSEvents.biomeSpawns(event => {
    // 添加生成
    event.addSpawn('kubejs:wyrm', ['#minecraft:is_overworld'], 20, 3, 5)
    // 参数: 实体ID, 生物群系标签, 权重, 最小数量, 最大数量
    
    // 移除生成
    event.removeSpawn('minecraft:zombie', ['#minecraft:is_overworld'])
})
```

#### 精确生成条件（Spawn Placement）

```javascript
// startup_scripts/spawn_placement.js
EntityJSEvents.spawnPlacement(event => {
    // "与" 条件：仅在 Y > 44 时允许溺尸生成
    event.and('minecraft:drowned', (entitypredicate, levelaccessor, spawntype, blockpos, randomsource) => {
        return blockpos.y > 44
    })
    
    // "或" 条件：允许末影人在末地之外生成
    event.or('minecraft:enderman', (entitypredicate, levelaccessor, spawntype, blockpos, randomsource) => {
        return levelaccessor.level.dimension != 'minecraft:the_end'
    })
    
    // 替换生成规则：允许烈焰人在主世界生成
    event.replace('minecraft:blaze', 'no_restrictions', 'world_surface', (entitypredicate, levelaccessor, spawntype, blockpos, randomsource) => {
        return levelaccessor.level.dimension == 'minecraft:overworld'
    })
})
```

---

## API 参考

### 实体构建器方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `.sized(width, height)` | 数值 | 设置实体碰撞箱大小 |
| `.mobCategory(category)` | 字符串 | 设置生物类别 |
| `.fireImmune(boolean)` | 布尔值 | 设置火焰免疫 |
| `.canFly(boolean)` | 布尔值 | 设置可飞行 |
| `.isFood(items)` | 数组 | 设置可食用物品 |
| `.tamableFood(items)` | 数组 | 设置驯服食物 |
| `.setDeathSound(sound)` | 字符串 | 设置死亡音效 |

### AI 目标方法

| 方法 | 参数 | 说明 |
|------|------|------|
| `.panic(priority, speed)` | 数值 | 恐慌逃跑 |
| `.meleeAttack(priority, speed, follow)` | 数值,布尔 | 近战攻击 |
| `.floatSwim(priority)` | 数值 | 游泳漂浮 |
| `.leapAtTarget(priority, height)` | 数值 | 跳跃攻击 |
| `.waterAvoidingRandomStroll(priority, speed)` | 数值 | 避水游荡 |
| `.lookAtPlayer(priority, distance)` | 数值 | 看向玩家 |
| `.randomLookAround(priority)` | 数值 | 随机环顾 |
| `.nearestAttackableTarget(priority, type, distance)` | 数值 | 最近可攻击目标 |
| `.hurtByTarget(priority, allies, retaliate)` | 数值,数组,布尔 | 被攻击反击 |

---

## 实用示例

### 完整实体示例：自定义龙

```javascript
// startup_scripts/dragon_entity.js
StartupEvents.registry('entity_type', event => {
    event.create('custom_dragon', 'entityjs:tamable')
        .sized(2.0, 1.5)
        .mobCategory('creature')
        .tamableFood(['minecraft:golden_apple', 'minecraft:enchanted_golden_apple'])
        .fireImmune(true)
        .canFly(true)
        .setDeathSound('minecraft:entity.ender_dragon.death')
        .addAnimationController('dragon_controller', 5, event => {
            if (event.entity.isFlying()) {
                event.thenLoop('fly')
            } else if (event.entity.isMoving()) {
                event.thenLoop('walk')
            } else {
                event.thenLoop('idle')
            }
            return true
        })
})

// 属性设置
EntityJSEvents.createAttributes(event => {
    event.create('kubejs:custom_dragon', attribute => {
        attribute.add('minecraft:generic.max_health', 100)
        attribute.add('minecraft:generic.attack_damage', 12)
        attribute.add('minecraft:generic.movement_speed', 0.3)
        attribute.add('minecraft:generic.armor', 8)
        attribute.add('minecraft:generic.flying_speed', 0.4)
    })
})

// AI 行为
EntityJSEvents.addGoalSelectors('kubejs:custom_dragon', event => {
    event.panic(1, 1.5)
    event.meleeAttack(2, 1.2, true)
    event.waterAvoidingRandomStroll(3, 1.0)
    event.lookAtPlayer(4, 10.0)
    event.randomLookAround(5)
})

EntityJSEvents.addGoals('kubejs:custom_dragon', event => {
    event.nearestAttackableTarget(1, 'minecraft:player', 16, true, false)
    event.hurtByTarget(2, [], false, [])
})

// 生成控制
EntityJSEvents.biomeSpawns(event => {
    event.addSpawn('kubejs:custom_dragon', ['#minecraft:is_mountain'], 5, 1, 2)
})
```

---

## 常见问题

### Q: 实体动画不播放怎么办？
**A:** 确保：
1. 动画文件路径正确（`assets/kubejs/animations/entity/xxx.animation.json`）
2. 动画名称与控制器中引用的名称一致
3. 控制器返回 `true` 表示成功处理

### Q: AI 目标不生效？
**A:** 检查：
1. 优先级设置是否合理（数字越小优先级越高）
2. 目标选择器和目标事件的区别
3. 实体类型字符串是否正确（使用 `kubejs:xxx` 格式）

### Q: 属性修改不生效？
**A:** 注意：
1. `createAttributes` 用于新实体（Startup 脚本）
2. `attributes` 用于修改现有实体（Server 脚本）
3. 某些属性可能需要重新进入世界才能生效

### Q: 生成控制不工作？
**A:** 确保：
1. `biomeSpawns` 需要完全重启世界
2. `spawnPlacement` 是 Startup 脚本
3. 生物群系标签正确（使用 `#minecraft:xxx` 格式）

---

## 相关链接

- **KubeJS 官方文档**: https://kubejs.com/
- **KubeJS Discord**: https://discord.gg/lat
- **EntityJS GitHub**: https://github.com/liopyu/EntityJS
- **Geckolib 文档**: https://geckolib.com/

---

## 文档信息

- **文档版本**: 1.0
- **最后更新**: 2024
- **适用 EntityJS 版本**: 1.20.1+
- **Wiki 文件列表**:
  - `Home.md` - 首页介绍
  - `Attribute-Creation.md` - 属性创建
  - `Attribute-Modification.md` - 属性修改
  - `AI-Creation.md` - AI 行为
  - `Entity-Animations.md` - 动画系统
  - `Spawn-Control.md` - 生成控制
  - `Examples.md` - 示例集合
  - `Base-Entity-Registry.md` - 基础实体注册
  - `Default-Minecraft-Entity-Builders.md` - 默认实体构建器
  - `Entity-Modification-Event.md` - 实体修改事件
  - `Clone-Entity-Registry-Event.md` - 克隆实体注册
  - `Projectile-Builders.md` - 弹射物构建器
  - `Addon-Compatibilities.md` - 模组兼容性

---

> 💡 **提示**: 本文档是 EntityJS Wiki 的核心索引文档。如需了解特定功能的详细信息，请查阅对应的 Wiki 页面。
