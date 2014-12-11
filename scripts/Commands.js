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
		};

		Commands.makeTogglePauseCommand = function (game) {
			return {
				execute: function() {
					game.togglePauseResume();
				}
			};			
		};

		return Commands;
	}

);