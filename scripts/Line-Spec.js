define(
	[
		"Vector",
		"Line",
		"Box"
	],
	function (Vector, Line, Box) {
		describe("line", function () {

			it("collides when ends on line", function () {
				var line = new Line(100, 100, 200, 100),
					ballLine = new Line(98, 98, 100, 100),
					last = new Vector(0, 0),
					velocity = new Vector(2, 2),
					result;

				 result = line.bounce(ballLine, velocity, last);

				 expect(result).not.toBeNull();
				 expect(result.Line.p0).toEqual(new Vector(100, 100));
				 expect(result.Line.p1).toEqual(new Vector(100, 100));
				 expect(result.Velocity).toEqual(new Vector(2, -2));
			});

			it("doesnt collide when starting on a line", function () {
				var line = new Line(100, 100, 200, 100),
					ballLine = new Line(100, 100, 102, 98),
					last = new Vector(100, 100),
					velocity = new Vector(2, -2),
					result;

				 result = line.bounce(ballLine, velocity, last);

				 expect(result).toBeNull();
			});

/*
			it("can collide with a corner", function () {
				// todo
				expect(true).toEqual(false);
			});
*/

			it("can calculate vector from p1 to p2", function () {
				var line = new Line(10, 11, 2, 13, 'ball line');
				var result = line.velocity();

				expect(result).toEqual(new Vector(-8, 2));
			});


			it("can return the smallest box surrounding a line", function () {
				var line = new Line(10, 11, 2, 3, 'ball line');
				var result = line.boundingBox();

				expect(result).toEqual(new Box(2, 3, 10, 11));
			});

			it("can we converted to meaningful string", function () {
				var l = new Line(0, 1, -2, 3, 'fixed line'),
					a = l.toString();

				expect(a).toEqual("[object Line <(0, 1), (-2, 3)>]");
			});

			it("can bounce a ball when it ends on a line", function () {
				var ball = new Line(50, 92, 50, 100, 'ball line'),
					line = new Line(0, 100, 100, 100, 'fixed line'),
					v = new Vector(0, 8),
					newPosition = line.velocityReflect(v);

				expect(newPosition).toEqual(new Vector(0, -8));
			});

			it("can bounce a ball off a diagonal (bl-tr) line", function () {
				var ball = new Line(50, 0, 50, 90, 'ball'),
					wall = new Line(0, 100, 100, 0, 'wall'),
					result = wall.bounce(ball, ball.velocity(), new Vector(-10, -10));

				expect(result.Line).toEqual(new Line(50, 50, 10, 50));
			});

			it("can bounce a ball moving horizontally into a vertical line", function () {
				var ball = new Line(50, 10, -10, 10, 'ball'),
					wall = new Line(0, 0, 0, 20, 'wall'),
					result = wall.bounce(ball, ball.velocity(), new Vector(-10, -10));

				expect(result.Line).toEqual(new Line(0, 10, 10, 10));
			});

			it("takes into account the balls radius when bouncing off a line", function () {
				var ball = new Line(10, 0, 10, 60, 'ball line'),
				 	r = 5,
					line = new Line(0, 50, 20, 50, 'fixed line'),
					result = line.bounceWithRadius(ball, r, ball.velocity(), new Vector(-10, -10));
				
				expect(result).not.toBeNull();	
				expect(result.Line).toEqual(new Line(10, 45, 10, 30));
			});

			it("takes into account the balls radius when bouncing off a line 2", function () {
				var ball = new Line(150, 196, 150, 204, 'ball'),
				  r = 1,
					line = new Line(100, 200, 200, 200, 'fixed line'),
					result = line.bounceWithRadius(ball, r, ball.velocity(), new Vector(-10, -10));

				expect(result.Line).toEqual(new Line(150, 199, 150, 194));
			});

			it("takes into account the balls radius when bouncing off a line 3", function () {
				var ball = new Line(150, 7, 150, -1, 'ball'),
				  r = 2,
					line = new Line(0, 0, 200, 0, 'fixed line'),
					result = line.bounceWithRadius(ball, r, ball.velocity(), new Vector(-10, -10));

				expect(result.Line).toEqual(new Line(150, 2, 150, 5));
			});

			it("takes into account the balls radius when bouncing off a line 4", function () {
				var ball = new Line(10, 5, 10, 6, 'ball'),
				 	r = 5,
					wall = new Line(0, 10, 20, 10, 'wall'),
					result = wall.bounceWithRadius(ball, r, ball.velocity(), new Vector(-10, -10));

				expect(result.Line).toEqual(new Line(10, 5, 10, 4));
			});

			it("takes into account the balls radius when bouncing off a line 5", function () {
				var ball = new Line(5, 5, 5, 6, 'ball'),
				 	r = 5,
					wall = new Line(1, 10, 10, 10, 'wall'),
					result = wall.bounceWithRadius(ball, r, ball.velocity(), new Vector(-10, -10));

				expect(result.Line).toEqual(new Line(5, 5, 5, 4));
			});

		 	it("can extend a perpendicular to another line", function () {
				var ballLine = new Line(10, 0, 10, 10, 'ball line'),
				  r = 5,
					line = new Line(0, 50, 20, 50, 'fixed line'),
					newPosition = line.extendTowards(ballLine, r);

				expect(newPosition).toEqual(new Line(0, 45, 20, 45));
			});

			it("can extend a perpendicular to another line 2", function () {
				var ballLine = new Line(150, 10, 150, 20, 'ball line'),
				  r = 5,
					line = new Line(100, 100, 200, 150, 'fixed line'),
					newPosition = line.extendTowards(ballLine, r);
					newPosition = newPosition.toFixed(0);

				expect(newPosition).toEqual(new Line(102, 96, 202, 146));
			});

			// it("can calculate multiple collisions", function () {

			// 	var lines = [
			// 		new Line(0, 0, 50, 0, 'top'),
			// 		new Line(0, 50, 50, 50, 'bottom'),
			// 		new Line(0, 0, 50, 50, 'left'),
			// 		new Line(50, 0, 50, 50, 'right'),
			// 		new Line(0, 0, 50, 50, 'diagonal tl-br'),
			// 	];

			// 	var start = new Vector(25, 6);
			// 	var velocity = new Vector(0, 20);
			// 	var radius = 5;

			// 	var result = Line.collideWithLines(start, velocity, radius, lines, new Vector(-10, -10));

			// 	expect(result.Line).toEqual(new Line(25, 18, 33, 18));
			// });

			// it("can calculate collisions with bottom line", function () {
			// 	var lines = [
			// 		// bottom
			// 		new Line(50, 220, 200, 215, 'bottom'),
			// 	];

			// 	var start = new Vector(174, 211);
			// 	var velocity = new Vector(1.8, -3.2);
			// 	var radius = 5;

			// 	var result = Line.collideWithLines(start, velocity, radius, lines);

			// 	expect(result.Line).toEqual(new Line(174, 211, 175.8, 207.8));
			// 	expect(result.Velocity).toEqual(new Vector(1.8, -3.2));
			// });
		});
	}
);
