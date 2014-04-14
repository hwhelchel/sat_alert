// Satellite
var Satellite = function(config) {
  this.name = config.name.trim();
  this.lat = config.lat;
  this.lon = config.lon;
  this.distance = config.distance;
};

Satellite.prototype = {

  update: function(data){
    this.visible = this.checkVisibility(data.user);
    this.direction = this.updateDirection(data.user);
  },

  checkVisibility: function(user) {
    if(this.isClose(user.distance) && this.isDarkOut(user)){
      return true;
    } else {
      return false;
    }
  },

  updateDirection:function(user){
    var degreeOptions = {
      userLatitude: user.coords.latitude,
      userLongitude: user.coords.longitude
    };
    var degreeDirection = this.getDirectionDegree(degreeOptions);
    var cardinalDirection = this.getCardinalDirection(degreeDirection);
    return cardinalDirection;
  },

  isClose: function(userDistance) {
      return this.distance < userDistance;
  },

  isDarkOut: function(user) {
    var currentTime = user.lastCoordUpdate;
    var times = SunCalc.getTimes(currentTime, user.coords.latitude, user.coords.longitude);
    var nauticalDusk = times.nauticalDusk.getTime();
    var nauticalDawn = times.nauticalDawn.getTime();
    return (currentTime > nauticalDusk || currentTime < nauticalDawn);
  },

  getDirectionDegree: function(opts) {
    var userLatitude = opts.userLatitude.toRad();
    var satLatitude = this.lat.toRad();
    var lonDiff = (this.lon - opts.userLongitude).toRad();
    var y = Math.sin(lonDiff) * Math.cos(this.lat);
    var x = Math.cos(userLatitude) * Math.sin(this.lat) - Math.sin(userLatitude) * Math.cos(this.lat) * Math.cos(lonDiff);
    return (Math.atan2(y, x).toDegree() + 360) % 360;
  },

  getCardinalDirection: function(directionDegree) {
    var directions = [
    [22.5, 'north'],
    [67.5, 'northeast'],
    [112.5, 'east'],
    [157.5, 'southeast'],
    [202.5, 'south'],
    [247.5, 'southwest'],
    [292.5, 'west'],
    [337.5, 'northwest'],
    [360, 'north']
    ];
    for (var i = 0; i < directions.length; i++) {
      var degreeThreshold = directions[i][0];
      var directionString = directions[i][1];
      if (directionDegree < degreeThreshold) {
        return directionString;
      }
    }
  }
};