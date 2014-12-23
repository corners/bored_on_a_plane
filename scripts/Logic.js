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
		    // dashboard
    		this.message = '';
		}

		Logic.prototype.setMessage = function (text) {
			this.message = text;
		}
		Logic.prototype.getMessage = function () {
			return this.message;
		}


		Logic.prototype.pause = function () {
			if (this.gameState === Logic.INGAME) {
				this.gameState = Logic.PAUSED;
			}
		}

		Logic.prototype.togglePauseResume = function () {
			if (this.isPaused()) {
				this.gameState = Logic.INGAME;
				this.setMessage('');
			} else if (this.inGame()) {
				this.gameState = Logic.PAUSED;
				this.setMessage('paused');
			}
		}

		Logic.prototype.startGame = function () {
			this.gameState = Logic.INGAME;
			this.setMessage('');
		}

		Logic.prototype.gameOver = function () {
	        this.gameState = Logic.GAMEOVER;
	        this.setMessage('game over press space to play again');
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