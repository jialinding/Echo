// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var eventSchema = mongoose.Schema({

    title: String,
    location: String,
    description: String,
    lat: Number,
    lng: Number,
    creator: String,
    attendees: [String]

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Event', eventSchema);