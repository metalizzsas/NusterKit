migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "tekargmc",
    "name": "sold_by",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "collectionId": "87lauw9xy54wkqt",
      "cascadeDelete": false
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "spn7asxw",
    "name": "parent_organization",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "collectionId": "87lauw9xy54wkqt",
      "cascadeDelete": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap")

  // remove
  collection.schema.removeField("tekargmc")

  // remove
  collection.schema.removeField("spn7asxw")

  return dao.saveCollection(collection)
})
