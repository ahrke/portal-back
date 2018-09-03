let courses = [];
let course_ids;

const getCourseIds = ( db, account_name ) => {
  let account = {};
  let table;
  let account_id;

  return db('accounts').select('*').where('account_name','=',account_name)
    .then(acc => {
      account = acc[0];
      account_id = acc[0].account_id;
      table = account.role == 1 ? 'teachers' : 'students';

      return db(table).select('*').where('account_id','=',account_id)
        .then(accIn => {
          let mLevel = accIn[0].homeroom_of ? accIn[0].homeroom_of : accIn[0].mathayom_level;
          return db('mathayom_course').select('*')
            .where('mathayom_level','=',mLevel)
            .then(courses => {
              course_ids = courses.map((course,i) => {
                return course.course_id;
              })
            })
        })

    })
}


const insertIntoTopic = (obj, topic_id, arr) => {
  obj.forEach((topic,i) => {
    if(topic.topic_id === topic_id){
      obj[i].lessons = arr;
    }
  })
}

const returnCourse = ( db, course_id) => {
    let course = {
    };

    return db('courses').select('*')
      .where('course_id','=',course_id)
      .then(data => {
        course = {
          course_name : data[0].course_name,
          course_code : data[0].course_code,
          course_id : data[0].course_id
        }
      })
      .then(() => {
        return db('topic_course').select('*')
          .where('course_id','=',course_id)
          .then(data => {
            const topicsArr = data.map((topic,i) => {
              return db('topics').select('*')
              .where('topic_id','=',topic.topic_id)
              .then(topic => {
                let topHere = {
                  topic_id: topic[0].topic_id,
                  topic_name: topic[0].topic_name,
                  lessons: {}
                }
                course.topics = !course.topics ? [topHere] : [...course.topics, topHere]
              })
            })
            return Promise.all(topicsArr);
          })
          .then(() => {
            let topicsToUpdate = course.topics.map((topic,i) => {
              let arrToAdd;
              let arrToPromise;
              return db('topic_lesson').select('*')
                .where('topic_id','=',topic.topic_id)
                .then(data => {
                  arrToPromise = data.map((lesson) => {
                    let lessonToAdd;
                    return db('lessons').select('*')
                      .where('lesson_id','=',data[0].lesson_id)
                      .then(lesson => {
                        let questionArr;

                        lessonToAdd = {
                          lesson_id: lesson[0].lesson_id,
                          lesson_name: lesson[0].lesson_name,
                          lesson_type: lesson[0].lesson_type,
                          lesson_value: lesson[0].lesson_value
                        };

                        return db('questions').select('*')
                          .where('lesson_id','=',lesson[0].lesson_id)
                          .then(questions => {
                            let questionsHere;
                            let questionsPromise = questions.map(question => {
                              let j = question;
                              //lessonToAdd.questions = !lessonToAdd.questions ? [question] : ([...lessonToAdd.questions, question]);

                              return db('responses').select('*')
                                .where('question_id','=',question.question_id)
                                .then(responses => {
                                  responses.forEach(response => {
                                    j.responses = !j.responses ? [response] : [...j.responses, response];
                                  })
                                })
                                .then(() => {
                                  questionArr = !questionArr ? [j] : [...questionArr, j];
                                })

                            })
                            return Promise.all(questionsPromise);
                          })
                          .then(() => {
                            lessonToAdd.questions = !lessonToAdd.questions ? [questionArr] : ([...lessonToAdd.questions, questionArr]);
                          })
                      })
                      .then(() => {
                        arrToAdd = !arrToAdd ? [lessonToAdd] : ([...arrToAdd, lessonToAdd]);
                      })
                  })
                  return Promise.all(arrToPromise);
                })
                .then(() => {
                  insertIntoTopic(course.topics, topic.topic_id, arrToAdd)
                })
            })
            return Promise.all(topicsToUpdate);
          })
          .then(() => {
            courses = !courses ? [course] : [...courses, course];
          })
          .catch(err => {
            courses = !courses ? [course] : [...courses, course];
            console.log("the issue is...",err)
          })
      })
      .catch(err => {
        console.log("err obtained from inside getCourse is...", err);
      })

}

const returnCourses = (res, db, course_ids) => {
  return course_ids.map(course_id => {
    return returnCourse(db,course_id);
  })
}

const handleReturnCourses = (db) => (req, res) => {
  const { account_name } = req.body;
  //course_ids = [...course_id];
  getCourseIds(db,account_name).then(() => {
    Promise.all(returnCourses(res, db, course_ids))
      .then(() => {
        res.json(courses);
      })
  })
  //Promise.all([getCourseIds(db,account_name),(() => console.log("....++++...course_ids is...",course_ids)),returnCourses(res,db,course_ids)]).then(() => {
  //  res.json(courses);
  //})

}

module.exports = {
  handleReturnCourses
}
