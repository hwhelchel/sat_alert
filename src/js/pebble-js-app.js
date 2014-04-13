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

var View = function() {
    this.messages = {
        iss: {
            title: "ISS Alert",
            visibility: {
                "true": function(direction) {
                    return "The ISS is now visible on the " + direction + "!, take a moment to watch the sky, take a picture, and tweet it to #ISeeTheISS!";
                },
                "false": function() {
                    return "The ISS is no longer visible around you!";
                }
            }
        }
    };
};

View.prototype = {
    notify: function(object, visibility, direction) {
        object = object.toLowerCase();
        visibility = visibility.toString();
        var messages = this.messages[object];

        var title = messages.title;
        var text = messages.visibility[visibility](direction);
        Pebble.showSimpleNotificationOnPebble(title, text);
    }
};






// Sets everything in motion
Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
        var view = new View();
        view.notify("ISS", true, "North");
    });