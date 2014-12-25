define(
	// module name
	"Globals",

	// dependencies
	[],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function () {
		"use strict";

		// todo properly
	    // command queue. all commands should have an execute function
		var commandQueue = [];
		return {
			pushCommand : function (cmd) {
				commandQueue.push(cmd);
			},
			processCommands : function  () {
				// todo implement commands as a queue
				var i, cmd;
				for (i = 0; i < commandQueue.length; i++) {
					cmd = commandQueue[i];
					cmd.execute();
				}
				commandQueue = [];
			}
		};
	}
);