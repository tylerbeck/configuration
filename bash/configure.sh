#!/bin/bash

# external sources ------------------------------
source bash/.bash/misc/colors.sh
source misc/shared.sh
source misc/helper-functions.sh

# variables -------------------------------------
LOG_PATH="$BASE_LOG_PATH/bash"
L="$LOG_PATH/configuration.log"

#get installation options -----------------------

#setup ------------------------------------------
mkdir -p "$LOG_PATH";

__log_header "Bash Profile Configuration" ${L}

#move existing files
if [ -e ~/.bash ]; then
	__log "Moving existing ~/.bash directory to ~/.old_bash" ${L}
	mv ~/.bash ~/.old_bash;
fi

if [ -e ~/.bash_profile ]; then
	__log "Moving existing ~/.bash_profile directory to ~/.old_bash_profile" ${L}
	mv ~/.bash_profile ~/.old_bash_profile;
fi


BASH_SRC_PATH="$PWD/bash/.bash/"
BASH_PROFILE_SRC_PATH="$PWD/bash/.bash_profile"

__log "Linking ~/.bash to $BASH_SRC_PATH" ${L}
ln -s "$BASH_SRC_PATH" ~/.bash

__log "Linking ~/.bash_profile to $BASH_PROFILE_SRC_PATH" ${L}
ln -s "$BASH_PROFILE_SRC_PATH" ~/bash_profile
mv ~/bash_profile ~/.bash_profile #fix os x bug... shows up as a folder icon until moving it.

__log_complete ${L}

