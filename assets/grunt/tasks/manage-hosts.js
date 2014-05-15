module.exports = function( grunt ){

	var sudo = require( 'sudo' );
	var exec = require( 'child_process' ).exec;
	var q = require( 'q' );
	var _ = require( 'lodash' );
	var inquirer = require( 'inquirer' );
	var fs = require('fs');
	var path = require('path');

	//host file delimiters
	var hostsStart = "## Begin Managed Hosts -------------------";
	var hostsEnd   = "## End Managed Hosts ---------------------";

	//conf paths
	var cwd = process.cwd();
	var aSitesAvbl = path.join( cwd, 'conf/apache2/sites-available/' );
	var aSitesEnbl = path.join( cwd, 'conf/apache2/sites-enabled/' );
	var nSitesAvbl = path.join( cwd, 'conf/nginx/sites-available/' );
	var nSitesEnbl = path.join( cwd, 'conf/nginx/sites-enabled/' );

	//temp path holder
	var projectPath = "";

	var options = {};

	//prompt properties
	var ipv4RegEx = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	var ipv6RegEx = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
    var domainRegEx = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*(\.[a-z]{2,99})?$/;
	var questions ={
		domain: {
			message: "domain",
			name: "domain",
			type: 'input',
			//TODO: check this
			validate: validatePattern( true, domainRegEx, 'please enter a valid domain' )
		},
		ipv4: {
			message: "ipv4",
			name: "ipv4",
			type: 'input',
			default: '127.0.0.1',
			validate: validatePattern( true, ipv4RegEx, 'please enter a valid domain' )
		},
		ipv6: {
			message: "ipv6",
			name: "ipv6",
			type: 'input',
			default: 'fe80::1%lo0',
			validate: validatePattern( true, ipv6RegEx, 'please enter a valid domain' )
		},
		serverType: {
			name: "serverType",
			message: "select server type",
			type: 'list',
			choices: [
				"nginx",
				"apache",
				"node",
				"other"
			],
			default: "nginx"
		},
		proxyPHP: {
			name: "proxyPHP",
			message: "proxy php requests",
			type: 'confirm',
			when: function( answers ){
				return true; //matchFn( 'serverType', 'nginx', answers );
			},
			default: false
		},
		proxyPort: {
			name: "proxyPort",
			message: "proxy port",
			type: 'input',
			when: function( answers ){
				return matchFn( 'serverType','nginx', answers, true ) || matchFn( 'proxyPHP', 'nginx', answers );
			},
			validate: validatePattern( true, /[0-9]+/, 'please enter a valid port' ),
			default: 8070
		},
		denyDotAccess: {
			name: "denyDotAccess",
			message: "deny access to .* files",
			type: 'confirm',
			default: true
		},
		staticPaths: {
			name: "staticPaths",
			message: "static paths (space separated)",
			type: 'input',
			when: function( answers ){
				return matchFn( 'serverType', 'nginx', answers, true );
			},
			filter: spacedArrayFilter
		},
		rootPath: {
			name: "rootPath",
			message: "root path",
			type: 'input',
			//TODO: validate root directory path
			validate: validatePattern( true, /.*/, 'enter a valid path')
		},
		apacheOptions: {
			name: "apacheOptions",
			message: "apache options",
			type: 'input',
			when: function( answers ){
				return matchFn( 'serverType', 'apache', answers );
			},
			default: "FollowSymLinks Indexes"
		},
		apacheOrder: {
			name: "apacheOrder",
			message: "select access order",
			type: 'list',
			choices: [
				"allow,deny",
				"deny,allow"
			],
			when: function( answers ){
				return matchFn( 'serverType', 'apache', answers );
			},
			default: "allow,deny"
		},
		apacheAllow: {
			name: "apacheAllow",
			message: "apache allow (space separated)",
			type: 'input',
			when: function( answers ){
				return matchFn( 'serverType', 'apache', answers );
			},
			filter: spacedArrayFilter,
			default: "all"
		},
		apacheDeny: {
			name: "apacheDeny",
			message: "apache deny (space separated)",
			type: 'input',
			when: function( answers ){
				return matchFn( 'serverType', 'apache', answers );
			},
			filter: spacedArrayFilter,
			default: "none"
		},
		apacheOverride: {
			name: "apacheOverride",
			message: "apache override",
			type: 'input',
			when: function( answers ){
				return matchFn( 'serverType', 'apache', answers );
			},
			default: "All",
			validate: validatePattern( true, /.*/, 'enter a valid override value')
		},
		projectPath: {
			name: "projectPath",
			message: "project path  ~/Projects/",
			type: 'input',
			validate: validatePattern( true, /.*/, 'enter a valid path'),
			filter: function( value ){
				return path.resolve( path.sep, path.join( process.env.HOME, 'Projects', value ) );
			}
		},
		projectServerType: {
			name: "serverType",
			message: "select server type",
			type: 'list',
			choices: [
				"nginx",
				"node",
				"apache",
				"other",
				"none"
			]
		},
		projectWebRoot: {
			name: "webroot",
			message: "webroot (relative to project)",
			type: 'input',
			validate: validatePattern( true, /.*/, 'enter a valid path'),
			when: function( answers ){
				projectPath = answers['projectPath'];
				return matchFn( 'serverType', 'none', answers, true );
			},
			filter: function( value ){
				return path.join( projectPath, value );
			}
		},
		projectIsNew: {
			name: "projectIsNew",
			message: "is this a new project?",
			type: 'confirm',
			default: true
		},
		projectCloneRepo: {
			name: "projectCloneRepo",
			message: "would you like to clone a git repo?",
			type: 'confirm',
			default: false,
			when: function( answers ){
				return !answers['projectIsNew'];
			}
		},
		projectScaffoldingType: {
			name: "projectScaffoldingType",
			message: "scaffolding source",
			type: 'list',
			choices: [
				"none",
				"yo",
				"git repo",
				"directory"
			],
			default: "none",
			when: function( answers ){
				return answers['projectIsNew'];
			}
		},
		projectRepo: {
			name: "projectRepo",
			message: "git repo url",
			type: 'input',
			validate: validatePattern( true, /.*/, 'enter a valid url'),
			when: function( answers ){
				return answers['projectCloneRepo'] || answers['projectScaffoldingType'] == "git repo";
			}
		},
		projectScaffoldPath: {
			name: "projectScaffoldPath",
			message: "scaffolding template path",
			type: 'input',
			validate: validatePattern( true, /.*/, 'enter a valid path'),
			when: function( answers ){
				return answers['projectScaffoldingType'] == "directory";
			}
		},
		projectScaffoldGenerator: {
			name: "projectScaffoldPath",
			message: "scaffolding template path",
			type: 'list',
			choices: ["none"],
			when: function( answers ){
				return answers['projectScaffoldingType'] == "yo";
			}
		}
	};

	function matchFn( prop, value, answers, negate ){
		var match = options[prop] == value || answers[prop] == value;
		return negate ? !match : match;
	}

	/**
	 * pattern validation for inquirer prompts
	 * @param required
	 * @param regex
	 * @param err
	 * @returns {Function}
	 */
	function validatePattern( required, regex, err ){

		return function( value ){
			if (required && value == ""){
				return "please enter a value";
			}
			if ( !regex.test( value ) ){
				return err;
			}
			return true;
		}
	}

	/**
	 * array filter for inquirer prompts
	 * @param value
	 * @returns {Array}
	 */
	function spacedArrayFilter( value ){
		value = value.trim();
		return value == "" ? [] : value.split(/\s+/g);
	}

	/**
	 * gets array of questions based on space separated key string
	 * @param str
	 * @returns {Array}
	 */
	function getQuestions( str ){
		str = str || "";

		//grunt.log.writeln( "getQuestions: "+ str );

		var keys = str == "" ? Object.keys( questions ) : str.split(" ");
		var prompts = [];
		keys.forEach( function(key){
			//grunt.log.writeln( "   " + key );
			prompts.push( questions[key] );
		} );

		return prompts;
	}

	/**
	 * puts contents into conf/hosts then copies to /etc/hosts
	 * @param parts
	 * @param ignoreDivergence
	 * @returns {*}
	 */
	function updateHostsFile( parts, ignoreDivergence ){

		var d = q.defer();

		var managedHosts = grunt.file.read("conf/hosts");
		var etcHosts = grunt.file.read("/etc/hosts");
		var diverged = managedHosts != etcHosts;
		grunt.verbose.writeln('hosts diverged: '+diverged);

		//save to managed file
		grunt.file.write( "conf/hosts", parts ? stringifyHostsFile( parts ) : managedHosts );

		if ( !diverged || ignoreDivergence ){
			var proc = sudo( [ "cp", "conf/hosts", "/etc/hosts" ] );
			proc.on('close', function( code ){
				if ( code == 0 )
					d.resolve();
				else
					d.reject( 'child process exited with code ' + code )
			});
		}
		else{
			grunt.log.writeln('diverged');
			d.reject( '/etc/hosts has diverged from conf/hosts, run `grunt update-hosts` to force update' );
		}

		return d.promise;

	}

	/**
	 * parses hosts file
	 * @returns {{top: string, bottom: string, managed: {}}}
	 */
	function parseHostsFile(){
		var hosts = grunt.file.read( 'conf/hosts' );


		//first get managed host entry line range
		var lines = hosts.split( /[\n\r]/g );
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

		return {
			top: top,
			bottom: bottom,
			managed: map
		};

	}

	/**
	 * converts parsed parts into string
	 * @param parts
	 * @returns {string}
	 */
	function stringifyHostsFile( parts ){

		var managed = [ hostsStart, "" ];
		var domains = Object.keys( parts.managed );
		//add domains to managed parts
		domains.forEach( function( domain ){
			if (parts.managed.hasOwnProperty( domain ) && parts.managed[ domain ] != undefined ){
				var ips = parts.managed[ domain ];
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
		lines = lines.concat( parts.top, managed, parts.bottom );

		return lines.join("\n");

	}

	/**
	 * updates or adds a hosts file entry
	 * @param domain
	 * @param ip4
	 * @param ip6
	 * @returns {*}
	 */
	function updateHostsFileEntry(){
		var domain = options.domain.trim();
		var ip4 = options.ipv4;
		var ip6 = options.ipv6;
		grunt.log.writeln( "updating hosts file entry: "+domain );

		var parts = parseHostsFile();

		if (parts.managed[domain] == undefined){
			parts.managed[domain] = {};
		}
		parts.managed[ domain ].ip4 = ip4;
		parts.managed[ domain ].ip6 = ip6;

		return updateHostsFile( parts, false );

	}

	/**
	 * removes a hosts file entry
	 * @returns {*}
	 */
	function removeHostsFileEntry(){
		var domain = options.domain.trim();
		grunt.log.writeln( "updating hosts file entry: "+domain );

		var parts = parseHostsFile();

		parts.managed[ domain ] = undefined;
		delete parts.managed[ domain ];

		return updateHostsFile( parts, false );
	}

	/**
	 * adds vhost files for specified domain
	 * @returns {*}
	 */
	function addVhost(){

		grunt.log.writeln( "adding vhost: "+options.domain );
		var domain = options.domain.trim();
		if ( options.serverType == "apache" || options.proxyPHP ){
			var atpl = grunt.file.read("assets/apache2/vhost.conf");
			var aconf = _.template( atpl, options ).replace(/[\n\r]+\s*[\n\r]+/g,"\n");
			grunt.file.write( aSitesAvbl+domain, aconf );

		}

		var tpl = grunt.file.read("assets/nginx/vhost.conf");
		var conf = _.template( tpl, options ).replace(/[\n\r]+\s*[\n\r]+/g,"\n");
		grunt.file.write( nSitesAvbl+domain, conf );

		var d = q.defer();
		d.resolve();
		return d.promise;
	}

	/**
	 * removes vhost files for specified domain
	 * @returns {*}
	 */
	function removeVhost(){

		var domain = options.domain.trim();
		grunt.log.writeln( "removing vhost: "+domain );

		if (grunt.file.exists( nSitesAvbl+domain ))
			grunt.file.delete( nSitesAvbl+domain );

		if (grunt.file.exists( aSitesAvbl+domain ))
			grunt.file.delete( aSitesAvbl+domain );

		var d = q.defer();
		d.resolve();
		return d.promise;

	}

	/**
	 * adds vhost conf file links to sites-enabled
	 * @returns {*}
	 */
	function enableVhost(){
		var domain = options.domain.trim();
		grunt.log.writeln( "enabling vhost: "+domain );

		var nConfSrc  = nSitesAvbl+domain;
		var aConfSrc  = aSitesAvbl+domain;
		var nConfDest = nSitesEnbl+domain;
		var aConfDest = aSitesEnbl+domain;

		if ( grunt.file.exists( nConfSrc ) ){
			fs.symlinkSync( nConfSrc, nConfDest );
			if ( grunt.file.exists( aConfSrc ) ) {
				fs.symlinkSync( aConfSrc, aConfDest );
			}
		}
		else{
			grunt.log.error('vhost: '+domain+' not found');
		}

		var d = q.defer();
		d.resolve();
		return d.promise;
	}

	/**
	 * removes vhost conf file links from sites-enabled
	 * @returns {*}
	 */
	function disableVhost(){
		var domain = options.domain.trim();
		grunt.log.writeln( "disabling vhost: "+domain );

		var nConfDest = nSitesEnbl+domain;
		var aConfDest = aSitesEnbl+domain;

		if ( grunt.file.exists( nConfDest ) ){
			grunt.file.delete( nConfDest );
		}
		if ( grunt.file.exists( aConfDest ) ) {
			grunt.file.delete( aConfDest );
		}

		var d = q.defer();
		d.resolve();
		return d.promise;
	}

	/**
	 * restart nginx returns promise
	 * @returns {*}
	 */
	function restartNginX(){

		var d = q.defer();

		grunt.log.write("restarting nginx...");
		var stop = sudo( [ "nginx", "-s", "stop" ] );
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
						d.reject( 'start process exited with code ' + code )
					}
				});
			}
			else{
				grunt.log.writeln("");
				d.reject( 'stop process exited with code ' + code )
			}
		});

		return d.promise;

	}

	/**
	 * restart nginx returns promise
	 * @returns {*}
	 */
	function restartApache(){

		var d = q.defer();
		grunt.log.write("restarting apache...");
		var proc = sudo( [ "apachectl", "restart" ] );
		proc.on('close', function( code ){
			if ( code == 0 ){
				d.resolve();
				grunt.log.writeln(" complete");
			}
			else{
				grunt.log.writeln("");
				d.reject( 'restart process exited with code ' + code )
			}
		});

		return d.promise;

	}

	/**
	 * loads list of currently installed yo generators
	 * @returns {*}
	 */
	function loadYoGenerators(){
		var d = q.defer();
		var matchName = /generator-([^@\r\n\s]+)/;
		var proc = exec('npm list -g | grep generator-',
				function ( error, stdout, stderr ) {
					var gmap = {};
					if (error !== null) {
						console.log('exec error: ' + error);
						d.reject( error );
					}
					else{
						var lines = stdout.split(/[\r\n]/g);
						//grunt.log.writeln( stdout );
						lines.forEach( function( line ){
							line = line.trim();
							if (line != ""){
								var parts = line.match( matchName );
								//grunt.log.writeln( line );
								//grunt.log.writeln( parts.join(', ') );
								if (parts && parts.length > 0){
									gmap[ parts[1] ] = true;
								}
							}
						});

						var generators = Object.keys( gmap );
						if ( generators.length > 0 ){
							questions[ 'projectScaffoldGenerator' ].choices = generators;
							d.resolve();
						}
						else{
							d.reject('no generators are installed');
						}

					}
				});

		return d.promise;
	}

	/**
	 * promise returning prompt
	 * @param qlist
	 * @returns {function}
	 */
	function prompt( qlist ){

		return function(){

			var d = q.defer();
			var qs = typeof qlist == 'string' ? getQuestions( qlist ) : qlist;
			inquirer.prompt( qs, function( result ){
				_.merge( options, result );
				d.resolve(options);
			} );

			return d.promise;
		}

	}

	/**
	 * populate project with code from template or repository
	 * @returns {*}
	 */
	function populateProject(){

		var d = q.defer();

		//populate files... set serverType and rootPath in options if available

		d.resolve( options );

		return d.promise;
	}

	/**
	 * prompt for server type if needed
	 * @returns {*}
	 */
	function serverTypePrompt(){
		var d = q.defer();

		//check to see if project's server-type is defined
		if ( options.serverType == undefined ){
			(prompt( "projectServerType" ))().
					then( function( result ){
						_.merge( options, result );
						d.resolve( options );
					});
		}
		else{
			d.resolve( options );
		}

		return d.promise;
	}

	/**
	 * prompt for webroot if needed
	 * @returns {*}
	 */
	function serverWebrootPrompt(){
		var d = q.defer();

		//check to see if project's server-type is defined
		if ( options.rootPath == undefined ){
			prompt( "rootPath" )().
					then( function( result ){
						_.merge( options, result );
						d.resolve( options );
					});
		}
		else{
			d.resolve( options );
		}

		return d.promise;
	}

	/**
	 * prompt for additional server options if needed
	 * @returns {*}
	 */
	function serverOptionsPrompt(){
		var d = q.defer();

		//check to see if project's server-type is defined
		if ( options.serverType != "none" ){
			var qlist = "domain ipv4 ipv6 proxyPHP proxyPort denyDotAccess apacheOptions "+
						"apacheOrder apacheAllow apacheDeny apacheOverride";
			(prompt( qlist ))().
					then( function( result ){
						_.merge( options, result );
						d.resolve( options );
					});
		}
		else{
			d.resolve( options );
		}

		return d.promise;
	}

	/**
	 * promise chain finished handler for async grunt tasks
	 * @param done
	 * @param logmsg
	 * @returns {Function}
	 */
	function finished( done, logmsg ){
		logmsg = logmsg || "";
		return function(){
			if( logmsg != "" )
				grunt.log.writeln( logmsg );
			done();
		}
	}

	/**
	 * promise chain error handler for async grunt tasks
	 * @param done
	 * @param logmsg
	 * @returns {Function}
	 */
	function problem( done, logmsg ){
		logmsg = logmsg || "";
		return function( error ){
			if( logmsg != "" )
				grunt.log.error( logmsg );
			grunt.log.error( error );
			done( false );
		}
	}

	/**
	 * updates /etc/hosts with conf/host
	 */
	grunt.registerTask( 'update-hosts', function(){

		var done = this.async();

		updateHostsFile( undefined, true ).
				then( finished( done, '/etc/hosts has been updated. ') ).
				catch( problem );

	});

	/**
	 * adds a host
	 */
	grunt.registerTask( 'add-hosts-entry', function(){

		var done = this.async();

		(prompt( "domain ipv4 ipv6" ))().
				then( updateHostsFileEntry ).
				then( finished( done ) ).
				catch( problem );

	});

	/**
	 * removes a host
	 */
	grunt.registerTask( 'remove-hosts-entry', function(){

		var done = this.async();

		(prompt( 'domain' ))().
				then( removeHostsFileEntry ).
				then( finished( done ) ).
				catch( problem );
	});

	/**
	 * adds a vhost
	 */
	grunt.registerTask( 'add-vhost', function(){

		var done = this.async();
		var qlist = "domain ipv4 ipv6 serverType proxyPHP proxyPort denyDotAccess staticPaths "+
					"rootPath apacheOptions apacheOrder apacheAllow apacheDeny apacheOverride";

		(prompt( qlist ))().
				then( updateHostsFileEntry ).
				then( addVhost ).
				then( enableVhost ).
				then( restartNginX ).
				then( restartApache ).
				then( finished( done ) ).
				catch( problem );
	});

	/**
	 * removes a host
	 */
	grunt.registerTask( 'remove-vhost', function(){

		var done = this.async();

		var prompts = [
			questions['domain']
		];

		(prompt( 'domain' ))().
				then( removeHostsFileEntry ).
				then( disableVhost ).
				then( removeVhost ).
				then( restartNginX ).
				then( restartApache ).
				then( finished( done ) ).
				catch( problem );
	});

	/**
	 * restarts apache and nginx
	 */
	grunt.registerTask( 'restart-servers', function(){

		var done = this.async();
		restartNginX().
				then( restartApache ).
				then( finished( done ) ).
				catch( problem );

	});

	/**
	 * adds a project
	 */
	grunt.registerTask( 'add-project', function(){

		var done = this.async();

		var qlist = "projectPath projectIsNew projectCloneRepo projectScaffoldingType projectScaffoldPath "+
					"projectScaffoldGenerator projectRepo";

		loadYoGenerators().
				then( prompt( qlist ) ).
				then( populateProject ).
				then( serverTypePrompt ).
				then( serverOptionsPrompt ).
				then( updateHostsFileEntry ).
				then( addVhost ).
				then( enableVhost ).
				then( restartNginX ).
				then( restartApache ).
				then( finished( done ) ).
				catch( problem );
	});


};