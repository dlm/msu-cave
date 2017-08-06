#Script must be run inside tmux

#!/bin/bash

tmux new-window

for i in 1 2 3 4
do
	tmux split-window -h
	tmux send-keys -t $i "clear" C-m
done

tmux select-layout even-horizontal

tmux send-keys -t 1 "ping 10.0.0.10" C-m
tmux send-keys -t 2 "ping 10.0.0.20" C-m
tmux send-keys -t 3 "ping 10.0.0.30" C-m
tmux send-keys -t 4 "ping 10.0.0.40" C-m
tmux send-keys -t 5 "ping 10.0.0.50" C-m

for i in 1 3 5 7 9
do
	tmux select-pane -t $i
	tmux split-window -v
done

for i in 2 4 6 8 10
do
	tmux send-keys -t $i "clear" C-m
done

tmux send-keys -t 2 "ping 10.0.0.11" C-m
tmux send-keys -t 4 "ping 10.0.0.21" C-m
tmux send-keys -t 6 "ping 10.0.0.31" C-m
tmux send-keys -t 8 "ping 10.0.0.41" C-m
tmux send-keys -t 10 "ping 10.0.0.51" C-m
