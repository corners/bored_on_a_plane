define(
	// module name
	"Block",

	// dependencies
	[ "Vector", "Box", "Line" ],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function (Vector, Box, Line) {
		"use strict";

		function Block (args) {
			if (!args) {
				throw 'Cannot create block without specifying arguments';
			}

			this.p = new Vector(args.x, args.y);
			this.width = args.width;
			this.height = args.height;
			this.lineWidth = ('lineWidth' in args) ? args.lineWidth : 1;
			this.lines = [
				new Line(args.x, args.y, args.x + args.width, args.y),
				new Line(args.x + args.width, args.y, args.x + args.width, args.y + args.height),
				new Line(args.x, args.y + args.height, args.x + args.width, args.y + args.height),
				new Line(args.x, args.y, args.x, args.y + args.height)
			];

			this.name = ('name' in args) ? args.name : '';
			this.fixed = ('fixed' in args) ? args.fixed : true;
			this.visible = true;

			this.fillStyle = ('fillStyle' in args ? args.fillStyle : 'yellow');
			this.strokeStyle = ('strokeStyle' in args ? args.strokeStyle : 'green');
		};

		Block.prototype.draw = function(context) {
			if (this.visible) {
				context.beginPath();
				context.rect(this.p.x, this.p.y, this.width, this.height);
				context.fillStyle = this.fillStyle;
				context.strokeStyle = this.strokeStyle;
				context.fill();
				context.lineWidth = this.lineWidth;
				context.stroke();

				if (this.animationStep === 1) {
					this.strokeStyle = this.colour;
					this.visible = this.fixed;
				}
				else if (this.animationStep > 1) {
					this.animationStep--;
				}
			}
		};

		/**
		  * Bounce the line off this shape.
		  * Assume the line describes the trajectory of a circle with the given radius.
		  * Return null if no collision occurs
		  */
/*		Block.prototype.bounceWithRadius = function (line, radius, velocity, lastCollision) {
				return null;  // shouldnt get here. box should resolve to series of lines
		};
*/
		/**
		 * Return the smallest box containing the whole of the line.
		 */
		Block.prototype.boundingBox = function () {
			return new Box(this.p.x, this.p.y, this.p.x + this.width, this.p.y + this.height);
		};

		/**
		 * returns outer lines in this shape for collision detection
		 */
		Block.prototype.outerLines = function () {
			return this.lines;
		};

		Block.prototype.onCollision = function () {
			this.fillStyle = 'red';
			this.animationStep = 200;
		};

		return Block;
	}
);