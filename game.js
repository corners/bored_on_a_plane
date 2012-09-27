(function () {
	"use strict";

	// todo namespace
	var PADDLE_COLOR = 'red',
		PADDLE_WIDTH = 20,
		PADDLE_HEIGHT = 2;

	var BALL_START_POSITION = new Vector(150,93),
		BALL_START_VELOCITY = new Vector(0, 8),
		BALL_RADIUS = 2;


	function Paddle(id) {
	  this.id = id;
	  this.x = -1;
	  this.y = -1;
	  this.width = PADDLE_WIDTH;
	  this.height = PADDLE_HEIGHT;
	  this.fillStyle = PADDLE_COLOR;
	  this.velocity = 0; // should be in pixels per second... not there yet
	}

	// returns true if point (x, y) inside box (x,y,width,height).
	function hitTest(pt, box) {
	  return (pt.x >= box.x &&
		pt.x <= box.x + box.width &&
		pt.y >= box.y &&
		pt.y <= box.y + box.height);
	}

	function Ball(id, x, y) {
	  this.id = id;
	  this.position = BALL_START_POSITION;
	  this.velocity = BALL_START_VELOCITY;
	  this.radius = BALL_RADIUS;
	  this.color = 'white';
	}

	Ball.prototype.boundingBox = function () {
	  return new Box(this.position.x - this.radius, this.position.y - this.radius, this.position.x + this.radius, this.position.y + this.radius);
	};

	Ball.prototype.move = function () {
	  return this.position.add(this.velocity);
	};

	function Engine() {
	  this.paused = false;
	  this.i = 0;
	  this.canvas = null;
	  this.context = null;
	  this.width = -1;
	  this.height = -1;
	  this.fps = 1;
	  this.interval_ms = 1000 / this.fps;

	  // colors
	  this.backgroundColor = '#000'; // black
	  this.textColor = '#fff';

	  // fonts
	  this.font = '12pt sans-serif';

	  // game object
	  this.paddle = new Paddle('paddle');
	  this.ball = null;

	  // input
	  this.velocityInput = 0; // amount to adjust paddle velocity. left < 0. right > 0

	  // dashboard
	  this.message = '';

	  this.lines = [
		  new Line(100, 100, 200, 100),
	    new Line(100, 200, 200, 200)//,
//		  new Line(400, 400, 300, 300),
//		  new Line(100, 400, 200, 325)
	  ];

	  this.gameState = 0;
	}

	Engine.GAMEOVER = 0;
	Engine.INGAME = 1;
	Engine.PAUSED = 3;

	Engine.prototype.startGame = function () {
	  this.gameBox = new Box(0, 0, this.width, this.height);

	  // game object
	  this.paddle = new Paddle('paddle');
	  this.paddle.x = (this.width - this.paddle.width) / 2;
	  this.paddle.y = this.height - this.paddle.height - 10;

	  this.ball = null;
	  this.ball = new Ball('main ball', this.paddle.x, this.height - this.paddle.height - 10);

	  // input
	  this.velocityInput = 0; // amount to adjust paddle velocity. left < 0. right > 0

	  // dashboard
	  this.message = '';

	  this.gameState = Engine.INGAME;
	};

	Engine.prototype.pressButton1 = function () {
	  if (this.gameState === Engine.INGAME) {
		this.gameState = Engine.PAUSED;
	  } else if (this.gameState === Engine.PAUSED) {
		this.gameState = Engine.INGAME;
	 } else if (this.gameState === Engine.GAMEOVER) {
		this.startGame();
	  }
	};

	Engine.prototype.moveLeft = function () {
	  this.velocityInput -= 1;
	};

	Engine.prototype.moveRight = function () {
	  this.velocityInput += 1;
	};

	Engine.prototype.handleKeyDown = function (that, evt) {
	  switch (evt.keyCode) {
		// Left arrow.
		case 37:
		  that.moveLeft();
		  break;

		// Right arrow.
		case 39:
		  that.moveRight();
		  break;
	  }
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
			canvas.setAttribute('width', '640');
			canvas.setAttribute('height', '480');
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

	Engine.prototype.handleAction = function () {
	  var maxVelocity = 10,
		step = 1;

	  if (this.velocityInput < 0) {
  		// paddle left
  		if (this.paddle.velocity <= 0) {
	  	  this.paddle.velocity += this.velocityInput;
		  } else {
  		  // If we're going in the opposite direction slow down fast
	  	  this.paddle.velocity = 0;
		  }
  		if (this.paddle.velocity < -maxVelocity) {
  		  this.paddle.velocity = -maxVelocity;
  		}
	  } else if (this.velocityInput > 0) {
	  	// paddle right
		  if (this.paddle.velocity >= 0) {
		     this.paddle.velocity += this.velocityInput;
	  	} else {
		    // If we're going in the opposite direction slow down fast
		    this.paddle.velocity = 0;
		  }
		  if (this.paddle.velocity > maxVelocity) {
		    this.paddle.velocity = maxVelocity;
		  }
	  }

	  this.velocityInput = 0;
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
	 * Collides the ball with the given lines until its velocity is exhaused.
	 */
	Engine.prototype.collideWithLines = function (ballLine, ballVelocity, radius, lines) {
		var newLine,
			line;

		for (var i = 0; i < lines.length; i++) {
			line = lines[i];
			newLine = line.bounceWithRadius(ballLine, radius);
			if (newLine !== null) {
			  ballLine = newLine;
			  ballVelocity = line.velocityReflect(ballVelocity);
			}
		}
		return {
			Velocity : ballVelocity,
			Line : ballLine
		}
	};

	Engine.prototype.move = function () {
	  var box,
	    line;

	  if (this.i === 65535) {
	  	this.i = 0;
	  } else {
		  this.i += 1;
	  }

	  this.paddle.x += this.paddle.velocity;

	  var b0 = this.ball.position,
	    b1 = this.ball.move(),
	    bline = new Line(b0.x, b0.y, b1.x, b1.y),
	    rline,
	    newv = this.ball.velocity.clone();

	  // collision detection
    // todo properly
	// todo bounding boxes to identify those lines we may have collided with
	  var walls = [
	    // top
	    new Line(0, 0, this.width, 0),
      // bottom
	    new Line(0, this.height - 11, this.width, this.height - 11),
	    // left
	    new Line(1, 0, 1, this.height),
	    // right
	    new Line(this.width, 0, this.width, this.height),
	  ];

		// on walls
		var result = this.collideWithLines(bline, newv, this.ball.radius, walls);
		bline = result.Line;
		newv = result.Velocity;

		// ball on lines
		result = this.collideWithLines(bline, newv, this.ball.radius, this.lines);
		bline = result.Line;
		newv = result.Velocity;

    this.ball.position = bline.p1.toFixed(0);
    this.ball.velocity = newv.toFixed(0);
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

	Engine.prototype.drawBall = function (ball)
	{
	  if (ball !== null) {
		this.context.fillStyle = ball.color;
		this.context.beginPath();
		this.context.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2, true);
		this.context.closePath();
		this.context.fill();
	  }
	};

	Engine.prototype.drawPaddle = function (paddle) {
	  if (paddle !== null) {
		 this.context.fillStyle = paddle.fillStyle;
		 this.context.globalAlpha = 1.0;
		 this.context.beginPath();
		 this.context.moveTo(paddle.x, paddle.y);
		 this.context.lineTo(paddle.x + paddle.width, paddle.y);
		 this.context.lineTo(paddle.x + paddle.width, paddle.y + paddle.height);
		 this.context.lineTo(paddle.x, paddle.y + paddle.height);
		 this.context.lineTo(paddle.x, paddle.y);
		 this.context.closePath();
		 this.context.fill();
	   }
	};

	Engine.prototype.drawLine = function (line) {
		if (line !== null) {
			this.context.beginPath();
			this.context.moveTo(line.p0.x, line.p0.y);
			this.context.lineTo(line.p1.x, line.p1.y);
			this.context.lineWidth = line.width;
			this.context.strokeStyle = line.strokeStyle;
			this.context.stroke();
		}
	};

	Engine.prototype.draw = function () {
	  if (this.gameState === Engine.INGAME) {
		this.drawText('i=' + this.i +
		  ' velocity=' + this.paddle.velocity +
		  ' ball: ' +
		  ' x=' + this.ball.position.x +
		  ' y=' + this.ball.position.y, 0, 0);
		 this.drawText(' v.x=' + this.ball.velocity.x +
		  ' v.y=' + this.ball.velocity.y, 0, 12);
	 } else if (this.ball !== null && this.ball.position !== null) {
	   this.drawText('ball: x=' + this.ball.position.x + ' y=' + this.ball.position.y, 0, 0);
	 }
	  if (this.message !== '') {
	  	// todo prettify
		  this.drawCenteredText(this.message, 0, this.width, 36);
  	}

	  this.drawPaddle(this.paddle);
	  this.drawBall(this.ball);
	  for (var i = 0; i < this.lines.length; i++) {
		  this.drawLine(this.lines[i]);
	  }
	};

	Engine.prototype.gameLoop = function (that) {
	  that.handleAction();
	  that.logic();
	  if (this.gameState === Engine.INGAME) {
	  	that.move();
	  }
	  that.clear();
	  that.draw();
	  var gLoop = setTimeout(function () {
	  	that.gameLoop(that);
	  }, this.interval_ms);
	};


  // Main
  var engine = new Engine(),
  canvasElem = document.getElementById('myCanvas');

  engine.initialize(window, canvasElem);
  engine.gameLoop(engine);

  var elem = document.getElementById('moveLeft');
  elem.onclick = function () { engine.moveLeft(); };
  elem = document.getElementById('moveRight');
  elem.onclick = function () { engine.moveRight(); };
  elem = document.getElementById('button1');
  elem.onclick = function () { engine.pressButton1(); };

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

  canvasElem.onclick = function (evt) {
    var half = engine.width * 0.5;
    if (evt.x < half) {
      engine.moveLeft();
    } else {
      engine.moveRight();
    }
  };
})();


