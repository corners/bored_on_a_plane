define(
	[
		"Vector"
	],
	function (Vector) {

		// Vector 1x2 only
		describe("Vector2", function () {

			it("can we converted to meaningful string", function () {
				var v = new Vector(-1, 2),
					a = v.toString();

				expect(a).toEqual("[object Vector <-1, 2>]");
			});

			it("can add two vectors", function () {
				var v1 = new Vector(1, 2),
					v2 = new Vector(-8, 3),
					a = v1.add(v2);
				expect(a).toEqual(new Vector(-7, 5));
			});

			it("can return it's negative", function () {
				var a = new Vector(3, -7).negative();
				expect(a).toEqual(new Vector(-3, 7));
			});

			it("can be multiplied by a scalar", function () {
				var a = new Vector(3, 4).multiplyScalar(3);
				expect(a).toEqual(new Vector(9, 12));
			});

			it("can be multiplied by a vector", function () {
				var a = new Vector(1, 2).multiply(new Vector(-2, 3));
				expect(a).toEqual(new Vector(-2, 6));
			});

			it("can round components to 1 decimal places", function () {
				var a = new Vector(1.54, 2.49).toFixed(1);
				expect(a).toEqual(new Vector(1.5, 2.5));
			});

			it("can find the dot product of two points", function () {
				var p1 = new Vector(2, 3),
					p2 = new Vector(4, 5),
					a = Vector.dotProduct(p1, p2);
				expect(a).toEqual(23);
			});

			it("can calculate the vector from point a to point b", function () {
				var p1 = new Vector(0, 0),
					p2 = new Vector(5, 3),
					a = p1.toPoint(p2);

				expect(a).toEqual(new Vector(5, 3));
			});

			it("can calculate the perpendicular", function () {
				var p1 = new Vector(0, 0),
					p2 = new Vector(5, 3),
					l = p1.toPoint(p2),
					a = l.getPerpendicular();

				expect(a).toEqual(new Vector(-3, 5));
			});

			it("can calculate the unit normal to 0dp", function () {
				var a = new Vector(0.7, -0.7).toFixed(0);

				expect(a).toEqual(new Vector(1, -1));
			});

			it("can calculate the unit normal to 1dp", function () {
				var l = new Vector(1, -1),
					a = l.getUnitNormal().toFixed(1);

				expect(a).toEqual(new Vector(0.7, 0.7));
			});

			it("can calculate the reflection from a horizontal line", function () {
				var I = new Vector(4, -2),
					line = new Vector(10, 0),
					unitNormal = line.getUnitNormal(),
					R = Vector.reflect(I, unitNormal);

				expect(R).toEqual(new Vector(4, 2));
			});

			it("can calculate the reflection from a vertical line", function () {
				var I = new Vector(4, -2),
					line = new Vector(0, -10),
					unitNormal = line.getUnitNormal(),
					R = Vector.reflect(I, unitNormal);

				expect(R).toEqual(new Vector(-4, -2));
			});

			// todo - not part of vector
			it("can determine if two line segments intersect", function () {
				var p0 = new Vector(4, 7),
					p1 = new Vector(16, 3),
					p2 = new Vector(1, 1),
					p3 = new Vector(17, 10),
					a = Vector.segmentsIntersect(p0, p1, p2, p3);

				expect(a).toEqual(true);
			});

			it("can determine that two line segments do not intersect", function () {
				var p0 = new Vector(4, 7),
					p1 = new Vector(16, 3),
					p2 = new Vector(10, 6),
					p3 = new Vector(17, 10),
					a = Vector.segmentsIntersect(p0, p1, p2, p3);

				expect(a).toEqual(false);
			});

			it("can calculate a reflection from a diagonal line", function () {
				// Ball travelling striaght down
				var I = new Vector(0, 8);

				// collides with a diagonal line running from bottom left to top right
				var p1 = new Vector(100, 200),
					p2 = new Vector(200, 100);

				var v12 = p1.toPoint(p2);
				var unitNormal = v12.getUnitNormal();
				var newVelocity = Vector.reflect(I, unitNormal);

				expect(newVelocity).toEqual(new Vector(-8 ,0));
			});

			it("can determine where two lines intersect", function () {
				var p0 = new Vector(4, 7),
					p1 = new Vector(16, 3),
					p2 = new Vector(1, 1),
					p3 = new Vector(17, 10),
					a = Vector.segmentsIntersectAt(p0, p1, p2, p3);

				expect(a).toEqual(new Vector(8.8, 5.4));
			});

			it("can reflect a ball off a line", function () {
				// Ball travelling striaght down
				var b0 = new Vector(50, 0),
					bv = new Vector(0, 90),
					b1 = b0.add(bv);

				// collides with a diagonal line running from bottom left to top right
				var l0 = new Vector(0, 100),
					l1 = new Vector(100, 0);

				// do the lines intersect
				var a = Vector.segmentsIntersectAt(b0, b1, l0, l1);

				expect(a).toEqual(new Vector(50, 50));

				// determine the velocity from this point
				var I = b1.subtract(a);

				// reflect the velocity off the line to the destination
			var v01 = l0.toPoint(l1);
				var unitNormal = v01.getUnitNormal();
				var newVelocity = Vector.reflect(I, unitNormal);
				var newPosition = a.add(newVelocity);

				expect(newPosition).toEqual(new Vector(10, 50));
			});

		});
	}
);

