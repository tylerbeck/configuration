#!/bin/bash

# external sources ------------------------------
	source conf.default/bash/misc/colors.sh
	source assets/sh/shared.sh
	source assets/sh/helper-functions.sh


# variables -------------------------------------
	LOG_PATH="$BASE_LOG_PATH/bash"
	L="$LOG_PATH/configuration.log"


#setup ------------------------------------------
	mkdir -p "$LOG_PATH";

	__log_header "Bash Profile Configuration" ${L}

	#move existing files
	if [ -e ~/.bash ]; then
		__log "Moving existing ~/.bash directory to ~/.bash.orig" ${L}
		mv ~/.bash ~/.bash.orig;
	fi

	if [ -e ~/.bash_profile ]; then
		__log "Moving existing ~/.bash_profile directory to ~/.bash_profile.orig" ${L}
		mv ~/.bash_profile ~/.bash_profile.orig;
	fi

	#set sources
	BASH_SRC_PATH="$PWD/conf/bash/"
	BASH_PROFILE_SRC_PATH="$PWD/conf/.bash_profile"

	#link bash scripts
	__log "Linking ~/.bash to $BASH_SRC_PATH" ${L}
	ln -s "$BASH_SRC_PATH" ~/.bash

	#link profile
	__log "Linking ~/.bash_profile to $BASH_PROFILE_SRC_PATH" ${L}
	ln -s "$BASH_PROFILE_SRC_PATH" ~/bash_profile
	mv ~/bash_profile ~/.bash_profile #fix os x bug... shows up as a folder icon until moving it.

	__log_complete ${L}

