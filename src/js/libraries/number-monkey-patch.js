Number.prototype.toRad = function() {
  return this * Math.PI / 180;
};

Number.prototype.toDegree = function() {
  return this / Math.PI * 180;
};
