module.exports = function( grunt ){

	var q = require( 'q' );
	var _ = require( 'lodash' );


	/**
	 * options controller
	 */
	var options = new (require('../classes/OptionsController'))( grunt );

	/**
	 * hosts controller
	 */
	var hosts = new (require('../classes/HostsController'))( grunt, options );

	/**
	 * nginx controller
	 */
	var nginx = new (require('../classes/NginxController'))( grunt, options );

	/**
	 * apache controller
	 */
	var apache = new (require('../classes/ApacheController'))( grunt, options );

	/**
	 * server controller
	 */
	var servers = new (require('../classes/ServerController'))( [nginx,apache], grunt, options );

	/**
	 * project controller
	 */
	var project = new (require('../classes/ProjectController'))( grunt, options );


	//current working directory
	var cwd = process.cwd();


	/**
	 * adds vhost files for specified domain for nginx and apache
	 * @returns {*}
	 */
	/*function addVhosts(){

		var d = q.defer();

		var opts = options.getAll();

		nginx.addVhost().
				then( function(){
					if ( opts.serverType == 'apache' || opts.proxyPHP ){
						return apache.addVhost();
					}
				} ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;
	}*/


	/**
	 * adds vhost conf file links to sites-enabled for nginx and apache
	 * @returns {*}
	 */
	/*function enableVhosts(){

		var d = q.defer();
		var opts = options.getAll();

		nginx.enableVhost().
				then( function(){
					if ( opts.serverType == 'apache' || opts.proxyPHP ){
						return apache.enableVhost();
					}
				} ).
				then( d.resolve ).
				catch( d.reject );

		return d.promise;
	}*/


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

		hosts.forceUpdate().
				then( finished( done, '/etc/hosts has been updated. ') ).
				catch( problem( done ) );

	});

	/**
	 * adds a host
	 */
	grunt.registerTask( 'add-hosts-entry', function(){

		var done = this.async();

		hosts.addEntry().
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * removes a host
	 */
	grunt.registerTask( 'remove-hosts-entry', function(){

		var done = this.async();

		hosts.removeEntry().
				then( finished( done ) ).
				catch( problem( done ) );
	});

	/**
	 * adds a vhost
	 */
	grunt.registerTask( 'add-vhost', function(){

		var done = this.async();

		hosts.addEntry().
				then( servers.addVhost ).
				then( servers.enableVhost ).
				then( hosts.addEntry ).
				then( servers.restart ).
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * removes a host
	 */
	grunt.registerTask( 'remove-vhost', function(){

		var done = this.async();

		hosts.removeEntry().
				then( servers.removeVhost ).
				then( servers.restart ).
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * adds a vhost
	 */
	grunt.registerTask( 'enable-vhost', function(){

		var done = this.async();

		servers.enableVhost().
				then( servers.restart ).
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * removes a host
	 */
	grunt.registerTask( 'disable-vhost', function(){

		var done = this.async();

		servers.disableVhost().
				then( servers.restart ).
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * restarts apache and nginx
	 */
	grunt.registerTask( 'restart-servers', function(){

		var done = this.async();
		servers.restart().
				then( finished( done ) ).
				catch( problem( done, "an error occurred restarting servers") );

	});

	/**
	 * restarts apache and nginx
	 */
	grunt.registerTask( 'start-servers', function(){

		var done = this.async();
		servers.start().
				then( finished( done ) ).
				catch( problem( done, "an error occurred starting servers") );

	});

	/**
	 * restarts apache and nginx
	 */
	grunt.registerTask( 'stop-servers', function(){

		var done = this.async();
		servers.stop().
				then( finished( done ) ).
				catch( problem( done, "an error occurred stopping servers") );

	});

	/**
	 * adds a project
	 */
	grunt.registerTask( 'create-project', function(){

		var done = this.async();

		project.create().
				then( function(){
					var d = q.defer();
					if ( options.get("projectAddVhost")){
						hosts.addEntry().
								then( servers.addVhost ).
								then( servers.enableVhost ).
								then( servers.restart ).
								then( d.resolve ).
								catch( d.reject );
					}
					else{
						d.resolve();
					}

					return d.promise;
				} ).
				then( finished( done ) ).
				catch( problem( done ) );
	});


};