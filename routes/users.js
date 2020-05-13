var express = require('express');
var router = express.Router();

// import controller function for out routes
const Controller = require('../controller/controller');

let controlDatabaseRoute = function () {

    // render github search page as long as user past authentication
    router.get('/', Controller.authenticate, function (req, res, next) {
        res.render('index');
    });

    // router that returns the saved list back to the client
    router.get('/list', function(req, res, next) {
        // return users list
        return Controller.getUserList(req, res, next);
    });

    // commit save
    router.put('/save', Controller.checkSession, function(req, res, next) {
        // try to save the user the client requested
        return Controller.saveUser(req, res, next);
    });

    // delete user from the list
    router.delete('/delete', Controller.checkSession, function (req, res, next) {
        // delete existing user
        return Controller.deleteUser(req, res, next);
    });

    // check if the session is not ended to protect the search on the client side
    router.post('/checkSession', Controller.checkSession, function (req, res, next) {
        return res.send(JSON.stringify({title: '', message: '', reload: false}));
    });

    return router;
};

module.exports = controlDatabaseRoute();
