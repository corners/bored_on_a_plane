define(
    //The name of this module
    "Box",

    //The array of dependencies
    [ 'Vector' ],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function (Vector) {
		    
		  "use strict";

	
		  function Box(x0, y0, x1, y1) {
		  	this.topLeft = new Vector(x0, y0);
		  	this.bottomRight = new Vector(x1, y1);
		  }
		
		  Box.prototype.inside = function (box) {
		    return (this.topLeft.x >= box.topLeft.x && this.topLeft.y >= box.topLeft.y && this.bottomRight.x <= box.bottomRight.x && this.bottomRight.y <= box.bottomRight.y);
		  };
	

			return Box;
			
		}
);