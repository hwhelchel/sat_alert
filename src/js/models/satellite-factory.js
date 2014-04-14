//Satellite Factory
var SatelliteFactory = function(){};

SatelliteFactory.prototype = {

  makeSatellite: function(data){
    var satellites = this.generateSatelliteAttributes(data.satelliteData);
    var closeSatellite = this.findClosestSatellite(satellites, data.user);
    return new Satellite(closeSatellite);
  },

  findClosestSatellite: function(coordinates, user){
    var nearestSatellite = {
      distance: 100000
    };

    for(var sat in coordinates) {
        distance = this.getDistanceInKilometers(coordinates[sat].lat, coordinates[sat].lon, user.coords.latitude, user.coords.longitude);
        if (distance < nearestSatellite.distance) {
          nearestSatellite.name = sat;
          nearestSatellite.distance = distance;
          nearestSatellite.lat = coordinates[sat].lat;
          nearestSatellite.lon = coordinates[sat].lon;
        }
    }
    return nearestSatellite;
  },

  generateSatelliteAttributes: function(data){
    var satellitesWithCoordinates = this.calculateLatitudeAndLongitude(this.readSatelliteInput(data));
    return satellitesWithCoordinates;
  },

  readSatelliteInput: function(data){
    var satellites = {};
    var x = 0;
    for(var i=0; i < data.length; i+=3){
      satellites[x] = {};
      satellites[x].name = data[i];
      satellites[x].tle_line_1 = data[i+1];
      satellites[x].tle_line_2 = data[i+2];
      x += 1;
    }
    return satellites;
  },

  calculateLatitudeAndLongitude: function(satellitesAttributes) {
    var coords = {};
    for (var satellite in satellitesAttributes) {
      if(satellitesAttributes[satellite].tle_line_1){
        coords[satellitesAttributes[satellite].name] = this.getCoordinates(satellitesAttributes[satellite].tle_line_1, satellitesAttributes[satellite].tle_line_2);
      }
    }
    return coords;
  },

  getDistanceInKilometers: function(lat1, lon1, lat2, lon2) {
      var dLat = (lat2 - lat1).toRad();
      var dLon = (lon2 - lon1).toRad();

      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = 6371 * c;
      return d;
  },

  getCoordinates: function(tle_line_1, tle_line_2){
    var satrec = satellite.twoline2satrec(tle_line_1, tle_line_2);
    var date = new Date();
    var position_and_velocity = satellite.propagate(satrec, date.getFullYear(), date.getMonth(), date.getDay(), date.getHours(), date.getMinutes(), date.getSeconds());
    var position_eci = position_and_velocity.position;
    var gmst = satellite.gstime_from_date (date.getFullYear(), date.getMonth(), date.getDay(), date.getHours(), date.getMinutes(), date.getSeconds());
    var position_gd = satellite.eci_to_geodetic (position_eci, gmst);
    var longitude = position_gd.longitude;
    var latitude  = position_gd.latitude;
    var longitude_str = satellite.degrees_long(longitude);
    var latitude_str  = satellite.degrees_lat(latitude);
    var coords = {};
    coords.lon = longitude_str;
    coords.lat = latitude_str;
    return coords;
  }


};