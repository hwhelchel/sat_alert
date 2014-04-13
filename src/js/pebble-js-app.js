//SUNCALC START
/*
 (c) 2011-2014, Vladimir Agafonkin
 SunCalc is a JavaScript library for calculating sun/mooon position and light phases.
 https://github.com/mourner/suncalc
 */

(function() {
  'use strict';

  // shortcuts for easier to read formulas

  var PI = Math.PI,
    sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad = PI / 180;

  // sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas


  // date/time constants and conversions

  var dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545;

  function toJulian(date) {
    return date.valueOf() / dayMs - 0.5 + J1970;
  }

  function fromJulian(j) {
    return new Date((j + 0.5 - J1970) * dayMs);
  }

  function toDays(date) {
    return toJulian(date) - J2000;
  }


  // general calculations for position

  var e = rad * 23.4397; // obliquity of the Earth

  function rightAscension(l, b) {
    return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l));
  }

  function declination(l, b) {
    return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l));
  }

  function azimuth(H, phi, dec) {
    return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi));
  }

  function altitude(H, phi, dec) {
    return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H));
  }

  function siderealTime(d, lw) {
    return rad * (280.16 + 360.9856235 * d) - lw;
  }


  // general sun calculations

  function solarMeanAnomaly(d) {
    return rad * (357.5291 + 0.98560028 * d);
  }

  function eclipticLongitude(M) {

    var C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
      P = rad * 102.9372; // perihelion of the Earth

    return M + C + P + PI;
  }

  function sunCoords(d) {

    var M = solarMeanAnomaly(d),
      L = eclipticLongitude(M);

    return {
      dec: declination(L, 0),
      ra: rightAscension(L, 0)
    };
  }


  var SunCalc = {};


  // calculates sun position for a given date and latitude/longitude

  SunCalc.getPosition = function(date, lat, lng) {

    var lw = rad * -lng,
      phi = rad * lat,
      d = toDays(date),

      c = sunCoords(d),
      H = siderealTime(d, lw) - c.ra;

    return {
      azimuth: azimuth(H, phi, c.dec),
      altitude: altitude(H, phi, c.dec)
    };
  };


  // sun times configuration (angle, morning name, evening name)

  var times = [
    [-0.83, 'sunrise', 'sunset'],
    [-0.3, 'sunriseEnd', 'sunsetStart'],
    [-6, 'dawn', 'dusk'],
    [-12, 'nauticalDawn', 'nauticalDusk'],
    [-18, 'nightEnd', 'night'],
    [6, 'goldenHourEnd', 'goldenHour']
  ];

  // adds a custom time to the times config

  SunCalc.addTime = function(angle, riseName, setName) {
    times.push([angle, riseName, setName]);
  };


  // calculations for sun times

  var J0 = 0.0009;

  function julianCycle(d, lw) {
    return Math.round(d - J0 - lw / (2 * PI));
  }

  function approxTransit(Ht, lw, n) {
    return J0 + (Ht + lw) / (2 * PI) + n;
  }

  function solarTransitJ(ds, M, L) {
    return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L);
  }

  function hourAngle(h, phi, d) {
    return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d)));
  }


  // calculates sun times for a given date and latitude/longitude

  SunCalc.getTimes = function(date, lat, lng) {

    var lw = rad * -lng,
      phi = rad * lat,
      d = toDays(date),

      n = julianCycle(d, lw),
      ds = approxTransit(0, lw, n),

      M = solarMeanAnomaly(ds),
      L = eclipticLongitude(M),
      dec = declination(L, 0),

      Jnoon = solarTransitJ(ds, M, L);


    // returns set time for the given sun altitude
    function getSetJ(h) {
      var w = hourAngle(h, phi, dec),
        a = approxTransit(w, lw, n);
      return solarTransitJ(a, M, L);
    }

    var result = {
      solarNoon: fromJulian(Jnoon),
      nadir: fromJulian(Jnoon - 0.5)
    };

    var i, len, time, Jset, Jrise;

    for (i = 0, len = times.length; i < len; i += 1) {
      time = times[i];

      Jset = getSetJ(time[0] * rad);
      Jrise = Jnoon - (Jset - Jnoon);

      result[time[1]] = fromJulian(Jrise);
      result[time[2]] = fromJulian(Jset);
    }

    return result;
  };

  // export as AMD module / Node module / browser variable
  if (typeof define === 'function' && define.amd) define(SunCalc);
  else if (typeof module !== 'undefined') module.exports = SunCalc;
  else window.SunCalc = SunCalc;

}());
//SUNCALC END

