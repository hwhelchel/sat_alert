// Global namespacing
SatAlert = {};

// Sets everything in motion
Pebble.addEventListener("ready",
  function(e) {
    SatAlert.view = new View();
    SatAlert.user = new User();
    SatAlert.factory = new SatelliteFactory();
    config = {
      view: SatAlert.view,
      user: SatAlert.user,
      ajax: Ajax,
      factory: SatAlert.factory
    };
    SatAlert.controller = new Controller(config);

});

Pebble.addEventListener("appmessage", function(e) {
  SatAlert.controller.getSatelliteData();
});