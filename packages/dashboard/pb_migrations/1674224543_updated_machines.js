migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap")

  collection.listRule = "(@request.auth.organization.role = \"admin\" && name != \"\") ||(@request.auth.organization.role = \"reseller\" && @request.auth.organization.id = sold_by.id) || (@request.auth.organization = \"end_user\" && @request.auth.organization.id = parent_organization.id)"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("dwcb2k10zn99qap")

  collection.listRule = null

  return dao.saveCollection(collection)
})
