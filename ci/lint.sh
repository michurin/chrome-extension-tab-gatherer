#!/bin/sh

set -e

cd "$(dirname "$0")"
cd lint

test -d node_modules || npm install
npx eslint --no-eslintrc --config ./eslintrc.js ../../extension/*.js ../../testing/*.js
