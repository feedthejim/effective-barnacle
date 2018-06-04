#!/bin/sh

docker ps -q --filter ancestor="eb-back" | xargs -r docker kill
