#!/bin/bash

# external sources ------------------------------
source bash/.bash/misc/colors.sh
source assets/misc/shared.sh
source assets/misc/helper-functions.sh


# variables -------------------------------------
LOG_PATH="$BASE_LOG_PATH/node"
L="$LOG_PATH/configuration.log"


#setup ------------------------------------------
mkdir -p "$LOG_PATH";

__log_header "NodeJS Configuration" ${L}


__log_complete ${L}

