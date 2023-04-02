#!/bin/sh

set -e

cd "$(dirname "$0")"

node ../testing/test.js
