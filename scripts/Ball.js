define(
	// module name
	"Ball",

	// dependencies
	[ 'Vector', 'Box' ],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function (Vector, Box) {    
		"use strict";
	
		function Ball(id, x, y, position, velocity, radius) {
		  this.id = id;
		  this.position = position;
		  this.velocity = velocity;
		  this.radius = radius;
		  this.color = 'orange';
		}
	
		Ball.prototype.boundingBox = function () {
		  return new Box(this.position.x - this.radius, this.position.y - this.radius, this.position.x + this.radius, this.position.y + this.radius);
		};
	
		Ball.prototype.move = function () {
		  return this.position.add(this.velocity);
		};

		Ball.prototype.draw = function (context) {
			context.fillStyle = this.color;
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, true);
			context.closePath();
			context.fill();
		};

		return Ball;
	}
);