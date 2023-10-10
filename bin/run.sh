#!/bin/bash

# confirm that poetry is installed
if ! command -v poetry &> /dev/null
then
    echo "poetry could not be found -  install it globally and try again"
    exit
fi

# check if node is installed
if ! command -v node &> /dev/null
then
    echo "node could not be found -  install it globally and try again"
    exit
fi


installed_node_version=$(node -v | cut -c 2-3)
# check if node version is 18 or higher
if [ "$installed_node_version" -lt 18 ]
then
    echo "node version is too low -  install node 18 or higher and try again"
    exit
fi


function start_backend() {
  poetry install
  poetry run aiconsole-dev
}

start_backend | tee
