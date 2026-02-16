ServerEvents.recipes((event) => {

  // ==================== 弹药配方 ====================

  // 手枪弹药
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { tag: "forge:ingots/copper" }, count: 1 },      // 铜锭
      { item: { item: "superbwarfare:primer" }, count: 1 },   // 底火
      { item: { item: "minecraft:gunpowder" }, count: 1 },    // 火药
      { item: { tag: "forge:plates/copper" }, count: 2 }      // 铜板
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:handgun_ammo",
        count: 64
      }
    }
  });

  // 重型弹药
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "minecraft:copper_ingot" }, count: 2 },  // 铜锭
      { item: { item: "superbwarfare:primer" }, count: 1 },   // 底火
      { item: { item: "minecraft:gunpowder" }, count: 1 },    // 火药
      { item: { tag: "forge:plates/copper" }, count: 1 },     // 铜板
      { item: { item: "superbwarfare:steel_ingot" }, count: 1 } // 钢锭
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:heavy_ammo",
        count: 16
      }
    }
  });


  // ==================== 爆炸物配方 ====================

  // 中型航空炸弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "minecraft:iron_ingot" }, count: 2 },                // 铁锭
      { item: { item: "superbwarfare:primer" }, count: 1 },                // 底火
      { item: { item: "minecraft:gunpowder" }, count: 5 },                 // 火药
      { item: { item: "superbwarfare:high_energy_explosives" }, count: 2 }, // 高能量炸药
      { item: { item: "superbwarfare:fusee" }, count: 1 },                 // 引信
      { item: { tag: "minecraft:smelts_to_glass" }, count: 4 }             // 沙子
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:medium_aerial_bomb",
        count: 1
      }
    }
  });


  // ==================== 导弹/无人机配方 ====================

  // 蜂群无人机
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "minecraft:iron_nugget" }, count: 2 },               // 铁粒
      { item: { item: "minecraft:redstone" }, count: 1 },                  // 红石
      { item: { item: "minecraft:gold_nugget" }, count: 1 },               // 金粒
      { item: { item: "superbwarfare:motor" }, count: 1 },                 // 马达
      { item: { item: "superbwarfare:seeker" }, count: 1 },                // 导引头
      { item: { tag: "minecraft:planks" }, count: 4 },                     // 木板
      { item: { item: "superbwarfare:high_energy_explosives" }, count: 2 }  // 高能量炸药
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:swarm_drone",
        count: 4
      }
    }
  });

  // 大型对地导弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "minecraft:gunpowder" }, count: 5 },                  // 火药
      { item: { item: "superbwarfare:missile_engine" }, count: 1 },         // 导弹发动机
      { item: { item: "superbwarfare:high_energy_explosives" }, count: 1 }, // 高能量炸药
      { item: { item: "superbwarfare:seeker" }, count: 1 },                 // 导引头
      { item: { tag: "minecraft:smelts_to_glass" }, count: 4 },             // 沙子
      { item: { tag: "forge:plates/copper" }, count: 2 }                    // 铜板
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:large_anti_ground_missile",
        count: 1
      }
    }
  });

  // 中型对空导弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "minecraft:iron_bars" }, count: 2 },                  // 铁栏杆
      { item: { item: "minecraft:iron_ingot" }, count: 2 },                 // 铁锭
      { item: { item: "superbwarfare:high_energy_explosives" }, count: 1 }, // 高能量炸药
      { item: { item: "superbwarfare:seeker" }, count: 1 },                 // 导引头
      { item: { item: "superbwarfare:missile_engine" }, count: 1 }          // 导弹发动机
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

  // 小型火箭
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "minecraft:copper_ingot" }, count: 2 },              // 铜锭
      { item: { item: "superbwarfare:fusee" }, count: 1 },                 // 引信
      { item: { item: "superbwarfare:high_energy_explosives" }, count: 1 }, // 高能量炸药
      { item: { item: "superbwarfare:grain" }, count: 1 }                  // 火药颗粒
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:small_rocket",
        count: 4
      }
    }
  });

  // 40mm榴弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "minecraft:iron_ingot" }, count: 2 },                // 铁锭
      { item: { item: "superbwarfare:fusee" }, count: 1 },                 // 引信
      { item: { item: "superbwarfare:primer" }, count: 1 },                // 底火
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
      { item: { item: "superbwarfare:small_rocket" }, count: 2 },           // 小型火箭
      { item: { item: "superbwarfare:cm_head" }, count: 1 }                // CMT弹头
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:medium_rocket_cm",
        count: 1
      }
    }
  });

  // 中型火箭弹HE
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "superbwarfare:small_rocket" }, count: 2 },           // 小型火箭
      { item: { item: "superbwarfare:he_head" }, count: 1 }                 // HE弹头
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:medium_rocket_he",
        count: 1
      }
    }
  });

  // 中型火箭弹AP
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "superbwarfare:small_rocket" }, count: 2 },           // 小型火箭
      { item: { item: "superbwarfare:ap_head" }, count: 1 }                 // AP弹头
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:medium_rocket_ap",
        count: 1
      }
    }
  });

  // 小型炮弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "minecraft:copper_ingot" }, count: 2 },               // 铜锭
      { item: { item: "minecraft:gunpowder" }, count: 1 },                  // 火药
      { item: { item: "superbwarfare:primer" }, count: 1 },                 // 底火
      { item: { item: "superbwarfare:steel_ingot" }, count: 1 },            // 钢锭
      { item: { item: "superbwarfare:high_energy_explosives" }, count: 1 }  // 高能量炸药
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:small_shell",
        count: 4
      }
    }
  });

  // 5英寸AP炮弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "superbwarfare:fusee" }, count: 1 },                   // 引信
      { item: { item: "superbwarfare:ap_head" }, count: 1 },                 // AP弹头
      { item: { item: "superbwarfare:grain" }, count: 1 }                    // 火药颗粒
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:ap_5_inches",
        count: 1
      }
    }
  });

  // 5英寸HE炮弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "superbwarfare:fusee" }, count: 1 },                   // 引信
      { item: { item: "superbwarfare:ap_head" }, count: 1 },                 // AP弹头
      { item: { item: "superbwarfare:he_head" }, count: 1 }                  // HE弹头
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:he_5_inches",
        count: 1
      }
    }
  });

  // 迫击炮弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "superbwarfare:fusee" }, count: 1 },                   // 引信
      { item: { item: "superbwarfare:steel_ingot" }, count: 1 },             // 钢锭
      { item: { item: "superbwarfare:high_energy_explosives" }, count: 1 },  // 高能量炸药
      { item: { item: "superbwarfare:grain" }, count: 1 }                    // 火药颗粒
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:mortar_shell",
        count: 4
      }
    }
  });

  // 5英寸GS炮弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "superbwarfare:fusee" }, count: 1 },                   // 引信
      { item: { item: "superbwarfare:gs_head" }, count: 1 },                 // GS弹头
      { item: { item: "superbwarfare:grain" }, count: 1 }                    // 火药颗粒
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:gs_5_inches",
        count: 1
      }
    }
  });

  // 5英寸CM炮弹
  event.custom({
    type: "tacz:gun_smith_table_crafting",
    materials: [
      { item: { item: "superbwarfare:fusee" }, count: 1 },                   // 引信
      { item: { item: "superbwarfare:cm_head" }, count: 1 },                 // CMT弹头
      { item: { item: "superbwarfare:grain" }, count: 1 }                    // 火药颗粒
    ],
    result: {
      type: "custom",
      group: "tacz:ammo",
      item: {
        item: "superbwarfare:cm_5_inches",
        count: 1
      }
    }
  });

});
