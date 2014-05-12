# external sources ------------------------------
	source conf.default/bash/misc/colors.sh
	source assets/sh/shared.sh
	source assets/sh/helper-functions.sh

# variables -------------------------------------
	LOG_PATH="$BASE_LOG_PATH"
	L="$LOG_PATH/configuration.log"

#get installation options -----------------------
	#since is top-level configuration, everything
	# should be explicitly included... for now
	LINK_TOOLCHAIN=0
	CONFIGURE_FOLDERS=0
	CONFIGURE_BASH=0
	CONFIGURE_HOMEBREW=0
	CONFIGURE_GIT=0
	CONFIGURE_NODEJS=0
	CONFIGURE_SERVERS=0
	XXXXXX=0

	while getopts ":nx" opt; do
        case $opt in
            x)
                LINK_TOOLCHAIN=1
                ;;
            f)
		        CONFIGURE_FOLDERS=1
		        ;;
            b)
                CONFIGURE_BASH=1
                ;;
            h)
                CONFIGURE_HOMEBREW=1
                ;;
            g)
		        CONFIGURE_GIT=1
		        ;;
            n)
		        CONFIGURE_NODEJS=1
		        ;;
            s)
		        CONFIGURE_SERVERS=1
		        ;;
            \?)
                echo "Invalid option: -$OPTARG"
                ;;
        esac
	done



#setup ------------------------------------------
	mkdir -p "$LOG_PATH";

	__log_header "Running Configuration" ${L} $C_LIGHTRED

#ensure xcode toolchain links -------------------
	if [ ${LINK_TOOLCHAIN} = 1 ]; then
		__log "Re-Linking XCode Toolchain" ${L}
		#from https://github.com/Homebrew/homebrew-apache
		sw_vers -productVersion | grep -E '^10\.[89]' > /dev/null && bash -c "[ -d /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain ] && sudo -u $(ls -ld /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain | awk '{print $3}') bash -c 'ln -vs XcodeDefault.xctoolchain /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain' || sudo bash -c 'mkdir -vp /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain/usr && ln -s /usr/bin /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain/usr/bin'"

	fi

#create projects and sites folders --------------
	if [ ${CONFIGURE_FOLDERS} = 1 ]; then

		if [ -ne conf ]; then
			__log "conf directory not found, copying conf.default to conf" ${L}
			cp conf.default conf
		fi

		if [ -ne ~/Projects ]; then
			__log "Creating Projects directory at ~/Projects" ${L}
			mkdir ~/Projects
		fi

		if [ -ne ~/Sites ]; then
			__log "Creating Sites directory at ~/Sites" ${L}
			mkdir -p ~/Sites
		fi

		if [ -ne ~/Sites/localhost ]; then
			__log "Creating localhost directory at ~/Sites/localhost" ${L}
			mkdir -p ~/Sites/localhost

			__log "Adding default files to localhost" ${L}
			cp assets/files/index.html ~/Sites/localhost/index.html
			cp assets/files/info.php ~/Sites/localhost/info.php
		fi

	fi


#configure brew ---------------------------------
	if [ ${CONFIGURE_HOMEBREW} = 1 ]; then
		#install brew
		#run brew doctor
		#tap kegs
		#install packages
		sh configure-brew.sh
	fi

#configure brew ---------------------------------
	if [ ${CONFIGURE_GIT} = 1 ]; then
		#relink .gitconfig
		sh configure-git.sh
	fi


#configure node ---------------------------------
	if [ ${CONFIGURE_NODEJS} = 1 ]; then
		#install global packages
		sh configure-node.sh
	fi

#configure node ---------------------------------
	if [ ${CONFIGURE_SERVERS} = 1 ]; then
		#link server configuration
		sh configure-servers.sh
	fi



	__log_complete ${L}
