const express = require('express');
const bodyParser = require('body-parser');

const Leaders = require('../models/leaders');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter
  .route('/')
  .get((req, res, next) => {
    Leaders.find({})
      .then((leaders) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
      })
      .catch((err) => next(err));
  })
  .post((req, res) => {
    Leaders.create(req.body)
      .then((leader) => {
        console.log('Leader is created', leader);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      })
      .catch((err) => next(err));
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /leaders');
  })
  .delete((req, res) => {
    Leaders.deleteMany({})
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

leaderRouter
  .route('/:leaderId')
  .get((req, res) => {
    Leaders.findById(req.params.leaderId)
      .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      })
      .catch((err) => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported on /leaders/${req.params.leaderId}`);
  })
  .put((req, res) => {
    Leaders.findByIdAndUpdate(
      req.params.leaderId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((leader) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(leader);
      })
      .catch((err) => next(err));
  })
  .delete((req, res) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

module.exports = leaderRouter;
