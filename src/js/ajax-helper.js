// Ajax module to query the APIs
Ajax = (function(satellite) {
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
        var data = requestObject.responseText.split('\n');
        if (requestObject.status == 200) {
          okCallback(data);
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

}(satellite));