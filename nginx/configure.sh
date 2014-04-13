#!/bin/bash

# external sources ------------------------------
source bash/.bash/misc/colors.sh
source assets/sh/shared.sh
source assets/sh/helper-functions.sh


# variables -------------------------------------
LOG_PATH="$BASE_LOG_PATH/nginx"
L="$LOG_PATH/configuration.log"


#setup ------------------------------------------
mkdir -p "$LOG_PATH";

__log_header "NGINX Configuration" ${L}


__log_complete ${L}

