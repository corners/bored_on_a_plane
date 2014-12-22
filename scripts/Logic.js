define(
	// module name
	"Logic",

	// dependencies
	[ 'underscore', 'Vector', 'Line', 'Box', 'Block', 'Ball', 'Paddle', 'Level', 'Styles', 'Commands' ],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function (_, Vector, Line, Box, Block, Ball, Paddle, Level, Styles, Commands) {    
		"use strict";

		/**
		* Game is over or not started.
		*/
		Logic.GAMEOVER = 0;
		/**
		* Game is active and not paused.
		*/
		Logic.INGAME = 1;
		/**
		* Game is active but paused.
		*/
		Logic.PAUSED = 3;

		function Logic() {
			this.paused = false;
    		this.gameState = Logic.GAMEOVER;
		}


		Logic.prototype.pause = function () {
			if (this.gameState === Logic.INGAME) {
				this.gameState = Logic.PAUSED;
			}
		};

		// Logic.prototype.togglePauseResume = function () {
		// 	if (this.gameState === Logic.INGAME) {
		// 		this.gameState = Logic.PAUSED;
		// 	} else if (this.gameState === Logic.PAUSED) {
		// 		this.gameState = Logic.INGAME;
		// 	} else if (this.gameState === Logic.GAMEOVER) {
		// 		this.startGame(); // todo not supported yet. need to reset paddle rather than remove. need to handle number of lives
		// 	}
		// };

		Logic.prototype.startGame = function () {
			this.gameState = Logic.INGAME;
		}

		Logic.prototype.gameOver = function () {
	        this.gameState = Logic.GAMEOVER;
		}

		// todo - remove these
		Logic.prototype.inGame = function () {
			return this.gameState === Logic.INGAME;
		}

		Logic.prototype.isPaused = function () {
			return this.gameState === Logic.PAUSED;
		}

		Logic.prototype.isGameOver = function () {
			return this.gameState === Logic.GAMEOVER;
		}

		return Logic;
	}
);