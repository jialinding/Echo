var map;
var searchBox
function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 12,
        center: {lat: 37.7752895, lng: -122.4403798}
    });

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

    $(events).each(function () {
        var e = this;
        var latLng = new google.maps.LatLng(this.lat, this.lng);
        var marker = new google.maps.Marker({
            map: map,
            title: e.title,
            position: latLng,
        });
        marker.setMap(map);

        marker.info = new google.maps.InfoWindow({
            content: e.title + ": " + e.description,
        });
        google.maps.event.addListener(marker, 'click', function () {
            marker.info.open(map, marker);
        })
    });

    searchBox = new google.maps.places.Autocomplete(document.getElementById('input-location'));

    google.maps.event.addListener(searchBox, 'place_changed', function () {
        var place = searchBox.getPlace();
        document.getElementById('input-location-lat').value = place.geometry.location.lat();
        document.getElementById('input-location-lng').value = place.geometry.location.lng();
    });

    $('#form-add-event').children().on('keypress', function (e) {
        var code = e.keycode || e.which;
        if (code === 13) {
            e.preventDefault();
        }
    })

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });
}

google.maps.event.addDomListener(window, 'load', initialize);