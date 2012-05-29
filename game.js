"use strict";

// todo namespace


function Paddle(id) {
    this.id = id;
    this.x = -1;
    this.y = -1;
    this.width = 20;
    this.height = 2;
    this.fillStyle = 'red';
    this.velocity = 0; // should be in pixels per second... not there yet
}

// returns true if point (x, y) inside box (x,y,width,height).
function hitTest(pt, box) {
    return (pt.x >= box.x && pt.x <= box.x + box.width && pt.y >= box.y && pt.y <= box.y + box.height);
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
    var xd, yd, magnitude = this.v.magnitude / fps;

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

    this.gameState = 0;
}

Engine.GAMEOVER = 0;
Engine.INGAME = 1;
Engine.PAUSED = 3;

Engine.prototype.startGame = function () {
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
        if (box.y2 >= this.height) {
            this.gameState = Engine.GAMEOVER;
        }
    } else if (this.gameState === Engine.PAUSED) {
        this.message = 'paused';
    } else if (this.gameState === Engine.GAMEOVER) {
        this.message = 'game over press button1 to play again';
    }
};

Engine.prototype.move = function () {
    var box;

    if (this.i === 65535) {
        this.i = 0;
    } else {
        this.i += 1;
    }

    this.paddle.x += this.paddle.velocity;

    // collision detection
    // ball on wall
    box = this.ball.boundingBox();
    if (box.x2 >= this.width) {
        this.ball.v.direction += 0.5 * Math.PI;
    } else if (box.x1 <= 0) {
        this.ball.v.direction -= 0.5 * Math.PI;
    } else if (box.y1 <= 0) {
        this.ball.v.direction -= 0.5 * Math.PI;
    }

    // ball on paddle
    if (box.y2 >= this.paddle.y && box.x1 >= this.paddle.x && box.x2 <= this.paddle.x + this.paddle.width) {
        this.ball.v.direction += 0.5 * Math.PI;
        this.message = 'strike';
    } else {
        this.message = '';
    }

    // paddle on wall
    if (this.paddle.x <= 0) {
        this.paddle.x = 0;
        this.paddle.velocity = 0;
    } else if (this.paddle.x + this.paddle.width >= this.width) {
        this.paddle.x = this.width - this.paddle.width;
        this.paddle.velocity = 0;
    }

    this.ball.move(this.fps);
};

Engine.prototype.clear = function () {
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.width, this.height);
};

Engine.prototype.drawText = function (value, x, y) {
    this.context.fillStyle = this.textColor;
    this.context.font = this.font;
    this.context.textBaseline = 'top';

    this.context.fillText(value, x, y);
};

Engine.prototype.drawCenteredText = function (value, x1, x2, y) {
    var textWidth, x;

    this.context.fillStyle = this.textColor;
    this.context.font = this.font;
    this.context.textBaseline = 'top';

    textWidth = this.context.measureText(value).width;
    x = (x2 - x1 - textWidth) / 2;
    this.context.fillText(value, x, y);
};

Engine.prototype.drawBall = function (ball) {
    if (ball !== null) {
        this.context.fillStyle = ball.color;
        this.context.beginPath();
        this.context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
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

Engine.prototype.draw = function () {
    if (this.gameState === Engine.INGAME) {
        this.drawText('i=' + this.i + ' velocity=' + this.paddle.velocity + ' ball: ' + ' x=' + this.ball.x + ' y=' + this.ball.y, 0, 0);
        this.drawText(' d=' + this.ball.v.direction / Math.PI + ' v=' + this.ball.v.magnitude, 0, 12);
    }
    if (this.message !== '') {
        // todo prettify
        this.drawCenteredText(this.message, 0, this.width, 36);
    }

    this.drawPaddle(this.paddle);
    this.drawBall(this.ball);
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
    elem = document.getElementById('button1');
    elem.onclick = function () {
        engine.pressButton1();
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
