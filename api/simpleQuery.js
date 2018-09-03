const searchDb = (db, table, where) => {
  return new Promise((res,rej) => {
    db(table).select('*').where(where).returning('*')
    .then(list => res(list.map(l => l)))
  })
}

module.exports = {
  searchDb
}
