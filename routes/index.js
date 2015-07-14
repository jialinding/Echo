var express = require('express');
var router = express.Router();
var passport = require('passport');
var Event = require('../models/event.js');

/* GET home page. */
router.get('/', function(req, res, next) {
    Event.find({}, function (err, docs) {
        res.render('index', { 'events': docs });
    });
});

router.post('/addevent', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the 'name' attributes
    var eventTitle = req.body.title;
    var eventLocation = req.body.location;
    var eventDescription = req.body.description;
    var eventLat = req.body.lat;
    var eventLng = req.body.lng;

    var newEvent = new Event();

    newEvent.title = eventTitle;
    newEvent.location = eventLocation;
    newEvent.description = eventDescription;
    newEvent.lat = eventLat;
    newEvent.lng = eventLng;

    // save the event
    newEvent.save(function(err) {
        if (err) {
            // If it failed, return error
            res.send('There was a problem adding the information to the database.');
        }
        else {
            // And forward to success page
            res.redirect('/');
        }
    });
});

router.get('/deleteevent/:id', function(req, res) {

    // Get our form values. These rely on the 'name' attributes
    var eventId = req.params.id;

    Event.find({ '_id': eventId }).remove(function (err) {
        if (err) {
            // If it failed, return error
            res.send('There was a problem adding the information to the database.');
        }
        else {
            // And forward to success page
            res.redirect('/');
        }
    });
});

// =====================================
// SIGNUP ==============================
// =====================================
// show the signup form
router.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup', { message: req.flash('signupMessage') });
});

// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// =====================================
// LOGIN ===============================
// =====================================
// show the login form
router.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login', { message: req.flash('loginMessage') }); 
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// route for facebook authentication and login
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect : '/login'
    })
);

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;
