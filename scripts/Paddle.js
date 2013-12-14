define(
    //The name of this module
    "Paddle",

    //The array of dependencies
    [ 'Vector', 'Box', 'Line' ],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function (Vector, Box, Line) {
		    
		  "use strict";
			
			function Paddle(id, x, y, width, height, color) {
				this.id = id;
				this.p = new Vector(x, y);
				this.width = width;
				this.height = height;
				this.fillStyle = color;
				this.velocity = 0; // should be in pixels per second... not there yet
				this.visible = true;
				this.lines = [
					new Line(x, y, x + width, y),
					new Line(x + width, y, x + width, y + height),
					new Line(x, y + height, x + width, y + height),
					new Line(x, y, x, y + height)
				];
			}

			/// Notification

			Paddle.prototype.onKeyPress = function (evt) {
				switch (evt.keyCode) {
					// Left arrow.
					case 37:
						this.p.x -= 10;
						break;

					// Right arrow.
					case 39:
						this.p.x += 10;
						break;
				}
			}

			/// Shape interface

			/**
			 * Describes the shape as a serious of outer lines. These lines are used for collision detection.
			 * @returns {Line[]}
			 */
			Paddle.prototype.outerLines = function () {
				return this.lines;
			}

			/**
			 * @returns {Box} the smallest box containing the whole of the object.
			 */
			Paddle.prototype.boundingBox = function () {
				return new Box(this.p.x, this.p.y, this.p.x + this.width, this.p.y + this.height);
			}

			/**
		     * @returns {bool} true if the object can be collided with.
			 */
			Paddle.prototype.isVisible = function () {
				return this.visible;
			}

			/**
			 * Called when the ball collides with this object allowing the object to react.
			 * TODO: pass in point of collision, velocity and object that collided
			 */
			Paddle.prototype.onCollision = function () {
				this.fillStyle = 'orange';
			}

			/**
			 * Tells the object to draw itself on the canvas.
			 * @param {context} display context to use for drawing.
			 */
			Paddle.prototype.draw = function (context) {
				context.fillStyle = this.fillStyle;
				context.globalAlpha = 1.0;
				context.beginPath();
				context.moveTo(this.p.x, this.p.y);
				context.lineTo(this.p.x + this.width, this.p.y);
				context.lineTo(this.p.x + this.width, this.p.y + this.height);
				context.lineTo(this.p.x, this.p.y + this.height);
				context.lineTo(this.p.x, this.p.y);
				context.closePath();
				context.fill();
			}

			// End Shape interface


			Paddle.prototype.describe = function () {
				var s = (new Vector(this.x, this.y)).describe('p') + ' ' + (new Vector(this.velocity, 0).describe('v'));
				return s;
			};

			return Paddle;
		}
);

