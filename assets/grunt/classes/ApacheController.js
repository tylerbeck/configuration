/***********************************************************************
 * This class controls vhosts for apache
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
module.exports = function ApacheController( grunt, options ){
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
	var confTplPath = "assets/apache2/vhost.conf";

	var cwd = process.cwd();
	var sitesAvblPath = path.join( cwd, 'conf/apache2/sites-available/' );
	var sitesEnblPath = path.join( cwd, 'conf/apache2/sites-enabled/' );

	/*================================================
	 * Public Methods
	 *===============================================*/

	/**
	 * adds vhost to sites-available
	 */
	function addVhost(){

		var d = q.defer();

		var serverType = options.get('serverType');

		if ( serverType == undefined || serverType == 'apache' ){

			var qlist = "domain serverType proxyPHP proxyPort denyDotAccess staticPaths "+
					"rootPath apacheOptions apacheOrder apacheAllow apacheDeny apacheRequire apacheOverride";

			( options.promptIfMissing( qlist ) )().
					then( function(){
						var domain = options.get('domain').trim();
						var tpl = grunt.file.read( confTplPath );
						var conf = _.template( tpl, options.getAll() ).replace(/[\n\r]+\s*[\n\r]+/g,"\n");

						//write file
						grunt.log.writeln( "adding apache vhost: "+domain );
						grunt.file.write( sitesAvblPath+domain, conf );

					} ).
					then( d.resolve ).
					catch( d.reject );
		}
		else{
			d.resolve();
		}

		return d.promise;

	}

	/**
	 * removes vhost from sites-available
	 */
	function removeVhost(){

		var d = q.defer();

		var qlist = "domain";

		( options.promptIfMissing( qlist ) )().
				then( function(){
					var domain = options.get('domain').trim();

					grunt.log.writeln( "removing apache vhost: "+domain );
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

					var confSrc  = sitesAvblPath+domain;
					var confDest = sitesEnblPath+domain;

					if ( grunt.file.exists( confSrc ) ){
						if (grunt.file.exists( confDest )){
							grunt.log.writeln( "apache vhost already enabled for: "+domain );
						}
						else{
							grunt.log.writeln( "enabling apache vhost: "+domain );
							fs.symlinkSync( confSrc, confDest );
						}
					}
					//else{
					//	grunt.log.error('apache vhost: '+domain+' not found');
					//}
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

					var confDest = sitesEnblPath+domain;

					if ( grunt.file.exists( confDest ) ){
						grunt.log.writeln( "disabling apache vhost: "+domain );
						grunt.file.delete( confDest );
					}
				} ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * executes control command
	 * @returns {*}
	 */
	function ctrlcmd( args ){
		args = args || [];
		args = [ "apachectl" ].concat( args );
		grunt.verbose.writeln( "executing: ", args.join(" ") );
		var d = q.defer();
		var proc = sudo( args );
		proc.on('close', function( code ){
			if ( code == 0 ){
				grunt.log.writeln( args.join(" ") + " : complete");
				d.resolve();
			}
			else{
				grunt.log.writeln("");
				d.reject( args.join(" ") + ' process exited with code ' + code )
			}
		});

		return d.promise;

	}

	function restart(){
		return ctrlcmd(['restart']);
	}

	function start(){
		return ctrlcmd(['start']);
	}

	function stop(){
		return ctrlcmd(['stop']);
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
	this.start = start;
	this.stop = stop;


	return this;

};
