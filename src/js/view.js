// View, the interface for the messages
var View = function() {
  this.messages = {
      visibility: {
        "true": {
          "title": function(satellite) {
            return "Look up!";
          },
          "text": function(satellite) {
            if (satellite.visible) {
                return "You might be able to see the " + satellite.name + " to the " + satellite.direction + "! Tweet to @NASA_Astronauts!";
            } else {
                return satellite.name + " in the " + satellite.direction + "! Tweet to @NASA_Astronauts!";
            }
          }
        },
        "false": {
          "title": function(satellite) {
            return satellite.name + " is gone!";
          },
          "text": function(satellite) {
              return "Sorry, the " + satellite.name + " is no longer visible!";
          }
        }
      }
  };
};

View.prototype = {
  notify: function(data) {
    var isVisible = data.satellite.visible.toString();
    var messages = this.messages;
    var title = messages.visibility[isVisible].title(data.satellite);
    var text = messages.visibility[isVisible].text(data.satellite);

    Pebble.sendAppMessage({ 0: text });
  }
};