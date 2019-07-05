#!/bin/bash
cd /home/prasad/Documents/cert-tools

# virtualenv -p /usr/bin/python3.6 venv
source ./venv/bin/activate
create-certificate-template -c conf.ini
deactivate
