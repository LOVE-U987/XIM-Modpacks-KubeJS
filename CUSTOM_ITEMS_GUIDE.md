# KubeJS 自定义物品添加指南

## 简介

本指南将帮助您使用KubeJS脚本在Minecraft服务器中添加自定义物品。我们使用了符合KubeJS 6.0文档格式的脚本，同时兼容KubeJS 1.6.5版本。

## 文件结构

```
kubejs/
├── startup_scripts/
│   └── add_custom_items.js    # 核心物品添加脚本
├── server_scripts/
│   ├── example_kubejs6_format.js  # KubeJS 6.0格式示例
│   └── test_custom_items.js       # 测试脚本
└── CUSTOM_ITEMS_GUIDE.md      # 本指南
```

## 核心脚本说明

### `add_custom_items.js`

这是添加自定义物品的核心脚本，位于`startup_scripts`目录下。脚本会在服务器启动时执行，自动添加配置的物品。

## 如何添加自定义物品

### 1. 打开配置文件

编辑`startup_scripts/add_custom_items.js`文件，找到`ITEMS_TO_ADD`数组。

### 2. 添加物品配置

在`ITEMS_TO_ADD`数组中添加物品对象，每个对象代表一个自定义物品。

### 3. 配置选项详解

| 选项 | 类型 | 说明 | 必填 | 默认值 |
|------|------|------|------|--------|
| `id` | 字符串 | 物品唯一标识符，格式：`modid:item_name` | 是 | - |
| `name` | 字符串 | 物品显示名称 | 是 | - |
| `type` | 字符串 | 物品类型（`basic`、`sword`、`pickaxe`等） | 是 | - |
| `material` | 字符串 | 工具材料（`wood`、`stone`、`iron`、`diamond`等） | 否（仅工具需要） | `wood` |
| `attackDamage` | 数字 | 攻击伤害值 | 否 | 2 |
| `attackSpeed` | 数字 | 攻击速度 | 否 | -2.8 |
| `maxStackSize` | 数字 | 最大堆叠数量（仅基础物品） | 否 | 64 |
| `creativeTab` | 字符串 | 创造模式标签 | 否 | `minecraft:misc` |

### 4. 不同类型物品示例

#### 基础物品

```javascript
{
    id: "kubejs:custom_diamond",
    name: "自定义钻石",
    type: "basic",
    maxStackSize: 64,
    creativeTab: "minecraft:materials"
}
```

#### 剑

```javascript
{
    id: "kubejs:custom_sword",
    name: "自定义剑",
    type: "sword",
    material: "diamond",
    attackDamage: 8,
    attackSpeed: -2.4,
    creativeTab: "minecraft:combat"
}
```

#### 镐

```javascript
{
    id: "kubejs:custom_pickaxe",
    name: "自定义镐",
    type: "pickaxe",
    material: "iron",
    attackDamage: 6,
    attackSpeed: -2.8,
    creativeTab: "minecraft:tools"
}
```

#### 斧

```javascript
{
    id: "kubejs:custom_axe",
    name: "自定义斧",
    type: "axe",
    material: "diamond",
    attackDamage: 9,
    attackSpeed: -3.0,
    creativeTab: "minecraft:tools"
}
```

####  shovel（铲）

```javascript
{
    id: "kubejs:custom_shovel",
    name: "自定义铲",
    type: "shovel",
    material: "stone",
    attackDamage: 4,
    attackSpeed: -3.0,
    creativeTab: "minecraft:tools"
}
```

#### 锄头

```javascript
{
    id: "kubejs:custom_hoe",
    name: "自定义锄头",
    type: "hoe",
    material: "iron",
    attackDamage: 2,
    attackSpeed: -1.0,
    creativeTab: "minecraft:tools"
}
```

## 创造模式标签列表

常用的创造模式标签：

- `minecraft:building_blocks` - 建筑方块
- `minecraft:decorations` - 装饰物品
- `minecraft:redstone` - 红石物品
- `minecraft:transportation` - 交通物品
- `minecraft:misc` - 杂项
- `minecraft:food` - 食物
- `minecraft:tools` - 工具
- `minecraft:combat` - 战斗物品
- `minecraft:brewing` - 酿造物品
- `minecraft:materials` - 材料

