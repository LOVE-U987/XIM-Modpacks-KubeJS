#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TaCZ Recipe Converter
将 JSON 配方文件转换为 KubeJS 代码
"""

import json
import sys
import os
from typing import Dict, List, Union, Any


class RecipeConverter:
    """TaCZ 配方转换器"""
    
    # 材料名称映射表
    MATERIAL_NAMES = {
        'copper_ingot': '铜锭',
        'iron_ingot': '铁锭',
        'gold_ingot': '金锭',
        'steel_ingot': '钢锭',
        'iron_nugget': '铁粒',
        'gold_nugget': '金粒',
        'copper_plate': '铜板',
        'iron_plate': '铁板',
        'gunpowder': '火药',
        'redstone': '红石',
        'iron_bars': '铁栏杆',
        'planks': '木板',
        'primer': '底火',
        'motor': '马达',
        'seeker': '导引头',
        'missile_engine': '导弹发动机',
        'high_energy_explosives': '高能量炸药',
        'fusee': '引信',
        'grain': '火药颗粒',
        'small_rocket': '小型火箭',
        'he_head': 'HE弹头',
        'ap_head': 'AP弹头',
        'cm_head': 'CMT弹头',
        'gs_head': 'GS弹头',
    }
    
    def __init__(self):
        self.output_lines = []
    
    def get_material_name(self, item_id: str) -> str:
        """根据物品ID获取中文名称"""
        # 提取物品名称（去掉命名空间）
        if ':' in item_id:
            item_name = item_id.split(':')[-1]
        else:
            item_name = item_id
        
        # 查找映射表
        return self.MATERIAL_NAMES.get(item_name, item_name)
    
    def get_recipe_name(self, output_item: str) -> str:
        """根据输出物品推断配方名称"""
        if ':' in output_item:
            item_name = output_item.split(':')[-1]
        else:
            item_name = output_item
        
        # 替换下划线为空格，并转换常见缩写
        name = item_name.replace('_', ' ')
        
        # 常见词汇翻译
        translations = {
            'rocket': '火箭弹',
            'missile': '导弹',
            'shell': '炮弹',
            'grenade': '榴弹',
            'ammo': '弹药',
            'bomb': '炸弹',
            'drone': '无人机',
            'small': '小型',
            'medium': '中型',
            'large': '大型',
            'ap': 'AP',
            'he': 'HE',
            'cm': 'CM',
            'gs': 'GS',
            'cmt': 'CMT',
            'mortar': '迫击炮',
            'inches': '英寸',
            'handgun': '手枪',
            'heavy': '重型',
            'rifle': '步枪',
            'aerial': '航空',
            'anti air': '对空',
            'anti ground': '对地',
            'swarm': '蜂群',
        }
        
        # 尝试翻译
        result = name
        for en, cn in translations.items():
            result = result.replace(en, cn)
        
        return result.strip()
    
    def convert_material(self, material: Dict[str, Any]) -> str:
        """转换单个材料为 KubeJS 格式"""
        count = material.get('count', 1)
        
        if 'tag' in material:
            # 使用矿物词典标签
            tag = material['tag']
            # 尝试从标签推断名称
            if 'ingots' in tag:
                material_name = tag.split('/')[-1] + '锭'
            elif 'plates' in tag:
                material_name = tag.split('/')[-1] + '板'
            elif 'nuggets' in tag:
                material_name = tag.split('/')[-1] + '粒'
            else:
                material_name = tag.split('/')[-1]
            return f'{{ item: {{ tag: "{tag}" }}, count: {count} }},  // {material_name}'
        
        elif 'item' in material:
            # 使用具体物品ID
            item_id = material['item']
            material_name = self.get_material_name(item_id)
            return f'{{ item: {{ item: "{item_id}" }}, count: {count} }},  // {material_name}'
        
        else:
            return f'{{ item: {{ item: "unknown" }}, count: {count} }},  // 未知材料'
    
    def convert_recipe(self, recipe: Dict[str, Any]) -> str:
        """转换单个配方为 KubeJS 格式"""
        output_item = recipe.get('输出物品', 'unknown:unknown')
        output_count = recipe.get('输出数量', 1)
        materials = recipe.get('输入物品', [])
        recipe_type = recipe.get('配方类型', 'tacz:gun_smith_table_crafting')
        
        # 获取配方名称
        recipe_name = self.get_recipe_name(output_item)
        
        # 构建材料列表
        materials_js = []
        for material in materials:
            materials_js.append(self.convert_material(material))
        
        # 构建完整配方代码
        lines = [
            f'  // {recipe_name}',
            f'  event.custom({{',
            f'    type: "{recipe_type}",',
            f'    materials: [',
        ]
        
        # 添加材料
        for material_js in materials_js:
            lines.append(f'      {material_js}')
        
        # 添加结果部分
        lines.extend([
            f'    ],',
            f'    result: {{',
            f'      type: "custom",',
            f'      group: "tacz:ammo",',
            f'      item: {{',
            f'        item: "{output_item}",',
            f'        count: {output_count}',
            f'      }}',
            f'    }}',
            f'  }});',
            f'',  # 空行
        ])
        
        return '\n'.join(lines)
    
    def convert_single(self, data: Dict[str, Any]) -> str:
        """转换单个配方"""
        return self.convert_recipe(data)
    
    def convert_batch(self, data: List[List[Dict[str, Any]]]) -> str:
        """转换批量配方"""
        results = []
        for recipe_list in data:
            if isinstance(recipe_list, list) and len(recipe_list) > 0:
                recipe = recipe_list[0]
                results.append(self.convert_recipe(recipe))
        return '\n'.join(results)
    
    def convert(self, data: Any) -> str:
        """自动检测并转换"""
        if isinstance(data, list):
            # 批量处理格式
            return self.convert_batch(data)
        elif isinstance(data, dict):
            # 单个配方格式
            return self.convert_single(data)
        else:
            raise ValueError("不支持的 JSON 格式")
    
    def process_file(self, input_file: str, output_file: str = None):
        """处理 JSON 文件并输出"""
        # 读取 JSON 文件
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 转换
        result = self.convert(data)
        
        # 包装成完整的 KubeJS 文件
        full_code = f'''ServerEvents.recipes((event) => {{

{result}}});'''
        
        # 输出
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(full_code)
            print(f"✅ 已生成文件: {output_file}")
        else:
            print(full_code)
        
        return full_code


def main():
    """主函数"""
    print("=" * 60)
    print("TaCZ Recipe Converter - TaCZ 配方转换器")
    print("=" * 60)
    
    # 查找当前目录下的 JSON 文件
    json_files = [f for f in os.listdir('.') if f.endswith('.json')]
    
    if json_files:
        print("\n📁 当前目录下的 JSON 文件:")
        for i, f in enumerate(json_files, 1):
            print(f"  {i}. {f}")
        print()
    
    # 交互式输入
    while True:
        # 输入文件
        input_file = input("请输入 JSON 文件名 (或输入 'q' 退出): ").strip()
        
        if input_file.lower() == 'q':
            print("👋 再见!")
            return
        
        if not input_file:
            print("❌ 文件名不能为空，请重新输入\n")
            continue
        
        # 检查输入文件是否存在
        if not os.path.exists(input_file):
            print(f"❌ 错误: 找不到文件 '{input_file}'\n")
            continue
        
        break
    
    # 输出文件（可选）
    output_file = input("请输入输出 JS 文件名 (直接回车则输出到屏幕): ").strip()
    if output_file == '':
        output_file = None
    
    # 转换
    try:
        converter = RecipeConverter()
        converter.process_file(input_file, output_file)
        print("\n✅ 转换完成!")
    except Exception as e:
        print(f"\n❌ 转换失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
