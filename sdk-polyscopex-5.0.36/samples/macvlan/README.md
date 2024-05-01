# Macvlan sample

This sample contains a docker container with a Python backend with a flask server. 
The manifest for the URCap describes a new "eth1" network interface which is a macvlan.
The flask server contains two REST-endpoints /hello and /set_interface which respectively echoes 
back "world", and sets the "eth1" network interface with the parameters described in the python main.py file.

Note: It is not possible to test the networking interfaces in the simulator. It is possible to test your REST endpoints 
and the business logic but networking changes needs a real robot. 