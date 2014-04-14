/***********************************************************************
 * Default Grunt Scaffolding
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

var gs = require('grunt-start');

var configDirs = [
	"./assets/grunt/config"
];

var taskDirs = [
	"./assets/grunt/tasks"
];

//npmTasks, taskDirectories, configDirectories, initFn
module.exports = new gs.Loader(

		//load npm tasks
		true,

		//array of or single directory path in which grunt tasks have been defined
		taskDirs,

		//array of or single directory path in which grunt configuration objects have been defined
		configDirs,

		//grunt file scripts
		function( grunt ){

			//default task definition
			grunt.registerTask( 'default', function(){
				grunt.log.writeln('Computer Configuration Script - Default Task');
			});

			grunt.registerTask( 'configure-node', [
				'install-global-modules'
			]);

			grunt.registerTask( 'tidy-up', function(){
				var done = this.async();
				grunt.log.writeln("Tiding Up...");
				setTimeout( function(){
					grunt.log.writeln("...Still Cleaning...");
				}, 500 );
				setTimeout( function(){
					grunt.log.writeln("...All Done!");
					done();
				}, 1000 );
			});

		}
);
