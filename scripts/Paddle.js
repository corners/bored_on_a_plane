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
				this.velocity = 0; // should be in pixels per second
				this.visible = true;
				this.lastTimestamp = null; // DOMHighResTimeStamp (in ms)
			}

			Paddle.prototype.moveTo = function (x, y) {
				this.p.x = x;
				this.p.y = y;
			}

			/// Notification
			Paddle.prototype.onKeyPress = function (evt) {
			}			
/*
			Paddle.prototype.onKeyPress = function (evt) {
				var force = 0,
					direction = 0;

				switch (evt.keyCode) {
					// Left arrow.
					case 37:
						direction = -1;
						break;

					// Right arrow.
					case 39:
						direction = 1;
						break;
				}

				if (this.velocity === 0) {
					force = 1;
				} else {
					force = 0.2;
				}
				this.velocity += (force * direction);
			}
*/
			/// Shape interface

			/**
			 * Describes the shape as a serious of outer lines. These lines are used for collision detection.
			 * @returns {Line[]}
			 */
			Paddle.prototype.outerLines = function () {
				return [
					new Line(this.p.x, this.p.y, this.p.x + this.width, this.p.y),
					new Line(this.p.x + this.width, this.p.y, this.p.x + this.width, this.p.y + this.height),
					new Line(this.p.x, this.p.y + this.height, this.p.x + this.p.width, this.p.y + this.height),
					new Line(this.p.x, this.p.y, this.p.x, this.p.y + this.height)
				];
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
				// this.fillStyle = 'orange';
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

			/**
			 * @param {timestamp} current timestamp
			 */
			Paddle.prototype.move = function(timestamp) {
				if (this.lastTimestamp === null) {
					this.lastTimestamp = timestamp;
				}
				var t = (timestamp - this.lastTimestamp) / 1000;
				this.p.x += (this.velocity) * t;

				if (this.p.x < 0) {
					this.p.x = 0;
					if (this.velocity < 0) {
						this.velocity = 0; 
					}
				}
				var leftMax = 620; // todo pass in and calculate from width
				if (this.p.x > leftMax) {
					this.p.x = leftMax;
					if (this.velocity > 0) {
						this.velocity = 0; 
					}
				}

				// decrease velocity by friction
				this.velocity -= (0.1 * this.velocity); 
			
				this.lastTimestamp = timestamp;
			}


			Paddle.prototype.describe = function () {
				var s = (new Vector(this.p.x, this.p.y)).describe('p') + ' ' + (new Vector(this.velocity, 0).describe('v'));
				return s;
			};

			return Paddle;
		}
);

