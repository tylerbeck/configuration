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
	 * apache controller
	 */
	var project = new (require('../classes/ProjectController'))( grunt, options );


	//current working directory
	var cwd = process.cwd();


	/**
	 * adds vhost files for specified domain
	 * @returns {*}
	 */
	function addVhosts(){

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
	}


	/**
	 * adds vhost conf file links to sites-enabled
	 * @returns {*}
	 */
	function enableVhosts(){

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

		addVhosts().
				then( enableVhosts ).
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * removes a host
	 */
	grunt.registerTask( 'remove-vhost', function(){

		var done = this.async();

		nginx.removeVhost().
				then( apache.removeVhost ).
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * adds a vhost
	 */
	grunt.registerTask( 'enable-vhost', function(){

		var done = this.async();

		enableVhosts().
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * removes a host
	 */
	grunt.registerTask( 'disable-vhost', function(){

		var done = this.async();

		nginx.disableVhost().
				then( apache.disableVhost ).
				then( finished( done ) ).
				catch( problem( done ) );

	});

	/**
	 * restarts apache and nginx
	 */
	grunt.registerTask( 'restart-servers', function(){

		var done = this.async();
		nginx.restart().
				then( apache.restart ).
				then( finished( done ) ).
				catch( problem( done, "an error occurred restarting server") );

	});

	/**
	 * adds a project
	 */
	grunt.registerTask( 'create-project', function(){

		var done = this.async();

		project.create().
				then( finished( done ) ).
				catch( problem( done ) );
	});


};