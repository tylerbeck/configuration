##Full Installation
1. Install XCode from AppStore

2. Install XCode Command Line Tools
```
xcode-select --install
```
3. Create a `Projects` directory & clone configuration repository
```
cd ~/ && mkdir Projects
git clone https://github.com/tylerbeck/configuration.git
```

4. If you already have a compatible confiugration directory, clone or copy it to `~/Projects/configuration/conf/` otherwise if you want to alter the default brew and node installs do the following:
	
	1. Run folder configuration to copy default configuration
	
		```
		sh configure.sh -f
		```
	2. Open `conf/brew/taps` and add/remove brew taps; one per line.
	3. Open `conf/brew/packages` and add/remove brew packages to be installed.
	4. Open `conf/applications/download_links` and add/remove links to download pages for applications to be manually installed.
	5. Open `conf/node/package_global.json` and add/remove global node modules to be installed.
	

5. Run installation script with all options (logs will be saved in ~/Desktop/computer-config-logs):
	* -x: link xcode toolchain 
	* -f: configure folders (Projects, conf); this will not overwrite existing directories
	* -b: configure bash profile
	* -h: configure homebrew (install, run doctor, tap kegs, install packages)
	* -g: configure git profile
	* -n: configure nodejs
	* -s: configure application servers (nginx, apache)
	* -a: install applications
	
```
sh configure.sh -xfbhgnsa
```




##Component Installation

TODO

##Grunt Tasks

TODO













