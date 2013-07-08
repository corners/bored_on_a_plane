define(
	// module name
	"Util",

	// dependencies
	[  ],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function () {    
		"use strict";

		return {
			function LoopingIterator(array) {
				if (array.length === 0) {
					throw "array must contain at least one element";
				}
				this.array = array;
				this.next = 0;
			}
			
			LoopingIterator.prototype.getNext = function() {
				this.next += 1;
				if (this.next >= this.array.length) {
					this.next = 0;
				}
				return this.array[this.next];
			}
	}
};