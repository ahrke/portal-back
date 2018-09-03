// function to handle inserting
const handleInsert = ( trx, toInsert, table ) => {
  return trx.insert(toInsert)
  .into(table)
  .returning("*")
}

module.exports = {
  handleInsert
}
