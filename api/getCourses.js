let courses = [];
console.log("courses at beginning is...1.1.1.1.1....",courses);
let course_ids;
let student_id;

/*

    !!!! garbage !!!!!

                        const addGrades = (student_id, lesson) => {
                          let lessonHere = lesson;
                          return db('student_lesson').select('*').where({
                            student_id: student_id,
                            lesson_id: lesson.lesson_id
                          }).returning('*')
                          .then(gradesHere => {
                            if(gradeHere[0]){
                              lessonHere = {
                                ...lessonHere,
                                grade: gradeHere[0].grade,
                                date_completed: gradeHere[0].date_completed,
                                attempts: gradeHere[0].attempts
                              }
                            }
                            return lessonHere;
                          })
                        }


                                                const addQuestions = (questionArr) => {
                                                  let questionArrHere = questionArr;
                                                  const getQuestions = new Promise((resolve,reject) => {
                                                    db('questions').select('*')
                                                    .where('lesson_id','=',lessonToAdd.lesson_id)
                                                    .then(questions => {
                                                      let questionsHere;
                                                      let questionsPromise = questions.map(question => {
                                                        let j = question;
                                                        //lessonToAdd.questions = !lessonToAdd.questions ? [question] : ([...lessonToAdd.questions, question]);

                                                        return db('responses').select('*')
                                                          .where('question_id','=',question.question_id)
                                                          .then(responses => {
                                                            responses.forEach(response => {
                                                              let responseHere = {
                                                                response_text : response.response_text,
                                                                question_id : response.question_id,
                                                                response_id : response.response_id
                                                              }
                                                              console.log("...!!..the response returned here is...",responseHere)
                                                              j.responses = !j.responses ? [responseHere] : [...j.responses, responseHere];
                                                            })
                                                          })
                                                          .then(() => {
                                                            questionArrHere = !questionArrHere ? [j] : [...questionArrHere, j];
                                                              console.log("..!!..questionArrHere...",questionArrHere)
                                                          })

                                                      })
                                                      return Promise.all(questionsPromise);
                                                    })
                                                    return questionArrHere;
                                                  })
                                                }


                                let topics = course.topics.map(topic => {
                                  let topicHere;
                                  createTopic(topic).then(t => {
                                    topicHere = t
                                  })
                                  return topicHere;
                                })

                                let lessons = topic.lessons.map(lesson => {
                                  let lessonHere;
                                  createLesson(lesson).then(l => {
                                    lessonHere = l
                                  })
                                  return lessonHere;
                                })
                        */

const getCourseIds = ( db, account_name ) => {
  let account = {};
  let table;
  let account_id;

  return db('accounts').select('*').where('account_name','=',account_name)
    .then(acc => {
      account = acc[0];
      account_id = acc[0].account_id;
      table = account.role == 1 ? 'teachers' : 'students';

      if(account.rode == 2){
        student_id = acc[0].account_name;
      }

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
                      .where('lesson_id','=',lesson.lesson_id)
                      .then(lesson => {
                        let questionArr;

                        lessonToAdd = {
                          lesson_id: lesson[0].lesson_id,
                          lesson_name: lesson[0].lesson_name,
                          lesson_type: lesson[0].lesson_type,
                          lesson_value: lesson[0].lesson_value
                        };



                        return new Promise((resolve, reject) => resolve(addQuestions(questionArr)))
                      })
                      .then(questionArrReturned => {
                        console.log("!!...!!!..questionArrReturned",questionArrReturned)
                        lessonToAdd.questions = !lessonToAdd.questions ? questionArrReturned : ([...lessonToAdd.questions, questionArrReturned]);
                        console.log("...lessonToAdd is currently...",lessonToAdd)
                      })
                      .then(() => {
                        console.log("finished Promise.all, lessonToAdd is currently...",lessonToAdd)
                        console.log("and the studeint_id is...",student_id)
                        if(student_id){
                          return addGrades(student_id, lessonToAdd)
                            .then(lessonWithGrades => {
                              console.log("lessonWithGrades is.......",lessonWithGrades)
                              lessonToAdd = lessonWithGrades;
                            })
                        }
                      })
                      .then(() => {
                        console.log("lessonToAdd in getCourses",lessonToAdd);
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

const returnCourses = (db, course_ids) => {
  return course_ids.map(course_id => {
    return returnCourse(db,course_id);
  })
}

const getCourses = (db, account_name) => {
  courses = [];
  return getCourseIds(db,account_name).then(() => {
    return Promise.all(returnCourses(db, course_ids))
  })
  .then(() => {
    user.courses = courses;
    return user;
  })
}

module.exports = {
  getCourses
}
