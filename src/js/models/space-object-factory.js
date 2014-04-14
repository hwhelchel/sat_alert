var SpaceObjectFactory = function(){};

SpaceObjectFactory.prototype = {

  createSpaceObject: function(data){
    return new SpaceObject(data);
  },

  generateSpaceObjectAttributes: function(data){
    var spaceObjectsWithCoordinates = calculateLatitudeAndLongitude(readSpaceObjectInput(data));
    return spaceObjectsWithCoordinates;
  },

  readSpaceObjectInput: function(data){
    var spaceObjects = {};
    var x = 0;
    for(var i=0; i < data.length; i+=3){
      spaceObjects[x] = {};
      spaceObjects[x].name = data[i];
      spaceObjects[x].tle_line_1 = data[i+1];
      spaceObjects[x].tle_line_2 = data[i+2];
      x += 1;
    }
    return spaceObjects;
  },

  calculateLatitudeAndLongitude: function(spaceObjectsAttributes) {
    var coords = {};
    for (var spaceObject in spaceObjectsAttributes) {
      if(spaceObjectsAttributes[spaceObject].tle_line_1){
        coords[spaceObjectsAttributes[spaceObject].name] = getCoordinates(spaceObjectsAttributes[spaceObject].tle_line_1, spaceObjectsAttributes[spaceObject].tle_line_2);
      }
    }
    return coords;
  }


};