migrate((db) => {
  const collection = new Collection({
    "id": "87lauw9xy54wkqt",
    "created": "2023-01-19 17:13:17.817Z",
    "updated": "2023-01-19 17:13:17.817Z",
    "name": "organization",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "wv6eitoi",
        "name": "name",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "tdibgs7r",
        "name": "role",
        "type": "select",
        "required": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "end_user",
            "reseller",
            "admin"
          ]
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
  const collection = dao.findCollectionByNameOrId("87lauw9xy54wkqt");

  return dao.deleteCollection(collection);
})
