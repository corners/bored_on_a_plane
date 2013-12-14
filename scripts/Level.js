define(
	// module name
	"Level",

	[ 'underscore', 'Vector', 'Line', 'Box', 'Block' ],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function (_, Vector, Line, Box, Block) {    
		"use strict";

		/** 
		 * Constructs a description of a level.
		 */
		function Level() {
		}

		/**
		 * Create grid of Blocks starting.
		 * Returns array of Blocks.
		 */
		function createGrid(numx, numy, x, y, width, height, args, colourFn) {
			args = args || { };

			var gapx = 10;
			var gapy = 8;

			return _.chain(_.range(0, (numx*numy)))
				.map(function (i) {
				  var startx = x + ((i % numx) * (gapx + width));
				  var starty = y + (Math.floor(i / numx) * ( gapy + height));
				  var b = { x: startx, y: starty, width: width, height: height, name: 'block ' + i };
				  return new Block(_.extend(b, args));
				})
				.value();
		}

		/**
		 * Describes the layout of the level as a series of objects.
		 * Returns and array of Shapes
		 */
		Level.prototype.getLayout = function (width, height) {

		    // Define borders
		    var shapes = [
		      // top
		      new Line(50, 50, width-50, 50, { name: 'top' }),
		      // bottom
		      new Line(50, height - 5, width-50, height - 5, { name: 'bottom' }),
		      // left
		      new Line(50, 0, 50, height, { name: 'left' }),
		      // right
		      new Line(width-50, 0, width-50, height, { name: 'right' }),
		    ];

		    // add bricks
		    return shapes.concat(createGrid(10, 8, 95, 70, 36, 16, { fixed : false }));
		}


		return Level;
	}
);