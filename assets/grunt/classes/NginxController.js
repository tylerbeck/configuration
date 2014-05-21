/***********************************************************************
 * This class controls nginx
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

/**
 * Hosts Controller
 * @param grunt
 * @param options
 * @returns {module}
 * @constructor
 */
module.exports = function NginxController( grunt, options ){
	'use strict';
	/*================================================
	 * Dependencies
	 *===============================================*/
	var q = require( 'q' );
	var _ = require( 'lodash' );
	var path = require( 'path' );
	var sudo = require( 'sudo' );
	var fs = require('fs');


	/*================================================
	 * Public Attributes
	 *===============================================*/

	/*================================================
	 * Private Attributes
	 *===============================================*/
	var confTplPath = "assets/nginx/vhost.conf";

	var cwd = process.cwd();
	var sitesAvblPath = path.join( cwd, 'conf/nginx/sites-available/' );
	var sitesEnblPath = path.join( cwd, 'conf/nginx/sites-enabled/' );

	/*================================================
	 * Public Methods
	 *===============================================*/
	/**
	 * adds vhost to sites-available
	 */
	function addVhost(){

		var d = q.defer();

		var qlist = "domain serverType proxyPHP proxyPort denyDotAccess staticPaths rootPath";

		( options.promptIfMissing( qlist ) )().
				then( function(){
					var domain = options.get('domain').trim();
					var tpl = grunt.file.read( confTplPath );
					var conf = _.template( tpl, options.getAll() ).replace(/[\n\r]+\s*[\n\r]+/g,"\n");

					//write file
					grunt.log.writeln( "adding nginx vhost: "+domain );
					grunt.file.write( sitesAvblPath+domain, conf );
				} ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * adds vhost to sites-available
	 */
	function removeVhost(){

		var d = q.defer();

		var qlist = "domain";

		( options.promptIfMissing( qlist ) )().
				then( function(){
					var domain = options.get('domain').trim();

					grunt.log.writeln( "removing nginx vhost: "+domain );
					//remove symlink first
					if (grunt.file.exists( sitesEnblPath+domain ))
						grunt.file.delete( sitesEnblPath+domain );
					//then remove conf file
					if (grunt.file.exists( sitesAvblPath+domain ))
						grunt.file.delete( sitesAvblPath+domain );
				} ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * enables vhost
	 */
	function enableVhost(){

		var d = q.defer();

		var qlist = "domain";

		( options.promptIfMissing( qlist ) )().
				then( function(){
					var domain = options.get('domain').trim();

					grunt.log.writeln( "enabling nginx vhost: "+domain );

					var confSrc  = sitesAvblPath+domain;
					var confDest = sitesEnblPath+domain;

					if ( grunt.file.exists( confSrc ) ){
						fs.symlinkSync( confSrc, confDest );
					}
					else{
						grunt.log.error('nginx vhost: '+domain+' not found');
					}

				} ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * enables vhost
	 */
	function disableVhost(){

		var d = q.defer();

		var qlist = "domain";

		( options.promptIfMissing( qlist ) )().
				then( function(){
					var domain = options.get('domain').trim();

					grunt.log.writeln( "enabling nginx vhost: "+domain );

					var confDest = sitesEnblPath+domain;

					if ( grunt.file.exists( confDest ) ){
						grunt.file.delete( confDest );
					}

				} ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * restarts nginx
	 * @returns {*}
	 */
	function restart(){

		var d = q.defer();

		var stop = sudo( [ "nginx", "-s", "stop" ] );
		grunt.log.write("restarting nginx...");
		stop.on('close', function( stopCode ){
			if ( stopCode == 0 ){
				var start = sudo( [ "nginx" ] );
				start.on('close', function( startCode ) {
					if ( startCode == 0 ) {
						d.resolve();
						grunt.log.writeln(" complete");
					}
					else{
						grunt.log.writeln("");
						d.reject( 'start process exited with code ' + startCode )
					}
				});
			}
			else{
				grunt.log.writeln("");
				d.reject( 'stop process exited with code ' + stopCode )
			}
		});

		return d.promise;

	}


	/*================================================
	 * Private Methods
	 *===============================================*/


	/*================================================
	 * Create Interface
	 *===============================================*/
	this.addVhost = addVhost;
	this.removeVhost = removeVhost;
	this.enableVhost = enableVhost;
	this.disableVhost = disableVhost;
	this.restart = restart;


	return this;

};