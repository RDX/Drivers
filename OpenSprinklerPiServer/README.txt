OpenSprinklerPiServer is a RESTful application written in Node.js to control the OpenSprinkler Pi product found at http://rayshobby.net.
It features a web based frontend to configure the zones, programs, and schedules. Also included is a Control4 driver so a user can integrate it with their C4 home automation system if desired.


Installation
-------------
-To install node.js on your pi, I recommend following the instructions found here: http://blog.rueedlinger.ch/2013/03/raspberry-pi-and-nodejs-basic-setup/
-After node is installed, simply unzip the OpenSprinklerPiServer into it's own directory, and run 'npm install' inside that directory to install all the dependencies (currently only restify).
-Now you can launch the app by running 'node app.js'.  
-After it has started up, access the web frontend by browsing to http://<IP>:<PORT>/index.html
-Refer to the blog post above to configure the service to start automatically


Control4 Information
---------------------
The driver contains the ability to start, stop, and toggle zones and programs.  The program names are hard coded in the driver as "A" and "B", so make sure you configure those names in the web frontend.  I will add more programs (C and D), in the future.


Limitations/Known Bugs/TODOs
-----------------------------
-Scheduling is not yet implemented, though it is the next on my list.  Control4 can handle scheduling, and some have even used Google Calendar to fire off a program as well.
-Reordering programs on the fly is not yet implemented.
-You can add a zone to a program multiple times, but removing those zones from the program is a little buggy.
-The Frontend is currently very ugly and simple.  We're working on it!
-API documentation needs to be beautified a little bit
-If the app doesn't exit cleanly (By pressing Enter to quit), the GPIO's get locked, and the pi has to be rebooted. 


Development Information
------------------------
By default , the app is set up to run on the raspberry pi, but you can change it so a PC will emulate the GPIOs of a Raspberry Pi. This is useful for development work.  To run on a PC, you will need to do the following two steps:

    in PiGpio.js, comment line number 1
    in PiGpio.js, uncomment line number 2

It will then use the files in the ./gpio directory.  It won't really do anything, but won't throw errors while running.


REST API Documentation
-----------------------
Commands that can be sent using the REST API (replace the IP with your actual IP):


Create a zone:
POST http://0.0.0.0/sprinkler/zone
body:
{
	name:"Name of Zone", 
	number:1
}
-note: zone numbers will be reordered to be the last zone number in the list, regardless of the number you put here


List all Zones:
GET http://0.0.0.0/sprinkler/zone


List specific zone:
GET http://0.0.0.0/sprinkler/zone


Update Zone Name:
PUT http://0.0.0.0/sprinkler/zone
body:
{
	number:1,
	method: "Rename",
	params:
	{
		name:"New Zone Name"
	}
}


Delete a Zone:
DELETE http://0.0.0.0/sprinkler/zone/1


Manually Start a Zone
GET http://0.0.0.0/sprinkler/zone/1/start


Manually Stop a Zone
GET http://0.0.0.0/sprinkler/zone/1/stop


Stop All Zones:
GET http://0.0.0.0/sprinkler/zone/stop


Toggle a Zone On/Off
http://0.0.0.0/sprinkler/zone/toggle


Create a Program
POST http://0.0.0.0/sprinkler/program
body:
{
	name:"Name of Program"
}


List All Programs:
GET http://0.0.0.0/sprinkler/program


List Specific Program:
GET http://0.0.0.0/sprinkler/program/Program%20Name


Add a Zone to a Program:
PUT http://0.0.0.0/sprinkler/program
body:
{
	name:"Program Name",
	method: "Add Zone",
    params:
    {
    	number:1, 		//zone number
    	duration:5 		//in minutes
    }
}


Remove a Zone from a Program:
PUT http://0.0.0.0/sprinkler/program
body:
{
	name:"Program Name",
	method: "Remove Zone",
	params:
	{
		number:1		//zone number
	}
}


Update Program Name:
PUT http://0.0.0.0/sprinkler/program
body:
{
	name:"Program Name",
	method: "Rename",
	params:
	{
		name: "New Program Name"
	}
}


Delete a Program:
DELETE http://0.0.0.0/sprinkler/program/Program%20Name


Start a Program:
GET http://0.0.0.0/sprinkler/program/Program%20Name/start


Stop a Program:
GET http://0.0.0.0/sprinkler/program/Program%20Name/stop


Stop all Programs:
GET http://0.0.0.0/sprinkler/program/stop


Advance to next zone in a program:
GET http://0.0.0.0/sprinkler/program/Program%20Name/next


Advance to next zone in any program:
GET http://0.0.0.0/sprinkler/program/next