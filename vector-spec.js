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
		var l = new Vector(5, 0),
			a = l.getUnitNormal();

		expect(a).toEqual(new Vector(0, 1));
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



