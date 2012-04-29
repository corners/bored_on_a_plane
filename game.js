"use strict";

// todo namespace



function Paddle(id) {
  this.id = id;
  this.x = -1;
  this.y = -1;
  this.width = 20;
  this.height = 6;
  this.fillStyle = 'red';
  this.velocity = 0; // should be in pixels per second... not there yet
}

// returns true if point (x, y) inside box (x,y,width,height).
function hitTest(pt, box) {
  return (pt.x >= box.x && 
    pt.x <= box.x + box.width && 
    pt.y >= box.y && 
    pt.y <= box.y + box.height);
}

function Vector(magnitude, direction) {
  this.magnitude = magnitude; // pixels per second
  this.direction = direction; // angle in radians
}

function Ball(id, x, y) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.radius = 2;
  this.color = 'white';
  this.v = new Vector(75, Math.PI * 0.25);
}

Ball.prototype.boundingBox = function () {  
  return {
    x1: this.x - this.radius,
    y1: this.y - this.radius,
    x2: this.x + this.radius,
    y2: this.y + this.radius
  };
};

Ball.prototype.move = function (fps) {
  var xd,
    yd,
    magnitude = this.v.magnitude / fps;

  xd = Math.cos(this.v.direction) * magnitude;
  yd = -Math.sin(this.v.direction) * magnitude;

  this.x += xd;
  this.y += yd;
};

function Engine() {
  this.paused = false;
  this.i = 0;
  this.canvas = null;
  this.context = null;
  this.width = -1;
  this.height = -1;
  this.fps = 50;
  this.interval_ms = 1000 / this.fps;

  // colors
  this.backgroundColor = '#000'; // black
  this.textColor = '#fff';

  // fonts
  this.font = '12px sans-serif';

  // game object
  this.paddle = new Paddle('paddle');
  this.ball = null;
  
  // input
  this.velocityInput = 0; // amount to adjust paddle velocity. left < 0. right > 0
  
  // dashboard
  this.message = '';
  
  
  this.paused = false;
}

Engine.prototype.togglePause = function () {
  this.paused = !this.paused;
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

Engine.prototype.initializeNewBall = function (x, y){
  this.ball = new Ball('main ball', x, y);
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
      this.width = canvas.width;
      this.height = canvas.height;

      this.paddle.x = (this.width - this.paddle.width) / 2;
      this.paddle.y = this.height - this.paddle.height - 10;

      this.initializeNewBall(this.paddle.x, this.height - this.paddle.height - 10);

      wnd.addEventListener('keydown', function (evt) {
        that.handleKeyDown(that, evt);
      }, true);
    } else {
      throw 'browser does not support 2d canvas';
    }
  } else {
      throw 'canvas element required';
  }
};

Engine.prototype.handleAction = function () {
  var maxVelocity = 10,
    step = 1;

  if (this.paused) {
    this.message = 'paused';
  } else {
    this.message = '';
  }

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

Engine.prototype.move = function () {
  var box;

  if (this.i === 65535) {
    this.i = 0;
  } else {
    this.i++;
  }
  this.paddle.x += this.paddle.velocity;

  // collision detection
  // ball on wall
  box = this.ball.boundingBox();
  if (box.x2 >= this.width) {
  	this.ball.v.direction += 0.5 * Math.PI;
  } else if (box.x1 <= 0) {
  	this.ball.v.direction -= 0.5 * Math.PI;
  } else if (box.y2 >= this.height) {
  	this.ball.v.direction += 0.5 * Math.PI;
  } else if (box.y1 <= 0) {
  	this.ball.v.direction -= 0.5 * Math.PI;
  }

  // paddle on wall
  if (this.paddle.x <= 0) {
    this.paddle.x = 0;
    this.paddle.velocity = 0;
  } else if (this.paddle.x + this.paddle.width >= this.width) {
    this.paddle.x = this.width - this.paddle.width;
    this.paddle.velocity = 0;
  }
  
  // ball on paddle
  if (hitTest(this.ball, this.paddle)) {
    this.message = 'strike';
  } else {
    this.message = '';
  }
  
  this.ball.move(this.fps);
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

Engine.prototype.drawBall = function (ball)
{
  this.context.fillStyle = ball.color;
  this.context.beginPath();
  this.context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
  this.context.closePath();
  this.context.fill();
};

Engine.prototype.drawPaddle = function (paddle) {
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
};

Engine.prototype.draw = function () {

  this.drawText('i=' + this.i + 
    ' velocity=' + this.paddle.velocity + 
    ' ball: ' +
    ' x=' + this.ball.x + 
    ' y=' + this.ball.y, 0, 0);
   this.drawText(' d=' + this.ball.v.direction / Math.PI + 
    ' v=' + this.ball.v.magnitude, 0, 12);
    
  if (this.message !== '') {
    // todo centre and prettify
    this.drawText(this.message, 0, 36);
  }

  this.drawPaddle(this.paddle);
  this.drawBall(this.ball);
};

Engine.prototype.gameLoop = function (that) {
  that.handleAction();
  if (!that.paused) {
    that.move();
  }
  that.clear();
  that.draw();
  var gLoop = setTimeout(function () { 
    that.gameLoop(that);
  }, this.interval_ms);
};

(function () {
  var engine = new Engine(),
    canvasElem = document.getElementById('myCanvas');
    
  engine.initialize(window, canvasElem);
  engine.gameLoop(engine);
  
  var elem = document.getElementById('moveLeft');
  elem.onclick = function () {
  	engine.moveLeft();
  };
  elem = document.getElementById('moveRight');
  elem.onclick = function () {
    engine.moveRight();
  };
  elem = document.getElementById('pause');
  elem.onclick = function () {
    engine.togglePause();
  };


  canvasElem.onclick = function (evt) {
    var half = engine.width * 0.5;
    if (evt.x < half) {
      engine.moveLeft();
    } else {
      engine.moveRight();
    }
  };
})();


// context.beginPath();
// // Start from the top-left point.
// context.moveTo(10, 10); // give the (x,y) coordinates
// context.lineTo(100, 10);
// context.lineTo(10, 100);
// context.lineTo(10, 10);

// // Done! Now fill the shape, and draw the stroke.
// // Note: your shape will not be visible until you call any of the two methods.
// context.fill();
// context.stroke();
// context.closePath();



// // You need to provide the source and destination (x,y) coordinates 
// // for the gradient (from where it starts and where it ends).
// var gradient1 = context.createLinearGradient(150, 10, 50, 50);

// // Now you can add colors in your gradient.
// // The first argument tells the position for the color in your gradient. The 
// // accepted value range is from 0 (gradient start) to 1 (gradient end).
// // The second argument tells the color you want, using the CSS color format.
// gradient1.addColorStop(0,   '#f00'); // red
// gradient1.addColorStop(0.5, '#ff0'); // yellow
// gradient1.addColorStop(1,   '#00f'); // blue

// // For the radial gradient you also need to provide source
// // and destination circle radius.
// // The (x,y) coordinates define the circle center points (start and 
// // destination).
// var gradient2 = context.createRadialGradient(sx, sy, sr, dx, dy, dr);

// // Adding colors to a radial gradient is the same as adding colors to linear 
// // gradients.
