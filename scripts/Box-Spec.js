define(
	[
		"Vector",
		"Line",
		"Box"
	],
	function (Vector, Line, Box) {
		describe("box", function () {

			it("can determine if one line_box intersects another", function () {
				var b0 = new Box(100, 102, 200, 102),
					b1 = new Box(100, 100, 102, 102),
					result = b0.intersects(b1);

				expect(result).toEqual(true);
			});

			it("can determine if one box intersects another", function () {
				var b0 = new Box(100, 100, 200, 200),
					b1 = new Box(120, 120, 140, 140),
					result = b0.intersects(b1);

				expect(result).toEqual(true);
			});

			it("can determine if one box inside another", function () {
				var b0 = new Box(10, 10, 20, 20),
					b1 = new Box(0, 0, 100, 100),
					inside = b0.inside(b1);

				expect(inside).toEqual(true);
			});

			it("treats on the lines as in the box", function () {
				var box = new Box(0, 0, 400, 400),
				  topLeft = new Box(0, 0, 1, 1),
				  topRight = new Box(400, 0, 1, 1),
				bottomLeft = new Box(0, 400, 1, 1),
				bottomRight = new Box(400, 400, 1, 1);

				expect(topLeft.inside(box)).toEqual(true);
				expect(topRight.inside(box)).toEqual(true);
				expect(bottomLeft.inside(box)).toEqual(true);
				expect(bottomRight.inside(box)).toEqual(true);
			});

		});

	}
);

