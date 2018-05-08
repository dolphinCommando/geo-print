var map, infoWindow;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.000, lng: -85.000},
    zoom: 4,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DEFAULT,
      position: google.maps.ControlPosition.TOP_LEFT
    }
  });
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      document.getElementById('comment').style.display = 'block';
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      firebase.database().ref('position').set({pos});
      map.setCenter(pos);
	  var marker = new google.maps.Marker({
          position: pos,
          map: map
      });
	  var circle = new google.maps.Circle({
	    strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: pos,
        radius: position.coords.accuracy
	  });
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}
function getCircle(accuracy) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: 'red',
    fillOpacity: .2,
    radius: accuracy,
    strokeColor: 'white',
    strokeWeight: .5
  };
}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

firebase.database().ref().on('child_added', function(snapshot) {
  console.log(JSON.stringify(snapshot.val()));
    /*var pos = {
      lat: snapshot.val().lat,
      lng: snapshot.val().lng
    }
    var clickableMarker = new google.maps.Marker({
      position: pos,
      clickable: true
    });

    clickableMarker.addEventListener('click', function() {
      infoWindow = new google.maps.InfoWindow;
      infoWindow.setPosition(pos);
      infoWindow.setContent(comment);
      infoWindow.open(map);
    });
  */
});

document.getElementById('comment-submit').addEventListener('click', function(event) {
  event.preventDefault();
  var comment = document.getElementById('comment-input').textContent;
    var newComment = firebase.database().ref('comments').push();
    newComment.set({
      comment: comment
    });
});




