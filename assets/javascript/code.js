var map, infoWindow;
markers = [];
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
      firebase.database().ref('position').set({
        lat: pos.lat,
        lng: pos.lng
      });
      map.setCenter(pos);
	  var marker = new google.maps.Marker({
          position: pos,
          label: '@',
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

firebase.database().ref().on('value', function(snapshot) {
  console.log(JSON.stringify(snapshot.val()));
  var lat = snapshot.child('position').val().lat;
  var lng = snapshot.child('position').val().lng;
  deleteMarkers();
  snapshot.child('comments').forEach(function(childSnapshot) {
    if (!childSnapshot.val().updated) {
      updateCommentCoords(childSnapshot.key, lat, lng);
    }
      var marker = new google.maps.Marker({
        position: {
          lat: childSnapshot.val().lat,
          lng: childSnapshot.val().lng
        },
        title: childSnapshot.val().date,
        map: map,
      });

      var infowindow = new google.maps.InfoWindow({
        content: childSnapshot.val().comment
      });

      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });

      markers.push(marker);

    /*
      infoWindow = new google.maps.InfoWindow;
      infoWindow.setPosition(snapshot.child('position').val());
      infoWindow.setContent(childSnapshot.val().comment);
      infoWindow.open(map);
    */
  });
  displayMarkers();
});

document.getElementById('comment-submit').addEventListener('click', function(event) {
  event.preventDefault();
  var comment = document.forms['comment-form']['comment-text'].value;
  var myDate = new Date();
  var now = `${myDate.getHours()}:${myDate.getHours()} ${myDate.getMonth()}/${myDate.getDate()}/${myDate.getFullYear()}`;
    var newComment = firebase.database().ref('comments').push();
    newComment.set({
      comment: comment,
      lat: '',
      lng: '',
      date: now,
      updated: false
    });
});

function updateCommentCoords(key, lat, lng) {
  firebase.database().ref(`comments/${key}`).update({
    lat: lat,
    lng: lng,
    updated: true
  });
}

function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
} 

function deleteMarkers() {
  setMapOnAll(null);
  markers = [];
}

function displayMarkers() {
  setMapOnAll(map);
}




