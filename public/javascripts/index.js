var map;
var eventMarkers;
var searchBox;

function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: {lat: 37.7752895, lng: -122.4403798}
    });

    initializeGeolocationMarker();

    eventMarkers = {};
    initializeEventMarkers();

    initializeSearchBox();

    $('#form-add-event').children().on('keypress', function (e) {
        var code = e.keycode || e.which;
        if (code === 13) {
            e.preventDefault();
        }
    })
}

function initializeGeolocationMarker() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(pos);

            var marker = new google.maps.Marker({
                map: map,
                position: pos,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: 'blue',
                    fillOpacity: 1,
                    scale: 4,
                    strokeWeight: 0,
                }
            });

            marker.setMap(map);
        });
    }
}

function initializeEventMarkers() {
    $(events).each(function () {
        if (this.creator === user._id) {
            addEventMarker(this.title, this.description, this.lat, this.lng, this._id, 'blue');
        } else if (this.attendees.indexOf(user._id) > -1) {
            addEventMarker(this.title, this.description, this.lat, this.lng, this._id, 'green');
        } else {
            addEventMarker(this.title, this.description, this.lat, this.lng, this._id, 'yellow');
        }
    });
}

function initializeSearchBox() {
    searchBox = new google.maps.places.Autocomplete(document.getElementById('input-location'));

    google.maps.event.addListener(searchBox, 'place_changed', function () {
        var place = searchBox.getPlace();
        document.getElementById('input-location-lat').value = place.geometry.location.lat();
        document.getElementById('input-location-lng').value = place.geometry.location.lng();
    });

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });
}

function addEventMarker(title, description, lat, lng, id, color) {
    var latLng = new google.maps.LatLng(lat, lng);
    var marker = new google.maps.Marker({
        map: map,
        title: title,
        position: latLng,
        icon: 'http://maps.google.com/mapfiles/ms/icons/' + color + '-dot.png',
    });
    marker.setMap(map);
    eventMarkers[id] = marker;

    var infoWindowContent = '<h4><a href="/e/' + id + '">' + title + '</a></h4>' + description;
    marker.info = new google.maps.InfoWindow({
        content: infoWindowContent,
    });
    google.maps.event.addListener(marker, 'click', function () {
        marker.info.open(map, marker);
    })
}

function updateEventMarker(id, color) {
    var marker = eventMarkers[id];
    marker.setIcon('http://maps.google.com/mapfiles/ms/icons/' + color + '-dot.png');
}

function removeEventMarker(id) {
    eventMarkers[id].setMap(null);
    delete eventMarkers[id];
}

google.maps.event.addDomListener(window, 'load', initialize);

function initalizeTables() {
    $(events).each(function () {
        if (user.events.created.indexOf(this._id) > -1) {
            addToEventsCreated(this.title, this.location, this._id);
        } else if (user.events.attended.indexOf(this._id) > -1) {
            addToEventsAttending(this.title, this.location, this._id);
        } else {
            addToEventsAvailable(this.title, this.location, this._id);
        }
    })
}

function addToEventsCreated(title, location, id) {
    $('#table-events-created tbody').append('<tr><td>' + title + '</td><td>' + location +
        '</td><td>' + '<a href="#" data-id=' + id + ' class="delete-event">Delete</a></td></tr>');
}

function removeFromEventsCreated(id) {
    $('#table-events-created a[data-id="' + id + '"]').closest('tr').remove();
}

function addToEventsAttending(title, location, id) {
    $('#table-events-attending tbody').append('<tr><td>' + title + '</td><td>' + location +
        '</td><td>' + '<a href="#" data-id=' + id + ' class="unattend-event">Unattend</a></td></tr>');
}

function removeFromEventsAttending(id) {
    $('#table-events-attending a[data-id="' + id + '"]').closest('tr').remove();
}

function addToEventsAvailable(title, location, id) {
    $('#table-events-available tbody').append('<tr><td>' + title + '</td><td>' + location +
        '</td><td>' + '<a href="#" data-id=' + id + ' class="attend-event">Attend</a></td></tr>');
}

function removeFromEventsAvailable(id) {
    $('#table-events-available a[data-id="' + id + '"]').closest('tr').remove();
}

function addEvent(e) {
    e.preventDefault();

    var title = $('#input-title').val();
    var location = $('#input-location').val();
    var description = $('#input-description').val();
    var lat = $('#input-location-lat').val();
    var lng = $('#input-location-lng').val();

    $.ajax({
        type: 'POST',
        url: '/addevent',
        data: {
            title: title,
            location: location,
            description: description,
            lat: lat,
            lng: lng,
            user: user._id
        },
        success: function (res) {
            addEventMarker(title, description, lat, lng, res, 'blue');
            addToEventsCreated(title, location, res);
        }
    });
}

function deleteEvent(e) {
    e.preventDefault();
    var id = $(e.target).attr('data-id');
    $.ajax({
        type: 'DELETE',
        url: '/deleteevent/' + id,
        complete: function () {
            removeEventMarker(id);
            removeFromEventsCreated(id);
        }
    });
}

function attendEvent(e) {
    e.preventDefault();

    var id = $(e.target).attr('data-id');
    $.ajax({
        type: 'PUT',
        url: '/attendevent/' + id,
        success: function (data) {
            addToEventsAttending(data.title, data.location, id);
            removeFromEventsAvailable(id);
            updateEventMarker(id, 'green');
        }
    });
}

function unattendEvent(e) {
    e.preventDefault();

    var id = $(e.target).attr('data-id');
    $.ajax({
        type: 'PUT',
        url: '/unattendevent/' + id,
        success: function (data) {
            addToEventsAvailable(data.title, data.location, id);
            removeFromEventsAttending(id);
            updateEventMarker(id, 'yellow');
        }
    });
}

$(document).ready(function() {
    initalizeTables();
    $('#form-add-event').on('submit', addEvent);
    $(document).on('click', '.delete-event', deleteEvent);
    $(document).on('click', '.attend-event', attendEvent);
    $(document).on('click', '.unattend-event', unattendEvent);
});