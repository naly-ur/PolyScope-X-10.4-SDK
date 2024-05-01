#!/bin/bash

set -e

found_java_processes=$(ps aux | grep java | wc -l)

# Greater than one because the ps command above will return both the java process and the 'grep java' line
if [[ ${found_java_processes} -gt 1 ]]; then
  exit 0
  else
    exit 1
fi