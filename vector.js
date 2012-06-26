
  "use strict"

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
    return new Vector(n.x / len, n.y / len);
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

    function Line(x1, y1, x2, y2) {
    this.pt1 = new Vector(x1,y1);
    this.pt2 = new Vector(x2,y2);
    // vector from pt1 to pt2
    var v = this.pt1.toPoint(this.pt2);
    this.v = v;
    this.P = v.getPerpendicular();
    // the unit version of perpendicular
    this.n1 = v.getUnitNormal();
  }

  Line.prototype.toString = function () {
    return 'line from ' + this.pt1 + ' to ' + this.pt2 + ' unit version of perpendicuar=' + this.n1;
  };

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







