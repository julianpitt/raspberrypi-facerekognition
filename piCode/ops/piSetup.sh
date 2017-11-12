#!/bin/bash

#Check to see if the user is root
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Not running as root"
    exit
fi

sudo apt-get update -y

# Set up nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash

# source nvm
touch ~/.bashrc

sudo tee -a ~/.bashrc <<'EOF'

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm 

EOF
source ~/.bashrc

# Install node version 6.10.3
nvm install 6.10.3
nvm use 6.10.3

# Clone the repo
cd ~
git clone https://github.com/julianpitt/raspberrypi-facerekognition

cd ./raspberrypi-facerekognition
rm -rf ./awsCode
npm set progress=false

cd ./piCode/recognition
cp example.config.json config.json
npm install

cd ../ops
npm install

# Add .bashrc if doesn't exist and append the startup script
sudo tee -a ~/.bashrc <<EOF

node ~/raspberrypi-facerekognition/piCode/ops/piBootScript.js

EOF

## UPGRADE ALL THE THINGS!!!
DEBIAN_FRONTEND=noninteractive DEBIAN_PRIORITY=critical sudo apt-get -q -y -o "Dpkg::Options::=--force-confdef" -o "Dpkg::Options::=--force-confold" dist-upgrade

# Remove no longer needed packages
DEBIAN_FRONTEND=noninteractive DEBIAN_PRIORITY=critical sudo apt-get -q -y -o "Dpkg::Options::=--force-confdef" -o "Dpkg::Options::=--force-confold" autoremove --purge

# Reboot
reboot