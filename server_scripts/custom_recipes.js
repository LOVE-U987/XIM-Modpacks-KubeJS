// 自定义配方脚本
// 这个文件包含了游戏中的自定义合成配方

// 监听服务器配方注册事件
ServerEvents.recipes(event => {
   
    // 配方1: 铁锭增殖配方
    // 使用萤石和铁锭合成更多铁锭
    // 合成模式: 萤石围绕铁锭的十字形排列
    // A = 萤石(fluorite), B = 铁锭(iron_ingot)
    // 输出: 2个铁锭
    event.shaped(
        Item.of('minecraft:iron_ingot', 2),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            B: 'minecraft:iron_ingot',
            A: 'alltheores:fluorite'
        }
    )

    // 配方2: 附魔金苹果合成配方
    // 使用金块和金苹果合成附魔金苹果
    // 合成模式: 金块完全包围金苹果的正方形排列
    // A = 金块(gold_block), B = 金苹果(golden_apple)
    // 输出: 1个附魔金苹果
    event.shaped(
        Item.of('minecraft:enchanted_golden_apple'),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            B: 'minecraft:golden_apple',
            A: 'minecraft:gold_block'
        }
    )

    // 配方3: 钻石增殖配方
    // 使用萤石和钻石合成更多钻石
    // 合成模式: 萤石完全包围钻石的正方形排列
    // A = 萤石(fluorite), B = 钻石(diamond)
    // 输出: 2个钻石
    event.shaped(
        Item.of('minecraft:diamond', 2),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            A: 'alltheores:fluorite',
            B: 'minecraft:diamond'
        }
    )
    
    // 配方4: 下界合金碎片合成配方
    // 使用萤石块和钻石合成下界合金碎片
    // 合成模式: 萤石块完全包围钻石的正方形排列
    // A = 萤石块(fluorite_block), B = 钻石(diamond)
    // 输出: 1个下界合金碎片
    event.shaped(
        Item.of('minecraft:netherite_scrap'),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            A: 'alltheores:fluorite_block',
            B: 'minecraft:diamond'
        }
    )

    // 配方5: 紫水晶碎片转换配方
    // 使用萤石和铁锭合成紫水晶碎片
    // 合成模式: 萤石完全包围铁锭的正方形排列
    // A = 萤石(fluorite), B = 铁锭(iron_ingot)
    // 输出: 1个紫水晶碎片
    event.shaped(
        Item.of('minecraft:amethyst_shard'),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            B: 'minecraft:iron_ingot',
            A: 'alltheores:fluorite'
        }
    )

    // 配方6: 金锭转换配方
    // 使用萤石和铁锭合成金锭
    // 合成模式: 萤石完全包围铁锭的正方形排列
    // A = 萤石(fluorite), B = 铁锭(iron_ingot)
    // 输出: 1个金锭
    event.shaped(
        Item.of('minecraft:gold_ingot'),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            B: 'minecraft:iron_ingot',
            A: 'alltheores:fluorite'
        }
    )

    event.shaped(
        Item.of('vanillabackport:resin_brick'),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            B: 'alltheores:platinum_ingot',
            A: 'vanillabackport:open_eyeblossom'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:geomancer_beads'),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            A: 'alltheores:ruby',
            B: 'vanillabackport:resin_brick'
        }
    )

    event.shaped(
        Item.of('irons_jewelry:ruby'),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            A: 'alltheores:ruby',
            B: 'minecraft:iron_ingot'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:grant_suns_blessing'),
        [
            'ABA',
            'CDC',
            'ABA'
        ],
        {
            C: 'alltheores:ruby',
            A: 'alltheores:sapphire',
            B: 'irons_jewelry:garnet',
            D: 'crystal_chronicles:divinite_shard'
        }
    )

    event.shaped(
        Item.of('minecraft:copper_ingot', 2),
        [
            '   ',
            ' AB',
            '   '
        ],
        {
            B: 'alltheores:bronze_ingot',
            A: 'alltheores:brass_ingot'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:ice_crystal'),
        [
            'ABA',
            'CDC',
            'ABA'
        ],
        {
            D: 'crystal_chronicles:ice_shard',
            C: 'alltheores:ruby',
            A: 'alltheores:sapphire',
            B: 'irons_jewelry:garnet'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:glowing_jelly'),
        [
            ' A ',
            ' B ',
            '   '
        ],
        {
            A: 'alltheores:peridot',
            B: 'minecraft:sweet_berries'
        }
    )

    event.shaped(
        Item.of('minecraft:coal', 6),
        [
            '   ',
            ' A ',
            '   '
        ],
        {
            A: 'alltheores:sulfur'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:umvuthana_mask_misery'),
        [
            'ABA',
            'CDC',
            'ABA'
        ],
        {
            A: 'alltheores:ruby',
            C: 'alltheores:fluorite',
            D: 'irons_jewelry:peridot',
            B: 'alltheores:sapphire'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:umvuthana_mask_bliss'),
        [
            'ABA',
            'CDC',
            'ABA'
        ],
        {
            A: 'alltheores:ruby',
            B: 'alltheores:fluorite',
            D: 'irons_jewelry:moonstone',
            C: 'alltheores:sapphire'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:umvuthana_mask_rage'),
        [
            'ABA',
            'CDC',
            'ABA'
        ],
        {
            A: 'alltheores:ruby',
            B: 'alltheores:fluorite',
            D: 'irons_jewelry:topaz',
            C: 'alltheores:sapphire'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:umvuthana_mask_fear'),
        [
            'ABA',
            'CDC',
            'ABA'
        ],
        {
            A: 'alltheores:ruby',
            B: 'alltheores:fluorite',
            C: 'alltheores:sapphire',
            D: 'irons_jewelry:sapphire'
        }
    )

    event.shaped(
        Item.of('mowziesmobs:umvuthana_mask_fury'),
        [
            'ABA',
            'CDC',
            'ABA'
        ],
        {
            A: 'alltheores:ruby',
            B: 'alltheores:fluorite',
            C: 'alltheores:sapphire',
            D: 'irons_jewelry:ruby'
        }
    )

    event.shaped(
        Item.of('irons_jewelry:sapphire'),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            A: 'alltheores:sapphire',
            B: 'minecraft:diamond'
        }
    )

    event.shaped(
        Item.of('irons_jewelry:topaz'),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            B: 'minecraft:gold_ingot',
            A: 'alltheores:cinnabar'
        }
    )
    event.shaped(
        Item.of('irons_jewelry:topaz'),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            B: 'minecraft:gold_ingot',
            A: 'alltheores:cinnabar'
        }
    )

    event.shaped(
        Item.of('irons_jewelry:peridot'),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            A: 'alltheores:ruby',
            B: 'minecraft:emerald'
        }
    )

    event.shaped(
        Item.of('irons_jewelry:garnet'),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            A: 'alltheores:cinnabar',
            B: 'minecraft:diamond'
        }
    )

    event.shaped(
        Item.of('irons_jewelry:onyx'),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            A: 'alltheores:fluorite',
            B: 'minecraft:lapis_lazuli'
        }
    )
    
})

// 配方总结:
// 本脚本共添加了12个自定义合成配方：
// 1. 铁锭增殖配方 - 萤石+铁锭=2铁锭 (十字形)
// 2. 附魔金苹果配方 - 金块+金苹果=附魔金苹果 (3x3方形)
// 3. 钻石增殖配方 - 萤石+钻石=2钻石 (3x3方形)
// 4. 下界合金碎片配方 - 萤石块+钻石=下界合金碎片 (3x3方形)
// 5. 紫水晶碎片转换配方 - 萤石+铁锭=紫水晶碎片 (3x3方形)
// 6. 金锭转换配方 - 萤石+铁锭=金锭 (3x3方形)
// 
// 手稿配方使用NBT数据中的'irons_restrictions:school_component'字段区分不同类型：
// - technomancy: 科技手稿
// - aqua: 水系手稿  
// - fire: 火焰手稿
// - nature: 自然手稿
// - blade: 刀片手稿 (使用独立物品ID)
//
// 所有配方都使用shaped合成模式，需要严格按照指定的材料排列方式放置