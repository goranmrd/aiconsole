#!/bin/bash

# Step 1: Download and extract standalone Python
echo "Downloading standalone Python..."
curl -LO https://github.com/indygreg/python-build-standalone/releases/download/20210724/cpython-3.9.6-x86_64-apple-darwin-install_only-20210724T1424.tar.gz
echo "Extracting Python..."
tar -xzvf cpython-3.9.6-x86_64-apple-darwin-install_only-20210724T1424.tar.gz
rm cpython-3.9.6-x86_64-apple-darwin-install_only-20210724T1424.tar.gz

# Step 2: Use the standalone Python's pip to install the dependencies
echo "Installing aiconsole and dependencies..."
./python/bin/pip install .. --use-feature=in-tree-build

echo "Build process completed!"