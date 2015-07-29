$(document).ready(function() {
	var now = moment();
	var startTime = moment(e.startDatetime);
	var time = startTime.format('LLLL');
	var relativeTime;
	if (moment(startTime).isBefore(now, 'minute')) {
		relativeTime = now.to(startTime);
	} else {
		relativeTime = startTime.from(now);
	}
	$('#start-datetime').text('Time: ' + time + ' -- ' + relativeTime);
})