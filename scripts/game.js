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
require(['underscore', 'Globals', 'Vector', 'Line', 'Box', 'Block', 'Ball', 'Paddle', 'Level', 'Styles', 'Commands', 'Logic', 'InGame'],
          function (_, Globals, Vector, Line, Box, Block, Ball, Paddle, Level, Styles, Commands, Logic, InGame) {

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

  var PADDLE_WIDTH = 70,
      PADDLE_HEIGHT = 6;
  // todo start on paddle and release based on paddle direction and speed
  var BALL_RADIUS = 4,
//      BALL_START_POSITION = new Vector((GAME_WIDTH - BALL_RADIUS) / 2, 410),
      BALL_START_POSITION = new Vector((GAME_WIDTH - BALL_RADIUS) / 2, 210),
      BALL_START_VELOCITY = new Vector(2.5, 3);

  function createPaddle() {
    return new Paddle('paddle', 0, 0, PADDLE_WIDTH, PADDLE_HEIGHT, Styles.Paddle.Fill);
  }

  /**
   * @shapes {Shape[]} objects from which to create bounding boxes for.
   * @returns {Collidable[] } array outer lines for each shape plus the shapes bounding box.
   * Collidable = { line : Line, shape : Shape, bb : Box }
   */
  function createCollidables(shapes) {
    return _.chain(shapes)
              .map(function (s) {
                var ols = s.outerLines();
                return _.map(ols, function (l) {
                  return { line : l, shape : s };
                });
              })
              .flatten()
              .map(function (ls) {
                return {
                  line : ls.line, shape : ls.shape, bb : ls.shape.boundingBox()
                };
              })
              .value();
  }

  function Engine(width, height) {
    //this.paused = false;
    this.logic = new Logic();
    this.inGame = new InGame();
    this.canvas = null;
    this.context = null;
    this.width = width;
    this.height = height;



    // List of functions to call when a key is pressed
    this.keyPressNofifications = [];

    // command queue. all commands should have an execute function
    //this.commands = [];

    // colors
    this.backgroundColor = Styles.Game.Fill;
    this.textColor = Styles.Game.Stroke;

    // fonts
    this.font = Styles.Game.Font;

    // game objects
    this.paddle = createPaddle();
    this.paddle.moveTo(200, 430);
    this.keyPressNofifications.push(function(shape) { 
        return function (evt) {
          shape.onKeyPress(evt);
        };
      }(this.paddle));
    this.keyPressNofifications.push(function(game) {
        return function (evt) {
          game.onKeyPress(evt);
        };
      }(this));


    this.ball = null;

    // // dashboard
    // this.message = '';

    var level = new Level(Styles.BlockStyle[0]);

    this.gameShapes = level.getLayout(width, height);

    // these shapes do not move
    this.staticCollidables = createCollidables(this.gameShapes);

    this.lastCollision = new Vector(-100, -100);
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

  /**
   * @returns {Collidable[]} array of collidable lines and their associated shapes.
   */
  Engine.prototype.getCollidables = function () {
    var dynamics = [ this.paddle ];
    var dynamicCollidables = createCollidables(dynamics);

    return dynamicCollidables.concat(this.staticCollidables);
  }

  Engine.prototype.startGame = function () {
    this.gameBox = new Box(0, 0, this.width, this.height);

    this.ball = new Ball('main ball', this.paddle.x, this.height - this.paddle.height - 10, BALL_START_POSITION, BALL_START_VELOCITY, BALL_RADIUS);

    // dashboard
//    this.message = '';
    this.logic.startGame();

    this.lastCollision = new Vector(-100, -100);
  };

  Engine.prototype.onKeyPress = function (evt) {
    switch (evt.keyCode) {
      // space
      case 32:
        Globals.pushCommand(Commands.makeTogglePauseCommand(this));
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
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
    }

    if (this.canvas) {
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
  }

  Engine.prototype.step = function () {
    var box;

    if (this.logic.inGame()) {
      // game logic
      if (this.ball) {
        box = this.ball.boundingBox();
        if (!box.inside(this.gameBox)) {
          this.logic.gameOver();
        }
      }
    }
  }

  /**
	 * Collides the line the ball will take with the shapes on the screen until its length has been reached.
	 * Calculates the new velocity based on the reflected collisions.
	 */
  Engine.prototype.collideWithShapes = function (start, velocity, radius, lastCollision) {
    var result,
        initialVelocity = velocity.clone();

    var ballLine = Line.calculateLine(start, velocity);
    var ballRadius = this.ball.radius;
    
    // find lines we could collide with using bounding boxes
    var lineBox = ballLine.boundingBox();

    // Returns true if the shape overlaps the bounding box of the ball line
    var BoxesOverlapFn = function(bb) {
      return bb.shape.isVisible() && (lineBox.intersects(bb.bb) || bb.bb.intersects(lineBox));
    };
    var BounceOffLineFn = function(bb) {
      return {
        collision: bb.line.bounce(ballLine, initialVelocity, lastCollision),
        shape: bb.shape
      };
    };
    var HasCollidedFn = function (result) {
      return result.collision !== null
    };
    var ClosestCollisionFn = function (result) {
      // assume line bouncing furthest means closest collision 
      return result.collision.Line.length();    
    };
    /**
     * Shift the line towards the ball line to take into account the radius of the ball
     */
    var ExtendTowardsFn = function (c) {
        // Collidable = { line : Line, shape : Shape, bb : Box }
        var offset = ballRadius - 1,
            newLine = c.line.extendTowards(ballLine, offset);
        return {
          line: newLine,
          shape: c.shape,
          bb: newLine.boundingBox(),
        };
    };
 
    var collidables = this.getCollidables();

    var done = false,
        collision;
    while (!done) {
      // Find all lines that collide and choose the closest
      var collisions = _.chain(collidables)
                          .filter(function (c) {
                            return c.shape.isVisible();
                          })
                          .map(ExtendTowardsFn)
                          .map(BounceOffLineFn)
                          .filter(HasCollidedFn)
                          .sortBy(ClosestCollisionFn)
                          .value();
      if (collisions.length > 1) {
        // TODO handle two collisions at the same distance
        // console.log('collisions = ' + collisions.length + ' 0:' + collisions[0].collision.Line.length()+ ' 1:' + collisions[1].collision.Line.length());
      }

      collision = _.chain(collisions)
                          .first()
                          .value();

      if (collision) {
        // notify
        Globals.pushCommand(Commands.makeDestroyShapeCommand(collision.shape));
//        Globals.pushCommand(Commands.makePauseCommand(this));
        
        ballLine = collision.collision.Line;
        lineBox = ballLine.boundingBox();
        velocity = collision.collision.Velocity;
        lastCollision = collision.collision.Collision;
        done = false;
      } else {
        done = true;
      }
    }
    return {
      Velocity : velocity,
      Line : ballLine,
      Collision : lastCollision
    };
  };

  Engine.prototype.move = function (timestamp) {
    this.inGame.move(timestamp);

    // Collide with shapes
    var result = this.collideWithShapes(this.ball.position, this.ball.velocity, this.ball.radius, this.lastCollision);

    this.lastCollision = result.Collision;
    this.ball.position = result.Line.p1;
    this.ball.velocity = result.Velocity;
//    trace('posn=('+this.ball.position.x + ', ' + this.ball.position.y+ ')');
  };

  Engine.prototype.clear = function () {
    this.context.fillStyle   = this.backgroundColor;
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
    // todo move into logic
    if (this.logic.inGame()) {
      var lines = [ this.inGame.getStatusMsg()[0], 
                    'paddle: ' + this.paddle.describe(),
                    'ball: ' + this.ball.describe()
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
  
    if (this.paddle !== null) {
      this.paddle.draw(this.context);
    }
    if (this.ball !== null) {
      this.ball.draw(this.context);
    }

    for (var i = 0; i < this.gameShapes.length; i++) {
      this.gameShapes[i].draw(this.context);
    }
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