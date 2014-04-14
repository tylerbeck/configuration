##Computer Configuration Script
1. Install XCode from AppStore

2. Install XCode Command Line Tools
```
xcode-select --install
```
3. 

















----
3. Add Symlink to Prevent Toolchain bug
```
sw_vers -productVersion | grep -E '^10\.[89]' > /dev/null && bash -c "[ -d /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain ] && sudo -u $(ls -ld /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain | awk '{print $3}') bash -c 'ln -vs XcodeDefault.xctoolchain /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain' || sudo bash -c 'mkdir -vp /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain/usr && ln -s /usr/bin /Applications/Xcode.app/Contents/Developer/Toolchains/OSX$(sw_vers -productVersion | cut -c-4).xctoolchain/usr/bin'"
```
4. Install HomeBrew
```
(ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)) \
	2>&1 | tee ~/Desktop/Installation\ Receipts/homebrew/install.log
```
5. Tap Additional Repositories
```
brew tap \
		homebrew/dupes \
		homebrew/versions \
		homebrew/science \
	 	homebrew/completions \
	 	homebrew/homebrew-php \
2>&1 | tee ~/Desktop/Installation\ Receipts/homebrew/taps.log
```

6. Install Brew Packages
```
brew install \

```

100. Open Links in Safari to Download Installers
```
open -a Safari http://www.alfredapp.com/#download
open -a Safari http://www.barebones.com/support/bbedit/updates.html
open -a Safari http://pngmini.com
open -a Safari http://imageoptim.com
open -a Safari http://www.jetbrains.com/idea/download/
open -a Safari http://www.knocktounlock.com/download
open -a Safari http://www.omnigroup.com/omnigraffle#download
open -a Safari http://cocoatech.com/pathfinder/download
open -a Safari http://www.sequelpro.com/download
open -a Safari https://github.com/mapbox/tilemill/downloads
```