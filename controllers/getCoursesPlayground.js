const studentList = require('../api/returnStudentList');
const lessonList = require('../api/returnLessonList');
const simpleQuery = require('../api/simpleQuery');

let db;
let account = {};

const searchDb = (table, where) => {
  return db(table).select('*').where(where).returning('*')
}

const createObj = (obj, childObj, table, where) => {
  return new Promise((resolve,reject) => {
    let objHere = obj;
    let children = new Promise((res,rej) => {
      let childs = simpleQuery.searchDb(db,table, where);
      res(childs);
    })

    children.then(k => {
      objHere[childObj] = k.map(k => k);
      resolve(objHere)
    })
  })
}

const createLesson = (lesson) => {
  return new Promise((resolve,reject) => {
    let lessonHere = lesson;
    let questions = new Promise((resolve,reject) => {
      let questions = simpleQuery.searchDb(db,'questions',{
        lesson_id : lesson.lesson_id
      });
      resolve(questions);
    })

    questions.then(questions => {
      lessonHere.questions = questions.map(q => q);
      resolve(lessonHere)
    })
  })
}

const getStudentCourseIds = (acc, resolve) => {
  let mLvl = acc.mathayom_level;
  return db('mathayom_course').select('*').where({
    mathayom_level : mLvl
  }).then(courses => {
    console.log("we in courses...it is..",courses[0])
    let ids = courses.map(course => {
      return course.course_id
    })
    resolve(ids)
  })
}

const getTeacherCourseIds = (acc, resolve) => {
  return db('teachers').select('*').where({
    account_id : acc.account_id
  }).then(accIn => {
    return db('teacher_course').select('course_id').where({
      teacher_id: accIn[0].teacher_id
    }).then(cIds => {
      let ids = cIds.map(id => id.course_id);
      resolve(ids)
    })
  })
}

const returnCourseIds = (account_name) => {
  return new Promise((resolve, reject) => {
    let ids;
    db('accounts').select('*').where({
      account_name : account_name
    }).then(acc => {
      account = acc[0];
      table = acc[0].role == 1 ? getTeacherCourseIds(acc[0],resolve) : getStudentCourseIds(acc[0],resolve);
      return table;
    })
  })
}

const returnCourseInfo = (courseIds) => {
  let courses;
  let coursesPromise = courseIds.map(course => {
    return new Promise((resolve, reject) => {
      console.log("from new Promise, course is...",course)
      db('courses').select('*').where({
        course_id : course
      }).returning('*')
      .then(course => {
        let courseHere = {
          course_id: course[0].course_id,
          course_name: course[0].course_name,
          course_code: course[0].course_code,
          semester: course[0].semester,
          year: course[0].year,
          tasks_tot: course[0].tasks_tot,
          midterm_tot: course[0].midterm_tot,
          final_tot: course[0].final_tot
        }
        courses = courses ? [...courses,courseHere] : [courseHere];
        resolve(courses)
      })
    })
  })

  return Promise.all(coursesPromise).then(() => {
    return courses;
  })
}

const returnCourses = (courses) => {
  return new Promise((r,rj) => {
    let coursesWithTopics;
    let k;
    let topicsPromise = courses.map(course => {
      return new Promise((re,ej) => {
        let courseHere = course;
        let getCourseTopics = new Promise((resolve, reject) => {
          simpleQuery.searchDb(db,'topic_course',{
            course_id : course.course_id
          })
          .then(result => {
            let topicPromise = result.map(topic => {
              let topicHere;
              return new Promise((res,rej) => {
                searchDb('topics',{
                  topic_id : topic.topic_id
                })
                .then(t => {
                  topicHere = t[0];
                  return new Promise((rL,rjL) => {
                    simpleQuery.searchDb(db,'topic_lesson',{topic_id : t[0].topic_id})
                    .then(ts => {
                      console.log("this is another run at ts",ts)
                      if(ts[0] == undefined){ rL(topicHere)}
                      let lessonsPromise = ts.map(topic => {
                        return new Promise((rtL,rjtL) => {
                          searchDb('lessons',{lesson_id : topic.lesson_id})
                          .then(l => {
                            let lessonHere = l[0];
                            let lessonBuild = createObj(l[0],'questions','questions',{lesson_id : l[0].lesson_id});
                            lessonBuild.then(qs => {
                              let questions = qs.questions.map(q => {
                                return createObj(q,'responses', 'responses', {question_id : q.question_id})
                              })
                              Promise.all(questions).then(qs => {
                                lessonHere.questions = qs.map(r => r);
                                console.log("questions responses: ",qs)
                                if(account.role === 2){
                                  let gradesPromise = createObj(l[0], 'grades', 'student_lesson',{
                                    lesson_id : l[0].lesson_id,
                                    student_id : account.account_name
                                  })
                                  gradesPromise.then(g => {
                                    lessonHere.grades = g.grades[0];
                                    rtL(lessonHere);
                                  })
                                }
                                if(account.role===1){
                                  rtL(lessonHere);
                                }
                              })
                              .catch(err => console.log("error from questions is...",err))
                            })
                          })
                        })
                      })
                      Promise.all(lessonsPromise).then(lessons => {
                        topicHere.lessons = lessons.map(l => l)
                        rL("add lessons complete")
                      })
                      .then((r) => {
                        res(topicHere)
                      })
                    })
                  })
                })
              })
            })
            Promise.all(topicPromise).then(topics => {
              let topicsHere = topics.map(t => t)
              courseHere.topics = topicsHere;
              resolve(courseHere)
            })
          })
        })
        getCourseTopics.then(data => {
          re(data)
        })
      })
    })

    Promise.all(topicsPromise).then(courses => {
      coursesWithTopics = courses.map(course => course)
      console.log("!!--!!_cWithTopics", coursesWithTopics)
      r(coursesWithTopics);
    })
  })
}

const addStudentLessonList = (courses) => {
  return Promise.all(
    courses.map(course => {
      return new Promise((res,rej) => {
        db('mathayom_course').select('*').where({
          course_id: course.course_id
        })
        .then(r => {
          studentList.returnStudentList(db,r[0].mathayom_level).then(list => {
            course.students = list;
          })
          .then(() => {
              lessonList.returnLessonList(db,course.course_id).then(list => {
                course.lessons = list
              })
              .then(() => {
                console.log("course from addStudentLessonList is...\n",course)
                res(course)
              })
          })
        })
      })
    })
  )
}

const getCourses = (database, account_name) => {
  db = database;
  let courseIds = returnCourseIds(account_name);
  return new Promise((res,rej) => {
    courseIds.then(ids => {
      returnCourseInfo(ids).then(coursesHere => {
        //console.log(coursesHere.map(course => course))
        returnCourses(coursesHere).then(list => {
          let listHere = list
          console.log("\n\naccount role is...",account.role)
          if(account.role===1){
            console.log("we in...\n")
            addStudentLessonList(list).then(r => {
              console.log("-!- r is then...",r,"\n\n")
              listHere = r;
              res(listHere);
            })
          } else {
            console.log("the list is...",listHere);
            res(listHere);
          }
        })
      });
    })
  })
}

module.exports = {
  getCourses
}
