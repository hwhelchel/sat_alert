// Ajax module to query the APIs
Ajax = (function(satellite) {
  var requestObject = new XMLHttpRequest();
  var _formatData = function(data) {
    data.type = data.type || "GET";
    return data;
};

var _request = function(data, okCallback, errorCallback) {
    data = _formatData(data);
    requestObject.open(data.type, data.url, true);
    requestObject.onreadystatechange = function(e) {
      if (requestObject.readyState == 4) {
        var tleArray = requestObject.responseText.split('\n');
        var spaceStations = _createSpaceStations(tleArray);
        var satellites = _createCoordinates(spaceStations);
        if (requestObject.status == 200) {
          okCallback(satellites);
      }
  }
};
requestObject.send();
};

var _createSpaceStations = function(tleArray){
    var spaceStations = {};
    var x = 0;
    for(var i=0; i < tleArray.length; i+=3){
      spaceStations[x] = {};
      spaceStations[x].name = tleArray[i];
      spaceStations[x].tle_line_1 = tleArray[i+1];
      spaceStations[x].tle_line_2 = tleArray[i+2];
      x += 1;
  }
  return spaceStations;
};

var _createCoordinates = function(spaceStations) {
    var coordinates = {};
    for (var station in spaceStations) {
      if(spaceStations[station].tle_line_1){
        coordinates[spaceStations[station].name] = getCoordinates(spaceStations[station].tle_line_1, spaceStations[station].tle_line_2);
    }
}
return coordinates;
};

var getCoordinates = function(tle_line_1, tle_line_2){
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
};


return {
    request: function(data, okCallback, errorCallback) {
      _request(data, okCallback, errorCallback);
  }
};
}(satellite));

var SatelliteFactory = function(config){
  this.user = config.user;
};

SatelliteFactory.prototype = {

  okCallback: function(coordinates){
    this.user.getLocation(this.findClosest.bind(this),coordinates);
},

errorCallback: function(coordinates){
    // does nothing
},

findClosest: function(coordinates, user){
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
var satellite = new SpaceObject(nearestSatellite, user);
satellite.setVisibility(user.coords);
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
}
};

var SpaceObject = function(config, user) {
  this.name = config.name;
  this.lat = config.lat;
  this.lon = config.lon;
  this.user = user;
  this.minimumDistance = 16378;
  this.distance = config.distance;
};

SpaceObject.prototype = {

  setVisibility: function(userCoords) {
    if (this.isClose(this.distance)) {
      var directionDegree = this.getDirectionDegree(
        userCoords.latitude,
        userCoords.longitude,
        this.lat,
        this.lon);
      var cardinalDirection = this.getCardinalDirection(directionDegree);
      this.user.setSpaceObjectProperties({
        name: this.name,
        visible: true,
        direction: cardinalDirection
    });
  } else {
      this.user.setSpaceObjectProperties({
        name: this.name,
        visible: false
    });
  }

},

isClose: function(distance) {
    if (this.minimumDistance) {
      return this.distance < this.minimumDistance;
  } else {
      return false;
  }
},

getDirectionDegree: function(lat1, lon1, lat2, lon2) {
    lat1 = lat1.toRad();
    lat2 = lat2.toRad();
    var lonDiff = (lon2 - lon1).toRad();
    var y = Math.sin(lonDiff) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDiff);
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

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

Number.prototype.toDegree = function() {
  return this / Math.PI * 180;
};


// View, the interface for the messages
var View = function() {
  this.messages = {
    spaceObject: {
      visibility: {
        "true": {
          "title": function() {
            return "Look up!";
          },
          "text": function(direction, darkOut) {
              if (darkOut) {
                return "You might be able to see the ISS to the " + direction + "! Tweet to @NASA_Astronauts!";
            } else {
                return "ISS in the " + direction + "! Tweet to @NASA_Astronauts!";
            }
          }
        },
        "false": {
          "title": function() {
            return "It's gone!";
          },
          "text": function() {
              return "Sorry, the ISS is not visible around you!";
          }
        }
      }
    }
  };
};

View.prototype = {
  notify: function(object, isVisible, direction, darkOut) {
    object = object.toLowerCase();
    isVisible = isVisible.toString();
    var messages = this.messages[object];

    var title = messages.visibility[isVisible].title();
    var text = messages.visibility[isVisible].text(direction, darkOut);
    Pebble.sendAppMessage({
      0: text
  });
}
};


// The user model that handles self localisation, and notifications
var User = function(opts) {
  this.lastCoordUpdate = null;
  this.spaceObject = {
    name: null,
    visible: false,
    direction: null
};
  this.view = opts.view;
  this.coords = {};
  this.darkOut = false;
};

User.prototype = {
  getLocation: function(callback, satCoords) {
    if (this.staleCoordinates()) {
      var self = this;
      navigator.geolocation.getCurrentPosition(function(position) {
        self.findCoordinates(position);
        callback(satCoords, self);
    });
  } else {
      callback(satCoords, this);
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
  },

isDarkOut: function() {
    var currentTime = this.lastCoordUpdate;
    var times = SunCalc.getTimes(currentTime, this.coords.latitude, this.coords.longitude);
    var nauticalDusk = times.nauticalDusk.getTime();
    var nauticalDawn = times.nauticalDawn.getTime();
    return (currentTime > nauticalDusk || currentTime < nauticalDawn);
  },

setSpaceObjectProperties: function(spaceObject) {
    if (this.spaceObject.visible != spaceObject.visible || this.spaceObject.direction != spaceObject.direction) {
        this.spaceObject.visible = spaceObject.visible;
        this.spaceObject.direction = spaceObject.direction;
        this.view.notify(spaceObject);
    }
  }
};


// Global namespacing
SatAlert = {};

// Sets everything in motion
Pebble.addEventListener("ready",
  function(e) {
    SatAlert.view = new View();
    SatAlert.user = new User({
      view: SatAlert.view
  });
    SatAlert.satelliteFactory = new SatelliteFactory({
      user: SatAlert.user
  });
});

Pebble.addEventListener("appmessage", function(e) {
  var data = {
    url: 'http://www.celestrak.com/NORAD/elements/stations.txt'; 
  };
  var okCallback = SatAlert.satelliteFactory.okCallback.bind(SatAlert.satelliteFactory);
  var errorCallback = SatAlert.satelliteFactory.errorCallback.bind(SatAlert.satelliteFactory);
  Ajax.request(data, okCallback, errorCallback);
});
