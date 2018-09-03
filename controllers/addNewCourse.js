const hi = require('../api/handleInsertToSql');

const handleAddCourse = (db) => (req,res) => {
  const { course_name, course_code, semester, year, tasks_tot, midterm_tot, final_tot } = req.body;
  const { day_of_week, period, mathayom_level, account_name } = req.body;
  let teacher_id;
  let course_id;

  if(!(course_name && course_code)){
    return res.status(400).send('invalid input');
  }

  const newCourse = {
    course_name,
    course_code,
    semester,
    year,
    tasks_tot: tasks_tot || 50,
    midterm_tot: midterm_tot || 20,
    final_tot: final_tot || 30
  }

  db('teachers').select('*')
      .where('account_name','=',account_name)
      .then(data => {
        console.log('data returned is...',data[0].teacher_id);
        teacher_id = data[0].teacher_id;
        insertNow();
      })

  const courseSched = (course_id) => {
    return {
      day_of_week,
      period,
      course_id
    }
  }

  const mathayomCourse = (course_id) => {
    return {
      course_id,
      mathayom_level
    }
  }

  const teacherCourse = (course_id, teacher_id) => {
    return {
      course_id,
      teacher_id
    }
  }

  const courses = 'courses';
  const course_sched = 'course_sched';
  const mathayom_course = 'mathayom_course';
  const teacher_course = 'teacher_course';

  const insertNow = () => {
      db.transaction(trx => {
      hi.handleInsert(trx, newCourse, courses)
      .then(data => {
        res.json(data[0]);
        console.log("first data log:....\n",data[0]);
        return hi.handleInsert(trx, courseSched(JSON.parse(data[0].course_id)), course_sched)
          .then(data => {
            console.log(data)
            return hi.handleInsert(trx, mathayomCourse(data[0].course_id), mathayom_course)
              .then(data => {
                console.log(data)
                return hi.handleInsert(trx, teacherCourse(data[0].course_id), teacher_course)
              })
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
  }
}

module.exports = {
  handleAddCourse
}
