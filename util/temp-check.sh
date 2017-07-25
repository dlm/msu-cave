#!/bin/bash

echo "Raspberry Pi Temperature Monitor."
echo "Press CTRL + c to end."
while :
do
	raw_data=$(cat /sys/class/thermal/thermal_zone0/temp)
	temp= $raw_Data/1000
	echo "CPU Temp: $temp degrees Celsius"
	sleep 3
done
