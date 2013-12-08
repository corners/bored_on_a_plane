define(
    //The name of this module
    "Paddle",

    //The array of dependencies
    [ 'Vector' ],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function (Vector) {
		    
		  "use strict";
			
			function Paddle(id, width, height, color) {
				this.id = id;
				this.x = -1;
				this.y = -1;
				this.width = width;
				this.height = height;
				this.fillStyle = color;
				this.velocity = 0; // should be in pixels per second... not there yet
			}

			Paddle.prototype.draw = function (context) {
				context.fillStyle = this.fillStyle;
				context.globalAlpha = 1.0;
				context.beginPath();
				context.moveTo(this.x, this.y);
				context.lineTo(this.x + this.width, this.y);
				context.lineTo(this.x + this.width, this.y + this.height);
				context.lineTo(this.x, this.y + this.height);
				context.lineTo(this.x, this.y);
				context.closePath();
				context.fill();
			}

			Paddle.prototype.describe = function () {
				var s = (new Vector(this.x, this.y)).describe('p') + ' ' + (new Vector(this.velocity, 0).describe('v'));
				return s;
			};

			return Paddle;
		}
);

