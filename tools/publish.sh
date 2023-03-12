#!/bin/sh

set -e

cd ${0%/*}/../extension

ver="$(jq -r .version <manifest.json)"
echo "Version: $ver"
pubfile="../tab-gatherer-$ver.zip"
echo "Target file: $pubfile"
echo "Files to archive:"
find . -type f | sort | sed  's-^-    -'


if test -e "$pubfile"
then
    echo "Target file is already exited; bump the version or remove target file manually"
    exit 1
fi

echo "Going to archive..."
zip -r "$pubfile" . -i '*.js' -i '*.json' -i '*.png'

echo "Done. OK"
