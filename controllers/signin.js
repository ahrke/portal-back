const getCourses = require("../api/getCourses");
const getCoursesPlayground = require("./getCoursesPlayground");

const handleSignin = (db,bcrypt) => (req,res) => {
  let user = {};

  const { account_name, password } = req.body;
  console.log('signin called with: ',account_name,' ',password)
  db.select('account_name','password').from('accounts')
    .where('account_name','=',account_name)
    .then(data => {
      //const isValid = bcrypt.compareSync(password, data[0].password, 10);
      const isValid = (password === data[0].password);
      console.log("signIn: checking for valid pass: ",isValid);
      if(isValid){
        return db('accounts').select('*')
          .where('account_name','=',account_name)
          .then(userHere => {
            console.log(userHere[0])
            user = userHere[0];
            let getCourses = new Promise((resolve,reject) => {
              let courses = getCoursesPlayground.getCourses(db,userHere[0].account_name)
              courses.then(c => {
                user.courses = c;
                resolve(user)
              })
            });
            getCourses.then(user => {
              console.log("\n\n\nmade it here...",user);
              return res.json(user);
            })

          })
          .catch(err => res.status(400).json('can not sign in'))
      } else {
        return res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
  handleSignin
}
