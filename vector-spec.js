// Vector 1x2 only
describe("vector", function () {

	it("can we converted to meaninful string", function () {
		var v = new Vector(-1, 2),
			a = v.toString();

		expect(a).toEqual("(-1, 2)");
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

	it("can calculate the unit normal", function () {
		var l = new Vector(4, -2),
			a = l.getUnitNormal();

		expect(a).toEqual(new Vector(0, 1));
	});

	it("can calculate the projection", function () {
		var I = new Vector(-4, 2),
			unitNormal = I.getUnitNormal(),
			N = Vector.project(I, unitNormal);

		expect(N).toEqual(new Vector(0, -2));
	});

	it("can calculate the reflection", function () {
		var I = new Vector(4, -2),
		    unitNormal = I.getUnitNormal(),
			R = Vector.reflect(I, unitNormal);

		expect(R).toEqual(new Vector(4, 2));
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










/*
	it("can calculate the unit normal for a real example", function() {
		var p1 = new Vector(0, 0),
			p2 = new Vector(5, 3),
			l = p1.toPoint(p2),
			a = l.getUnitNormal();
// not sure on the answer
		expect(a).toEqual(new Vector(9, 12));
	});
*/
});



