const getCourses = require("../api/getCourses");

const handleReturnStudentGrade = (db) => (req, res) => {
  const { student_id } = req.body;
  const user = {};
  let gradesToReturn = {};
  let coursesWithGrades = [];


  const getLessonGrade = (db, student_id, lesson_id) => {
    return db('student_lesson').select('*').where({
      student_id: student_id,
      lesson_id: lesson_id
    }).returning('*')
  }

  const coursesHere = new Promise((resolve, reject) => {
    resolve(getCourses.getCourses(db, student_id, user))
  })

  coursesHere.then(userWithCourses => {
    const coursesHere = userWithCourses.courses.map(course => {
      let courseHere = { course_name : course.course_name }
      const topicsHere = course.topics.map(topic => {
        let topicHere = { topic_name: topic.topic_name };
        let lessonsHere;
        let allLessons;
        allLessons = topic.lessons ? topic.lessons.map(lesson => {
          let lessonHere = {
            lesson_name: lesson.lesson_name,
            lesson_id: lesson.lesson_id,
            student_id: student_id,
            grade: 0,
            attempts: 0
           }
          return getLessonGrade(db, student_id, lesson.lesson_id)
            .then(gradeHere => {
              console.log('!!---gradeHere is...',gradeHere[0].grade)
              if(gradeHere[0]){
                lessonHere = {
                  ...lessonHere,
                  grade: gradeHere[0].grade,
                  date_completed: gradeHere[0].date_completed,
                  attempts: gradeHere[0].attempts
                }
              }
              lessonsHere = lessonsHere ?
              [...lessonsHere, lessonHere]
              : [lessonHere];

              console.log('lessonsHere is currently...',lessonsHere)
            })
          })
          : []
        return Promise.all(allLessons)
          .then(() => {
            topicHere = {
              topic_name : topic.topic_name,
              lessons: lessonsHere
            }
            courseHere.topics = !courseHere.topics
              ? [ topicHere ]
              : [...courseHere.topics, topicHere]
          })

      })
      return Promise.all(topicsHere)
      .then(() => {
        coursesWithGrades = !coursesWithGrades
          ? [courseHere]
          : [...coursesWithGrades, courseHere];

        console.log('coursesWithGrades is currently...',coursesWithGrades)
        return true;
      })
    })
    return Promise.all(coursesHere)
  })
    .then(() => {
      return res.json(coursesWithGrades)
    }
  )
}

module.exports = {
  handleReturnStudentGrade
}
