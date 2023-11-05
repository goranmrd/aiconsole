#!/bin/bash

set -e

version=$(awk -F'"' '/"version": ".+"/{print $4; exit}' package.json)

echo "Current version: $version"

# Update the version in pyproject.toml
sed -i '' "s/version = .*/version = \"$version\"/" ../backend/pyproject.toml

# Update the version in web/package.json
sed -i '' "s/\"version\": .*/\"version\": \"$version\",/" ../frontend/package.json
