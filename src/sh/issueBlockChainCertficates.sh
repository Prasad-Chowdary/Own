#!/bin/bash
cd /home/prasad/Documents/cert-issuer
# virtualenv -p /usr/bin/python3.6 venv
source ./venv/bin/activate
cert-issuer -c conf_ethtest.ini
deactivate
