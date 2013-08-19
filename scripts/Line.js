define(
    //The name of this module
    "Line",

    //The array of dependencies
    [ 'Vector', 'Box' ],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
	function (Vector, Box) {

		"use strict";

		/**
		  * Constructor for Line object.
		  */
		function Line(x0, y0, x1, y1, args) {
			this.p0 = new Vector(x0, y0);
			this.p1 = new Vector(x1, y1);
			var v = this.p0.toPoint(this.p1);
			this.v12 = v;
			this.unitNormal = v.getUnitNormal();
			this.width = 1;
			args = args || {};
			this.name = args.hasOwnProperty('name') ? args.name : '';
			this.fixed = args.hasOwnProperty('fixed') ? args.fixed : true;
			this.visible = true;
			var colour = args.hasOwnProperty('color') ? args.color : (this.fixed ? 'red' : 'blue');
			this.colour = colour;
			this.strokeStyle = colour;
			this.colour2 = args.hasOwnProperty('color2') ? args.color2 : 'orange';
			this.animationStep = 0;
			this.lines = [ this ];
		};


		/**
		  * Draw line to the supplied canvas context.
		  */
		Line.prototype.draw = function (context) {
			var oldColor;

			if (this.visible) {
				context.beginPath();
				context.moveTo(this.p0.x, this.p0.y);
				context.lineTo(this.p1.x, this.p1.y);
				context.lineWidth = this.width;
				oldColor = context.strokeStyle;
				context.strokeStyle = this.strokeStyle;
				context.stroke();
				context.strokeStyle = oldColor;
			}
			if (this.animationStep === 1) {
				this.strokeStyle = this.colour;
				this.visible = this.fixed;
			}
			else if (this.animationStep > 1) {
				this.animationStep--;
			}
		};

		/**
		  *	The minimum difference in either direction between the start of a line and the point of collision.
	  	  *	Collisions within this box are ignored.
		  */
		Line.TOLERANCE = 0.51;

		Line.prototype.toString = function () {
			return '[object Line <(' + this.p0.x + ', ' + this.p0.y + '), (' + this.p1.x + ', ' + this.p1.y + ')>]';
		};

		/**
		  * Reflects the line off this line. Return null if lines do not intersect.
		  * todo change line to start p and calculate
		  */
		Line.prototype.bounce = function (line, velocity, lastCollision) {
			// do the lines intersect
			var a = Vector.segmentsIntersectAt(line.p0, line.p1, this.p0, this.p1);
			if (a === null) {
			  return null;
			}

			// if the start intersects then ignore
			var diff = Math.abs(new Line(a.x, a.y, lastCollision.x, lastCollision.y).length());
			if (diff < Line.TOLERANCE) {
				var Ix = line.p1.subtract(a);

				console.log("within tollerance to point " + lastCollision.toString() + ' at ' + a.toString() + 'I=' + Ix.toString());

				return null;
			}

			// determine the velocity from this point
			var I = line.p1.subtract(a);

			// reflect the velocity off the line to the destination
			var newVelocity = Vector.reflect(I, this.unitNormal);
			var newPosition = a.add(newVelocity);
			var reflectedVelocity = Vector.reflect(velocity, this.unitNormal);
			var result = new Line(a.x, a.y, newPosition.x, newPosition.y);

			console.log('collided with line: ' + this.toString() + ' at ' + a.toString() + ' I=' + I.toString() +' new v=' + reflectedVelocity.toString() + ' lastC=' + lastCollision.toString());

			return {
				Line : result,
				Velocity : reflectedVelocity,
				Collision : a
			};
		};

		Line.prototype.velocityReflect = function (v) {
			return Vector.reflect(v, this.unitNormal);
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
		  * Bounce the line off this shape.
		  * Assume the line describes the trajectory of a circle with the given radius.
		  * Return null if no collision occurs
		  */
		 Line.prototype.bounceWithRadius = function (line, radius, velocity, lastCollision) {
			// extend radius perpendicular to the line we are bouncing off

			// TODO this goes wrong if the rounding pushes the ball to the otherside of the
			// line. which then moves the extendTowards in the opposite direction ...maybe
			//var linex = this.extendTowardsX(line, radius);
			var linex = this;

			var result = linex.bounce(line, velocity, lastCollision);
			return result
		};

		/**
		 * Return the smallest box containing the whole of the line.
		 */
		Line.prototype.boundingBox = function () {
			return new Box(Math.min(this.p0.x, this.p1.x),
				Math.min(this.p0.y, this.p1.y),
				Math.max(this.p0.x, this.p1.x),
				Math.max(this.p0.y, this.p1.y));
		};

		/**
		 * returns outer lines in this shape for collision detection
		 */
		Line.prototype.outerLines = function () {
			return this.lines;
		};

		/**
		 * Calculate difference between p0 and p1.
		 */
		Line.prototype.velocity = function () {
			return this.p1.subtract(this.p0);
		};

		/**
		 * Create a line from the initial point to an point based on the velocity.
		 */
		Line.calculateLine = function (vector, velocity) {
			return new Line(vector.x, vector.y, vector.x + velocity.x, vector.y + velocity.y);
		};

		Line.prototype.onCollision = function () {
			if (!this.fixed) {
				this.strokeStyle = this.colour2;
				this.animationStep = 100;
			}
		};

		//return the constructor function so it can be used by other modules.
		return Line;
	}
);























