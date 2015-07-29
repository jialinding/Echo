conn = new Mongo();
db = conn.getDB('Echo');
var eventIds = db.events.find({}, { _id: 1 }).map(function (item) {
	return item._id.valueOf();
});

db.users.find({}).forEach(function (user) {
	var eventsCreated = [];
	var eventsAttended = [];
	if (user.events.created) {
		eventsCreated = user.events.created.filter(function (eventId) {
			return eventIds.indexOf(eventId) > -1;
		});
	}
	if (user.events.attended) {
		eventsAttended = user.events.attended.filter(function (eventId) {
			return eventIds.indexOf(eventId) > -1;
		});
	}
	db.users.update(
		{ _id: user._id },
		{ $set: 
			{
				events:
					{
						created: eventsCreated,
						attended: eventsAttended
					}
			}
		},
		{ upsert: true }
	);
});