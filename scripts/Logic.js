define(
	// this module represents the game. it contains all the rules of the game.
	// TODO rename to GameState
	// module name
	"Logic",

	// dependencies
	[ 'underscore', 'Globals', 'Vector', 'Line', 'Box', 'Block', 'Ball', 'Paddle', 'Level', 'Styles', 'Commands', 'Physics' ],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function (_, Globals, Vector, Line, Box, Block, Ball, Paddle, Level, Styles, Commands, Physics) {
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

		function Logic(physics) {
			this.physics = physics;
			this.paused = false;
    		this.gameState = Logic.GAMEOVER;
		    // dashboard
    		this.message = '';
    		this.statusMsg = [];

    		this.gameOver();
		}

		Logic.prototype.button1Pressed = function () {
			if (this.isGameOver()) {
				this.startGame();
			}
			else {
				this.togglePauseResume();
			}
		}

		Logic.prototype.setMessage = function (text) {
			this.message = text;
		}
		Logic.prototype.getMessage = function () {
			return this.message;
		}

		Logic.prototype.setStatusMsg = function (index, text) {
			this.statusMsg[index] = text;
		}
		Logic.prototype.getStatusMsg = function (index) {
			return this.statusMsg[index];
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

		// Logic.prototype.startGame = function () {
		// 	this.physics.start();
		// 	this.startGame();
		// };

		Logic.prototype.startGame = function () {
			this.gameState = Logic.INGAME;
			this.setMessage('');
			this.physics.start();
//			this.startGame();
		}

		Logic.prototype.gameOver = function () {
	        this.gameState = Logic.GAMEOVER;
	        this.setMessage('press Button1 play again');
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

		Logic.prototype.playerDied = function () {
			this.gameOver();
		}

		return Logic;
	}
);