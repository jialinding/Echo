var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function (e, docs) {
        res.render('index', { 'events': docs });
    })
});

router.get('/helloworld', function(req, res, next) {
  res.render('helloworld', { title: 'Hello World' });
});

router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            'userlist' : docs
        });
    });
});

router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the 'name' attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        'username' : userName,
        'email' : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send('There was a problem adding the information to the database.');
        }
        else {
            // And forward to success page
            res.redirect('userlist');
        }
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

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        'title' : eventTitle,
        'location' : eventLocation,
        'description': eventDescription,
        'lat': eventLat,
        'lng': eventLng,
    }, function (err, doc) {
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

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the 'name' attributes
    var eventId = req.params.id;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.remove({
        '_id': eventId,
    }, function (err, doc) {
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

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;
