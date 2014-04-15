// Controller
var Controller = function(config){
  this.user = config.user;
  this.view = config.view;
  this.ajax = config.ajax;
  this.factory = config.factory;
  this.oldSat = { name: null };
};

Controller.prototype = {

  success: function(data){
    this.user.getLocation(this.continueSuccess.bind(this), data);
  },

  continueSuccess: function(data){
    this.satelliteData = data;
    if (this.satellite){
      this.oldSat = this.satellite;
    }
    this.satellite = this.makeSatellite();
    this.satellite.update(this);
    this.checkIfWeShouldUpdateView();
  },

  checkIfWeShouldUpdateView: function(){
    if (this.satellite.changed) {
      this.view.notify(this);
    }
  },

  error: function(){
    console.log('error');
  },

  getSatelliteData: function(){
    var data = {
      url: 'http://www.celestrak.com/NORAD/elements/stations.txt'
    };
    this.ajax.request(data, this.success.bind(this), this.error.bind(this));
  },

  makeSatellite: function(){
    return this.factory.makeSatellite(this);
  }
};