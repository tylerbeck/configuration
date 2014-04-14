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

		//grunt main - define tasks here if you want, but isn't nicer keeping everything in folders?
		function( grunt ){ }
);
