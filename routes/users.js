const express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/user');

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  const { username, password } = req.body;
  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        const err = new Error(`User ${username} already exsists`);
        err.status = 403;
        return next(err);
      }

      return User.create({ username, password });
    })
    .then((user) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({ status: 'Registration Success', user });
    })
    .catch((err) => next(err));
});

router.post('/login', (req, res, next) => {
  if (!req.session.user) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const err = new Error('You are not authenticated');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const [username, password] = auth;

    return User.findOne({ username })
      .then((user) => {
        if (user === null) {
          const err = new Error(`User ${username} doesn't exist`);
          err.status = 403;
          return next(err);
        }

        if (user.password !== password) {
          const err = new Error('Your password is not correct');
          err.status = 403;
          return next(err);
        }

        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated');
      })
      .catch((err) => next(err));
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('You are already authenticated');
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  } else {
    const err = new Error('You are not logged in');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
