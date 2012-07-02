  "use strict";

  function Vector(x, y) {
    this.x = x;
    this.y = y;
  }

  Vector.prototype.toString = function () {
    return '(' + this.x + ', ' + this.y + ')';
  };

  Vector.dotProduct = function (v1, v2) {
    // multiply corresponding entries and sum the products
    return (v1.x * v2.x) + (v1.y * v2.y);
  };

  Vector.prototype.negative = function () {
    return this.multiplyScalar(-1);
  };

  // calculate vector from this point to another
  Vector.prototype.toPoint = function (pt) {
    return new Vector(pt.x - this.x, pt.y - this.y);
  };

  Vector.prototype.getPerpendicular = function () {
    return new Vector(-this.y, this.x);
  };

  Vector.prototype.getUnitNormal = function () {
    // divide each component by the length of the line
    var n = this.getPerpendicular();
    var len = Math.sqrt(Math.pow(n.x, 2) + Math.pow(n.y, 2));
    return new Vector(Math.round(n.x / len), Math.round(n.y / len));
    // todo proper vector multiply
  };

  Vector.prototype.multiplyScalar = function (n) {
    return new Vector(this.x * n, this.y * n);
  };

  Vector.prototype.multiply = function (v) {
    return new Vector(this.x * v.x, this.y * v.y);
  };

  Vector.prototype.add = function (v) {
    return new Vector(this.x + v.x, this.y + v.y);
  };

  Vector.prototype.subtract = function (v) {
    return new Vector(this.x - v.x, this.y - v.y);
  };

  Vector.project = function (I, unitNormal) {
    return unitNormal.multiplyScalar(Vector.dotProduct(I.negative(), unitNormal));
  };

  // Reflects initial vector I along the unit normal
  // I = initial vector
  // unitNormal = unitNormal of line to reflect against
  Vector.reflect = function (I, unitNormal) {
  	var N = Vector.project(I, unitNormal);

  	return N.multiplyScalar(2).add(I);
  };

  Vector.segmentsIntersect = function (p0, p1, p2, p3) {
      var s1 = p1.subtract(p0),
        s2 = p3.subtract(p2),
        a = (-s1.y * (p0.x - p2.x)) + (s1.x * (p0.y - p2.y)),
        b = (-s2.x * s1.y) + (s1.x * s2.y),
        s =  a / b,
        t = (s2.x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / (-s2.x * s1.y + s1.x * s2.y);

      return s >= 0 && s <= 1 && t >= 0 && t <= 1;
  };


  function Line(x1, y1, x2, y2) {
    this.pt1 = new Vector(x1, y1);
    this.pt2 = new Vector(x2, y2);
	this.strokeStyle = 'red';
    // vector from pt1 to pt2
/*    var v = this.pt1.toPoint(this.pt2);
    this.v = v;
    this.P = v.getPerpendicular();
    // the unit version of perpendicular
    this.n1 = v.getUnitNormal();
*/
  }

  Line.prototype.vector = function () {
    return this.pt1.toPoint(this.pt2);
  };

  Line.intersects = function (l1, l2) {
	return Vector.segmentsIntersect(l1.pt1, l1.pt2, l2.pt1, l2.pt2);
  };

  Line.prototype.toString = function () {
    return 'line from ' + this.pt1 + ' to ' + this.pt2 + ' unit version of perpendicuar=' + this.n1;
  };
/*
  Line.prototype.collide = function (I) {
    // I is the initial vector I
    var n = Vector.dotProduct(I.negative(), this.n1);

    var N = this.n1.multiplyScalar(n);

    var F = N.multiplyScalar(2).add(I);

    return F;
  };

  var line = new Line(0,0,10,0);
  var result = line.collide(new Vector(4,-2));
//  test('collide', new Vector(4,2), result);

*/
