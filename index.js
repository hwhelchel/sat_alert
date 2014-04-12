var distanceToISS

$(function(){
  setInterval(function(){getDistancetoISS()}, 2000);
  setInterval(function(){displayDistance()}, 2500);
})

function displayDistance(){
  $('#distance').html(distanceToISS);
}

function getDistancetoISS(){
  var lat, lon
  $.getJSON('http://api.open-notify.org/iss-now.json?callback=?', function(data) {
    lat = data['iss_position']['latitude'];
    lon = data['iss_position']['longitude'];
    var userCoords = getUserCoordinates()
    distanceToISS = getDistanceInKilometers(lat, lon, userCoords.lat, userCoords.lon).toFixed(2);
  });
}

function getUserCoordinates(){
  return {
    lat: 37.7083,
    lon: -122.2803
  }
}

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

function getDistanceInKilometers(lat1, lon1, lat2, lon2){
  var dLat = (lat2-lat1).toRad();
  var dLon = (lon2-lon1).toRad();
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = 6371 * c;
  return d;
}

// for use when the site is up

function getRealUserCoordinates() {
  if(navigator.geolocation){             
    navigator.geolocation.getCurrentPosition(geoLocationSuccess, geoLocationError);
  }
}

function geoLocationSuccess(position) {
  var position = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude 
  }
  return position;
}

function geoLocationError() {
  alert('We weren\'t able to get your location.');
}


