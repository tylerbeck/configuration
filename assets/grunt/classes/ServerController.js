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
module.exports = function ServerController( servers, grunt, options ){
	'use strict';
	/*================================================
	 * Dependencies
	 *===============================================*/
	var q = require( 'q' );
	var _ = require( 'lodash' );


	/*================================================
	 * Public Attributes
	 *===============================================*/

	/*================================================
	 * Private Attributes
	 *===============================================*/

	/*================================================
	 * Public Methods
	 *===============================================*/

	function executeMethods( name ){

		var d = q.defer();
		var promises = [];
		servers.forEach( function( s ){
			if ( s[ name ] && typeof s[ name ] == 'function')
				promises.push( s[ name ]() );
		});

		q.allSettled( promises )
			.then( function ( results ) {
					var errors = [];
					results.forEach(function ( result, index ) {
						if (result.state !== "fulfilled") {
							errors.push( result.state );
						}
					} );
					if ( errors.length > 0 ){
						d.reject( errors.join("\n") );
					}
					else {
						d.resolve();
					}
				});

		return d.promise;
	}


	/**
	 * adds vhost to sites-available
	 */
	function addVhost(){
		return executeMethods( 'addVhost' );
	}

	/**
	 * removes vhost from sites-available
	 */
	function removeVhost(){
		return executeMethods( 'removeVhost' );
	}

	/**
	 * enables vhost
	 */
	function enableVhost(){
		return executeMethods( 'enableVhost' );
	}

	/**
	 * disable vhost
	 */
	function disableVhost(){
		return executeMethods( 'disableVhost' );
	}

	/**
	 * restart servers
	 * @returns {*}
	 */
	function restart(){
		return executeMethods( 'restart' );
	}

	/**
	 * start servers
	 * @returns {*}
	 */
	function start(){
		return executeMethods( 'start' );
	}


	/**
	 * stop servers
	 * @returns {*}
	 */
	function stop(){
		return executeMethods( 'stop' );
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
