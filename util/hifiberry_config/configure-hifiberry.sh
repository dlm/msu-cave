#HiFiBerry DAC+ Setup Script

#!/bin/bash

user=$(whoami)

sudo apt-get install csound

sudo echo "dtoverlay=hifiberry-dacplus" >> /boot/config.txt

cp asound.conf /etc/

sudo usermod -a -G audio $user

echo ""
echo "HiFiBerry Successfully configured. Reboot now to complete installation."
