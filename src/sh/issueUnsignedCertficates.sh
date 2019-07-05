#!/bin/bash
cd /home/prasad/Documents/cert-tools
# virtualenv -p /usr/bin/python3.6 venv
source ./venv/bin/activate
instantiate-certificate-batch -c conf.ini
deactivate