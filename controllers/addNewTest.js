const hi = require('../api/handleInsertToSql');

const handleAddTest = (db) => (req, res) => {
  const { lesson_type, lesson_name, lesson_value } = req.body;
  const { questions } = req.body;
  const { topic_id } = req.body;

  const lessons = "lessons";
  const quest = "questions";
  const responses = "responses";
  const topic_lesson = "topic_lesson";

  let qCount = -1;

  console.log("req.body contains...",lesson_name," ", lesson_type," ", lesson_value);
  if(!(lesson_name && lesson_value)){
    return res.status(400).send('invalid input');
  }

  const lessonToInsert = {
    lesson_type,
    lesson_name,
    lesson_value : lesson_value || 0
  }

  const returnArr = (obj) => {
    return obj.map(data => data);
  }

  const questionsArr = returnArr(questions);
  console.log(questionsArr[1]);

  const questionToInsert = (question, lesson_id) => {
    return {
      question_type: question.question_type,
      question_value: question.question_value,
      question_text: question.question_text,
      question_answer: question.question_answer,
      lesson_id
    }
  }

  const responseToInsert = (response, question_id) => {
    return {
      question_id,
      response_text: response
    }
  }

  db.transaction(trx => {
    hi.handleInsert(trx, lessonToInsert, lessons)
    .then(data => {
      console.log("inserted ",lessonToInsert," into ", lessons);
      const lesson_id = data[0].lesson_id;
      const insertToTopicLesson = hi.handleInsert(trx, {topic_id, lesson_id}, topic_lesson);
      const questionsToPromise = questionsArr.map(question => {
        return hi.handleInsert(trx,questionToInsert(question,lesson_id),quest)
        .then(question => {
          qCount++;
          console.log("insertion return...",question);
          const question_id = question[0].question_id;
          console.log("questionsArr of current (",qCount,") position...",questionsArr[qCount]);
          const responsesToPromise = questionsArr[qCount].responses.map(response =>
            hi.handleInsert(trx, responseToInsert(response, question_id),responses)
          )
          return Promise.all(responsesToPromise);
        })
      })
      return Promise.all([insertToTopicLesson,questionsToPromise]);
    })
    .then(trx.commit)
    .then(res.json(res.body))
    .catch(trx.rollback)
  })
}

module.exports = {
  handleAddTest
}
