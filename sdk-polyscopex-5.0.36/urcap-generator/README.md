## Create New URCap Contributions

This URCap Contribution Generator is created using Yeoman (see https://yeoman.io/).

---
### Installation
To install Yeoman (yo) and the URCap Contribution Generator run:

 `npm install`  
 `npm link`

--- 
### Create new Angular or Javascript Contribution
To create a new URCap contribution run:

`npm run newurcap`

and follow the Template Wizard.

####Example:
Used the Wizard to create a Gripper contribution with id mygripper.
A folder is created called 'mygripper'.  
To create the final zip contribution, mygripper needs to be installed and build using:

`cd ../mygripper`  
`npm install`  
`npm build`  

A file called 'mygripper.zip' is created and put in the .urcaps/zip folder

---
### Create new Angular Contribution
To create an Angular Contribution run:

`npm run newurcap:angular`  

---
### Create new JavaScript Contribution
To create a JavaScript Contribution run:

`npm run newurcap:javascript`

---
### Create new empty Docker Container Contribution
To create an empty Docker Container Contribution run:

`npm run newurcap:docker`

---
### Command Line Arguments to create a new URCap Web Contribution

 `npm run newurcap -- "Universal Robots" "com.ur.urplus" "My Gripper" "mygripper" "angular" "my-program" "my-application" --web --programNode --applicationNode --forceReplace`

will create a mygripper folder with a new Contribution, including a sample program node and application node.  

---
### Command Line Arguments to create a new URCap Docker Container Contribution

`npm run newurcap -- "Universal Robots" "com.ur.urplus" "My Docker" "mydocker" --docker --forceReplace`

will create a mydocker folder with a new empty Docker Container Contribution.

---
### Command Line Arguments to create a new URCap ROS2 Docker Container Contribution

`npm run newurcap -- "Universal Robots" "com.ur.urplus" "My Docker" "mydocker" --docker --ros2 --forceReplace`

will create a mydocker folder with a new empty Docker Container Contribution.

---
### Command Line Help 

`npm run newurcap -- --help`

will show help for the commandline arguments and options.
