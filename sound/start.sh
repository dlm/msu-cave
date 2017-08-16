#!/bin/bash
/bin/sleep 30
/usr/bin/csound -odac -+rtaudio=alsa -b2048 -B2048 /etc/cave/sound/active
