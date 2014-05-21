/***********************************************************************
 * This class controls a managed hosts file
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
module.exports = function HostsController( grunt, options ){
	'use strict';
	/*================================================
	 * Dependencies
	 *===============================================*/
	var q = require( 'q' );
	var _ = require( 'lodash' );
	var sudo = require( 'sudo' );

	/*================================================
	 * Public Attributes
	 *===============================================*/

	/*================================================
	 * Private Attributes
	 *===============================================*/

	var ignoreDivergence = false;

	var hostsPath = '/etc/hosts';
	var confPath = 'conf/hosts';

	//host file delimiters
	var hostsStart = "## Begin Managed Hosts -------------------";
	var hostsEnd   = "## End Managed Hosts ---------------------";

	var hosts = {};
	var unmanaged = {
		top: "",
		bottom: ""
	};

	/*================================================
	 * Public Methods
	 *===============================================*/
	/**
	 * adds entry to managed hosts list
	 */
	function addEntry(){

		var d = q.defer();

		( options.promptIfMissing('domain ipv4 ipv6') )().
				then( function( opts ){
					var domain = opts.domain.trim();
					if (hosts[domain] == undefined){
						hosts[domain] = {};
					}
					hosts[ domain ].ip4 = opts.ipv4;
					hosts[ domain ].ip6 = opts.ipv6;
				} ).
				then( saveHosts ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * adds entry to managed hosts list
	 */
	function removeEntry(){

		var d = q.defer();

		( options.promptIfMissing('domain') )().
				then( function( opts ){
					var domain = opts.domain.trim();
					hosts[domain] = undefined;
					delete hosts[domain];
				} ).
				then( saveHosts ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}

	/**
	 * forces an update to hosts
	 * @returns {*}
	 */
	function forceUpdate(){

		var d = q.defer();

		ignoreDivergence = true;

		saveHosts().
				then( function(){ ignoreDivergence = false; } ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;

	}


	/*================================================
	 * Private Methods
	 *===============================================*/
	/**
	 * parses hosts file
	 * @returns {{top: string, bottom: string, managed: {}}}
	 */
	function parseHosts(){

		var str = grunt.file.read( confPath );

		//first get managed host entry line range
		var lines = str.split( /[\n\r]/g );
		var numLines = lines.length;
		grunt.verbose.writeln('hosts file has  '+numLines+' lines');

		var l = 0, from = -1, to = -1;
		while( l < numLines && from == -1 ){
			if ( lines[l] == hostsStart ){
				from = l;
			}
			l++;
		}
		while( l < numLines && to == -1 ){
			if ( lines[l] == hostsEnd ){
				to = l;
			}
			l++;
		}

		grunt.verbose.writeln('managed from: '+from+' to: '+to);
		//split hosts into managed & un-managed sections
		var top = lines.slice(0, from);
		var bottom = lines.slice(to+1);
		var managed = lines.slice(from+1,to-1); //drop boundry markers

		//parse lines into domain map
		var map = {};
		var matchEntry = /^\s*([^\s]+)\s+([^\s]+)/;
		var matchEmpty = /^\s*$/;
		managed.forEach( function( line ){
			//grunt.log.writeln( line );
			//only parse non-empty lines
			if ( !matchEmpty.test( line ) ){
				var matches = line.match( matchEntry );
				if (matches){
					var ip = matches[1];
					var domain = matches[2];
					grunt.verbose.writeln("ip: "+ip+"  domain: "+domain);
					if ( map[ domain ] == undefined ){
						map[ domain ] = {}
					}

					//TODO: make a better IPv4 vs IPv6 test
					if (ip.indexOf(":") >= 0){
						map[domain].ip6 = ip;
					}
					else{
						map[domain].ip4 = ip;
					}
				}
			}
		});

		unmanaged.top = top;
		unmanaged.bottom = bottom;
		hosts = map;

	}

	/**
	 * converts parsed parts into string
	 * @returns {string}
	 */
	function stringifyHostsFile(){

		var managed = [ hostsStart, "" ];
		var domains = Object.keys( hosts );
		//add domains to managed parts
		domains.forEach( function( domain ){
			if ( hosts[ domain ] ){
				//console.log( domain );
				var ips = hosts[ domain ];
				if ( ips.ip4 )
					managed.push( ips.ip4 + "\t" + domain );
				if ( ips.ip6 )
					managed.push( ips.ip6 + "\t" + domain );
				managed.push("");//blank line for readability
			}
		} );
		managed.push( hostsEnd );

		//join parts
		var lines = [];
		lines = lines.concat( unmanaged.top, managed, unmanaged.bottom );
		//grunt.log.writeln( lines.join("\n") );
		return lines.join("\n");

	}

	/**
	 * save managed hosts file, then copy to etc
	 * @returns {*}
	 */
	function saveHosts(){

		var d = q.defer();

		var confHosts = grunt.file.read( confPath );
		var etcHosts = grunt.file.read( hostsPath );
		var diverged = confHosts != etcHosts;

		//save conf hosts
		//grunt.log.writeln( JSON.stringify(hosts,undefined,"\t") );
		grunt.file.write( confPath, stringifyHostsFile() );

		//continue if files have not diverged or changes ignored
		if ( !diverged || ignoreDivergence ){
			//copy conf hosts to etc hosts
			var proc = sudo( [ "cp", confPath, hostsPath ] );
			proc.on('close', function( code ){
				if ( code == 0 )
					d.resolve();
				else
					d.reject( 'child process exited with code ' + code )
			});
		}
		else{
			grunt.log.error('hosts files have diverged');
			d.reject( hostsPath+' has diverged from '+confPath+', run `grunt update-hosts` to force update' );
		}

		return d.promise;

	}



	/*================================================
	 * Create Interface
	 *===============================================*/
	this.forceUpdate = forceUpdate;
	this.addEntry = addEntry;
	this.removeEntry = removeEntry;


	//get current hosts
	parseHosts();

	return this;

};

