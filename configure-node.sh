#!/bin/bash

# external sources ------------------------------
	source conf.default/bash/misc/colors.sh
	source assets/sh/shared.sh
	source assets/sh/helper-functions.sh


# variables -------------------------------------
	LOG_PATH="$BASE_LOG_PATH/node"
	L="$LOG_PATH/configuration.log"


#setup ------------------------------------------
	mkdir -p "$LOG_PATH";

	__log_header "NodeJS Configuration" ${L}

	#ensure grunt and grunt-cli are installed
	__run "npm install -g grunt grunt-cli" ${L}

	#install computer config dependencies
	__run "npm install" ${L}

	#now that grunt is installed things get a bit easier
	__run "grunt configure-node --verbose" ${L}

	__log_complete ${L}

