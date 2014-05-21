/***********************************************************************
 * This class controls projects
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

/**
 * Projects Controller
 * @param grunt
 * @param options
 * @returns {module}
 * @constructor
 */
module.exports = function ProjectsController( grunt, options ){

	'use strict';

	/*================================================
	 * Dependencies
	 *===============================================*/
	var q = require( 'q' );
	var _ = require( 'lodash' );
	var path = require( 'path' );
	var sudo = require( 'sudo' );
	var fs = require('fs-extra');
	var exec = require( 'child_process' ).exec;


	/*================================================
	 * Public Attributes
	 *===============================================*/

	/*================================================
	 * Private Attributes
	 *===============================================*/
	var cwd = process.cwd();

	/*================================================
	 * Public Methods
	 *===============================================*/

	/**
	 * adds vhost to sites-available
	 */
	function createProject(){
		console.log('createProject');
		var d = q.defer();

		var qlist = "projectPath projectIsNew projectScaffoldingType projectSourceType";

		( options.promptIfMissing( qlist ) )().
				then( setupProject ).
				then( getProjectSettings ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}



	/*================================================
	 * Private Methods
	 *===============================================*/

	function setupProject(){

		var isNew = options.get('projectIsNew');
		var type = options.get('projectSourceType');

		if ( isNew ) {
			switch( type ){
				case "none":
					return true;
					break;
				case "git repo":
					return scaffoldGit();
					break;
				case "directory":
					return scaffoldDirectory();
					break;
				case "yo":
					return scaffoldYo();
					break;
			}
		}
		else{
			switch( type ){
				case "none":
					return true;
					break;
				case "git repo":
					return sourceGit();
					break;
				case "directory":
					return sourceDirectory();
					break;
			}
		}
	}

	/**
	 * scaffold project from git repo
	 * @returns {*}
	 */
	function scaffoldGit(){

		var d = q.defer();

		var qlist = "projectPath projectRepo";

		( options.promptIfMissing( qlist ) )().
				then( cloneGitRepo ).
				then( cleanGitRepo ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * scaffold project from local directory
	 * @returns {*}
	 */
	function scaffoldDirectory(){

		var d = q.defer();

		var qlist = "projectPath projectSourcePath";

		( options.promptIfMissing( qlist ) )().
				then( copyDirectory ).
				then( cleanGitRepo ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * scaffold project using yo
	 * @returns {*}
	 */
	function scaffoldYo(){

		var d = q.defer();

		var qlist = "projectPath projectScaffoldGenerator";

		( options.promptIfMissing( qlist ) )().
				then( function(){
					console.log('prompts complete');
					var d = q.defer();

					var dir = options.get('projectPath');
					var yeoman = require('yeoman-generator');

					grunt.file.mkdir( dir );

					//change working directory to project directory
					process.chdir( dir );

					var env = yeoman( options.get('yoGenerator') );

							//env.lookups.push( '/usr/local/lib/node_modules' );

							//add generators
							env.lookup();

							env.run( function(err) {
						        console.log('done!');
								//return to original working directory
								process.chdir( cwd );

								d.resolve();
				            });
					//d.resolve();

					return d.promise;
				} ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}




	/**
	 * source project from git repository
	 * @returns {*}
	 */
	function sourceGit(){
		console.log('sourceGit');
		var d = q.defer();

		var qlist = "projectPath projectRepo";

		( options.promptIfMissing( qlist ) )().
				then( cloneGitRepo ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * source project from local directory
	 * @returns {*}
	 */
	function sourceDirectory(){

		var d = q.defer();

		var qlist = "projectSourcePath";

		( options.promptIfMissing( qlist ) )().
				then( copyDirectory ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * clones git repo specified in options into project folder
	 * @returns {*}
	 */
	function cloneGitRepo(){

		var d = q.defer();

		var dest = options.get('projectPath');
		var repo = options.get('projectRepo');

		var proc = exec( 'git clone '+repo+' '+dest, function ( error, stdout, stderr ) {
			if (error !== null) {
				console.log('exec error: ' + error);
				d.reject( error );
			}
			else {
				console.log( stdout );
				d.resolve();
			}
		});

		return d.promise;

	}

	/**
	 * removes the .git folder from a cloned directory
	 * @returns {boolean}
	 */
	function cleanGitRepo(){

		var dir = options.get('projectPath');
		var dotgit = path.join( dir, '.git' );

		grunt.file.delete( dotgit, {force:true} );

		return true;
	}

	/**
	 * copy directory into project folder
	 * @returns {*}
	 */
	function copyDirectory(){

		var dest = options.get('projectPath');
		var src = options.get('projectSourcePath');

		grunt.log( 'copying directory '+src+' to '+dest );

		fs.copySync( src, dest );

		return true;

	}


	/**
	 * look for webroot path, and add to options if found
	 * look for server type, and add to options if found
	 */
	function getProjectSettings(){
		var dir = options.get('projectPath');
		var pkgPath = path.join(dir,'package.json');
		if ( grunt.file.exists( pkgPath ) ){
			var pkg = grunt.file.readJSON( pkgPath );
			if ( pkg.webroot != undefined ){
				options.set( 'webroot', path.join( dir,pkg.webroot ) );
			}
			if ( pkg.serverType != undefined ){
				options.set( 'serverType', pkg.serverType );
			}
		}
		else{
			//TODO:look for common webroot directories
		}

	}


/*

 var qlist1 = "projectPath projectIsNew projectCloneRepo projectScaffoldingType projectScaffoldPath "+
 "projectScaffoldGenerator projectRepo";

 var qlist2 = "projectServerType projectRootPath domain ipv4 ipv6 staticPaths denyDotAccess "+
 "proxyPHP proxyPort apacheOptions apacheOrder apacheAllow apacheDeny apacheOverride";

 */




	/*================================================
	 * Create Interface
	 *===============================================*/
	this.create = createProject;

	return this;

};
