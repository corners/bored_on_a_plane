/**
  * Shim for libraries
  */
require.config({
  shim: {
    underscore: {
      exports: '_'
    },
  }
});


// Start the main app logic.
require(['underscore', 'Globals', 'Styles', 'Commands', 'Logic', 'InGame', 'DrawVisitor' ],
          function (_, Globals, Styles, Commands, Logic, InGame, DrawVisitor) {

  "use strict";

  var LOG_TRACE = 5;
  var LogLevel = 0;//LOG_TRACE; // increasing level means increasing detail

  function trace(message) {
    if (LogLevel >= LOG_TRACE) {
      console.log(message);
    }
  }


  var GAME_WIDTH = 640,
      GAME_HEIGHT = 480;


  function Engine(width, height) {
    //this.paused = false;
    this.logic = new Logic();
    this.drawVisitor = null;
    this.inGame = new InGame(width, height);
    this.context = null;
    this.width = width;
    this.height = height;

    // List of functions to call when a key is pressed
    this.keyPressNofifications = [];

    // colors
    this.backgroundColor = Styles.Game.Fill;
    this.textColor = Styles.Game.Stroke;

    // fonts
    this.font = Styles.Game.Font;

    // this.keyPressNofifications.push(function(shape) { 
    //     return function (evt) {
    //       shape.onKeyPress(evt);
    //     };
    //   }(this.paddle));
    this.keyPressNofifications.push(function(game) {
        return function (evt) {
          game.onKeyPress(evt);
        };
      }(this));


    // // dashboard
    // this.message = '';

    //this.gameState = 0;
    //this.logic.gameState = 0;
  }

  Engine.prototype.button1Pressed = function () {
    if (this.logic.isGameOver()) {
      Globals.pushCommand(Commands.makeStartGameCommand(this));
    }
    else {
      this.logic.togglePauseResume();
    }
  }

  Engine.prototype.startGame = function () {
    this.inGame.start();
    this.logic.startGame();
  };

  var BUTTON_1 = 32; // Space

  Engine.prototype.onKeyPress = function (evt) {
    switch (evt.keyCode) {
      // space
      case BUTTON_1:
        //Globals.pushCommand(Commands.makeTogglePauseCommand(this));
        this.button1Pressed();
        break;
    }
  };

  Engine.prototype.handleKeyDown = function (that, evt) {
    this.keyPressNofifications.forEach(function(action) {
      action(evt);
    });
  };

  Engine.prototype.initialize = function (wnd, canvas) {
    var that = this;

    if (wnd === null) {
      // todo throw exception
      throw 'window element required';
    }

    if (canvas) {
      this.context = canvas.getContext('2d');
    }

    if (canvas) {
      if (this.context) {
        // set the dimensions of the coordinate system.
        // the size of the box will be set in CSS and should scale for us
        canvas.setAttribute('width', GAME_WIDTH);
        canvas.setAttribute('height', GAME_HEIGHT);
        this.width = canvas.width;
        this.height = canvas.height;

        wnd.addEventListener('keydown', function (evt) {
          that.handleKeyDown(that, evt);
        }, true);
      } else {
        throw 'browser does not support 2d canvas';
      }
    } else {
      throw 'canvas element required';
    }

    this.drawVisitor = new DrawVisitor(canvas.getContext('2d'), this.Styles);
  }

  Engine.prototype.step = function () {
    if (this.logic.inGame()) {
      // game logic
      this.inGame.step(this.logic);
    }
  }

  Engine.prototype.move = function (timestamp) {
    this.inGame.move(timestamp);
  };

  Engine.prototype.clear = function () {
    this.context.fillStyle  = this.backgroundColor;
    this.context.fillRect(0, 0, this.width, this.height);
  };

  Engine.prototype.drawText = function (value, x, y) {
    this.context.fillStyle = this.textColor;
    this.context.font = this.font;
    this.context.textBaseline = 'top';

    this.context.fillText(value, x, y);
  };

  Engine.prototype.drawCenteredText = function (value, x1, x2, y) {
    var textWidth,
        x;

    this.context.fillStyle = this.textColor;
    this.context.font = this.font;
    this.context.textBaseline = 'top';

    textWidth = this.context.measureText(value).width;
    x = (x2 - x1 - textWidth) / 2;
    this.context.fillText(value, x, y);
  };

  Engine.prototype.draw = function () {

    if (this.logic.inGame()) {
      // todo this should be all part of in game statuses
      var lines = [ this.inGame.getStatusMsg()[0], 
                    'paddle: ' + this.inGame.paddle.describe(),
                    'ball: ' + this.inGame.ball.describe()
                  ];
      var height = 14;
      for (var i = 0; i < lines.length; i++) {
        this.drawText(lines[i], 0, height * i);
      }
    }

    var message = this.logic.getMessage();
    if (message !== '') {
      // todo prettify
      this.drawCenteredText(message, 0, this.width, 16);
    }
    message = this.logic.getStatusMsg(0);
    if (message !== '') {
      this.drawCenteredText(message, 0, this.width, 36);      
    }
  
    this.inGame.visitShapes(this.drawVisitor);
  };

  Engine.prototype.gameLoop = function (fps, timestamp) {
    Globals.processCommands();
    this.step();
    if (this.logic.inGame()) {
      this.move(timestamp);
    }
    this.clear();
    this.draw();

    this.logic.setStatusMsg(0, fps + ' FPS');
  };

  /** 
   * Main entry point
   */
  function main() {
    var engine = new Engine(GAME_WIDTH, GAME_HEIGHT),
        canvasElem = document.getElementById('myCanvas');

    engine.initialize(window, canvasElem);

    var requestAnimationFrame = window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;

    var start = null,
        frames = 0,
        fps = 0;

    /**
     * Game loop.
     * @timestamp {DOMHighResTimeStamp} time in milliseconds at which the repaint is scheduled to occur. 
     */
    function step(timestamp) {
      if (start === null) {
        start = timestamp;
      }
      if ((timestamp - start) >= 1000) {
        fps = frames;
        frames = 0;
        start = timestamp;
      }
      frames++;
      engine.gameLoop(fps, timestamp);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  main();
});