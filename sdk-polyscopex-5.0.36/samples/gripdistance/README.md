# Grip Distance URCap

This is a sample application URCap. It has an application node and program nodes.
The application node also uses the generate preamble behavior to demonstrate how a URCap would write to the preamble.

## What does it do?

Allows user to set properties for a sample gripper.
The max and min distance for the gripper are hardcoded as 0mm and 300mm.
The user can set the open and close distance for the gripper in the application part of the URCap.
In the program node the user can open or close the gripper. They can then run a program with this node.
Since there is no physical gripper present the change between open and close can be seen in the analog output slider.
