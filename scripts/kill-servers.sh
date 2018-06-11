#!/bin/sh

docker ps -q --filter ancestor="effective-barnacle_backend" | xargs -r docker kill
