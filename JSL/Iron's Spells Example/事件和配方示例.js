// 该代码来自 KubeJS Iron's Spells 1.21.1 的官方仓库
// 该文件放置于 kubejs/server_scripts 文件夹中
// 用于演示 Iron's Spellbooks 模组的各种事件监听和炼金术士大锅配方

console.info('Hello, World! (Loaded server TEST example script)')

// ==================== 法力值变化事件 ====================
// ISSEvents.changeMana - 当玩家法力值发生变化时触发
// 可以用于修改法力消耗、恢复逻辑等
ISSEvents.changeMana(event => {
	// 输出调试信息，显示当前脚本类型
	console.log("-- @" + event.entity.scriptType)
	console.log("--- CHANGE-MANA ---")
	
	// event.entity - 触发事件的实体（玩家）
	console.log(event.entity ?? undefined)
	
	// event.magicData - 玩家的魔法数据，包含法力值、施法状态等信息
	console.log(event.magicData ?? undefined)
	
	// event.magicData.casting - 是否正在施法中
	// 这里只在非施法状态下修改法力值（避免干扰施法过程）
	if (!event.magicData.casting) {
		// event.oldMana - 变化前的法力值
		console.log(event.oldMana ?? undefined)

		// setNewMana - 设置新的法力值
		// 这里将法力值增加 0.5，实现缓慢恢复效果
  		event.setNewMana(event.oldMana + 0.5)

  		// event.newMana - 变化后的法力值
  		console.log(event.newMana ?? undefined)
	}
})

// ==================== 法术施放前事件 ====================
// ISSEvents.spellPreCast - 在法术即将施放前触发
// 可以取消施法或修改施法参数
ISSEvents.spellPreCast(event => {
	console.log("-- @" + event.entity.scriptType)
	console.log("--- PRE-CAST ---")
	
	// event.entity - 施法者实体
	console.log(event.entity ?? undefined)
	
	// event.spellId - 法术的ID，格式为 "modid:spell_name"
	console.log(event.spellId ?? undefined)
	
	// event.schoolType - 法术所属学派
	console.log(event.schoolType ?? undefined)
	
	// event.spellLevel - 法术等级
	console.log(event.spellLevel ?? undefined)
	
	// event.castSource - 施法来源（法术书、卷轴、剑等）
	console.log(event.castSource ?? undefined)
	
	// event.entity.magicData - 玩家的完整魔法数据
	// console.log(event.entity.magicData ?? undefined)
})

// ==================== 法术施放事件 ====================
// ISSEvents.spellOnCast - 在法术施放时触发（实际执行效果时）
// 可以修改法术等级、法力消耗等参数
ISSEvents.spellOnCast(event => {
	console.log("-- @" + event.entity.scriptType)
	console.log("--- ON-CAST ---")
	
	// 输出施法者和法术信息
	console.log(event.entity ?? undefined)
  console.log(event.spellId ?? undefined)
  console.log(event.schoolType ?? undefined)
  
  // event.originalSpellLevel - 原始法术等级（修改前的）
  console.log("Old Spell Level: " + event.originalSpellLevel ?? undefined)

  // setSpellLevel - 修改法术等级
  // 这里将法术等级提升1级
  event.setSpellLevel(event.originalSpellLevel + 1)

  // event.spellLevel - 修改后的法术等级
  console.log("New Spell Level: " + event.spellLevel ?? undefined)
  console.log(event.castSource ?? undefined)

	// event.manaCost - 法力消耗
	console.log("Old Mana Cost: " + event.manaCost ?? undefined)
	
	// setManaCost - 修改法力消耗
	// 这里将法力消耗增加1点
	event.setManaCost(event.manaCost + 1)
	
	console.log("New Mana Cost: " + event.manaCost ?? undefined)

	// console.log(event.entity.magicData ?? undefined)
})

