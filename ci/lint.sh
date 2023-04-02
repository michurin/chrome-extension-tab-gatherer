#!/bin/sh

set -e

cd "$(dirname "$0")"
cd lint

test -d node_modules || npm install
npx eslint ../../extension/*.js ../../testing/*.js
