const simpleQuery = require('./simpleQuery');

const returnLessonList = (db,course_id) => {
  let lessonList = [];

  return new Promise((res,rej) => {
    simpleQuery.searchDb(db, 'topic_course', {
      course_id: course_id
    })
    .then(ct => {
      Promise.all(
        ct.map(t => {
          return new Promise((rr,jj) => {
            simpleQuery.searchDb(db, 'topic_lesson', {
              topic_id: t.topic_id
            })
            .then(lessons => {
              Promise.all(
                lessons.map(l => {
                  return new Promise((r,j) => {
                    simpleQuery.searchDb(db, 'lessons', {
                      lesson_id: l.lesson_id
                    })
                    .then(lHere => {
                      r(lHere[0])
                    })
                  })
                })
              )
              .then(lList => {
                if(lList.length==0){
                  rr(console.log("\n\nlList.length is 0..."))
                }
                else {
                  let l = lessonList;
                    console.log("\n\nlList is...",lList,"\n")
                  lList.forEach(ll => {
                    console.log("\n\nll is...",ll,"\n")
                    l.push(ll)
                  })
                  console.log("\nl from lHere is...",l,"\n");
                  rr(l)
                }
              })
            })
          })
        })
      )
      .then(lists => {
        console.log("lessonList is...",lessonList);
        res(lessonList);
      })
    })
  })
}

module.exports = {
  returnLessonList
}
