
'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {
				jshintrc: true
			},
			gruntfile: {
				src: 'Gruntfile.js',
			},
			lib: {
				src: ['index.js']
			},
			tests: {
				src: ['test/**/*.js']
			}
		},

		mochaTest: {
			test: {
				options: {
					globals: ['should'],
					timeout: 3000,
					ui: 'bdd',
					reporter: 'spec',
					colors: true,
					require: ['test/helpers/chai']
				},
				src: ['test/**/*.test.js']
			}
		}
	});

	// Tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');

	// Default task.
	grunt.registerTask('default', ['jshint']);
	grunt.registerTask('test', ['jshint', 'mochaTest']);

};
