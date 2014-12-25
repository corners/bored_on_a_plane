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
			this.shrinking = false;

			this.fillStyle = ('fillStyle' in args ? args.fillStyle : 'yellow');
			this.strokeStyle = ('strokeStyle' in args ? args.strokeStyle : 'green');
		};

		Block.prototype.shrink = function(size) {
			if (this.width > size && this.height > size) {
				this.p.x += size;
				this.p.y += size;
				this.width -= (2 * size);
				this.height -= (2 * size);
			} else {
				// shrunk to nothing
				this.visible = false;
				this.shrinking = false;
			}
		}

		/// Shape interface

		/**
		 * Describes the shape as a serious of outer lines. These lines are used for collision detection.
		 * @returns {Line[]}
		 */
		Block.prototype.outerLines = function () {
			return this.lines;
		}

		/**
		 * @returns {Box} the smallest box containing the whole of the object.
		 */
		Block.prototype.boundingBox = function () {
			return new Box(this.p.x, this.p.y, this.p.x + this.width, this.p.y + this.height);
		}

		/**
	   * @returns {bool} true if the object can be collided with.
		 */
		Block.prototype.isVisible = function () {
			return this.visible;
		}

		/**
		 * Called when the ball collides with this object allowing the object to react.
		 */
		Block.prototype.onCollision = function () {
			if (!this.fixed) {
				this.fillStyle = 'red';
				this.shrinking = true;
			}
		}

		Block.prototype.accept = function(visitor) {
			visitor.visitBlock(this);
		}

		// End Shape interface

		return Block;
	}
);