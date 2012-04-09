 "use strict"



  var i = 0,
    paused = false;


// Get a reference to the element.
var elem = document.getElementById('myCanvas');

// Always check for properties and methods, to make sure your code doesn't break 
// in other browsers.
if (elem && elem.getContext) {

  // Get the 2d context.
  // Remember: you can only initialize one context per element.
  var context = elem.getContext('2d');
  if (context) {
    // You are done! Now you can draw your first rectangle.
    // You only need to provide the (x,y) coordinates, followed by the width and 
    // height dimensions.


    // Draw some rectangles.
    // context.fillRect  (0,   0, 150, 50);
    // context.strokeRect(0,  60, 150, 50);
    // context.clearRect (30, 25,  90, 60);
    // context.strokeRect(30, 25,  90, 60);

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

    var HandleKeyDown = function (evt) {
      switch (evt.keyCode) {

      // Left arrow.
      case 37:
        i = 0;
        //racquetX = racquetX - 20;
        //if (racquetX < 0) racquetX = 0;
        break;

      // Right arrow.
      case 39:
        i = 100;
        //racquetX = racquetX + 20;
        //if (racquetX > boardX - racquetW) racquetX = boardX - racquetW;
        break;
      }
    }  


    var Move = function () {
      i++;
    };
    var gLoop;

    var Clear = function () {
      context.fillStyle   = '#000'; // blue
      context.fillRect(0, 0, 450, 300);
    };

    var Draw = function () {

      context.fillStyle   = '#00f'; // blue
      context.strokeStyle = '#f00'; // red
      context.lineWidth   = 4;      

      context.fillStyle    = '#00f';
      context.font         = 'italic 30px sans-serif';
      context.textBaseline = 'top';
      context.fillText('Loop counter=' + i, 0, 0);
    };


    var GameLoop = function(){  
      Clear();  
      Move();
      Draw();
      gLoop = setTimeout(GameLoop, 1000 / 50);
    };


    window.addEventListener('keydown', HandleKeyDown, true);
    GameLoop(); 
  }
}