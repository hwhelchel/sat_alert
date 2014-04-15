// View, the interface for the messages
var View = function() {};

View.prototype = {
  notify: function(data) {
    var text = getMessage(data.satellite);
    Pebble.sendAppMessage({ 0: text });
  },

  getMessage: function(satellite){
    if (satellite.visible) {
        return "You might be able to see the " + satellite.name + " to the " + satellite.direction + "! Tweet to @NASA_Astronauts!";
    } else {
        return satellite.name + " in the " + satellite.direction + "! Tweet to @NASA_Astronauts!";
    }
  }
};