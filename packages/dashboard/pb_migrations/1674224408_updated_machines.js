migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap")

  collection.listRule = "(@request.auth.organization.role = \"reseller\" && @request.auth.organization.id = sold_by) || (@request.auth.organization = \"end_user\" && @request.auth.organization.id = parent_organization) || (@request.auth.organization.role = \"admin\" && name != \"\")"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap")

  collection.listRule = null

  return dao.saveCollection(collection)
})
