const hi = require('../api/handleInsertToSql');

const enrollStudent = (db) => (req, res) => {
  const { account_name, course_id } = req.body;
  if(!(account_name && course_id)){
    return res.status(400).send('invalid input')
  }

  const enroll = {
    account_name,
    course_id
  }

  
}
