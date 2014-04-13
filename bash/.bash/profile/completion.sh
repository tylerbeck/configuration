#BASH COMPLETION --------------------------------
	if [ -f $(brew --prefix)/etc/bash_completion ]; then
	    . $(brew --prefix)/etc/bash_completion
	fi

#GIT COMPLETION --------------------------------
	source ~/.bash/profile/helpers/git-completion.bash