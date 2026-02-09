# **Adding a Simple Animation Controller** 🎥

> To incorporate animations into entities, you'll need an animation controller. This section explains how to add a basic controller to manage animations for the "wyrm" entity.

```javascript
StartupEvents.registry('entity_type', event => {
    let builder = event.create('wyrm', 'entityjs:animal')
    builder.addAnimationController('exampleController', 1, event => {
        if (event.entity.hurtTime > 0) {
            event.thenPlayAndHold('spawn');
        } else {
            event.thenLoop('idle');
        }
        return true;
    });
});
```

> - The `addAnimationController` method adds a new controller named "exampleController" to the "wyrm" entity.  
> - The controller transitions between animations with a `translationTicksLength` of 1.  
> - The "spawn" animation is played when the entity is hurt, while the "idle" animation loops indefinitely.

---

# **Setting Up Triggerable Animations** 🎯

> Triggerable animations play based on specific events or conditions. Here’s how you can set up triggerable animations for the "wyrm" entity.

```javascript
StartupEvents.registry('entity_type', event => {
    let builder = event.create('wyrm', 'entityjs:animal')
    builder.addAnimationController('exampleController1', 5, event => {
        event.addTriggerableAnimation('spawn', 'spawning', 'default');
        if (event.entity.isMoving()) {
            event.thenPlay("idle");
        }
        return true;
    })
    builder.onLivingJump(entity => {
        entity.triggerAnimation('exampleController1', 'spawning');
    });
});
```

> - A triggerable animation named "spawn" is added with a loop type of "default".  
> - The "idle" animation plays when the entity is moving.  
> - The "spawning" animation is triggered when the entity jumps.

---

# **Dedicated Triggerable Animation Setup** 🔧

> A dedicated method to add triggerable animations using `addTriggerableAnimationController`. This setup manages animations without additional logic.

```javascript
StartupEvents.registry('entity_type', event => {
    let builder = event.create('wyrm', 'entityjs:animal')
    builder.addTriggerableAnimationController('exampleController', 5, 'spawn', 'spawning', 'play_once');
});
```

> - This adds an animation controller named "exampleController" with a transition duration of 5.  
> - A triggerable animation named "spawn" is added with a loop type of "play_once".

---

# **Entity `triggerAnimation` Method** 🚀

> The `triggerAnimation` method can be called directly from the entity object in built-in KubeJS events such as `EntityEvents.hurt`.

```javascript
EntityEvents.hurt('kubejs:wyrm', event => {
    event.entity.triggerAnimation('exampleController', 'spawning');
});
```

> - When the entity is hurt, the "spawning" animation is triggered using the `triggerAnimation` method.

---
# **Individual Model Part Rotation/Animations** 

> With Geckolib's RenderUtil class you can get and rotate individual model parts.

```javascript
    // Note that in 1.20.1 the class name is "RenderUtils" instead of "RenderUtil"
    let RenderUtil = Java.loadClass("software.bernie.geckolib.util.RenderUtil")
    let geoModel = RenderUtil.getGeoModelForEntity(entity);
    let /** @type {Internal.GeoBone} */ head = geoModel.getBone("head").get();
    head.setRotY(90)
```

---

## Rendering Hand and Armor Items

If you're using a **humanoid** geo model (such as the built-in `kubejs:sasuke`), you can use the following setup to render **held items** and **armor pieces** correctly. For custom models, you’ll need to adjust the bone names accordingly.

