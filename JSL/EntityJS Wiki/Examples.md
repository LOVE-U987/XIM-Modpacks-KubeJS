# EntityJS 示例集 📚

> 本页面收集了各种 EntityJS 使用示例，帮助您快速上手并理解如何使用 EntityJS 创建和修改实体。

---

## 目录 📑

1. [基础实体创建](#基础实体创建)
2. [AI 行为定制](#AI-行为定制)
3. [属性修改](#属性修改)
4. [动画设置](#动画设置)
5. [完整实体示例](#完整实体示例)

---

## 基础实体创建

### 简单的动物实体

```javascript
StartupEvents.registry('entity_type', event => {
    event.create('custom_cow', 'entityjs:animal')
        .sized(1.0, 1.5)
        .mobCategory('creature')
        .isFood(['minecraft:wheat'])
        .setBreedOffspring(context => 'minecraft:cow')
})
```

### 可驯服生物

```javascript
StartupEvents.registry('entity_type', event => {
    event.create('pet_dragon', 'entityjs:tamable')
        .sized(1.5, 1.0)
        .mobCategory('creature')
        .tamableFood(['minecraft:golden_apple'])
        .fireImmune(true)
        .canFly(true)
})
```

### 敌对生物

```javascript
StartupEvents.registry('entity_type', event => {
    event.create('dark_knight', 'entityjs:mob')
        .sized(0.8, 2.0)
        .mobCategory('monster')
        .setDeathSound('minecraft:entity.wither.death')
        .fireImmune(false)
})
```

---

## AI 行为定制

### 添加基础 AI 目标

```javascript
EntityJSEvents.addGoalSelectors('kubejs:custom_mob', event => {
    // 恐慌行为（受到伤害时逃跑）
    event.panic(1, 1.5)
    
    // 近战攻击
    event.meleeAttack(2, 1.0, true)
    
    // 随机游荡
    event.waterAvoidingRandomStroll(3, 1.0)
    
    // 看向玩家
    event.lookAtPlayer(4, 8.0)
    
    // 随机环顾
    event.randomLookAround(5)
})
```

### 添加目标选择器

```javascript
EntityJSEvents.addGoals('kubejs:custom_mob', event => {
    // 攻击最近的玩家
    event.nearestAttackableTarget(1, 'minecraft:player', 10, true, false)
    
    // 被攻击时反击
    event.hurtByTarget(2, [], false, [])
})
```

### 自定义 AI 行为

```javascript
EntityJSEvents.addGoalSelectors('kubejs:smart_mob', event => {
    event.customGoal(
        'follow_owner',
        1,
        mob => mob.isTame(), // 只能驯服的生物使用
        mob => true,
        true,
        mob => {},
        mob => mob.getNavigation().stop(),
        true,
        mob => {
            let owner = mob.getOwner()
            if (owner && mob.distanceToEntity(owner) > 5) {
                mob.getNavigation().moveTo(owner.x, owner.y, owner.z, 1.2)
            }
        }
    )
})
```

---

## 属性修改

### 修改原版实体属性

```javascript
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

### 创建新属性

```javascript
EntityJSEvents.createAttributes(event => {
