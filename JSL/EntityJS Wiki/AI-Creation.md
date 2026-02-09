# AI Customization Events Overview 🤖

> The AI customization events in EntityJS allow you to add or remove goals from any existing Mob entity as well as modify any living entity's brain logic.

---

## Key Events 🔑

<table> <tr> <td><strong>addGoalSelectors</strong></td> <td>Registers **action goals** in the entity’s goal-selector (i.e., what the entity *will do*). These goals drive behaviours like moving, attacking, wandering, looking around.</td> </tr> <tr> <td><strong>addGoals</strong></td> <td>Registers **targeting goals** in the entity’s target-selector (i.e., what the entity *should target*). These govern target acquisition, retaliation, prioritisation of victims or allies.</td> </tr> <tr> <td><strong>buildBrain</strong></td> <td>Initialises the entity’s modern “brain” system: defines memory modules, activities and behaviours that run per tick.</td> </tr> <tr> <td><strong>buildBrainProvider</strong></td> <td>Sets up the brain’s sensors and interaction logic (how the entity perceives its world and responds). This defines what the entity can sense, remember, and then decide on via the brain.</td> </tr> </table>

Note: When starting with entity AI it’s often simpler to use addGoals & addGoalSelectors (the legacy goal/target system). The newer brain system (buildBrain & buildBrainProvider) is more powerful but also more complex.

---

## Add Goal Selectors 🎯

> This script allows you to add or remove goals from the "wyrm" entity and define custom goals.

#### 📜 Server Script:

```javascript
EntityJSEvents.addGoalSelectors('kubejs:wyrm', e => {
    let Player = Java.loadClass('net.minecraft.world.entity.player.Player')
    e.panic(1, 0.5)
    e.floatSwim(1)
    e.meleeAttack(4, 1, true)
    e.leapAtTarget(3, 0.4)
    e.waterAvoidingRandomStroll(5, 0.4, 0.8)
    e.lookAtEntity(6, Player, 8, 0.8, false)
    e.randomLookAround(7)
    e.customGoal(
        'follow_target',
        1,
        mob => true,
        mob => true,
        true,
        mob => {},
        mob => mob.getNavigation().stop(),
        true,
        /** @param {Internal.Mob} mob */ mob => {
            let mobAABB = mob.boundingBox.inflate(5)
            mob.level.getEntitiesWithin(mobAABB).forEach(entity => {
                if (entity == null) return
                if (entity.player && entity.distanceToEntity(mob) < 20) {
                    mob.getNavigation().moveTo(entity.block.x, entity.y, entity.z, 1.0);
                }
            })
        }
    )
    let $PanicGoal = Java.loadClass("net.minecraft.world.entity.ai.goal.PanicGoal")
    e.removeGoal($PanicGoal)
    e.removeGoals(context => {
        const { goal, entity } = context
        return goal.getClass() == $PanicGoal
    })
})
```

---

## Add Goals 🛠️

> This script adds new goals and target behaviors to the "wyrm" entity.

#### 📜 Server Script:

```javascript
EntityJSEvents.addGoals("kubejs:wyrm", event => {
    let Cow = Java.loadClass('net.minecraft.world.entity.animal.Cow')
    event.hurtByTarget(1, [Cow], true, [Cow])
    event.nearestAttackableTarget(2, Cow, 5, false, false, entity => {
        return entity.age < 500
    })
    const $BreedGoal = Java.loadClass('net.minecraft.world.entity.ai.goal.BreedGoal')
    event.arbitraryTargetGoal(2, entity => new $BreedGoal(entity, 1))
    let $PanicGoal = Java.loadClass("net.minecraft.world.entity.ai.goal.PanicGoal")
    event.removeGoal($PanicGoal)
    event.removeGoals(context => {
        const { goal, entity } = context
        return goal.getClass() == $PanicGoal
    })
})
```

---

## Build Brain 🧠

> This script constructs the decision-making logic for the "wyrm" entity, defining its behaviors.

#### 📜 Server Script:

```javascript
EntityJSEvents.buildBrain('kubejs:wyrm', event => {
    const activitybehaviors = [
        event.behaviors.animalMakeLove('kubejs:wyrm', 0.2),
        event.behaviors.followTemptation(entity => {
            return 1;
        }),
        event.behaviors.animalPanic(2)
    ]
    const idlebehaviors = [
        event.behaviors.animalPanic(2)
    ]
    const corebehaviors = [
        event.behaviors.meleeAttack(5)
    ]
    event.addActivity('minecraft:panic', 1, activitybehaviors)
    event.idleActivity(1, idlebehaviors)
    event.coreActivity(1, corebehaviors)
})
```

---

## Build Brain Provider 🧩

> This script defines the perception and memory logic for the "wyrm" entity by adding memory and sensor modules.

#### 📜 Server Script:

```javascript
EntityJSEvents.buildBrainProvider('kubejs:wyrm', event => {
    event.addMemory("angry_at")
    event.addSensor('nearest_adult')
})
```
