const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite === null) {
          return Favorites.create({
            user: req.user._id,
            dishes: req.body,
          }).then((newFavorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(newFavorite);
          });
        }

        for (let newDish of req.body) {
          if (favorite.dishes.indexOf(newDish) === -1) {
            favorite.dishes.push(newDish);
          }
        }

        favorite.save().then((updatedFavorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(updatedFavorite);
        });
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET operation is not supported on /favorites/${req.params.dishId}`);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite === null) {
          return Favorites.create({
            user: req.user._id,
            dishes: [{ _id: req.params.dishId }],
          }).then((newFavorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(newFavorite);
          });
        }

        const dishIndex = favorite.dishes.indexOf(req.params.dishId);
        if (dishIndex !== -1) {
          const err = new Error(`Dish ${req.params.dishId} is already favorite`);
          err.status = 404;
          return next(err);
        }

        favorite.dishes.push({ _id: req.params.dishId });
        favorite.save().then((updatedFavorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(updatedFavorite);
        });
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation is not supported on /favorites/${req.params.dishId}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite === null) {
          const err = new Error(`Favorite ${req.params.dishId} was not found`);
          err.status = 404;
          return next(err);
        }

        const dishIndex = favorite.dishes.indexOf(req.params.dishId);
        if (dishIndex === -1) {
          const err = new Error(`Dish ${req.params.dishId} is not favorite`);
          err.status = 404;
          return next(err);
        }

        favorite.dishes.splice(dishIndex, 1);
        favorite.save().then((updatedFavorite) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(updatedFavorite);
        });
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
