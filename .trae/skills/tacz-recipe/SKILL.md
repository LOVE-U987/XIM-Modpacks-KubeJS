---
name: "tacz-recipe"
description: "Converts JSON recipe data to KubeJS TaCZ recipe code. Invoke when user provides a JSON file with recipe data and asks to convert it to KubeJS format. Supports both single recipe and batch processing."
---

# TaCZ Recipe Converter

This skill converts simplified JSON recipe format into proper KubeJS TaCZ recipe code. Supports both single recipe and batch processing.

## Input Format

### Single Recipe Format

```json
{
    "输出物品": "modid:item_name",
    "输出数量": 1,
    "输入物品": [
        {
            "tag": "forge:ingots/copper",
            "count": 5
        },
        {
            "item": "modid:item_name",
            "count": 1
        }
    ],
    "配方类型": "tacz:gun_smith_table_crafting"
}
```

### Batch Processing Format

```json
[
    [{
        "输出物品": "modid:item_name_1",
        "输出数量": 6,
        "输入物品": [...],
        "配方类型": "tacz:gun_smith_table_crafting"
    }],
    [{
        "输出物品": "modid:item_name_2",
        "输出数量": 1,
        "输入物品": [...],
        "配方类型": "tacz:gun_smith_table_crafting"
    }]
]
```

**Note**: Batch format uses nested arrays. Each recipe is wrapped in an array, and all recipes are in the outer array.

### Field Mapping

| JSON Field | Meaning | KubeJS Field |
|------------|---------|--------------|
| `输出物品` | Result item ID | `result.item.item` |
| `输出数量` | Result count | `result.item.count` |
| `输入物品` | Materials array | `materials` |
| `配方类型` | Recipe type | `type` |

### Material Format

Each material in `输入物品` can have:
- `"tag": "forge:xxx"` - Use Forge ore dictionary tag
- `"item": "modid:xxx"` - Use specific item ID
- `"count": number` - Quantity required

## Output Format

Generate KubeJS code following this structure:

```javascript
// 配方名称（从输出物品推断）
event.custom({
  type: "tacz:gun_smith_table_crafting",
  materials: [
    { item: { tag: "forge:ingots/copper" }, count: 5 },    // 材料注释
    { item: { item: "modid:item_name" }, count: 1 }       // 材料注释
  ],
  result: {
    type: "custom",
    group: "tacz:ammo",
    item: {
      item: "modid:result_item",
      count: 1
    }
  }
});
```

## Processing Steps

### For Single Recipe

1. **Read the JSON file** provided by user
2. **Extract all fields** from the JSON
3. **Convert materials**:
   - If `tag` field exists → use `{ item: { tag: "..." }, count: X }`
   - If `item` field exists → use `{ item: { item: "..." }, count: X }`
4. **Generate comments** for each material (use Chinese names if identifiable)
5. **Build the KubeJS code** with proper indentation and formatting
6. **Append to recipes.js** or provide as insertable code block

### For Batch Processing

1. **Read the JSON file** (it will be an array of arrays)
2. **Iterate through each recipe array** in the outer array
3. **For each inner array**, extract the first (and only) recipe object
4. **Process each recipe** using the single recipe steps above
5. **Combine all generated code** into one output
6. **Append all recipes to recipes.js** or provide as insertable code block

## Code Style Guidelines

- Use 2-space indentation
- Add Chinese comments for each material
- Add empty line before each recipe
- End each recipe with `});`
- Use `//` separator comments for recipe categories if applicable

## Example Conversions

### Single Recipe Example

**Input JSON:**
```json
{
    "输出物品": "superbwarfare:medium_anti_air_missile",
    "输出数量": 1,
    "输入物品": [
        {"tag": "forge:ingots/copper", "count": 5},
        {"item": "superbwarfare:missile_engine", "count": 1},
        {"item": "superbwarfare:seeker", "count": 1},
        {"item": "superbwarfare:high_energy_explosives", "count": 1}
    ],
    "配方类型": "tacz:gun_smith_table_crafting"
}
```

**Output KubeJS:**
```javascript
// 中型对空导弹
event.custom({
  type: "tacz:gun_smith_table_crafting",
  materials: [
    { item: { tag: "forge:ingots/copper" }, count: 5 },              // 铜锭
    { item: { item: "superbwarfare:missile_engine" }, count: 1 },   // 导弹发动机
    { item: { item: "superbwarfare:seeker" }, count: 1 },           // 导引头
    { item: { item: "superbwarfare:high_energy_explosives" }, count: 1 } // 高能量炸药
  ],
  result: {
    type: "custom",
    group: "tacz:ammo",
    item: {
      item: "superbwarfare:medium_anti_air_missile",
      count: 1
    }
  }
});
```

### Batch Processing Example

**Input JSON:**
```json
[
    [{
        "输出物品": "superbwarfare:grenade_40mm",
        "输出数量": 6,
        "输入物品": [
            {"item": "minecraft:iron_ingot", "count": 2},
            {"item": "superbwarfare:fusee", "count": 1},
            {"item": "superbwarfare:primer", "count": 1},
            {"item": "superbwarfare:high_energy_explosives", "count": 1}
        ],
        "配方类型": "tacz:gun_smith_table_crafting"
    }],
    [{
        "输出物品": "superbwarfare:medium_rocket_cmt",
        "输出数量": 1,
        "输入物品": [
            {"item": "superbwarfare:small_rocket", "count": 2},
            {"item": "superbwarfare:cm_head", "count": 1}
        ],
        "配方类型": "tacz:gun_smith_table_crafting"
    }]
]
```

**Output KubeJS:**
```javascript
// 40mm榴弹
event.custom({
  type: "tacz:gun_smith_table_crafting",
  materials: [
    { item: { item: "minecraft:iron_ingot" }, count: 2 },              // 铁锭
    { item: { item: "superbwarfare:fusee" }, count: 1 },               // 引信
    { item: { item: "superbwarfare:primer" }, count: 1 },              // 底火
    { item: { item: "superbwarfare:high_energy_explosives" }, count: 1 } // 高能量炸药
  ],
  result: {
    type: "custom",
    group: "tacz:ammo",
    item: {
      item: "superbwarfare:grenade_40mm",
      count: 6
    }
  }
});

// 中型火箭弹CMT
event.custom({
  type: "tacz:gun_smith_table_crafting",
  materials: [
    { item: { item: "superbwarfare:small_rocket" }, count: 2 },        // 小型火箭
    { item: { item: "superbwarfare:cm_head" }, count: 1 }              // CMT弹头
  ],
  result: {
    type: "custom",
    group: "tacz:ammo",
    item: {
      item: "superbwarfare:medium_rocket_cmt",
      count: 1
    }
  }
});
```

## Common Material Names (for comments)

| Item ID Pattern | Chinese Name |
|-----------------|--------------|
| `*_ingot` | XX锭 |
| `*_nugget` | XX粒 |
| `*_plate` | XX板 |
| `gunpowder` | 火药 |
| `redstone` | 红石 |
| `iron_bars` | 铁栏杆 |
| `planks` | 木板 |
| `primer` | 底火 |
| `motor` | 马达 |
| `seeker` | 导引头 |
| `missile_engine` | 导弹发动机 |
| `high_energy_explosives` | 高能量炸药 |
| `fusee` | 引信 |
| `grain` | 火药颗粒 |
| `grenade_*` | XX榴弹 |
| `rocket` | 火箭 |
| `cm_head` | CMT弹头 |
