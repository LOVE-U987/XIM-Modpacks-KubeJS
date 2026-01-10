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
    )

   
    
})
