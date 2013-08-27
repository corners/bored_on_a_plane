/**
  * Shim for libraries
  */
require.config({
  shim: {
    underscore: {
      exports: '_'
    },
  }
});

require(
[
    "underscore",    
	"Vector",
	"Vector-Spec",
	"Line",
	"Line-Spec",
	"Box",
	"Box-Spec"
],
function (_, Vector, VectorSpec, Line, LineSpec, Box, BoxSpec) {
	jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
	jasmine.getEnv().execute();
});

