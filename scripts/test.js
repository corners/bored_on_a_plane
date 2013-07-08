require.config({
	paths: {
//		"jquery": "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min",
//		"underscore": "lib/underscore",
	 }
});


require(
[
	"Vector",
	"Vector-Spec",
	"Line",
	"Line-Spec",
	"Box",
	"Box-Spec"
],
function (Vector, VectorSpec, Line, LineSpec, Box, BoxSpec) {
	jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
	jasmine.getEnv().execute();
});

