Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
        var data = {
            url: "http://api.open-notify.org/iss-now.json",
            type: "GET"
        };
    });

function okCallback(data){
    lat = data['iss_position']['latitude'];
    lon = data['iss_position']['longitude'];
    var userCoords = user.getLocation()
    distanceToISS = getDistanceInKilometers(lat, lon, userCoords.latitude, userCoords.longitude);
    if (isClose(distanceToISS)) {
        directionDegree = getDirectionDegree(userCoords.latitude, userCoords.longitude, lat, lon);
        cardinalDirection = getCardinalDirection(directionDegree)
        var message = "Look up space cadet! The ISS is to the" + cardinalDirection
    }
}

function errorCallback(){
    //ignore
}

Number.prototype.toRad = function() {
   return this * Math.PI / 180;
}

Number.prototype.toDegree = function() {
   return this / Math.PI * 180;
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

var minimumDistance = 400 //kilometers
function isClose(distanceToISS){
  return distanceToISS < minimumDistance
}

function getDirectionDegree(lat1, lon1, lat2, lon2){
  lat1 = lat1.toRad()
  lat2 = lat2.toRad()
  var lonDiff = (lon2 - lon1).toRad();
  var y = Math.sin(lonDiff) * Math.cos(lat2)
  var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lonDiff);
  return (Math.atan2(y, x).toDegree() + 360) % 360;
}

function getCardinalDirection(directionDegree){
  if(directionDegree < 22.5){
    return "N"
  } else if (directionDegree < 67.5){
    return "NE"
  } else if (directionDegree < 112.5){
    return "E"
  } else if (directionDegree < 157.5){
    return "SE"
  } else if (directionDegree < 202.5){
    return "S"
  } else if (directionDegree < 247.5){
    return "SW"
  } else if (directionDegree < 292.5){
    return "W"
  } else if (directionDegree < 337.5){
    return "NW"
  } else {
    return "N"
  }
}

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
                    console.log(requestObject);
                    okCallback(response);
                } else {

                    console.log(response);
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