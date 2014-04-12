# external sources ------------------------------
source bash/.bash/misc/colors.sh
source misc/shared.sh
source misc/helper-functions.sh

# variables -------------------------------------
LOG_PATH="$BASE_LOG_PATH"
L="$LOG_PATH/configuration.log"

#get installation options -----------------------

#setup ------------------------------------------
mkdir -p "$LOG_PATH";

__log_header "Header" ${L}
__run "cat brew/taps" ${L}
__log_complete ${L}

