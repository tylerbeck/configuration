/***********************************************************************
 * This class controls user prompts and options
 * Author: Copyright 2012-2014, Tyler Beck
 * License: MIT
 ***********************************************************************/

/**
 * Options Controller
 * @param grunt
 * @returns {module}
 * @constructor
 */
module.exports = function OptionsController( grunt ){

	'use strict';


	/*================================================
	 * Dependencies
	 *===============================================*/
	var q = require( 'q' );
	var _ = require( 'lodash' );
	var inquirer = require( 'inquirer' );
	var exec = require( 'child_process' ).exec;
	var path = require( 'path' );

	/*================================================
	 * Public Attributes
	 *===============================================*/
	/**
	 * options object
	 * @type {{}}
	 */
	var options = {};

	/*================================================
	 * Private Attributes
	 *===============================================*/

	//prompt properties
	var ipv4RegEx = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
	var ipv6RegEx = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
	var domainRegEx = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*(\.[a-z]{2,99})?$/;

	/**
	 * Inquirer Questions
	 */
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
				return matchFn( 'serverType', 'nginx', answers, false );
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
			message: "webroot path",
			type: 'input',
			//TODO: validate root directory path
			validate: validatePattern( true, /.*/, 'enter a valid path')
		},
		projectRootPath: {
			name: "rootPath",
			message: "webroot path (relative to project)",
			type: 'input',
			//TODO: validate root directory path
			validate: validatePattern( true, /.*/, 'enter a valid path'),
			filter: function( value ){
				return path.join( options['projectPath'], value );
			}
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
		projectScaffoldingType: {
			name: "projectSourceType",
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
		projectSourceType: {
			name: "projectSourceType",
			message: "project source",
			type: 'list',
			choices: [
				"none",
				"git repo",
				"directory"
			],
			default: "none",
			when: function( answers ){
				return !answers['projectIsNew'];
			}
		},
		projectRepo: {
			name: "projectRepo",
			message: "git repo url",
			type: 'input',
			validate: validatePattern( true, /.*/, 'enter a valid url'),
			when: function( answers ){
				return matchFn( 'projectSourceType', "git repo", answers );
			}
		},
		projectSourcePath: {
			name: "projectSourcePath",
			message: "source directory path",
			type: 'input',
			validate: validatePattern( true, /.*/, 'enter a valid path'),
			when: function( answers ){
				return matchFn( 'projectSourceType', "directory", answers ) ||
						matchFn( 'projectScaffoldingType', "directory", answers );
			}
		},
		projectScaffoldGenerator: {
			name: "yoGenerator",
			message: "generator type",
			type: 'list',
			choices: ["none"], //this is dynamically set by loadYoGenerators
			when: function( answers ){
				return matchFn( 'projectIsNew', true, answers ) && matchFn( 'projectSourceType', "yo", answers );
			},
			first: loadYoGenerators
		}
	};


	/*================================================
	 * Public Methods
	 *===============================================*/
	/**
	 * sets an option
	 * @param name
	 * @param value
	 */
	function setOption( name, value ){
		options[name] = value;
	}

	/**
	 * gets an option
	 * @param name
	 * @returns {*}
	 */
	function getOption( name ){
		return options[name];
	}

	/**
	 * gets an option
	 * @param name
	 * @returns {*}
	 */
	function getOptions(){
		//return _.clone( options );
		return  options;
	}

	/**
	 * promise returning prompt
	 * @param qlist
	 * @returns {function}
	 */
	function prompt( qlist ){
		//console.log('prompt', qlist);
		var setup = [];
		var qs = typeof qlist == 'string' ? getQuestions( qlist ) : qlist;
		qs.forEach( function( question ){
			if ( question.hasOwnProperty('first') && typeof question.first == 'function' ){
				//console.log('adding preprocessor for '+question.name);
				setup.push( question.first() );
			}
		});

		return function(){

			var d = q.defer();

			q.all( setup ).
					then( function(){
						//console.log('prompting: ',qs);
						inquirer.prompt( qs, function( result ){
							_.merge( options, result );
							d.resolve( options );
						} );
					} ).
					catch( d.reject );

			return d.promise;
		}

	}

	/**
	 * prompts user for option if missing from options
	 * @param qlist
	 * @returns {Function}
	 */
	function promptIfMissing( qlist ){
		//console.log('promptIfMissing', qlist);
		var qs = typeof qlist == 'string' ? getQuestions( qlist ) : qlist;
		var filtered = [];
		qs.forEach( function( question ){
			//console.log( '  ',question.name+':', options[ question.name ] );
			if ( options[ question.name ] == undefined ){
				filtered.push( question );
			}
		});

		return prompt( filtered );
	}



	/*================================================
	 * Private Methods
	 *===============================================*/
	/**
	 * utility method for 'when' methods in prompts
	 * @param prop
	 * @param value
	 * @param answers
	 * @param negate
	 * @returns {boolean}
	 */
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
	 * loads list of currently installed yo generators
	 * @returns {*}
	 */
	function loadYoGenerators(){
		grunt.log.writeln('loading yo generators...');
		var d = q.defer();
		var matchName = /generator-([^@\r\n\s]+)/;
		//TODO: switch to yo --help to get list of generators
		var proc = exec('npm list -g | grep generator-',
				function ( error, stdout, stderr ) {
					var gmap = {};
					if (error !== null) {
						console.log('exec error: ' + error);
						d.reject( error );
					}
					else{
						var lines = stdout.split(/[\r\n]/g);
						lines.forEach( function( line ){
							line = line.trim();
							if (line != ""){
								var parts = line.match( matchName );
								if (parts && parts.length > 0){
									gmap[ parts[1] ] = true;
								}
							}
						});

						var generators = Object.keys( gmap );
						if ( generators.length > 0 ){
							questions[ 'projectScaffoldGenerator' ].choices = generators;
							//console.log( generators.join("\n"));
							d.resolve();
						}
						else{
							d.reject('no generators are installed');
						}

					}
				});

		return d.promise;
	}

	//TODO: add a public getYoGenerators method that uses yo --help to get (and cache) list of generators
	//TODO: update loadYoGenerators to use getYoGenerators


	/*================================================
	 * Create Interface
	 *===============================================*/
	this.set = setOption;
	this.get = getOption;
	this.getAll = getOptions;
	this.prompt = prompt;
	this.promptIfMissing = promptIfMissing;

	return this;

};