## 扩展支持更多物品类型

如果您需要添加脚本中未支持的物品类型，可以按照以下步骤扩展：

1. 在`add_custom_items.js`文件中找到`switch`语句
2. 添加新的`case`分支
3. 实现该类型物品的创建逻辑

例如，添加弓的支持：

```javascript
case "bow":
    // 创建弓
    itemBuilder = event.create(itemConfig.id, "bow")
        .displayName(Text.item(itemConfig.name))
        .tier(itemConfig.material || "wood")
        // 添加弓特有的属性
        .durability(384);
    break;
```

## 测试自定义物品

### 使用测试脚本

我们提供了`test_custom_items.js`脚本，位于`server_scripts`目录下。当玩家加入服务器时，脚本会自动：

1. 给玩家发送使用说明
2. 发放测试物品（自定义钻石、剑、镐）
3. 提供使用指南

### 手动测试

1. 启动服务器
2. 使用创造模式，在物品栏中查找您添加的自定义物品
3. 测试物品的功能和属性

## 查看日志

服务器启动时，脚本会输出详细的日志信息：

- 初始化信息
- 每个物品的添加结果
- 最终的添加结果摘要

日志示例：

```
[KubeJS] 初始化自定义物品添加脚本...
[KubeJS] 配置信息: 计划添加 3 个物品
[KubeJS] 开始处理自定义物品添加...
[KubeJS] 成功添加物品: kubejs:custom_diamond - 自定义钻石
[KubeJS] 成功添加物品: kubejs:custom_sword - 自定义剑
[KubeJS] 成功添加物品: kubejs:custom_pickaxe - 自定义镐
[KubeJS] =======================================
[KubeJS] 自定义物品添加结果摘要:
[KubeJS] 成功添加: 3 项
[KubeJS] ✓ 物品: kubejs:custom_diamond (自定义钻石)
[KubeJS] ✓ 物品: kubejs:custom_sword (自定义剑)
[KubeJS] ✓ 物品: kubejs:custom_pickaxe (自定义镐)
[KubeJS] 添加失败: 0 项
[KubeJS] =======================================
```

## 常见问题

### 1. 物品没有添加成功

- 检查`id`格式是否正确（必须包含冒号）
- 检查`type`是否拼写正确
- 检查日志中的错误信息
- 确保脚本位于`startup_scripts`目录下

### 2. 物品没有显示在创造模式物品栏中

- 检查`creativeTab`配置是否正确
- 尝试使用`/give`命令手动获取物品

### 3. 工具属性不正确

- 检查`material`、`attackDamage`和`attackSpeed`配置
- 确保工具类型和材料匹配

## 高级功能

### 添加自定义纹理

要为自定义物品添加纹理，您需要：

1. 在`kubejs/assets/kubejs/textures/item/`目录下添加PNG纹理文件
2. 纹理文件名必须与物品ID的后半部分匹配（例如：`custom_diamond.png`）
3. 重启服务器

### 添加自定义物品效果

可以在`server_scripts`目录下创建脚本，监听物品使用事件，添加自定义效果：

```javascript
ItemEvents.rightClicked(event => {
    const item = event.item;
    const player = event.player;
    
    if (item.id === 'kubejs:custom_item') {
        // 添加自定义效果
        player.addEffect('minecraft:strength', 600, 2);
        // 消耗物品
        item.shrink(1);
    }
});
```

## 注意事项

1. 确保物品ID的唯一性，避免与现有物品冲突
2. 工具材料会影响工具的耐久度和挖掘速度
3. 攻击伤害和攻速需要平衡，避免破坏游戏平衡性
4. 每次修改配置后需要重启服务器
5. 建议先在测试服务器上测试，再部署到正式服务器

## 示例配置

完整的示例配置可以参考`add_custom_items.js`文件中的`ITEMS_TO_ADD`数组。

## 总结

使用本指南，您可以轻松地在Minecraft服务器中添加各种类型的自定义物品。脚本采用了模块化设计，便于扩展和维护。如果您有任何问题，可以查看服务器日志或参考KubeJS官方文档。

祝您游戏愉快！