// ==================== 法术施放后事件 ====================
// ISSEvents.spellPostCast - 在法术施放完成后触发
// 用于记录日志、触发后续效果等
ISSEvents.spellPostCast(event => {
	console.log("-- @" + event.entity.scriptType)
	console.log("--- POST-CAST ---")
	
	console.log(event.entity ?? undefined)
	
	// event.spell - 法术对象
	console.log(event.spell ?? undefined)
	
	console.log(event.spellLevel ?? undefined)
	
	// event.level - 世界/维度对象
	console.log(event.level ?? undefined)
	
	console.log(event.magicData ?? undefined)
	
	// console.log(event.entity.magicData ?? undefined)
})

// ==================== 服务器加载事件 ====================
// ServerEvents.loaded - 服务器完成加载时触发
// 可以在这里检查法术状态
ServerEvents.loaded(event => {
	// Spell.checkStatus - 检查法术状态
	console.log("Status: " + Spell.checkStatus("irons_spellbooks:raise_dead"))
	
	// Spell.isEnabled - 检查法术是否启用
	console.log("Enabled: " + Spell.isEnabled("irons_spellbooks:raise_dead"))
})

// ==================== 炼金术士大锅配方 ====================
// ServerEvents.recipes - 注册配方
// 注意：炼金术士大锅配方在 1.21.1 版本中改用 KubeJS 原生配方系统
ServerEvents.recipes(event => {
	
	// ---------- 酿造配方 (brew) ----------
	// 将物品和流体在大锅中转化为其他流体
	let brew = event.recipes.irons_spellbooks.alchemist_cauldron_brew
	
	// 参数说明：
	// results - 产出的流体列表（在大锅中生成）
	// input - 消耗的物品（玩家手持）
	// base_fluid - 大锅中需要消耗的流体
	// byproduct - 副产物（可选，返还给玩家）

	// 示例：消耗白色陶瓦和 1000mB 水，产出 500mB 牛奶
	// "0.5B" 表示 0.5 桶 = 500mB (1B = 1000mB)
	brew(["0.5B x minecraft:milk"], "minecraft:white_terracotta", "1B x minecraft:water")
	
	// 带副产物的版本（取消注释可使用）
	// 消耗白色陶瓦和 1000mB 水，产出 500mB 牛奶，返还普通陶瓦
	// brew(["0.5B x minecraft:milk"], "minecraft:white_terracotta", "1B x minecraft:water", "minecraft:terracotta")

	// ---------- 清空配方 (empty) ----------
	// 将大锅中的流体转化为物品（玩家手持获得）
	let empty = event.recipes.irons_spellbooks.alchemist_cauldron_empty
	
	// 参数说明：
  // result - 产出的物品（返还给玩家）
  // input - 消耗的物品（玩家手持）
  // fluid - 大锅中需要消耗的流体
  // sound - 播放的音效（可选，默认是玻璃瓶填充声）

	// 示例：消耗泥土和 250mB 牛奶，产出白色混凝土
	empty("minecraft:white_concrete", "minecraft:dirt", "250x minecraft:milk")
	
	// 带自定义音效的版本（取消注释可使用）
	// empty("minecraft:white_concrete", "minecraft:dirt", "250x minecraft:milk", "irons_spellbooks:cast.generic.lightning")

  // ---------- 填充配方 (fill) ----------
  // 将玩家手持的流体容器倒入大锅
  let fill = event.recipes.irons_spellbooks.alchemist_cauldron_fill
	
	// 参数说明：
	// result - 返还的空容器（返还给玩家）
	// input - 消耗的流体容器（玩家手持）
	// fluid - 倒入大锅的流体
	// mustFitAll - 是否必须完全容纳（可选，默认 true）
	// sound - 播放的音效（可选，默认是玻璃瓶倒空声）

	// 示例：消耗牛奶桶，向大锅倒入 1000mB 牛奶，返还空桶
	fill("1000x minecraft:milk", "minecraft:milk_bucket", "minecraft:bucket")
	
	// 可选参数版本（取消注释可使用）
	// mustFitAll 设为 false 表示即使大锅不能完全容纳也会倒入部分
	// fill("1000x minecraft:milk", "minecraft:milk_bucket", "minecraft:bucket", false)
	
	// 带自定义音效的版本
	// fill("1000x minecraft:milk", "minecraft:milk_bucket", "minecraft:bucket", false, "irons_spellbooks:cast.generic.lightning")
})
