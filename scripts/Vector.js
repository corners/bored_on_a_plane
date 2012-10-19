define(
    //The name of this module
    "Vector",

    //The array of dependencies
    [],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function () {
		    
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
		
		  /** Round to a fixed number of digits.
		  */
		  Vector.prototype.toFixed = function (digits) {
		    var round = function (value, digits) {
		      return parseFloat(value.toFixed(digits));
		    };
		    return new Vector(round(this.x, digits), round(this.y, digits));
		  }
		
			Vector.prototype.round = function () {
				return new Vector(Math.round(this.x), Math.round(this.y));
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

      //return the constructor function so it can be used by other modules.
			return Vector;
    }
);




