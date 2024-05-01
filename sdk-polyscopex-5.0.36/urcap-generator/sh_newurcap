#!/bin/bash

##############################################################################
# Bash script for creating a URCap project
##############################################################################
set -e
command_exists () {
	type "$1" &> /dev/null ;
}

if ! command_exists "node" ; then
	echo "The tool 'node' does not seem to be installed."
	echo "Please install it by sourcing the install script. Like: '. ./install.sh'";
	exit 1;
fi

if ! command_exists "npm" ; then
	echo "The tool 'npm' does not seem to be installed."
	echo "Please install it by sourcing the install script. Like: '. ./install.sh'";
	exit 1;
fi

if [[ ! -d "./urcap-generator/node_modules" ]]; then
	echo "The URCap Generator does not seem to be installed."
	echo "Please install it by running the install script. Like: '. ./install.sh'";
	exit 1;
fi

{
	pushd urcap-generator > /dev/null
	npm --silent run newurcap -- "$@"
	popd > /dev/null
} || {
	popd > /dev/null
}
