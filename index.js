const http = require('http');
const express = require('express');
const knex = require('knex');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const signin = require('./controllers/signin');
const register = require('./controllers/register');
const addNewCourse = require('./controllers/addNewCourse');
const addNewTest = require('./controllers/addNewTest');
const addNewTopic = require('./controllers/addNewTopic');
const returnCourses = require('./controllers/returnCourses');
const updateGrade = require('./controllers/updateGrade');
const returnStudentGrade = require('./controllers/returnStudentGrade');
const returnStudentByCourseList = require('./controllers/returnStudentByCourseList');
const returnLessonList = require('./controllers/returnLessonList');
const getCoursesPlayground = require('./controllers/getCoursesPlayground');

const app = express();

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'david',
    password: '',
    database: 'portal'
  }
})

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req,res) => {
  db.select('*').from('tester')
    .then(data => {
      res.json(data[0])
    })
})

app.post('/signin', signin.handleSignin(db,bcrypt));
app.post('/register', register.handleRegister(db));
app.post('/addNewCourse', addNewCourse.handleAddCourse(db));
app.post('/addNewTest', addNewTest.handleAddTest(db));
app.post('/addNewTopic', addNewTopic.handleAddNewTopic(db));
app.post('/returnCourses', returnCourses.handleReturnCourses(db));
app.post('/updateGrade', updateGrade.handleUpdateGrade(db));
app.post('/getStudentCourseList', returnStudentByCourseList.handleReturnStudentCourseList(db));
app.post('/getLessonList', returnLessonList.handleReturnLessonList(db));
//app.post('/getCoursesPlayground', getCoursesPlayground.getCourses(db));

app.listen(3000);
