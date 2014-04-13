__log ( )
{
	if [ "$#" -gt 1 ]; then
		echo "$1" | tee -a $2
	elif [ "$#" -gt 0 ]; then
		echo "$1"
	fi
}

__put ( )
{
	if [ "$#" -gt 1 ]; then
		printf "$1" | tee -a $2
	elif [ "$#" -gt 0 ]; then
		printf "$1"
	fi
}

__run ( ) {
	if [ "$#" -gt 1 ]; then
		$1 2>&1 | tee -a $2
	elif [ "$#" -gt 0 ]; then
		$1
	fi
}

__log_header ( )
{
	__put "$C_LIGHTGREEN"
	__log "======================================================================" $2
	__put "$1" $2
	__put "$C_DARKGRAY"
	__log " - $( date )" $2
	__put "$C_LIGHTGREEN"
	__log "======================================================================" $2
	__put "$C_DEFAULT"
}

__log_complete ( )
{
	__put "$C_LIGHTGREEN"
	__log "[COMPLETE]" $1
	__put "$C_LIGHTYELLOW"
	__log "Log saved to: $1"
	__put "$C_DEFAULT"
}


__trim ( ) {
	echo "$1" | sed -e 's/^ *//' -e 's/ *$//'
}
