# external sources ------------------------------
source bash/.bash/misc/colors.sh
source assets/misc/shared.sh
source assets/misc/helper-functions.sh

# variables -------------------------------------
LOG_PATH="$BASE_LOG_PATH"
L="$LOG_PATH/configuration.log"

#get installation options -----------------------

#setup ------------------------------------------
mkdir -p "$LOG_PATH";

__log_header "Header" ${L}
__run "cat brew/taps" ${L}
__log_complete ${L}

#ensure xcode toolchain links -------------------
	#from
sw_vers -productVersion | grep -E '^10\.[89]' > /dev/null && bash -c "[ -d /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain ] && sudo -u $(ls -ld /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain | awk '{print $3}') bash -c 'ln -vs XcodeDefault.xctoolchain /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain' || sudo bash -c 'mkdir -vp /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain/usr && ln -s /usr/bin /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain/usr/bin'"

