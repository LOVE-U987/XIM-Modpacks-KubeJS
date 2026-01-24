// 添加唱片到音乐唱片标签
ServerEvents.tags('item', event => {
    event.add('c:music_discs', 'kubejs:pokopoko_disc')
})