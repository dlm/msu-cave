#!/usr/bin/env bash

# abort on error
set -e

if [[ $# -eq 0 ]] ; then
    echo 'Must specify exp directory'
    echo "  $0 expDir"
    exit 0
fi



expDir=$1
mkdir "$expDir"
for i in `seq 1 5`; do
    ./data_collector.js --pod=$i > "$expDir/pod${RANDOM}.log" &
done
