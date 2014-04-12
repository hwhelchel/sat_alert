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