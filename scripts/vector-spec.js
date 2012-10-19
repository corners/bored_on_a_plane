// Vector 1x2 only
describe("Vector", function () {

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
			R = Vector.reflect(I, unitNormal).toFixed(0);

		expect(R).toEqual(new Vector(4, 2));
	});

	it("can calculate the reflection from a vertical line", function () {
		var I = new Vector(4, -2),
			line = new Vector(0, -10),
		    unitNormal = line.getUnitNormal(),
			R = Vector.reflect(I, unitNormal).toFixed(0);

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
		var newVelocity = Vector.reflect(I, unitNormal).toFixed(1);

		expect(newVelocity).toEqual(new Vector(-8 ,0));
	});

	it("can determine where two lines intersect", function () {
		var p0 = new Vector(4, 7),
			p1 = new Vector(16, 3),
			p2 = new Vector(1, 1),
			p3 = new Vector(17, 10),
			a = Vector.segmentsIntersectAt(p0, p1, p2, p3).toFixed(1);

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
		var newVelocity = Vector.reflect(I, unitNormal).toFixed(1);
		var newPosition = a.add(newVelocity);

		expect(newPosition).toEqual(new Vector(10, 50));
	});

});

describe("line", function () {

	it("can we converted to meaningful string", function () {
		var l = new Line(0, 1, -2, 3),
			a = l.toString();

		expect(a).toEqual("[object Line <(0, 1), (-2, 3)>]");
	});

	it("can bounce a ball when it ends on a line", function () {
		var ball = new Line(50, 92, 50, 100),
			line = new Line(0, 100, 100, 100),
			v = new Vector(0, 8),
			newPosition = line.velocityReflect(v);

		expect(newPosition).toEqual(new Vector(0, -8));
	});

	it("can bounce a ball off a line", function () {
		var line0 = new Line(50, 0, 50, 90),
			line1 = new Line(0, 100, 100, 0),
			newPosition = line1.bounce(line0);

		expect(newPosition).toEqual(new Line(50, 50, 10, 50));
	});

	it("can bounce a ball moving horizontally into a vertical line", function () {
		var line0 = new Line(50, 10, -10, 10),
			line1 = new Line(0, 0, 0, 20),
			newPosition = line1.bounce(line0);

		expect(newPosition).toEqual(new Line(0, 10, 10, 10));
	});

	it("takes into account the balls radius when bouncing off a line", function () {
		var ballLine = new Line(10, 0, 10, 60),
		  r = 5,
			line = new Line(0, 50, 20, 50),
			newPosition = line.bounceWithRadius(ballLine, r);

		expect(newPosition).toEqual(new Line(10, 45, 10, 30));
	});

	it("takes into account the balls radius when bouncing off a line 2", function () {
		var ballLine = new Line(150, 196, 150, 204),
		  r = 1,
			line = new Line(100, 200, 200, 200),
			newPosition = line.bounceWithRadius(ballLine, r);

		expect(newPosition).toEqual(new Line(150, 199, 150, 194));
	});

	it("takes into account the balls radius when bouncing off a line 3", function () {
		var ballLine = new Line(150, 7, 150, -1),
		  r = 2,
			line = new Line(0, 0, 200, 0),
			newPosition = line.bounceWithRadius(ballLine, r);

		expect(newPosition).toEqual(new Line(150, 2, 150, 5));
	});

	it("takes into account the balls radius when bouncing off a line 4", function () {
		var ballLine = new Line(150, 105, 150, 106),
		  r = 5,
			line = new Line(100, 110, 200, 120),
			newPosition = line.bounceWithRadius(ballLine, r);

		expect(newPosition).toEqual(new Line(150, 105, 150, 103));
	});

  it("can extend a perpendicular to another line", function () {
		var ballLine = new Line(10, 0, 10, 10),
		  r = 5,
			line = new Line(0, 50, 20, 50),
			newPosition = line.extendTowards(ballLine, r);

		expect(newPosition).toEqual(new Line(0, 45, 20, 45));
	});

  it("can extend a perpendicular to another line 2", function () {
		var ballLine = new Line(150, 10, 150, 20),
		  r = 5,
			line = new Line(100, 100, 200, 150),
			newPosition = line.extendTowards(ballLine, r);
			newPosition = newPosition.toFixed(0);

		expect(newPosition).toEqual(new Line(102, 96, 202, 146));
	});


});

describe("box", function () {

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
