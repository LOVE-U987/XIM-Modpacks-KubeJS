// 自定义配方脚本
// 这个文件包含了游戏中的自定义合成配方

// 监听服务器配方注册事件
ServerEvents.recipes(event => {
    event.shaped(
        Item.of('irons_spellbooks:uncommon_ink'),
        [
            'A B',
            'CCC',
            '   '
        ],
        {
            C: 'irons_spellbooks:common_ink',
            B: 'minecraft:copper_ingot',
            A: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('irons_spellbooks:rare_ink'),
        [
            'AAB',
            'CCC',
            '   '
        ],
        {
            C: 'irons_spellbooks:uncommon_ink',
            B: 'minecraft:iron_ingot',
            A: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('irons_spellbooks:epic_ink'),
        [
            'AAA',
            'BBB',
            ' C '
        ],
        {
            C: 'minecraft:gold_ingot',
            B: 'irons_spellbooks:rare_ink',
            A: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('irons_spellbooks:legendary_ink'),
        [
            'ABA',
            'CCC',
            'ADA'
        ],
        {
            B: 'kubejs:ruby',
            D: 'minecraft:amethyst_shard',
            C: 'irons_spellbooks:epic_ink',
            A: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('minecraft:egg'),
        [
            '   ',
            ' A ',
            '   '
        ],
        {
            A: 'minecraft:brown_egg'
        }
    ),
    event.shaped(
        Item.of('minecraft:egg'),
        [
            '   ',
            ' A ',
            '   '
        ],
        {
            A: 'minecraft:blue_egg'
        }
    ),
    event.shaped(
        Item.of('minecraft:brown_egg'),
        [
            '   ',
            ' A ',
            '   '
        ],
        {
            A: 'minecraft:egg'
        }
    ),
    event.shaped(
        Item.of('irons_spellbooks:raw_mithril'),
        [
            ' A ',
            'ABA',
            ' C '
        ],
        {
            C: 'minecraft:netherite_scrap',
            A: 'minecraft:diamond',
            B: 'kubejs:piglich_heart'
        }
    ),
    event.shaped(
        Item.of('minecraft:experience_bottle', 2),
        [
            ' A ',
            'BCB',
            'D D'
        ],
        {
            A: 'minecraft:glowstone_dust',
            C: 'minecraft:gold_ingot',
            D: 'minecraft:glass_bottle',
            B: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('grimoireofgaia:experience_iron'),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            B: 'kubejs:example_item',
            A: 'minecraft:experience_bottle'
        }
    ),
    event.shaped(
        Item.of('grimoireofgaia:experience_iron'),
        [
            ' A ',
            'ABA',
            ' A '
        ],
        {
            A: 'minecraft:experience_bottle',
            B: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('grimoireofgaia:experience_gold'),
        [
            '   ',
            'AB ',
            ' A '
        ],
        {
            B: 'kubejs:example_item',
            A: 'grimoireofgaia:experience_iron'
        }
    ),
    event.shaped(
        Item.of('grimoireofgaia:experience_gold'),
        [
            '   ',
            'AB ',
            '   '
        ],
        {
            A: 'grimoireofgaia:experience_iron',
            B: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('grimoireofgaia:experience_diamond'),
        [
            '   ',
            'ABA',
            '   '
        ],
        {
            A: 'grimoireofgaia:experience_gold',
            B: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('kubejs:aluminum_crystal'),
        [
            'AAA',
            'ABA',
            'AAA'
        ],
        {
            A: 'grimoireofgaia:experience_diamond',
            B: 'kubejs:ruby'
        }
    ),
    event.shaped(
        Item.of('kubejs:aluminum_crystal'),
        [
            'ABA',
            'BCB',
            'ABA'
        ],
        {
            B: 'grimoireofgaia:experience_diamond',
            C: 'kubejs:piglich_heart',
            A: 'minecraft:experience_bottle'
        }
    ),
    event.shaped(
        Item.of('grimoireofgaia:experience_diamond'),
        [
            'ABA',
            'BCB',
            'ABA'
        ],
        {
            C: 'kubejs:example_item',
            B: 'grimoireofgaia:experience_iron',
            A: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('kubejs:aluminum_crystal'),
        [
            'ABA',
            'CCC',
            'ABA'
        ],
        {
            B: 'kubejs:piglich_heart',
            A: 'minecraft:experience_bottle',
            C: 'kubejs:fluorite'
        }
    ),
    event.shaped(
        Item.of('minecraft:experience_bottle', 6),
        [
            'ABA',
            'ACA',
            'BCB'
        ],
        {
            A: 'minecraft:emerald',
            B: 'irons_spellbooks:arcane_essence',
            C: 'minecraft:glass_bottle'
        }
    )
})
