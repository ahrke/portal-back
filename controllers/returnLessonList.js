const simpleQuery = require('../api/simpleQuery');

const handleReturnLessonList = (db) => (req, res) => {
  const { course_id } = req.body;
  let lessonList = [{}];

  return new Promise((reso,reje) => {
    simpleQuery.searchDb(db, 'topic_course', {
      course_id: course_id
    })
    .then(ct => {
      let ctPromises = ct.map(t => {
        return new Promise((re,rj) => {
          simpleQuery.searchDb(db, 'topic_lesson', {
            topic_id: t.topic_id
          })
          .then(lessons => {
            let lessonsPromise = lessons.map(l => {
              return new Promise((r,j) => {
                simpleQuery.searchDb(db, 'lessons', {
                  lesson_id: l.lesson_id
                })
                .then(lHere => {
                  r(lHere[0])
                })
              })
            })

            Promise.all(lessonsPromise).then(lessons => {
              re(lessons.map(l => l))
            })
          })
        })
      })

      Promise.all(ctPromises).then(topics => {
        let lessons;
        let top = topics.map(t => {
          t.map(l => {
            lessons = lessons ? [...lessons, l] : [l]
          })
        })
        res.json(lessons)
      })
    })
  })
}

module.exports = {
  handleReturnLessonList
}
