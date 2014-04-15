#!/bin/sh
IP=192.168.1.171
export PEBBLE_PHONE=$IP

echo "--------------------------------------------------------"
echo "Installing on $IP"
echo "--------------------------------------------------------"

grunt
pebble build 
pebble install
pebble logs


echo "-------------------------------------------------------"