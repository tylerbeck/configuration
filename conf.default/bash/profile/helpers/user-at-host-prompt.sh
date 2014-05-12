__user_at_host_ps1 ()
{
	if [ "$USER" = "tylerbeck" ] &&
	   [ $(hostname -fs) = "tbmbp" ]; then
		printf "•"
	elif [ "$USER" = "root" ] &&
	   		[ $(hostname -fs) = "tbmbp" ]; then
		printf "root"
	else
		printf "$USER@$(hostname -fs)"
	fi
}
