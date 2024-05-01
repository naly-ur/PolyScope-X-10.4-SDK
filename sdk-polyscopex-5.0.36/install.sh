#!/bin/bash

##############################################################################
# Bash script to install the URCap Contribution Generator
# Run (Source) this before running the sh_newurcap script
##############################################################################
set -e
NODE_VERSION=18.17.1
NVM_VER=0.39.0

(return 0 2>/dev/null) && sourced=1

install_nvm() {
	echo "Installing NVM v${NVM_VER}..."
	touch ${HOME}/.bashrc
	export NVM_DIR="${HOME}/.nvm"
	mkdir -p $NVM_DIR
	curl -o- https://raw.githubusercontent.com/creationix/nvm/v${NVM_VER}/install.sh | bash
	. ${NVM_DIR}/nvm.sh
}

install_node() {
  if command_exists "nvm" ; then
  	echo "The tool 'nvm' is installed."
  else
  	echo "The tool 'nvm' does not seem to be installed."
    install_nvm
  fi

	echo "Installing Node v${NODE_VERSION}..."
	nvm install ${NODE_VERSION}
	nvm alias default v${NODE_VERSION}
	nvm use default
	NODE_DIR="${NVM_DIR}/versions/node/v${NODE_VERSION}/bin/"
	export PATH="${NODE_DIR}:${PATH}"
}

command_exists () {
	type "$1" &> /dev/null ;
}

if command_exists "node" ; then
	echo "The tool 'node' is installed."
else
	echo "The tool 'node' does not seem to be installed."
	if [ -z ${sourced+x} ]; then
		echo "To install Node, this install script needs to be sourced. Please run it using dot, like: '. ./install.sh'"
		exit 1
	fi
	install_node
fi

if command_exists "npm" ; then
	echo "The tool 'npm' is installed."
else
	echo "The tool 'npm' does not seem to be installed."
	if [ -z ${sourced+x} ]; then
		echo "To install NPM, this install script needs to be sourced. Please run it using dot, like: '. ./install.sh'"
		exit 1
	fi
	install_node
fi

node urcap-generator/checknode.js

{
	echo "Installing NPM packages ..."
	pushd urcap-generator > /dev/null
	npm install --no-update-notifier
	echo "Linking URCap Generator ..."
	npm link
	cp -f sh_newurcap ../newurcap.sh
	popd > /dev/null
	npm config set @universal-robots:registry https://pkgs.dev.azure.com/polyscopex/api/_packaging/polyscopex/npm/registry/
	npm config set strict-ssl false
	echo "Run './newurcap.sh' to create new URCap contributions."
} || {
	popd > /dev/null
}

set +e