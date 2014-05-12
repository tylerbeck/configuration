module.exports = function( grunt ){

	var sys = require('sys');
	var exec = require('child_process').exec;
	var q = require('q');
	var _ = require('lodash');


	grunt.registerTask("install-global-modules", function(){

		var done = this.async();

		var pkg = grunt.file.readJSON( 'conf/package_global.json' );

		var loaders = [];
		if ( pkg && pkg.dependencies ){

			var loaders = [];
			var names = _.keys( pkg.dependencies );
			names.forEach( function( name ){
				grunt.verbose.writeln("creating loader function for: "+name);
				//add promise returning function to loaders
				loaders.push( function(){
					var d = q.defer();
					var version = pkg.dependencies[ name ];
					var id = (version == "latest") ? name : name + "@" + version;
					//execute load
					grunt.log.write( 'executing: `npm install -g '+id+'`...' );
					exec("npm install -g "+id, function( error, stdout, stderr ){

						grunt.verbose.writeln("exec callback");

						sys.puts( stdout );
						sys.puts( stderr );

						if ( error !== null ){
							d.reject( error );
						}
						else{
							grunt.verbose.writeln("complete");
							d.resolve();
						}
					});

					return d.promise;
				} );
			});

		}

		q.fcall( function(){
			return loaders.reduce( q.when, q(true) );
		})
		.then( function(){
			done();
		})
		.fail(function (error) {
			grunt.log.writeln( error.toString() );
			done();
		});

	} );
};