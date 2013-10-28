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
		"jquery.flot" : 'external/flot/flot-0.8.1/jquery.flot.min',
		"jquery.flot.resize" : 'external/flot/flot-0.8.1/jquery.flot.resize.min',
		"jquery.flot.axislabels" : 'external/flot/flot-0.8.1/jquery.flot.axislabels',
		"qunit" : 'external/qunit/1.12.0/qunit-1.12.0',
	},
	shim: {
		"jquery.bootstrap": {
			deps: ["jquery"]
			},
		"jquery.flot": {
			deps: ["jquery"]
			},
		"jquery.flot.resize": {
			deps: ["jquery", "jquery.flot"]
			},
		"jquery.flot.axislabels": {
			deps: ["jquery", "jquery.flot"]
			},
		"qunit": {
			deps: ["jquery"],
			exports: 'QUnit'
			},
	}
});
