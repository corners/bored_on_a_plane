define(
	// module name
	"Styles",

	[],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function () {    
		"use strict";

		function Style(fill, stroke) {
			this.Fill = fill;
			this.Stroke = stroke;
		}

		return {
			Game: { Fill: 'white', Stroke: 'black', Font: '10pt sans-serif' },
			Paddle: new Style('silver', 'black'),
			BlockStyle: {
				0: new Style('white', 'silver')
			}
		};
	}
);