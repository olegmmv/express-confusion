const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');
const { populate } = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter
  .route('/')
  .get((req, res, next) => {
    Dishes.find({})
      .populate('comments.author')
      .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.create(req.body)
      .then((dish) => {
        console.log('Dish is created', dish);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      })
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /dishes');
  })
  .delete(authenticate.verifyUser, (req, res) => {
    Dishes.deleteMany({})
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

dishRouter
  .route('/:dishId')
  .get((req, res) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation is not supported on /dishes/${req.params.dishId}`);
  })
  .put(authenticate.verifyUser, (req, res) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res) => {
    Dishes.findByIdAndRemove(req.params.dishId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

// dish comments
dishRouter
  .route('/:dishId/comments')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        if (dish === null) {
          const err = new Error(`Dish ${req.params.dishId} was not found`);
          err.status = 404;
          return next(err);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish.comments);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish === null) {
          const err = new Error(`Dish ${req.params.dishId} was not found`);
          err.status = 404;
          return next(err);
        }

        req.body.author = req.user._id;
        dish.comments.push(req.body);
        dish.save().then((updatedDish) => {
          Dishes.findById(updatedDish._id)
            .populate('comments.author')
            .then((populatedDish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(populatedDish);
            });
        });
      })
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation is not supported on /dishes/${req.params.dishId}/comments`);
  })
  .delete(authenticate.verifyUser, (req, res) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish === null) {
          const err = new Error(`Dish ${req.params.dishId} was not found`);
          err.status = 404;
          return next(err);
        }

        for (let i = dish.comments.length - 1; i >= 0; i--) {
          dish.comments.id(dish.comments[i]._id).remove();
        }
        dish.save().then((updatedDish) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(updatedDish);
        });
      })
      .catch((err) => next(err));
  });

dishRouter
  .route('/:dishId/comments/:commentId')
  .get((req, res) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        if (dish === null) {
          const err = new Error(`Dish ${req.params.dishId} was not found`);
          err.status = 404;
          return next(err);
        }

        const comment = dish.comments.id(req.params.commentId);
        if (comment === null) {
          const err = new Error(`Comment ${req.params.commentId} was not found`);
          err.status = 404;
          return next(err);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation is not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`
    );
  })
  .put(authenticate.verifyUser, (req, res) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish === null) {
          const err = new Error(`Dish ${req.params.dishId} was not found`);
          err.status = 404;
          return next(err);
        }

        const comment = dish.comments.id(req.params.commentId);
        if (comment === null) {
          const err = new Error(`Comment ${req.params.commentId} was not found`);
          err.status = 404;
          return next(err);
        }

        if (req.body.rating) {
          comment.rating = req.body.rating;
        }
        if (req.body.comment) {
          comment.comment = req.body.comment;
        }
        dish.save().then((updatedDish) => {
          Dishes.findById(updatedDish._id)
            .populate('comments.author')
            .then((populatedDish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(populatedDish);
            });
        });
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish === null) {
          const err = new Error(`Dish ${req.params.dishId} was not found`);
          err.status = 404;
          return next(err);
        }

        const comment = dish.comments.id(req.params.commentId);
        if (comment === null) {
          const err = new Error(`Comment ${req.params.commentId} was not found`);
          err.status = 404;
          return next(err);
        }

        comment.remove();
        dish.save().then((updatedDish) => {
          Dishes.findById(updatedDish._id)
            .populate('comments.author')
            .then((populatedDish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(populatedDish);
            });
        });
      })
      .catch((err) => next(err));
  });

module.exports = dishRouter;
