#!/bin/bash

# external sources ------------------------------
	source conf.default/bash/misc/colors.sh
	source assets/sh/shared.sh
	source assets/sh/helper-functions.sh


# variables -------------------------------------
	LOG_PATH="$BASE_LOG_PATH/applications"
	L="$LOG_PATH/configuration.log"


#setup ------------------------------------------
	mkdir -p "$LOG_PATH";

	__log_header "Application Configuration" ${L}

	#open application download page links
	IFS=$'\n'
	for LINK in `cat conf/applications/download_links`
	do

		LINK=$( __trim "$LINK" )
		if [ ${LINK} != "" ]; then
			__run "open -a Safari $LINK" ${L}
		fi

	done

	__log_complete ${L}

