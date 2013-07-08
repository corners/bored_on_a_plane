define(
	// module name
	"Level",

	// dependencies
	[ ],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function () {    
		"use strict";

		/** 
		 * Constructs a description of a level.
		 * name: 					name of level
		 * blockGenerators: 				functions for creating initial layout of blocks.
		 */
		function Level(name, blockGenerators) {
			this.name = name;
			this.blockGenerators = blockGenerators;
		}


		return Level;
	}
);