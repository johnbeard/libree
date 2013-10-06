module.exports = (grunt) ->

	require('time-grunt')(grunt)
	require('load-grunt-tasks')(grunt)

	shell = require('shelljs')

	run = (cmd) ->
		grunt.log.ok cmd
		shell.exec cmd

	grunt.initConfig
		static_path: 'libreestatic/'
		app: 'libree'

		requirejs:
			dist:
				options:
					baseUrl: './'
					appDir: '<%= static_path %>/'
					dir: '<%= static_path %>/min'
					optimize: 'none'
					optimizeCss: 'none'
					mainConfigFile: '<%= static_path %>/js/require-config.js'
					
					# CDN resources have empty: paths
					paths: 
						"jquery": 
							"empty:"
						"jquery.bootstrap": 
							"empty:"
					shim:
						"jquery.bootstrap": 
							deps: ["jquery"]

	grunt.registerTask 'collect-static', 'Symlink static files using Django utility', ->
		run "./manage.py collectstatic --noinput"

	grunt.registerTask 'build', '', [
		'requirejs'
	]
	
	grunt.registerTask 'default', [
		'collect-static'
		'build'
	]
