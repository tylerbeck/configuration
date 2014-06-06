#COMMAND ALIASES --------------------------------
	alias ls='ls -a'

#CUSTOM ALIASES ---------------------------------


#PROJECT CONFIGURATION ALIASES ------------------
	alias projectcreate='CWD=$(pwd) && cd ~/Projects/configuration/ && grunt create-project && cd $CWD'
	alias vhostadd='CWD=$(pwd) && cd ~/Projects/configuration/ && grunt add-vhost && cd $CWD'
	alias vhostremove='CWD=$(pwd) && cd ~/Projects/configuration/ && grunt remove-vhost && cd $CWD'
	alias hostsadd='CWD=$(pwd) && cd ~/Projects/configuration/ && grunt add-hosts-entry && cd $CWD'
	alias hostsremove='CWD=$(pwd) && cd ~/Projects/configuration/ && grunt remove-hosts-entry && cd $CWD'
	alias restartservers='CWD=$(pwd) && cd ~/Projects/configuration/ && grunt restart-servers && cd $CWD'
