// Controller
var Controller = function(config){
  this.user = config.user;
  this.view = config.view;
  this.ajax = config.ajax;
  this.factory = config.factory;
};

Controller.prototype = {

  success: function(data){
    this.user.getLocation();
    this.satelliteData = {};
    this.satelliteData = data;
    this.satellite = {};
    this.satellite = this.makeSatellite(this);
    this.satellite.update(this);
    this.view.notify(this);
  },

  error: function(){
    // does nothing right now
  },

  getSatelliteData: function(){
    var data = {
      url: 'http://www.celestrak.com/NORAD/elements/stations.txt'
    };
    this.ajax.request(data, this.success.bind(this), this.error.bind(this));
  },

  makeSatellite: function(data){
    return this.factory.makeSatellite(data);
  }
};