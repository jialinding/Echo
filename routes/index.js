var express = require('express');
var router = express.Router();
var passport = require('passport');
var Event = require('../models/event.js');
var User = require('../models/user.js');

/* Pages */
router.get('/', isLoggedIn, function(req, res, next) {
    Event.find({}, function (err, events) {
        User.findById(req.user.id, function (err, user) {
            res.render('index', { 
                'events': events,
                'user': user
            });
        })
    });
});

router.get('/userlist', isLoggedIn, function(req, res) {
    User.find({}, function (err, docs) {
        res.render('userlist', { 'users': docs });
    });
});

router.get('/u/:id', isLoggedIn, function(req, res) {
    User.findById(req.params.id, function (err, user) {
        Event.find({ _id: { $in: user.events.created }}, function (err, eventsCreated) {
            Event.find({ _id: { $in: user.events.attended }}, function (err, eventsAttended) {
                res.render('userprofile', {
                    'user': user,
                    'eventsCreated': eventsCreated,
                    'eventsAttended': eventsAttended
                });
            });
        });
    });
});

router.get('/eventslist', isLoggedIn, function(req, res) {
    Event.find({}, function (err, docs) {
        res.render('eventlist', { 'events': docs });
    });
});

router.get('/e/:id', isLoggedIn, function(req, res) {
    Event.findById(req.params.id, function (err, e) {
        User.findById(e.creator, function (err, creator) {
            User.find({ _id: { $in: e.attendees }}, function (err, attendees) {
                res.render('eventprofile', {
                    'event': e,
                    'creator': creator,
                    'attendees': attendees
                });
            });
        }); 
    });
});

/* AJAX endpoints */
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
    newEvent.creator = req.body.user;

    // save the event
    newEvent.save(function(err, newEvent) {
        if (err) {
            // If it failed, return error
            res.send('There was a problem adding the information to the database.');
        }
        else {
            User.findById(req.body.user, function (err, user) {
                user.events.created.push(newEvent._id);
                user.save();
            })
            res.json(newEvent._id);
        }
    });
});

router.delete('/deleteevent/:id', function(req, res) {

    // Get our form values. These rely on the 'name' attributes
    var eventId = req.params.id;

    Event.findById(eventId, function (err, event) {
        User.findById(event.creator, function (err, user) {
            var index = user.events.created.indexOf(eventId);
            user.events.created.splice(index, 1);
            user.save();
        })
    });

    Event.findByIdAndRemove(eventId, function (err) {
        if (err) {
            // If it failed, return error
            res.send('There was a problem adding the information to the database.');
        }
        else {
            // And forward to success page
            res.redirect(303, '/');
        }
    });
});

router.put('/attendevent/:id', function(req, res) {
    var eventId = req.params.id;
    var userId = req.user.id;
    
    User.findById(userId, function (err, user) {
        user.events.attended.push(eventId);
        user.save();
    })

    Event.findById(eventId, function (err, event) {
        event.attendees.push(userId);
        event.save();
        res.json({
            title: event.title,
            location: event.location
        });
    });
});

router.put('/unattendevent/:id', function(req, res) {
    var eventId = req.params.id;
    var userId = req.user.id;

    User.findById(userId, function (err, user) {
        var index = user.events.attended.indexOf(eventId);
        user.events.attended.splice(index, 1);
        user.save();
    })
    
    Event.findById(eventId, function (err, event) {
        var index = event.attendees.indexOf(userId);
        event.attendees.splice(index, 1);
        event.save();
        res.json({
            title: event.title,
            location: event.location
        });
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

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}

module.exports = router;
