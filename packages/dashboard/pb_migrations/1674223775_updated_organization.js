migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("87lauw9xy54wkqt")

  collection.listRule = "id=@request.auth.organization.id"
  collection.viewRule = "id=@request.auth.organization.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("87lauw9xy54wkqt")

  collection.listRule = null
  collection.viewRule = null

  return dao.saveCollection(collection)
})
