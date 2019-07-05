#!/bin/bash
cd /home/ipsg/Documents/skill-squirrel/cert-verifier
# virtualenv -p /usr/bin/python3.6 venv
source ./venv/bin/activate
cd cert_verifier
python verifier.py >> ../reports/report.txt
cd ../
deactivate