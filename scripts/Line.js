define(
    //The name of this module
    "Line",

    //The array of dependencies
    [ 'Vector' ],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function (Vector) {
		    
		  "use strict";
	
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
		
		
			Line.prototype.length = function () {
				return this.p0.length(this.p1);
			}
		
		  Line.prototype.toFixed = function (digits) {
		    var p0f = this.p0.toFixed(digits),
		        p1f = this.p1.toFixed(digits);
		        
		      return new Line(p0f.x, p0f.y, p1f.x, p1f.y);
		  };
		
			Line.prototype.round = function () {
				var a = this.p0.round(),
						b = this.p1.round();
						
				return new Line(a.x, a.y, b.x, b.y);
			}
		
		  /**
		   * Bounce the line off this one assuming it describes the centre of a circle with the given radius.
		   */
		  Line.prototype.bounceWithRadius = function (line, radius) {
				// extend radius perpendicular to the line we are bouncing off
				
				/// this goes wrong if the rounding pushes the ball to the otherside of the
				// line. which then moves the extendTowards in the opposite directin
				var linex = this.extendTowards(line, radius);
		
				var result = linex.bounce(line);
				if (result !== null) {
				  result = result.round();
				}
				return result;
		  };
		
      //return the constructor function so it can be used by other modules.
			return Line;
    }
);