```js
let Axis = Java.loadClass("com.mojang.math.Axis")
// This will use the "sasuke.geo.json" model that comes with EntityJS and will allow you to set a custom entity name in the event.create("someMob") field.
builder.modelResource(entity => {
    return "kubejs:geo/entity/sasuke.geo.json"
})
//Renders the item in the main right hand
builder.addRenderItemLayer(entity => "right_hand", itemLayerBuilder => {
    itemLayerBuilder.renderItem(context => {
        let {
            poseStack,
        } = context
        poseStack.translate(0.05, -0.5, -0.5)
        poseStack.mulPose(Axis.YP.rotationDegrees(90))
        poseStack.mulPose(Axis.ZP.rotationDegrees(-40))
    })
})
//Renders armor to the entity based on the positions of the geo 
builder.addArmorItemLayer(armorBuilder => {
    armorBuilder
        .setHeadArmorBone((e) => "head")
        .setChestArmorBone((e) => "body")
        .setRightLegArmorBone((e) => "right_leg")
        .setLeftLegArmorBone((e) => "left_leg")
        .setRightFootArmorBone((e) => "right_foot")
        .setLeftFootArmorBone((e) => "left_foot")
        .setMainHandArmorBone((e) => "right_arm")
        .setOffhandArmorBone((e) => "left_arm")
        .setLeftShoulderArmorBone(e => "left_shoulder")
        .setRightShoulderArmorBone(e => "right_shoulder")
        .renderArmor(context => {
            let {
                poseStack,
                bone,
            } = context
            if (bone.name === "head") {
            } else if (bone.name == "body") {
                poseStack.translate(0, -0.3, 0.0)
            } else if (bone.name == "left_foot") {
                poseStack.translate(0.3, -4, 0)
                poseStack.scale(1.8, 5, 1.8)
            } else if (bone.name == "right_foot") {
                poseStack.translate(-0.3, -2.1, 0)
                poseStack.scale(1.8, 5, 1.8)
            } else if (bone.name == "left_shoulder") {
                poseStack.translate(-0.6, 43.3, 0)
                poseStack.scale(1.7, 6.5, 1.7)
            } else if (bone.name == "right_shoulder") {
                poseStack.translate(0.6, 43.3, 0)
                poseStack.scale(1.7, 6.5, 1.7)
            }
        })
})
```
## 🧠 How Armor Placement Works

To determine where each armor piece is rendered on the vanilla `HumanoidModel`, a method like this is used in the renderer:

```java
@Override
protected ModelPart getModelPartForBone(GeoBone bone, EquipmentSlot slot,
                                        ItemStack stack, T animatable,
                                        HumanoidModel<?> baseModel) {
    String boneName = bone.getName();

    return switch (slot) {
        case HEAD -> baseModel.head;
        case CHEST -> {
            if (boneName.contains("left_shoulder")) yield baseModel.leftArm;
            if (boneName.contains("right_shoulder")) yield baseModel.rightArm;
            yield baseModel.body;
        }
        case MAINHAND -> baseModel.rightArm;
        case OFFHAND -> baseModel.leftArm;
        case LEGS -> boneName.contains("left_leg") ? baseModel.leftLeg : baseModel.rightLeg;
        case FEET -> boneName.contains("left_foot") ? baseModel.leftLeg : baseModel.rightLeg;
        default -> baseModel.body;
    };
}
```

### 📛 Naming Bones for Armor Rendering

The renderer uses the **bone name** and the **armor slot** to determine which body part the armor should attach to. For example:

| Bone Name         | Equipment Slot | Mapped Model Part     |
|------------------|----------------|------------------------|
| `"head"`         | `HEAD`         | `baseModel.head`       |
| `"body"`         | `CHEST`        | `baseModel.body`       |
| `"left_shoulder"`| `CHEST`        | `baseModel.leftArm`    |
| `"right_shoulder"`| `CHEST`       | `baseModel.rightArm`   |
| `"left_leg"`     | `LEGS`         | `baseModel.leftLeg`    |
| `"right_leg"`    | `LEGS`         | `baseModel.rightLeg`   |
| `"left_foot"`    | `FEET`         | `baseModel.leftLeg`    |
| `"right_foot"`   | `FEET`         | `baseModel.rightLeg`   |

Make sure your bone names follow a recognizable pattern so they can be correctly matched based on the `slot` and part name.

---
# **File Structure for Geckolib Entities** 📁

> Ensure the following file structure for Geckolib entity animations, geo models, and textures:

<table>
  <tr>
    <td><strong>Animations</strong></td>
    <td><code>assets&gt;modname&gt;animations&gt;entity&gt;mobname.animation.json</code></td>
  </tr>
  <tr>
    <td><strong>Geo Model</strong></td>
    <td><code>assets&gt;modname&gt;geo&gt;entity&gt;mobname.geo.json</code></td>
  </tr>
  <tr>
    <td><strong>Texture</strong></td>
    <td><code>assets&gt;modname&gt;textures&gt;entity&gt;mobname.png</code></td>
  </tr>
</table>

