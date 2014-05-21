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

		var fns = [];
		servers.forEach( function( s ){
			if ( s[ name ] && typeof s[ name ] == 'function')
				fns.push( s[ name ] );
		});

		return fns.reduce( q.when, q() );
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
	 * restarts nginx
	 * @returns {*}
	 */
	function restart(){
		return executeMethods( 'restart' );
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
