/* Global RequireJS config script
 * 
 * This is loaded into the base template for use by the browser, and
 * is also used as the mainConfigFile by the build process
 */
require.config({
	paths: {
		"jquery": ["//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min", 
			'external/jquery-2.0.3.min'],
		"jquery.bootstrap": ["//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap", 
			'external/bootstrap/3.0.0/js/bootstrap'],
	},
	shim: {
		"jquery.bootstrap": {
			deps: ["jquery"]
			},
	}
});
