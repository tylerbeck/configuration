#!/bin/bash

# external sources ------------------------------
	source bash/.bash/misc/colors.sh
	source assets/sh/shared.sh
	source assets/sh/helper-functions.sh


# variables -------------------------------------
	LOG_PATH="$BASE_LOG_PATH/node"
	L="$LOG_PATH/configuration.log"


#setup ------------------------------------------
	mkdir -p "$LOG_PATH";

	__log_header "NodeJS Configuration" ${L}

	__run "cd nodejs && npm install -g grunt && cd ../" ${L}

		#now that grunt is installed things get a bit easier
	__run "cd nodejs && npm install -g grunt && cd ../" ${L}


	__log_complete ${L}

