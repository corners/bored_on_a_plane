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
require(['underscore', 'Vector', 'Line', 'Box', 'Block', 'Ball', 'Paddle', 'Level', 'Styles'],
          function (_, Vector, Line, Box, Block, Ball, Paddle, Level, Styles) {

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

  var PADDLE_WIDTH = 80,
      PADDLE_HEIGHT = 8;
  // todo start on paddle and release based on paddle direction and speed
  var BALL_RADIUS = 10,
//      BALL_START_POSITION = new Vector((GAME_WIDTH - BALL_RADIUS) / 2, 410),
      BALL_START_POSITION = new Vector((GAME_WIDTH - BALL_RADIUS) / 2, 210),
      BALL_START_VELOCITY = new Vector(2.5, 3);

  function createPaddle(x, y) {
    return new Paddle('paddle', x, y, PADDLE_WIDTH, PADDLE_HEIGHT, Styles.Paddle.Fill);
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
    this.paused = false;
    this.i = 0;
    this.canvas = null;
    this.context = null;
    this.width = width;
    this.height = height;

    this.keyPressNofifications = [];

    // colors
    this.backgroundColor = Styles.Game.Fill;
    this.textColor = Styles.Game.Stroke;

    // fonts
    this.font = Styles.Game.Font;

    // game objects
    this.paddle = createPaddle(200, 430);//height - 50);
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

    // dashboard
    this.message = '';

    var level = new Level(Styles.BlockStyle[0]);

    this.gameShapes = level.getLayout(width, height);

    // these shapes do not move
    this.staticCollidables = createCollidables(this.gameShapes);

    this.lastCollision = new Vector(-100, -100);
    this.gameState = 0;
  }

  /**
   * @returns {Collidable[]} array of collidable lines and their associated shapes.
   */
  Engine.prototype.getCollidables = function () {
    var dynamics = [ this.paddle ];
    var dynamicCollidables = createCollidables(dynamics);

    return dynamicCollidables.concat(this.staticCollidables);
  }

  /**
	  * Game is over or not started.
	  */
  Engine.GAMEOVER = 0;
  /**
	  * Game is active and not paused.
	  */
  Engine.INGAME = 1;
  /**
	  * Game is active but paused.
	  */
  Engine.PAUSED = 3;


  Engine.prototype.startGame = function () {
    this.gameBox = new Box(0, 0, this.width, this.height);

    this.ball = new Ball('main ball', this.paddle.x, this.height - this.paddle.height - 10, BALL_START_POSITION, BALL_START_VELOCITY, BALL_RADIUS);

    // dashboard
    this.message = '';

    this.gameState = Engine.INGAME;
    this.lastCollision = new Vector(-100, -100);
  };

  Engine.prototype.togglePauseResume = function () {
    if (this.gameState === Engine.INGAME) {
      this.gameState = Engine.PAUSED;
    } else if (this.gameState === Engine.PAUSED) {
      this.gameState = Engine.INGAME;
    } else if (this.gameState === Engine.GAMEOVER) {
      this.startGame(); // todo not supported yet. need to reset paddle rather than remove. need to handle number of lives
    }
  };

  Engine.prototype.onKeyPress = function (evt) {
    switch (evt.keyCode) {
      // space
      case 32:
        this.togglePauseResume();
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

    this.gameState = Engine.GAMEOVER;
  };

  Engine.prototype.logic = function () {
    var box;

    if (this.gameState === Engine.INGAME) {
      // game logic
      box = this.ball.boundingBox();
      if (!box.inside(this.gameBox)) {
        this.gameState = Engine.GAMEOVER;
      }
    } else if (this.gameState === Engine.PAUSED) {
      this.message = 'paused';
    } else if (this.gameState === Engine.GAMEOVER) {
      this.message = 'game over press space to play again';
    }
  };

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
    var ExtendTowardsFn = function (bb) {
        // Collidable = { line : Line, shape : Shape, bb : Box }
        var newLine = bb.line.extendTowards(ballLine, ballRadius);
        return {
          line: newLine,
          shape: bb.shape,
          bb: newLine.boundingBox(),
        };
    };
 
    var collidables = this.getCollidables();

    var done = false,
        collision;
    while (!done) {
      // Find all lines that collide and choose the closest
      var collisions = _.chain(collidables)
                          .filter(function (bb) {
                            return bb.shape.isVisible();
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
        collision.shape.onCollision();
        
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
    if (this.i === 65535) {
      this.i = 0;
    } else {
      this.i += 1;
    }
    // Collide with shapes
    var result = this.collideWithShapes(this.ball.position, this.ball.velocity, this.ball.radius, this.lastCollision);

    this.lastCollision = result.Collision;
    this.ball.position = result.Line.p1;
    this.ball.velocity = result.Velocity;
//    trace('posn=('+this.ball.position.x + ', ' + this.ball.position.y+ ')');

    this.paddle.move(timestamp);
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
    if (this.gameState === Engine.INGAME) {
      var lines = [ 'i:' + this.i, 
                    'paddle: ' + this.paddle.describe(),
                    'ball: ' + this.ball.describe()
                  ];
      var height = 14;
      for (var i = 0; i < lines.length; i++) {
        this.drawText(lines[i], 0, height * i);
      }
    }

    if (this.message !== '') {
      // todo prettify
      this.drawCenteredText(this.message, 0, this.width, 36);
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
// todo remember keypreses then notify in handleAction so we calculate everything at once
//    this.handleAction();
    this.logic();
    if (this.gameState === Engine.INGAME) {
      this.move(timestamp);
    }
    this.clear();
    this.draw();

    this.drawCenteredText(fps + ' FPS', 0, this.width, 36);
  };

  // Main
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
});