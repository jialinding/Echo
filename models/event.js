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
    attendees: [String],
    startTime: String,
    startDatetime: Date,
    expireAt: Date

});

eventSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

eventSchema.pre('remove', function (next) {
	var User = this.model('User');
	var that = this;

	User.findById(this.creator, function (err, user) {
		var index = user.events.created.indexOf(that._id);
		user.events.created.splice(index, 1);
		user.save();
	});

	User.find({ _id: { $in: this.attendees }}, function (err, attendees) {
		attendees.forEach(function (user) {
			var index = user.events.attended.indexOf(that._id);
			user.events.attended.splice(index, 1);
			user.save();
		})
	});

	next();
})

// create the model for users and expose it to our app
module.exports = mongoose.model('Event', eventSchema);