const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Promotions = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter
  .route('/')
  .get((req, res, next) => {
    Promotions.find({})
      .then((promotions) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res) => {
    Promotions.create(req.body)
      .then((promo) => {
        console.log('Promo is created', promo);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      })
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /promotions');
  })
  .delete(authenticate.verifyUser, (req, res) => {
    Promotions.deleteMany({})
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

promoRouter
  .route('/:promoId')
  .get((req, res) => {
    Promotions.findById(req.params.promoId)
      .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported on /promotions/${req.params.promoId}`);
  })
  .put(authenticate.verifyUser, (req, res) => {
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
  })
  .delete(authenticate.verifyUser, (req, res) => {
    Promotions.findByIdAndRemove(req.params.promoId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

module.exports = promoRouter;
