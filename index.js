const http = require('http');
const express = require('express');
const knex = require('knex');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const signin = require('./controllers/signin');
const register = require('./controllers/register');

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

app.get('/', (req,res) => {
  db.select('*').from('tester')
    .then(data => {
      res.json(data[0])
    })
})

app.post('/signin', signin.handleSignin(db,bcrypt));
app.post('/register', register.handleRegister(db));

app.listen(3000);
