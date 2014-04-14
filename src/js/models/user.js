// The user model that handles self localisation, and notifications
var User = function() {
  this.lastCoordUpdate = null;
  this.coords = {};
  this.darkOut = false;
  this.distance = 1000; //distance user can see in km
};

User.prototype = {
  getLocation: function(satCoords) {
    if (this.staleCoordinates()) {
      var self = this;
      navigator.geolocation.getCurrentPosition(
      function(position) {
        self.findCoordinates(position);
      });
    }
  },

  findCoordinates: function(position) {
    this.lastCoordUpdate = position.timestamp;
    this.coords = {
      'latitude': position.coords.latitude,
      'longitude': position.coords.longitude,
      'altitude': position.coords.altitude
    };
  },

  staleCoordinates: function() {
    var now = new Date().getTime();
    return (now - this.lastCoordUpdate > 30000); //five minutes
  }
};