#!/bin/bash

# external sources ------------------------------
	source conf.default/bash/misc/colors.sh
	source assets/sh/shared.sh
	source assets/sh/helper-functions.sh


# variables -------------------------------------
	LOG_PATH="$BASE_LOG_PATH/git"
	L="$LOG_PATH/configuration.log"


#setup ------------------------------------------
	mkdir -p "$LOG_PATH";

	__log_header "GIT Configuration" ${L}

	#move existing files
	if [ -e ~/.gitconfig ]; then
		__log "Moving existing ~/.gitconfig directory to ~/.gitconfig.orig" ${L}
		mv ~/.gitconfig ~/.gitconfig.orig;
	fi

	#set file path
	GITCONFIG_SRC_PATH="$PWD/conf/.gitconfig"

	#link file
	__log "Linking ~/.gitconfig to $GITCONFIG_SRC_PATH" ${L}
	ln -s "$GITCONFIG_SRC_PATH" ~/.gitconfig

	__log_complete ${L}

