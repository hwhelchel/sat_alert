Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
        var data = {
            url: "http://api.open-notify.org/iss-now.json",
            type: "GET"
        };
    });

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

var User = function(opts){
  this.lastCoordUpdate =  null;
  this.iss = {
    visible: false,
    direction: null
  };
  this.view = opts.view;
  this.coords = {};
};

User.prototype = {
  getLocation: function(){
    if(this.staleCoordinates()){
      navigator.geolocation.getCurrentPosition(this.foundCoordinates.bind(this));
    }
    return this.coords;
  },

  foundCoordinates: function(position){
    this.lastCoordUpdate = position.timestamp;
    this.coords = {
      'latitude': position.coords.latitude,
      'longitude': position.coords.longitude,
      'altitude': position.coords.altitude
    };
  },

  staleCoordinates: function(){
    var now = new Date().getTime();
    return (now - this.lastCoordUpdate > 30000); //five minutes
  },

  setiss: function(iss){
    if(this.iss.visible != iss.visible || this.iss.direction != iss.direction){
      this.iss.visible = iss.visible;
      this.iss.direction = iss.direction;
      this.view.notify("ISS", this.iss.visible);
    }
  },
};