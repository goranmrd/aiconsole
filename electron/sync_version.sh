#!/bin/bash

set -e

version=$(awk -F'"' '/"version": ".+"/{print $4; exit}' package.json)

echo "Current version: $version"

# Update the version in pyproject.toml
sed -i '' "s/version = .*/version = \"$version\"/" pyproject.toml

# Update the version in web/package.json
sed -i '' "s/\"version\": .*/\"version\": \"$version\",/" web/package.json
