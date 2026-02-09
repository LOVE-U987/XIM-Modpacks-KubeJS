# **Attribute Modification Overview** 📊

> The **Entity Attribute Modification Event** in EntityJS allows you to customize various entity attributes. This event shadows Forge's Entity Attribute Modification event. The event only modifies an entity's base existing attributes which are made on creation.
It's done this way because attributes are made to be dynamically changed via various means (attribute modifiers for one) during game time.

This event is for entity attribute *modification*. For adding attributes the entity may not already have please visit the [Attribute Creation](https://github.com/liopyu/EntityJS/wiki/Attribute-Creation) Wiki Page.

---

## Key Features 🌟

<table>
  <tr>
    <td><strong>🔧 Attribute Modification</strong></td>
    <td>Adjust key attributes like health, damage, and speed to match your gameplay needs.</td>
  </tr>
  <tr>
    <td><strong>🔄 Compatibility</strong></td>
    <td>Works with both vanilla Minecraft mobs and custom entities created using EntityJS.</td>
  </tr>
  <tr>
    <td><strong>🛠️ Debugging & Inspection</strong></td>
    <td>Inspect entity attributes, view their default values, and make adjustments accordingly.</td>
  </tr>
</table>

---

## Attribute Script Example 📜

```javascript
//attributes Startup Script
EntityJSEvents.attributes(event => {
    /**
     * While the entity builders come with pre-added default attributes you may
     * add your own attributes here as well for more control over your entity's attributes.
     * This also works to modify existing mob's attributes such as in this example we are modifying
     * an allay's max health.
     */
    event.modify('minecraft:allay', attribute => {
        //Overwrite an allay's max health attribute setting it to 30.
        attribute.add("minecraft:generic.max_health", 30)
    })
    //You are able to see existing attributes an entity may already have like so
    event.getAttributes('allay').forEach(attribute => {
        console.log(`Allay Attribute: ${attribute.descriptionId}: ${attribute.defaultValue}`)
    })
    // Returns a list of all entity types that can have their attributes modified by this event
    console.log(event.getAllTypes())
})
```
