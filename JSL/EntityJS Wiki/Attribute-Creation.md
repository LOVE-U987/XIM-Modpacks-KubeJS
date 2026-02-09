# **Attribute Creation Overview** 🧬

> The **Entity Attribute Creation Event** in EntityJS allows you to **add or modify** the default attributes for any entity type.
> It is built on top of Forge’s `EntityAttributeCreationEvent`, and **copies** the entity’s current attribute map, then applies changes to it.
> This makes it safe to use for extending or adjusting base attributes without wiping existing ones.

Use this event to **add new attributes** to an entity. Do not use this event to modify existing attributes as the newly generated attribute map may differ during later loading stages in the game.

For modifying attributes the entity already has, see the [Attribute Modification Wiki Page](https://github.com/liopyu/EntityJS/wiki/Attribute-Modification).

---

## Key Features ⚙️

<table>
  <tr>
    <td><strong>➕ Attribute Addition</strong></td>
    <td>Add attributes an entity type may not have by default — including vanilla or custom ones.</td>
  </tr>
  <tr>
    <td><strong>🔧 Non-destructive</strong></td>
    <td>Preserves existing attributes by copying them before applying changes — no full overrides.</td>
  </tr>
</table>

---

## Create Attribute Example 💡

```js
//createAttributes Startup Script
EntityJSEvents.createAttributes(event => {
    /**
     * Add or update default attributes for the entity type.
     * Existing attributes are preserved, and new ones are merged in.
     */
    event.create("kubejs:wyrm", attribute => {
        attribute.add("minecraft:generic.max_health", 40)
        attribute.add("minecraft:generic.attack_damage", 8)
    })
})
```

---

## Additional Utility Methods 🧰

You can also inspect what attributes an entity type has during the event:

```js
event.getAttributes('minecraft:spider').forEach(attribute => {
    console.log(`Spider Attribute: ${attribute.descriptionId}`)
})

console.log(event.getAllTypes()) // returns all types included in the event's attribute map
```

---

### 🔎 Behavior Clarification

* The `event.create()` method **does not override** the attribute map.
* Instead, it:

  1. Retrieves the existing `AttributeSupplier` (if present),
  2. Copies its contents into a builder,
  3. Applies your changes, and
  4. Replaces the original with the updated version.

This makes it **safe to use** even on entities that already have attributes — no data is lost unless explicitly changed.

