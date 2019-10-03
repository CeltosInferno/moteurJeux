#!/usr/bin/env bash
CUR_DIR=$( cd "$( dirname "$0" )" && pwd )
"${CUR_DIR}/client/node_modules/.bin/http-server" "${CUR_DIR}/client" -c-1