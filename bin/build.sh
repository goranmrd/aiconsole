#!/usr/bin/env bash
# check for node
if ! [ -x "$(command -v node)" ]; then
  echo 'Error: node is not installed.' >&2
  exit 1
fi

# check for node version ( must be higher than 18 series )
if [ "$(node -v)" \< "v18" ]; then
  echo 'Error: node version must be higher than 18 series.' >&2
  exit 1
fi

# check for yarn
if ! [ -x "$(command -v yarn)" ]; then
  echo 'Error: yarn is not installed.' >&2
  exit 1
fi

rm -rf ./aiconsole/static
cd ./web || exit 1

# install dependencies
yarn install
yarn build
cd ..
poetry build

echo "Build Success! Now you can use poetry publish to publish your package."





