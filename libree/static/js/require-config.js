/* Global RequireJS config script
 * 
 * When DEBUG is on, this is loaded as a separate script in the base template
 * 
 * When DEBUG is off, and we are serving collected statics, this is 
 * included as a mainBuildFile by the app build script. CDN scripts
 * should be excluded there using 'empty:'
 */
require.config({
	baseUrl: "/static",
	paths: {
		"jquery": ["//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min", 
			'external/jquery-2.0.3.min'],
		"jquery.bootstrap": ["//netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min", 
			'external/bootstrap/3.0.0/js/bootstrap']
	},
	shim: {
		"jquery.bootstrap": {
			deps: ["jquery"]
			}
	}
});
