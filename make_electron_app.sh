#!/bin/bash

PYTHON_SCRIPT_PATH="./build_local_python.sh"

check_python() {
  cd electron
  "$PYTHON_SCRIPT_PATH"
}

make_app() {
  cd ../web
  yarn make
}

check_python
make_app