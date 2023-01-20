migrate((db) => {
  const collection = new Collection({
    "id": "dwcb2k10zn99qap",
    "created": "2023-01-19 17:09:10.783Z",
    "updated": "2023-01-19 17:09:10.783Z",
    "name": "machines",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ycczahcj",
        "name": "serial",
        "type": "text",
        "required": true,
        "unique": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap");

  return dao.deleteCollection(collection);
})
