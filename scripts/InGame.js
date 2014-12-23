define(
  // module name

  "InGame",

  // dependencies
  [ 'underscore', 'Globals', 'Vector', 'Line', 'Box', 'Block', 'Ball', 'Paddle', 'Level', 'Commands' ],

  //The function to execute when all dependencies have loaded. The arguments
  //to this function are the array of dependencies mentioned above.
  function (_, Globals, Vector, Line, Box, Block, Ball, Paddle, Level, Commands) {
    "use strict";


    function InGame() {
      this.i = 0;

    }

    InGame.prototype.move = function (timestamp) {
      if (this.i === 65535) {
        this.i = 0;
      } else {
        this.i += 1;
      }
    }


    InGame.prototype.getStatusMsg = function () {
      return [ 
        'i:' + this.i,
        ];
    }

    return InGame;
  }
);
