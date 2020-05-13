var express = require('express');
var router = express.Router();

// import controller functions for out routes
const Controller = require('../controller/controller');

let controlLoginRoute = function () {

// constant authentication fields - user name and password must match this variables.
  const user = "admin";
  const password = "1234";

  /* GET home page. */
  router.get('/', function(req, res, next) {
    if (req.session.isLogged) // if the session not expired
      res.redirect('/githubSearch');
    else
      res.redirect('/login');
  });

  // login
  router.get('/login', function (req, res, next) {
    return Controller.login(req, res, next);
  });

  // authentication
  router.post('/authentication', function (req, res, next) {
    return Controller.checkAuthentication(req, res, next, user, password);
  });

  // router that is triggered by pressing logout button
  router.post('/logout', function (req, res, next) {
    // end the session while setting isLogged as false
    req.session.isLogged = false;
    return res.redirect('/login');
  });

  return router;
};

module.exports = controlLoginRoute();
