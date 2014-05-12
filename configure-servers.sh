#!/bin/bash

# external sources ------------------------------
	source conf.default/bash/misc/colors.sh
	source assets/sh/shared.sh
	source assets/sh/helper-functions.sh


# variables -------------------------------------
	LOG_PATH="$BASE_LOG_PATH/servers"
	L="$LOG_PATH/configuration.log"

#get installation options -----------------------
	if [ "$#" = 0 ]; then
		INSTALL_GENERAL=1
		INSTALL_NGINX=1
		INSTALL_APACHE=1
	else
		INSTALL_GENERAL=0
		INSTALL_NGINX=0
		INSTALL_APACHE=0

		while getopts ":gna" opt; do
	        case $opt in
	            g)
	                INSTALL_GENERAL=1
	                ;;
	            n)
	                INSTALL_NGINX=1
	                ;;
	            a)
	                INSTALL_APACHE=1
	                ;;
	            \?)
	                echo "Invalid option: -$OPTARG"
	                ;;
	        esac
		done
	fi


#setup ------------------------------------------
	mkdir -p "$LOG_PATH";

	if [ ${INSTALL_GENERAL} = 1 ]; then

		L="$LOG_PATH/configuration.log"

		__log_header "General Server Configuration" ${L}

		if [ -e /etc/hosts ]; then
			__log "Moving existing /etc/hosts directory to /etc/hosts.orig" ${L}
			sudo mv /etc/hosts /etc/hosts.orig;
		fi

		#set source
		HOSTS_SRC_PATH="$PWD/conf/hosts"

		#link configuration directory
		__log "Linking /etc/hosts to $HOSTS_SRC_PATH" ${L}
		sudo ln -s "$HOSTS_SRC_PATH" /etc/hosts

	fi

	if [ ${INSTALL_NGINX} = 1 ]; then

		L="$LOG_PATH/nginx.log"

		__log_header "NginX Installation" ${L}

		#move existing configuration directory
		if [ -e /usr/local/etc/nginx ]; then
			__log "Moving existing /usr/local/etc/nginx directory to /usr/local/etc/nginx.orig" ${L}
			mv /usr/local/etc/nginx /usr/local/etc/nginx.orig;
		fi

		#set sources
		CONF_SRC_PATH="$PWD/conf/nginx/"

		#link configuration directory
		__log "Linking /usr/local/etc/nginx to $CONF_SRC_PATH" ${L}
		ln -s "$CONF_SRC_PATH" /usr/local/etc/nginx

		#TODO: autostart on boot

		__log_complete ${L}

	fi

	if [ ${INSTALL_APACHE} = 1 ]; then

		L="$LOG_PATH/apache.log"

		__log_header "Apache Installation" ${L}


		#move existing configuration directory
		if [ -e /etc/apache2 ]; then
			__log "Moving existing /etc/apache2 directory to /etc/apache2.orig" ${L}
			mv /etc/apache2 /etc/apache2.orig;
		fi

		#set sources
		CONF_SRC_PATH="$PWD/conf/apache2/"

		#link configuration directory
		__log "Linking /etc/apache2 to $CONF_SRC_PATH" ${L}
		ln -s "$CONF_SRC_PATH" /etc/apache2

		#TODO: autostart on boot

		__log_complete ${L}

	fi





	__log_complete ${L}

