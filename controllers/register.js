const handleRegister = (db) => (req,res) => {
  const { account_name, password, name_first, name_last, role } = req.body;
  if(!(account_name && password)){
    return res.status(400).send('invalid input')
  }

// set up main account insertion object
  const mainAccount = {
    account_name,
    password,
    name_first: name_first || 'anonymous',
    name_last: name_last || 'kun'
  }

// create variables to hold insert object data
  let insertData = {
    account_name
  };
  if(role === 'student'){
    insertData.mathayom_level = req.body.mLevel
  } else if(role === 'teacher'){
    insertData.homeroom_of = req.body.hRoom
  }
  console.log(insertData);

  const linkedTable = role+'s';

// insert items into database
  db.transaction(trx => {
    // insert student/teacher first
    handleInsert(trx,insertData,linkedTable)
    // then into main account, returning account
    .then(data => {
      return handleInsert( trx, mainAccount, 'accounts')
        .then(account => res.json(account[0]))
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
}

// function to handle inserting
const handleInsert = ( trx, toInsert, table ) => {
  return trx.insert(toInsert)
  .into(table)
}


module.exports = {
  handleRegister
}
