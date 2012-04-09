 "use strict"

// todo namespace

function Engine() {
  this.paused = false;
  this.i = 0;
  this.canvas = null;
  this.context = null;
  this.width = -1;
  this.height = -1;

  // colors
  this.backgroundColor = '#000'; // black
}

Engine.prototype.HandleKeyDown = function (that, evt) {
  switch (evt.keyCode) {

    // Left arrow.
    case 37:
      that.i = 0;
      //racquetX = racquetX - 20;
      //if (racquetX < 0) racquetX = 0;
      break;

    // Right arrow.
    case 39:
      that.i = 100;
      //racquetX = racquetX + 20;
      //if (racquetX > boardX - racquetW) racquetX = boardX - racquetW;
      break;
  }
};

Engine.prototype.Initialize = function (wnd, canvas) {
  var that = this;

  if (wnd === null) {
    // todo throw exception
    throw 'window element required'
  }

  if (canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  if (this.canvas) {
    if (this.context) {
      this.width = canvas.width;
      this.height = canvas.height;

      wnd.addEventListener('keydown', function (evt) {
        that.HandleKeyDown(that, evt);
      }, true);
    } else {
      throw 'browser does not support 2d canvas'
    }
  } else {
      throw 'canvas element required'
  }
};

Engine.prototype.Move = function () {
  this.i++;
};

Engine.prototype.Clear = function () {
  this.context.fillStyle   = this.backgroundColor;
  this.context.fillRect(0, 0, this.width, this.height);
};

Engine.prototype.Draw = function () {

  this.context.fillStyle   = '#00f'; // blue
  this.context.strokeStyle = '#f00'; // red
  this.context.lineWidth   = 4;      

  this.context.fillStyle    = '#00f';
  this.context.font         = 'italic 30px sans-serif';
  this.context.textBaseline = 'top';
  this.context.fillText('Loop counter=' + this.i, 0, 0);
};

Engine.prototype.GameLoop = function(that) {
  that.Move();
  that.Clear();
  that.Draw();
  var gLoop = setTimeout(function () { 
    that.GameLoop(that);
  }, 1000 / 50);
};

var engine = new Engine();
engine.Initialize(window, document.getElementById('myCanvas'));
engine.GameLoop(engine);

// // Set the style properties.
// context.fillStyle   = '#00f';
// context.strokeStyle = '#f00';
// context.lineWidth   = 4;

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