// Ajax module to query the APIs
Ajax = (function() {
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
        var response = JSON.parse(requestObject.responseText);
        if (requestObject.status == 200) {
          okCallback(response);
        } else {
          errorCallback(response);
        }
      }
    };
    requestObject.send();
  };

  return {
    request: function(data, okCallback, errorCallback) {
      _request(data, okCallback, errorCallback);
    }
  };
}());

var SpaceObject = function() {
  var minimumDistance;
};

SpaceObject.prototype = {

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

  isClose: function(distanceToObject) {
    if (this.minimumDistance) {
      return distanceToObject < this.minimumDistance;
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

var ISS = function(config) {
  this.user = config.user;
  this.minimumDistance = 400;
};

ISS.prototype = new SpaceObject();

ISS.prototype.okCallback = function(data) {
  this.lat = data['iss_position']['latitude'];
  this.lon = data['iss_position']['longitude'];
  this.user.getLocation(this.treatCoords.bind(this));
},

ISS.prototype.treatCoords = function(userCoords) {
  this.distanceToObject = this.getDistanceInKilometers(
    this.lat,
    this.lon,
    userCoords.latitude,
    userCoords.longitude
  );
  if (this.isClose(this.distanceToObject)) {
    var directionDegree = this.getDirectionDegree(
      userCoords.latitude,
      userCoords.longitude,
      this.lat,
      this.lon);
    var cardinalDirection = this.getCardinalDirection(directionDegree);
    this.user.setIss({
      visible: true,
      direction: cardinalDirection
    });
  } else {
    this.user.setIss({
      visible: false
    });
  }
};

ISS.prototype.errorCallback = function() {
  //not used at the moment
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
    iss: {
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

    var title = messages.visibility[isVisible]["title"]();
    var text = messages.visibility[isVisible]["text"](direction, darkOut);
    Pebble.sendAppMessage({
      0: text
    });
  }
};


// The user model that handles self localisation, and notifications
var User = function(opts) {
  this.lastCoordUpdate = null;
  this.iss = {
    visible: null,
    direction: null
  };
  this.view = opts.view;
  this.coords = {};
  this.darkOut = false;
};

User.prototype = {
  getLocation: function(callback) {
    if (this.staleCoordinates()) {
      var self = this;
      navigator.geolocation.getCurrentPosition(function(position) {
        self.foundCoordinates(position);
        callback(self.coords);
      });
    } else {
      callback(this.coords);
    }
  },

  foundCoordinates: function(position) {
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

  setIss: function(iss) {
    if (this.iss.visible != iss.visible || this.iss.direction != iss.direction) {
      this.iss.visible = iss.visible;
      this.iss.direction = iss.direction;
      this.iss.darkOut = this.isDarkOut();
      this.view.notify("ISS", this.iss.visible, this.iss.direction, this.iss.darkOut);
    }
  },

  isDarkOut: function() {
    var currentTime = this.lastCoordUpdate;
    var times = SunCalc.getTimes(currentTime, this.coords.latitude, this.coords.longitude);
    var nauticalDusk = times.nauticalDusk.getTime();
    var nauticalDawn = times.nauticalDawn.getTime();
    return (currentTime > nauticalDusk || currentTime < nauticalDawn);
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
    SatAlert.iss = new ISS({
      user: SatAlert.user
    });
  });

Pebble.addEventListener("appmessage", function(e) {
  var data = {
    url: 'http://api.open-notify.org/iss-now.json'
  };
  var okCallback = SatAlert.iss.okCallback.bind(SatAlert.iss);
  var errorCallback = SatAlert.iss.errorCallback.bind(SatAlert.iss);
  Ajax.request(data, okCallback, errorCallback);
});