define(
    //The name of this module
    "Box",

    //The array of dependencies
    [ 'Vector' ],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function (Vector) {
		"use strict";

		function Box(x1, y1, x2, y2) {
			this.x1 = x1;
			this.y1 = y1;
			this.x2 = x2;
			this.y2 = y2;
			//this.topLeft = new Vector(x0, y0);
			//this.bottomRight = new Vector(x1, y1);
		}

		// returns true if this box is fully inside the the given box
		Box.prototype.inside = function (box) {
			return (this.x1 >= box.x1 && this.y1 >= box.y1 && this.x2 <= box.x2 && this.y2 <= box.y2);
		};

		// returns true if any point of the two boxes overlap
		Box.prototype.intersects = function (rectB) {
		
			// Cond1.  If A's left edge is to the right of the B's right edge,
      		//     -  then A is Totally to right Of B
			//Cond2.  If A's right edge is to the left of the B's left edge,
			//           -  then A is Totally to left Of B
			//Cond3.  If A's top edge is below B's bottom  edge,
			//           -  then A is Totally below B
			//Cond4.  If A's bottom edge is above B's top edge,
			//          -  then A is Totally above B
			//So condition for Non-Overlap is
			//
			//Cond1 Or Cond2 Or Cond3 Or Cond4
			//Therefore, a sufficient condition for Overlap is the opposite (De Morgan)
			//Not Cond1 AND Not Cond2 And Not Cond3 And Not Cond4
		
			var rectA = this;
			return (rectA.x1 <= rectB.x2 && rectA.x2 >= rectB.x1 &&
		   		rectA.y1 <= rectB.y2 && rectA.y2 >= rectB.y1); 
		};
		return Box;
	}
);
