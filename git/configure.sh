#!/bin/bash

# external sources ------------------------------
source bash/.bash/misc/colors.sh
source assets/misc/shared.sh
source assets/misc/helper-functions.sh


# variables -------------------------------------
LOG_PATH="$BASE_LOG_PATH/git"
L="$LOG_PATH/configuration.log"


#setup ------------------------------------------
mkdir -p "$LOG_PATH";

__log_header "Bash Profile Configuration" ${L}

#move existing files
if [ -e ~/.gitconfig ]; then
	__log "Moving existing ~/.gitconfig directory to ~/.old_gitconfig" ${L}
	mv ~/.gitconfig ~/.old_gitconfig;
fi

GITCONFIG_SRC_PATH="$PWD/git/.gitconfig/"

__log "Linking ~/.gitconfig to $GITCONFIG_SRC_PATH" ${L}
ln -s "$GITCONFIG_SRC_PATH" ~/.gitconfig

__log_complete ${L}
