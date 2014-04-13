$(function(){
  setInterval(function(){SatAlert.getDistancetoISS()}, 2000);
  setInterval(function(){SatAlert.displayDistance()}, 2100);
})

// main JS for 

var SatAlert = {
  
  coords: {
    lat: null,
    long: null
  },
  
  displayDistance: function (){
    if (SatAlert.distanceToISS != undefined) {
      $('#distance').html("You are " + SatAlert.distanceToISS + " kilometers from the ISS!");
    }
  },

  getDistancetoISS: function (){
    var lat, lon
    $.getJSON('http://api.open-notify.org/iss-now.json?callback=?', function(data) {
      lat = data['iss_position']['latitude'];
      lon = data['iss_position']['longitude'];
      var userCoords = SatAlert.getRealUserCoordinates()
      SatAlert.distanceToISS = SatAlert.getDistanceInKilometers(lat, lon, SatAlert.coords.lat, SatAlert.coords.lon).toFixed(2);
    });
  },
  
  getRealUserCoordinates: function() {
    navigator.geolocation.getCurrentPosition(function(position) {
      SatAlert.coords.lat = position.coords.latitude;
      SatAlert.coords.lon = position.coords.longitude
    })
  },

  getDistanceInKilometers: function (lat1, lon1, lat2, lon2){
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = 6371 * c;
    return d;
  }
}

// extend Number with toRad function

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}
