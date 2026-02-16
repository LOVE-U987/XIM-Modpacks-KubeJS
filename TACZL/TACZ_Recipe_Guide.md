# TaCZ（永恒枪械工坊：零）配方指南

本文档记录了 TaCZ 模组在 KubeJS 中的配方类型和使用方法。

---

## 配方类型

### 1. `tacz:gun_smith_table_crafting`

**用途**：枪械锻造台配方

**适用场景**：
- 制作枪械
- 制作配件
- 制作特殊物品

**JSON 格式**：
```json
{
  "type": "tacz:gun_smith_table_crafting",
  "materials": [
    {
      "item": {
        "tag": "forge:ingots/copper"
      },
      "count": 1
    },
    {
      "item": {
        "item": "minecraft:flint"
      },
      "count": 1
    }
  ],
  "result": {
    "type": "custom",
    "group": "tacz:ammo",
    "item": {
      "item": "minecraft:painting",
      "count": 1
    }
  }
}
```

**字段说明**：
- `type`：配方类型，固定为 `tacz:gun_smith_table_crafting`
- `materials`：材料列表
  - `item`：可以是 `tag`（矿物词典标签）或 `item`（具体物品ID）
  - `count`：数量
- `result`：结果物品
  - `type`：固定为 `"custom"`
  - `group`：分组，例如 `"tacz:ammo"`、`"tacz:misc"`
  - `item.item`：结果物品的ID
  - `item.count`：数量

---

## KubeJS 示例

### 文件位置
`server_scripts/recipes.js`

### 完整示例代码

```javascript
ServerEvents.recipes((event) => {
    // 步枪弹药配方
    event.custom({
        type: "tacz:gun_smith_table_crafting",
        materials: [
            // 使用矿物词典标签 - 接受任何铜锭
            { item: { tag: "forge:ingots/copper" }, count: 1 },
            // 使用具体物品ID - 只接受原版燧石
            { item: { item: "minecraft:flint" }, count: 1 },
            { item: { item: "minecraft:gunpowder" }, count: 1 },
            { item: { item: "superbwarfare:copper_plate" }, count: 3 }
        ],
        result: {
            type: "custom",
            group: "tacz:ammo",
            item: {
                item: "superbwarfare:rifle_ammo",
                count: 1
            }
        },
    })
})
```

---

## 矿物词典标签 vs 具体物品ID

### 矿物词典标签（推荐）

```javascript
{ item: { tag: "forge:ingots/copper" }, count: 1 }
```

**优点**：
- 兼容性好，接受所有模组的铜锭
- 适合整合包

**常用标签**：
| 标签 | 含义 |
|------|------|
| `forge:ingots/iron` | 所有铁锭 |
| `forge:ingots/gold` | 所有金锭 |
| `forge:ingots/copper` | 所有铜锭 |
| `forge:gems/diamond` | 所有钻石 |
| `forge:dusts/redstone` | 所有红石粉 |
| `forge:rods/wooden` | 所有木棍 |

### 具体物品ID

```javascript
{ item: { item: "minecraft:copper_ingot" }, count: 1 }
```

**优点**：
- 精确控制，只接受特定物品
- 适合需要特定模组物品的场景

---

## 查找配方类型的方法

### 方法1：查看模组 JAR 文件
1. 解压 TaCZ 的 `.jar` 文件
2. 查看 `data/tacz/recipes/` 目录
3. 找到 `misc/` 文件夹中的配方文件
4. 查看 `"type"` 字段

### 方法2：使用 KubeJS 命令
在游戏中运行：
```
/kubejs recipes
```
然后查看日志文件 `logs/kubejs/server.log`

### 方法3：查看源码
访问 TaCZ GitHub 仓库：
https://github.com/MCModderAnchor/TACZ

---

## 注意事项

1. **配方类型区分**：
   - `tacz:gun_smith_table_crafting` - 枪械锻造台内部配方
   - `minecraft:crafting_shaped` - 普通合成台配方（用于合成锻造台方块）

2. **结果格式**：
   - 必须使用 `"type": "custom"` 和 `"group"` 字段
   - `group` 可以是 `"tacz:ammo"`、`"tacz:misc"` 等

3. **材料格式**：
   - 支持 `tag`（矿物词典）和 `item`（具体ID）两种方式
   - 建议金属类材料使用矿物词典标签

---

## 参考文件

- 配方文件：`server_scripts/recipes.js`
- TaCZ 配方示例：`tacz recipes/misc/blood_strike_1.json`

---

*文档生成时间：2026-02-15*
