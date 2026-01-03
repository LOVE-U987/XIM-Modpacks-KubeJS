ServerEvents.recipes(event => {

    event.shaped(
            Item.of('minecraft:splash_potion'),
            [
                    ' A ',
                    'BC ',
                    ' DE'
            ],
            {
                    C: 'minecraft:clay_ball',
                    A: 'minecraft:prismarine_crystals',
                    B: 'minecraft:prismarine_shard',
                    D: 'minecraft:iron_ingot',
                    E: 'minecraft:slime_ball'
            }
    )
});
