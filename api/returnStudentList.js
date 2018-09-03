const returnStudentList = (db, mathayom_level) => {
  const m = mathayom_level;
  console.log("--!!-- m is...",m)

  return new Promise((res,rej) => {
    db('students').select('*').where({
      mathayom_level : m
    }).returning('*')
    .then(list => {
      let students = [{}];
      Promise.all(list.map(s => {
        let studentHere = s;
        console.log("!!===!!  s is...",s)
        return new Promise((r,j) => {
          db('accounts').select('name_first').where({
            account_id : s.account_id
          })
          .then(s => {
            studentHere.name_first = s[0].name_first;
            return new Promise((rr,jj) => {
                db('student_lesson').select('*').where({
                  student_id: studentHere.account_name
                }).returning('*')
                .then(result => {
                  studentHere.grades = result.map(r => r)
                  r(studentHere);
                })
            })
          })
        })
      }))
      .then(allStudents => {
        students = allStudents.map(s => s)
        res(students)
      })
    })
  })
}

module.exports = {
  returnStudentList
}
