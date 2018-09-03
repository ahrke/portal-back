const studentList = require('../api/returnStudentList');
const simpleQuery = require('../api/simpleQuery');

const handleReturnStudentCourseList = (db) => (req,res) => {
  const { teacher_id } = req.body;

  const getMyCourseIds = () => {
      return simpleQuery.searchDb(db,'teacher_course', {
        teacher_id : teacher_id
      })
  }

  getMyCourseIds().then(ids => {
    let allCourseStudentListPromise = ids.map(id => {
      return new Promise((res,rej) => {
        //create object to hold course information, and list of students
        let courseList = {};

        //create promise to retrieve course information
        let courseIdPromise = () => {
          return simpleQuery.searchDb(db,'courses',{
            course_id : id.course_id
          })
        }
        courseIdPromise().then(course => {
          courseList = course[0];

          simpleQuery.searchDb(db, 'mathayom_course',{
            course_id : course[0].course_id
          })
          .then(mId => {
            //create promise to retrieve student list
            studentList.returnStudentList(db,mId[0].mathayom_level).then(list => {
              courseList.students = list;

              //return the course list
              res(courseList);
            })
          })
        })
      })
    })

    Promise.all(allCourseStudentListPromise).then(list => {
      let coursesList = list.map(c => c);

      res.json(coursesList);
    })
  })

}

module.exports = {
  handleReturnStudentCourseList
}
