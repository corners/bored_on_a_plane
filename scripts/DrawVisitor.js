define(
	// module name
	"DrawVisitor",

	// dependencies
	[ 'Paddle', 'Styles' ],

	//The function to execute when all dependencies have loaded. The arguments
	//to this function are the array of dependencies mentioned above.
	function (Paddle, Styles) {
		"use strict";

		/**
		 * Visitor to draw objects.
		 * @param {context} display context to use for drawing.
		 */
		function DrawVisitor(context) {
			this.ctx = context;
		}


		DrawVisitor.prototype.drawCenteredText = function (value, x1, x2, y) {
			var textWidth,
				x;

			this.ctx.fillStyle = this.textColor;
			this.ctx.font = this.font;
			this.ctx.textBaseline = 'top';

			textWidth = this.ctx.measureText(value).width;
			x = (x2 - x1 - textWidth) / 2;
			this.ctx.fillText(value, x, y);
		};

		DrawVisitor.prototype.visitPaddle = function (paddle) {
			this.ctx.globalAlpha = 1.0;
			this.ctx.beginPath();
			this.ctx.rect(paddle.p.x, paddle.p.y, paddle.width, paddle.height);
			this.ctx.fillStyle = paddle.fillStyle;
			this.ctx.strokeStyle = paddle.strokeStyle;
			this.ctx.fill();
			this.ctx.lineWidth = paddle.lineWidth;
			this.ctx.stroke();
		}

		DrawVisitor.prototype.visitBox = function (box) {
		    this.ctx.fillStyle  = Styles.Game.Fill;//this.backgroundColor;
		    this.ctx.fillRect(box.x1, box.y1, box.width(), box.height());
		}

		DrawVisitor.prototype.visitBlock = function (block) {
			if (block.visible) {
				this.ctx.beginPath();
				this.ctx.rect(block.p.x, block.p.y, block.width, block.height);
				this.ctx.fillStyle = block.fillStyle;
				this.ctx.strokeStyle = block.strokeStyle;
				this.ctx.fill();
				this.ctx.lineWidth = block.lineWidth;
				this.ctx.stroke();

				if (block.shrinking) {
					block.shrink(2);
				}
			}
		}

		DrawVisitor.prototype.visitBall = function (ball) {
			this.ctx.fillStyle = ball.color;
			this.ctx.beginPath();
			this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2, true);
			this.ctx.closePath();
			this.ctx.fill();
		}

		DrawVisitor.prototype.visitLine = function (line) {
			var oldColor;

			if (line.visible) {
				this.ctx.beginPath();
				this.ctx.moveTo(line.p0.x, line.p0.y);
				this.ctx.lineTo(line.p1.x, line.p1.y);
				this.ctx.lineWidth = line.width;
				oldColor = this.ctx.strokeStyle;
				this.ctx.strokeStyle = line.strokeStyle;
				this.ctx.stroke();
				this.ctx.strokeStyle = oldColor;
			}
			if (line.animationStep === 1) {
				line.strokeStyle = line.colour;
				line.visible = line.fixed;
			}
			else if (line.animationStep > 1) {
				line.animationStep--;
			}
		}

		return DrawVisitor;
	}
);