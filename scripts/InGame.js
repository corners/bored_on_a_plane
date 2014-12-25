define(
  // module name

  "InGame",

  // dependencies
  [ 'underscore', 'Globals', 'Vector', 'Line', 'Box', 'Block', 'Ball', 'Paddle', 'Level', 'Commands', 'Styles' ],

  // rudamentary "physics" for this game. rename 

  //The function to execute when all dependencies have loaded. The arguments
  //to this function are the array of dependencies mentioned above.
  function (_, Globals, Vector, Line, Box, Block, Ball, Paddle, Level, Commands, Styles) {
    "use strict";

    var GAME_WIDTH = 640,
        GAME_HEIGHT = 480;

    var BALL_RADIUS = 4,
    //      BALL_START_POSITION = new Vector((GAME_WIDTH - BALL_RADIUS) / 2, 410),
        BALL_START_POSITION = new Vector((GAME_WIDTH - BALL_RADIUS) / 2, 210),
        BALL_START_VELOCITY = new Vector(2.5, 3);

    var PADDLE_WIDTH = 70,
        PADDLE_HEIGHT = 6;
    // todo start on paddle and release based on paddle direction and speed


    function createPaddle() {
      return new Paddle('paddle', 0, 0, PADDLE_WIDTH, PADDLE_HEIGHT, Styles.Paddle.Fill);
    }

    function InGame(width, height) {
      this.i = 0;
      this.width = width;
      this.height = height;

      this.ball = null;
      this.paddle = null;
      this.gameBox = null
      this.gameShapes = null;
      this.staticCollidables = null;

      this.lastCollision = null;

      this.gameShapes = [];
    }

    // todo this really should be a static that creates an in-game class
    InGame.prototype.start = function () {
      var level = new Level(Styles.BlockStyle[0]);

      this.gameShapes = level.getLayout(this.width, this.height);
      // these shapes do not move
      this.staticCollidables = createCollidables(this.gameShapes);
      // this.lastCollision = new Vector(-100, -100);

      this.gameBox = new Box(0, 0, this.width, this.height);

      // game objects
      this.paddle = createPaddle();
      this.paddle.moveTo(200, 430);

      this.tryAgain();
      // this.ball = new Ball('main ball', this.paddle.x, this.height - this.paddle.height - 10, BALL_START_POSITION, BALL_START_VELOCITY, BALL_RADIUS);
      // this.lastCollision = new Vector(-100, -100);
    }

    /**
     * the game has started but the player has failed. This resets the ball and lets the user try again.
     */
    InGame.prototype.tryAgain = function () {
      //this.ball = new Ball('main ball', this.width * 0.5, (this.height - this.paddle.height - 10), BALL_START_POSITION, BALL_START_VELOCITY, BALL_RADIUS);
      this.ball = new Ball('main ball', -1, -1, BALL_START_POSITION, BALL_START_VELOCITY, BALL_RADIUS);
      this.lastCollision = new Vector(-100, -100);
    }

    InGame.prototype.visitShapes = function (visitor) {

      if (this.gameBox !== null) {
        this.gameBox.accept(visitor);
      }

      if (this.paddle !== null) {
        this.paddle.accept(visitor);
      }
      if (this.ball !== null) {
        this.ball.accept(visitor);
      }

      for (var i = 0; i < this.gameShapes.length; i++) {
        this.gameShapes[i].accept(visitor);
      }
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

    /**
     * @returns {Collidable[]} array of collidable lines and their associated shapes.
     */
    InGame.prototype.getCollidables = function () {
      var dynamics = [ this.paddle ];
      var dynamicCollidables = createCollidables(dynamics);

      return dynamicCollidables.concat(this.staticCollidables);
    }


    /**
     * Collides the line the ball will take with the shapes on the screen until its length has been reached.
     * Calculates the new velocity based on the reflected collisions.
     */
    InGame.prototype.collideWithShapes = function (start, velocity, radius, lastCollision) {
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



    InGame.prototype.move = function (timestamp) {
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
    }


    InGame.prototype.step = function (logic) {
      var box;
      
      if (this.ball) {
        box = this.ball.boundingBox();
        if (!box.inside(this.gameBox)) {
          // TODO event not command
          Globals.pushCommand(Commands.makePlayerDiedCommand(logic));
        }
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
