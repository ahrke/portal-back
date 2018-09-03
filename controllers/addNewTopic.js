const hi = require('../api/handleInsertToSql');

const handleAddNewTopic = (db) => (req, res) => {
  const { course_id, topic_name } = req.body;
  const topics = "topics";
  const topic_course = "topic_course";
  let topic_id;

  const topicToInsert = {
    topic_name
  }

  db.transaction(trx => {
    hi.handleInsert(trx, topicToInsert, topics)
    .then(data => {
      topic_id = data[0].topic_id;
      const topicCourseToInsert = {
        topic_id,
        course_id
      }
      return hi.handleInsert(trx, topicCourseToInsert, topic_course)
      .then(data => res.json("successfully added ",topic_name," to topics"))
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
}

module.exports = {
  handleAddNewTopic
}
