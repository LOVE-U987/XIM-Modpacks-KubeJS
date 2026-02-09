

# **Custom Entity Registration** 🧪

> The`createCustom` method has been overridden to be able to register and copy any entity class that extends the LivingEntity class. It utilizes a dummy instance of the entity that overrides rendering and modeling with GeckoLib support offering full customizability. Additionally this method has direct access to the modification builder allowing easy modification of the custom entity.

---

## Overview 🧬

These entities will inherit the behavior of the provided class and override their rendering, model, and animation systems to use GeckoLib. This enables full visual customization without losing access to the original entity logic.

```js
let EntityAmphithere = Java.loadClass("com.github.alexthe666.iceandfire.entity.EntityAmphithere")
StartupEvents.registry('entity_type', event => {
    event.createCustom('wyrm', EntityAmphithere, modifyBuilder => {
        modifyBuilder.tick(entity => {
            console.log(entity.type)
        })
    })
})
```

Once registered, the entity functions normally on the server side using the original entity's methods/logic. On the client side, however, it is wrapped by a GeckoLib-compatible proxy for advanced modeling and animation control.

---

## GeckoLib Dummy Entity 📦

When working with GeckoLib animation callbacks like `addAnimationController`, the passed-in entity is not your original one, but a **client-side dummy** used for modeling purposes.

To access your original server-side logic while inside these geckolib animation callbacks, use:

```js
  entity.originalEntity
```

To convert from the original entity back into the wrapped GeckoLib proxy (useful in mixed contexts like utilizing Geckolib's Animatable methods such as `triggerAnimation`), use:

```js
  originalEntity.getAnimatableEntity().triggerAnimation('exampleController', 'spawning')
```


---

## Example 🧪

```js
let Zombie = Java.loadClass("net.minecraft.world.entity.monster.Zombie")
StartupEvents.registry("entity_type", event => {
    event.createCustom("wyrm", Zombie, modifyBuilder => {})
        .sized(1, 1)
        .addAnimationController('exampleController', 1, controllerEvent => {
            controllerEvent.addTriggerableAnimation('spawn', 'spawning', 'default');
            if (controllerEvent.entity.originalEntity.hurtTime > 0) {
            } else {
                controllerEvent.thenLoop('idle');
            }
            return true;
        })
        .textureResource(entity => {
            if (entity.originalEntity.hurtTime > 0) {
                entity.triggerAnimation('exampleController', 'spawning')
            }
            return "kubejs:textures/entity/wyrm.png"
        })
        .scaleModelForRender(context => {
            const { entity, widthScale, heightScale, poseStack, model, isReRender, partialTick, packedLight, packedOverlay } = context
            poseStack.scale(0.5, 0.5, 0.5)
        })
})
```

---


## Recommended: Use `createCustom` with `modifyBuilder` 🧠

While `createCustom` still gives you access to base `EntityType` builder methods such as `sized`, `clientTrackRange`, `mobCategory`, and GeckoLib visuals, you can now also **directly modify behavior** using the `modifyBuilder` callback parameter.

This allows you to attach logic such as `tick`, `onRemovedFromWorld`, `canFreeze`, and more — all in the same place you define your custom entity — without needing to register a separate `EntityJSEvents.modifyEntity` handler.

### Example

```javascript
event.createCustom('wyrm', Villager, modifyBuilder => {
    modifyBuilder.tick(entity => {
        console.log(entity.type)
    })

    modifyBuilder.onRemovedFromWorld(entity => {
        console.log(entity.id + " was removed")
    })

    modifyBuilder.canFreeze(entity => false)
})
```
---

## Notes 🗒️
* Entity AI, and base logic are derived from the class you provide.
* This works on any entity class that extends the base LivingEntity class 

---
