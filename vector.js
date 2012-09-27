  "use strict";

  function Vector(x, y) {
    this.x = x;
    this.y = y;
  }

  Vector.prototype.toString = function () {
    return '[object Vector <' + this.x + ', ' + this.y + '>]';
  };

  Vector.dotProduct = function (v1, v2) {
    // multiply corresponding entries and sum the products
    return (v1.x * v2.x) + (v1.y * v2.y);
  };

  Vector.prototype.negative = function () {
    return this.multiplyScalar(-1);
  };

  Vector.prototype.clone = function () {
    return new Vector(this.x, this.y);
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

  Vector.prototype.toFixed = function (digits) {
    var round = function (value, digits) {
      return parseFloat(value.toFixed(digits));
    };
    return new Vector(round(this.x, digits), round(this.y, digits));
  }

  // calculate vector from this point to another i.e. pt2 - pt 1.
  Vector.prototype.toPoint = function (pt) {
    return pt.subtract(this);
  };

  // find a vector that is perpendicular to the line described by this vector
  Vector.prototype.getPerpendicular = function () {
    return new Vector(-this.y, this.x);
  };

  Vector.prototype.getUnitNormal = function () {
    // divide each component by the length of the line
    var n = this.getPerpendicular();
    var len = Math.sqrt(Math.pow(n.x, 2) + Math.pow(n.y, 2));
    return new Vector(n.x / len, n.y / len);
  };

  Vector.prototype.length = function (v) {
    var vd = this.subtract(v);
    return Math.sqrt(Math.pow(vd.x, 2) + Math.pow(vd.y, 2));
  };


  Vector.project = function (I, unitNormal) {
  	var x = Vector.dotProduct(I.negative(), unitNormal),
	   	N = unitNormal.multiplyScalar(x);
    return N;
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


	Vector.segmentsIntersectAt = function (p0, p1, p2, p3) {
		var s1 = p1.subtract(p0),
		  s2 = p3.subtract(p2),
		  a = (-s1.y * (p0.x - p2.x)) + (s1.x * (p0.y - p2.y)),
		  b = (-s2.x * s1.y) + (s1.x * s2.y),
		  s =  a / b,
		  t = (s2.x * (p0.y - p2.y) - s2.y * (p0.x - p2.x)) / (-s2.x * s1.y + s1.x * s2.y);

		if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
			return p0.add(s1.multiplyScalar(t));
		} else {
			return null;
		}
	};


  /**
   * Constructor for Line object.
   */
  function Line(x0, y0, x1, y1) {
    this.p0 = new Vector(x0, y0);
    this.p1 = new Vector(x1, y1);
    this.strokeStyle = 'red';
    var v = this.p0.toPoint(this.p1);
    this.v12 = v;
    this.unitNormal = v.getUnitNormal();
    this.width = 1;
  }

  Line.prototype.toString = function () {
    return '[object Line <(' + this.p0.x + ', ' + this.p0.y + '), (' + this.p1.x + ', ' + this.p1.y + ')>]';
  };

  /**
   * Reflects the line off this line. Return null if lines do not intersect.
   */
  Line.prototype.bounce = function (line) {
		// do the lines intersect
		var a = Vector.segmentsIntersectAt(line.p0, line.p1, this.p0, this.p1);
		if (a === null) {
		  return null;
		}

		// determine the velocity from this point
		var I = line.p1.subtract(a);

		// reflect the velocity off the line to the destination
	  var newVelocity = Vector.reflect(I, this.unitNormal).toFixed(1);
		var newPosition = a.add(newVelocity);
    return new Line(a.x, a.y, newPosition.x, newPosition.y);
  };

  Line.prototype.velocityReflect = function (v) {
    return Vector.reflect(v, this.unitNormal).toFixed(1);
  };

  /**
   * Moves the start and end points of the line by the supplied vector.
   */
  Line.prototype.add = function (v) {
    var p2 = this.p0.add(v),
		p3 = this.p1.add(v);

    return new Line(p2.x, p2.y, p3.x, p3.y);
  };

  /**
   * Move this line towards the given line by a scalar distance in the direction of the perpendicular.
   */
  Line.prototype.extendTowards = function (line, length) {
    // extend radius perpendicular to the line we are bouncing off
    var v, pa, ps, la, ls, offset;

	// determine which point is closer to thr target and move this line in that direction
	v = this.unitNormal.multiplyScalar(length),
	pa = this.p0.add(v),
	ps = this.p0.subtract(v),
	la  = pa.length(line.p0),
	ls = ps.length(line.p0);

    offset = (la <= ls) ? v : v.negative();
    return this.add(offset);
  };

  /**
   * Bounce the line off this one assuming it describes the centre of a circle with the given radius.
   */
  Line.prototype.bounceWithRadius = function (line, radius) {
		// extend radius perpendicular to the line we are bouncing off
		var linex = this.extendTowards(line, radius);

		return linex.bounce(line);
  };



  function Box(x0, y0, x1, y1) {
  	this.topLeft = new Vector(x0, y0);
  	this.bottomRight = new Vector(x1, y1);
  }

  Box.prototype.inside = function (box) {
    return (this.topLeft.x >= box.topLeft.x && this.topLeft.y >= box.topLeft.y && this.bottomRight.x <= box.bottomRight.x && this.bottomRight.y <= box.bottomRight.y);
  };
