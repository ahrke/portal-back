const hi = require('../api/handleInsertToSql');

const handleUpdateGrade = (db) => (req, res) => {
  const { lesson_id, student_id, grade } = req.body;

  const sl = 'student_lesson';

  const gradeToInsert = {
    lesson_id,
    student_id,
    grade,
    date_completed : 'now()'
  }

  db.transaction(trx => {
    db('student_lesson').select('*').where({
      student_id: student_id,
      lesson_id: lesson_id
    })
      .then(data => {
        return (
          data[0] ? db('student_lesson').select('*').where('slesson_id','=',data[0].slesson_id)
            .update({
              attempts : data[0].attempts + 1,
              grade : grade
            }).returning('*')
            : hi.handleInsert(trx, gradeToInsert, sl)
                .then(data => {
                  return db('student_lesson').select('*').where('slesson_id','=',data[0].slesson_id)
                    .increment('attempts',1).returning('*')
                  })
          )
        })
      .then(returned => {
        res.json(returned)
        console.log("returned data after addGrade is...",returned)
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })

/*
  db.transaction(trx => {
    hi.handleInsert(trx, gradeToInsert, sl)
      .then(data => {
        return db('student_lesson').select('*').where('slesson_id','=',data[0].slesson_id)
          .set('attempts','=','attempts + 1').returning('*')
      })
      .then(returned => console.log("returned data after addGrade is...",returned))
  })
*/
}

module.exports = {
  handleUpdateGrade
}
