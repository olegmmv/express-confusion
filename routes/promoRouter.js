const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Promotions = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Promotions.find({})
      .then((promotions) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.create(req.body)
        .then((promo) => {
          console.log('Promo is created', promo);

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promo);
        })
        .catch((err) => next(err));
    }
  )
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /promotions');
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.deleteMany({})
        .then((response) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

promoRouter
  .route('/:promoId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported on /promotions/${req.params.promoId}`);
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.findByIdAndUpdate(
        req.params.promoId,
        {
          $set: req.body,
        },
        { new: true }
      )
        .then((promo) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promo);
        })
        .catch((err) => next(err));
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.findByIdAndRemove(req.params.promoId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

module.exports = promoRouter;
