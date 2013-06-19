Run "npm install" in this directory to install all the dependencies (currently only restify).

By default , the app is set up to run on the raspberry pi, but you can change it so a PC will emulate the GPIOs of a Raspberry Pi. This is useful for development work.  To run on a PC, you will need to do the following two steps:

in app.js, comment line number 1
in app.js, uncomment line number 2

It will then use the files in the ./gpio directory.  It won't really do anything, but won't throw errors while running.

http://blog.rueedlinger.ch/2013/03/raspberry-pi-and-nodejs-basic-setup/
^Here is a decent guide that shows how to install node.js on the raspberry pi.  
