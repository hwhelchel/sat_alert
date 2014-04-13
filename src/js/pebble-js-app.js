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
        if (directionDegree < 22.5) {
            return "North";
        } else if (directionDegree < 67.5) {
            return "North East";
        } else if (directionDegree < 112.5) {
            return "East";
        } else if (directionDegree < 157.5) {
            return "South East";
        } else if (directionDegree < 202.5) {
            return "South";
        } else if (directionDegree < 247.5) {
            return "South West";
        } else if (directionDegree < 292.5) {
            return "West";
        } else if (directionDegree < 337.5) {
            return "North West";
        } else {
            return "North";
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

}

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
                    "text": function(direction) {
                        return "ISS in the " + direction + "! Tweet at the @NASA_Astronauts!";
                    }
                },
                "false": {
                    "title": function() {
                        return "It's gone!";
                    },
                    "text": function() {
                        return "The ISS is no longer visible around you!";
                    }
                }
            }
        }
    };
};

View.prototype = {
    notify: function(object, isVisible, direction) {
        object = object.toLowerCase();
        isVisible = isVisible.toString();
        var messages = this.messages[object];

        var title = messages.visibility[isVisible]["title"]();
        var text = messages.visibility[isVisible]["text"](direction);
        Pebble.showSimpleNotificationOnPebble(title, text);
    }
};


// The user model that handles self localisation, and notifications
var User = function(opts) {
    this.lastCoordUpdate = null;
    this.iss = {
        visible: false,
        direction: null
    };
    this.view = opts.view;
    this.coords = {};
};

User.prototype = {
    getLocation: function(callback) {
        if (this.staleCoordinates()) {
            var self = this;
            navigator.geolocation.getCurrentPosition(function(position) {
                self.foundCoordinates(position);
                callback(self.coords);
            })
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
            this.view.notify("ISS", this.iss.visible);
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