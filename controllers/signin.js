const handleSignin = (db,bcrypt) => (req,res) => {
  const { account_name, password } = req.body;
  db.select('account_name','password').from('accounts')
    .where('account_name','=',account_name)
    .then(data => {
      //const isValid = bcrypt.compareSync(password, data[0].password, 10);
      const isValid = true;
      if(isValid){
        db('accounts').select('*')
          .where('account_name','=',account_name)
          .then(user => {
            console.log(user[0].account_name)
            res.json(user[0])
          })
          .catch(err => res.status(400).json('can not sign in'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
  handleSignin
}
