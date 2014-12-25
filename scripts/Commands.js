define(
    //The name of this module
    "Commands",

    //The array of dependencies
    [ 'Vector', 'Paddle' ],

    //The function to execute when all dependencies have loaded. The arguments
    //to this function are the array of dependencies mentioned above.
    function (Vector, Paddle) {
		"use strict";


		function Commands() {
		}

		Commands.makeStartGameCommand = function (game) {
			return {
				execute: function() {
					game.startGame();
				},
				undo: function() {
				}
			};			
		}

		Commands.makeMovePaddleCommand = function (paddle, x, y) {
			var beforeX, beforeY;
			return {
				execute: function() {
					beforeX = paddle.p.x;
					beforeY = paddle.p.y;
					paddle.moveTo(x, y);

				},
				undo: function() {
					paddle.moveTo(beforeX, beforeY);
				}
			};			
		}

		Commands.makeTogglePauseCommand = function (game) {
			return {
				execute: function() {
					game.button1Pressed();
				}
			};			
		}

		Commands.makePauseCommand = function (game) {
			return {
				execute: function() {
					game.pause();
				}
			};
		}

		Commands.makeDestroyShapeCommand = function (shape) {
			var shapeToDestroy;
			return {
				execute: function() {
					shapeToDestroy = shape;
					shape.onCollision();

				},
				undo: function() {
					// todo
				}
			};			
		}

		return Commands;
	}

);