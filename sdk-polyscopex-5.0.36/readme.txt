URCap Software Development Kit

urcap-generator/  - contains the URCap generator for creating URCap contributions.
samples/          - contains URCap samples. Build using: npm install && npm run build
install.sh        - The script for installing the npm packages for the URCap generator. Run this first.
newurcap.sh       - The script for creating a URCap contribution in your current working directory using the generator
readme.txt        - This file

Note that the newurcap script file will appear after install script is executed.
Once a new URCap contribution is created using the 'newurcap' script, then a folder named after its id is created.
To create the final zip file for a contribution, go to its folder and run 'npm install' and run 'npm run build'