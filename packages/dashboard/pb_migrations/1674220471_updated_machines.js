migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wvd5yuxt",
    "name": "balenaSerial",
    "type": "text",
    "required": true,
    "unique": true,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap")

  // remove
  collection.schema.removeField("wvd5yuxt")

  return dao.saveCollection(collection)
})
