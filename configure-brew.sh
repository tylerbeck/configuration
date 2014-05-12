#!/bin/bash

# external sources ------------------------------
	source conf.default/bash/misc/colors.sh
	source assets/sh/shared.sh
	source assets/sh/helper-functions.sh


# variables -------------------------------------
	LOG_PATH="$BASE_LOG_PATH/homebrew"
	PACKAGE_LOG_PATH="$LOG_PATH/packages"


#get installation options -----------------------
	if [ "$#" = 0 ]; then
		INSTALL_BREW=1
		BREW_DOCTOR=1
		TAP_KEGS=1
		INSTALL_PACKAGES=1
	else
		INSTALL_BREW=0
		BREW_DOCTOR=0
		TAP_KEGS=0
		INSTALL_PACKAGES=0

		while getopts ":idtp" opt; do
	        case $opt in
	            i)
	                INSTALL_BREW=1
	                ;;
	            d)
	                BREW_DOCTOR=1
	                ;;
	            t)
			        TAP_KEGS=1
			        ;;
			    p)
	                INSTALL_PACKAGES=1
	                ;;
	            \?)
	                echo "Invalid option: -$OPTARG"
	                ;;
	        esac
		done
	fi


#setup ------------------------------------------
	mkdir -p "$LOG_PATH";


#install homebrew -------------------------------
	if [ ${INSTALL_BREW} = 1 ]; then

		L="$LOG_PATH/install.log"

		__log_header "Homebrew Installation" ${L}

		#TODO: uncomment next line for real use
		#__run "ruby -e \"$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)\"" ${L}

		__log_complete ${L}

	fi


#run brew doctor --------------------------------
	if [ ${BREW_DOCTOR} = 1 ]; then

		L="$LOG_PATH/doctor.log"

		__log_header "Brew Doctor" ${L}
		__run "brew doctor" ${L}
		__log_complete ${L}

	fi


#tap kegs ---------------------------------------
	if [ ${TAP_KEGS} = 1 ]; then

		L="$LOG_PATH/taps.log"

		__log_header "Tapping Kegs" ${L}

		IFS=$'\n'
		for KEG in `cat conf/brew/taps`
		do

			KEG=$( __trim "$KEG" )
			if [ ${KEG} != "" ]; then
				__log "Tapping: $KEG" ${L}
				__run "brew tap $KEG" ${L}
			fi

		done

		__log_complete ${L}

	fi


#install packages -------------------------------
	if [ ${INSTALL_PACKAGES} = 1 ]; then

		mkdir -p "$PACKAGE_LOG_PATH";

		IFS=$'\n'
		for PKG in `cat conf/brew/packages`
		do

			PKG=$( __trim "$PKG" )
			if [ ${PKG} != "" ]; then

				L="$PACKAGE_LOG_PATH/$PKG.log"

				__log_header "Installing Package" ${L}
				#make sure the package is installed with options from file
				INSTALL_CMD="brew install $PKG";

				#TODO: uncomment next line for real use
				#__run "$INSTALL_CMD" ${L}

				#TODO: comment next line for real use
				__log "$INSTALL_CMD" ${L}

				__log_complete ${L}
			fi

		done

	fi

