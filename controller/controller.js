// control functions. will be exported to the login and users routes

// import all models in db namespace
const db = require('../models');

// github search functions

// get user list that are saved in the database back to the client
exports.getUserList = (req, res, next) => {
    return db.User.findAll()
        .then((user) => res.send(JSON.stringify(user)))
        .catch((err) => {
            console.log('error', JSON.stringify(err))
        });
};

// add new user to the database - not exported to the routes
newUser = (req, res) => {
    // database will save user name as its written in github, url link for html link, and the name of the user
    //in lower case for allowing delete as long as that field suitable to the input
    let user = {username: req.body.name, urlLink: req.body.url, nameToLowerCase: req.body.name.toLowerCase()};
    return db.User.create(user)
        .then(() => res.send(JSON.stringify({title: 'SUCCESS!', message: 'User was added to the list'})))
        .catch((err) => {
            console.log('error', JSON.stringify(err));
        });
};

// check if user exist in our list in the database. if yes request new user, else return fail message
exports.saveUser = (req, res, next) => {
    return db.User.findOne({where: {username: req.body.name}})
        .then((users) => {
            if (users) { // if the user exists in the database - do not add it
                res.send(JSON.stringify({title: 'WATCH OUT!', message: 'User already exist in the saved list', reload: false}));
            } else
                return newUser(req, res); // create new user
        })
        .catch((err) => {
            console.log('error', JSON.stringify(err))
        });
};

// delete the user from database if exist there. if not will send fail message
exports.deleteUser = (req, res, next) => {
    if(req.body.name === '') // if an empty input
        return res.send(JSON.stringify({title: 'NO INPUT!', message: 'Please enter a user name', reload: false}));
    return db.User.findOne({where: {nameToLowerCase: req.body.name.trim().toLowerCase()}})
        .then(prod => {
            if (prod) { // if user exists
                prod.destroy();
                res.send(JSON.stringify({title: 'SUCCESS!', message: 'User was deleted successfully', reload: false}));
            }
            else
                res.send(JSON.stringify({title: 'OOPS!', message: 'User is not found in the list', reload: false}));
        })
        .catch((err) => {
            console.log('error', JSON.stringify(err));
        });
};

// login/logout functions

// check user authentication, if user name and password are authenticated, then login. else send failure response to the
// user
exports.checkAuthentication = (req, res, next, user, password) => {
    if(req.body.username === user && req.body.password === password) {
        req.session.isLogged = true;
        return res.redirect('/githubSearch');
    }
    else {
        req.session.isLogged = false;
        req.session.error = true;
        return res.redirect('/login');
    }
};

//login - if the session exists, redirect to github search page
exports.login = (req, res, next) => {
    if (req.session.isLogged)
        return res.redirect('/githubSearch');
    else if (req.session.error) // will be defined if authentication failed
    {
        req.session.error = false; // set error as false for the next time the page reloads (the error will disappear)
        return res.render('login',
            // error message will be rendered back to login form for new authentication
            {
                error: true,
                message: `Authentication failed, 
                please log in again`
            });
    }
    else {// if the session is ended and everything is fine
        req.session.error = false;
        return res.render('login',
            {
                error: false,
                message: ''
            });
    }
};

// checking login session middleware
exports.authenticate = (req, res, next) => {
    if (req.session.isLogged) // if session wes ended
        next();
    else
        res.redirect('/login');
};

// check the session middleware while trying to search for a user from the client side
exports.checkSession = (req, res, next) => {
    if (req.session.isLogged)
        next();
    else
        return res.send(JSON.stringify({
        title: 'SESSION ENDED',
        message: 'Looks like your session was ended. Please log in again',
        reload: true
    }));
};