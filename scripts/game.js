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
require(['underscore', 'Vector', 'Line', 'Box', 'Block', 'Ball', 'Paddle', 'Level'],
          function (_, Vector, Line, Box, Block, Ball, Paddle, Level) {

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

  var GAME_BACKGROUND = '#ddd',
      GAME_TEXT = '#000';

  var PADDLE_COLOR = 'red',
      PADDLE_WIDTH = 20,
      PADDLE_HEIGHT = 2;
  // todo start on paddle and release based on paddle direction and speed
  var BALL_RADIUS = 5,
      BALL_START_POSITION = new Vector((GAME_WIDTH - BALL_RADIUS) / 2, 410),
      BALL_START_VELOCITY = new Vector(2, 2);

  function createPaddle(x, y) {
    return new Paddle('paddle', x, y, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_COLOR);
  }

  /**
   * @shapes {Shape[]} objects from which to create bounding boxes for.
   * @returns {Collidable[] } array outer lines for each shape plus the shapes bounding box.
   * Collidable = { line : Line, shape : Shape, bb : Box }
   */
  function createBoundingBoxes(shapes) {
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
    this.backgroundColor = GAME_BACKGROUND;
    this.textColor = GAME_TEXT;

    // fonts
    this.font = '12pt sans-serif';

    // game objects
    this.paddle = createPaddle(width / 2, height - 50);
    this.keyPressNofifications.push(function(shape) { 
        return function (evt) {
          shape.onKeyPress(evt);
        };
      }(this.paddle));
    this.ball = null;

    // dashboard
    this.message = '';

    var level = new Level();

    // All game shapes must have the following Shape interface: outerLines(), boundingBox(), visible, onCollision(), draw(context)

    this.gameShapes = level.getLayout(width, height).concat(this.paddle);

    this.fixedBoundingBoxes = createBoundingBoxes(this.gameShapes);
  
    this.lastCollision = new Vector(-100, -100);
    this.gameState = 0;
  }

  /**
   * @returns {Collidable[]} array of collidable lines and their associated shapes.
   */
  Engine.prototype.getCollidables = function () {
    return this.fixedBoundingBoxes;// .concat(dynamicCollidables);
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

    // game object
    // this.paddle = createPaddle();
    // this.paddle.x = (this.width - this.paddle.width) / 2;
    // this.paddle.y = this.height - this.paddle.height - 10;

    this.ball = null;
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
      this.message = 'game over press button1 to play again';
    }
      };

  /**
	 * Collides the line the ball will take with the shapes on the screen until its length has been reached.
	 * Calculates the new volocity based on the reflected collisions.
	 */
  Engine.collideWithShapes = function (start, velocity, radius, boundingBoxes, lastCollision) {
    var result,
        initialVelocity = velocity.clone();

    var ballLine = Line.calculateLine(start, velocity);
    
    // find lines we could collide with using bounding boxes
    var lineBox = ballLine.boundingBox();
    var boxesOverlap = function(bb) {
      return bb.shape.isVisible() && (lineBox.intersects(bb.bb) || bb.bb.intersects(lineBox));
    };
    var bounceOffLine = function(bb) {
      return {
        collision: bb.line.bounceWithRadius(ballLine, radius, initialVelocity, lastCollision),
        shape: bb.shape
      };
    };
    var hasCollided = function (result) {
      return result.collision !== null
    };
    var closestCollision = function (result) {
        // assume line bouncing furthest means closest collision 
        return result.collision.Line.length();    
    };

    var done = false,
        collision;
    while (!done) {
      // Find all lines that collide and choose the closest
      collision = _.chain(boundingBoxes)      
                          .filter(boxesOverlap)
                          .map(bounceOffLine)
                          .filter(hasCollided)
                          .sortBy(closestCollision)
                          .first()
                          .value();

      if (collision) {
        // notif
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

  Engine.prototype.move = function () {
    if (this.i === 65535) {
      this.i = 0;
    } else {
      this.i += 1;
    }

    // Collide with shapes
    var collidables = this.getCollidables();
    var result = Engine.collideWithShapes(this.ball.position, this.ball.velocity, this.ball.radius, collidables, this.lastCollision);

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

  Engine.prototype.gameLoop = function (timestamp) {
// todo remember keypreses then notify in handleAction so we calculate everything at once
//    this.handleAction();
    this.logic();
    if (this.gameState === Engine.INGAME) {
      this.move();
    }
    this.clear();
    this.draw();

    this.drawCenteredText(timestamp, 0, this.width, 36);
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

  var start = Date.now();  // Only supported in FF. Other browsers can use something like Date.now().

  function step(timestamp) {
    var progress = timestamp - start;
    engine.gameLoop(progress);
    requestAnimationFrame(step);
    start = timestamp;
  }
  requestAnimationFrame(step);


  //var elem = document.getElementById('moveLeft');
  // elem.onclick = function () { engine.moveLeft(); };
  // elem = document.getElementById('moveRight');
  // elem.onclick = function () { engine.moveRight(); };
  var elem = document.getElementById('button1');
  elem.onclick = function () { engine.togglePauseResume(); };

  elem = document.getElementById('viewFullscreen');
  if (elem) {
    elem.addEventListener('click', function () {
      var elem = document.documentElement;

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
      else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      }
        else if (elem.webkitRequestFullScreen) {
          elem.webkitRequestFullScreen();
        }
        }, false);
  }

  elem = document.getElementById('cancelFullscreen');
  if (elem) {
    elem.addEventListener('click', function () {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
        else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
        });
  }
});


