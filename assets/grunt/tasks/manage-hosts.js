module.exports = function( grunt ){

	function addHostsFileEntry( domain, ip4, ip6 ){
		var hosts = grunt.file.read("/etc/hosts")
	}

	function removeHostsFileEntry( domain ){

	}


	function addApacheSite(){

	}

	function removeApacheSite(){

	}

	function addNginxSite(){

	}

	function removeNginxSite(){

	}

	function enableNginxSite(){

	}

	function disableNginxSite(){

	}

	//default task definition
	grunt.registerTask( '', function(){
		grunt.log.writeln('Computer Configuration Script - Default Task');
	});

};