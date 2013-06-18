Run "npm install" in this directory to install all the dependencies (currently only restify).

By default (for now), the app is set up to run on a PC, emulating the GPIOs of a Raspberry Pi.  To run on a real Pi, you will need to do the following two steps:

in app.js, uncomment line number 926 
in app.js, comment line number 927

Should read: 
GPIO_PATH = "/sys/class/gpio/";