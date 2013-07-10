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


POST /sprinkler/zone

	Creates a new zone

	Parameters
	name 		string		The friendly name of the zone
	number 		int 		The physical zone number

	Status Codes
	201 		Zone was successfully created
	400			Data supplied is invalid, reason supplied in the body
	409			Zone number already exists

	Notes
	zone numbers will be reordered to be the last zone number in the list, regardless of the number you put here




GET http://0.0.0.0/sprinkler/zone

	List all Zones

	Status Codes
	200			All zones returned




GET http://0.0.0.0/sprinkler/zone

	List specific zone


	Status Codes
	200			All zones returned
	404			Zone not found, doesn't exist




PUT http://0.0.0.0/sprinkler/zone

	Update Zone

	Parameters
	number 		int
	method		"Rename"
	params
		name 	string

	Status Codes
	200			Zone renamed
	400			Data supplied is invalid, reason supplied in the body
	404			Zone not found, doesn't exist




DELETE http://0.0.0.0/sprinkler/zone/1

	Delete a Zone

	Status Codes
	200			Zone Deleted
	404			Zone not found, doesn't exist




GET http://0.0.0.0/sprinkler/zone/1/start

	Manually Start a Zone

	Status Codes
	200			Zone started
	404			Zone not found, doesn't exist




GET http://0.0.0.0/sprinkler/zone/1/stop

	Manually Stop a Zone

	Status Codes
	200			Zone Stopped
	404			Zone not found, doesn't exist




GET http://0.0.0.0/sprinkler/zone/stop

	Stop All Zones

	Status Codes
	200			All zones stopped




GET http://0.0.0.0/sprinkler/zone/1/toggle

	Toggle a Zone On/Off

	Status Codes
	200			Zone toggled
	404			Zone not found, doesn't exist




POST http://0.0.0.0/sprinkler/program

	Create a Program

	Parameters
	name 		string

	Status Codes
	201 		Program was successfully created
	400			Data supplied is invalid, reason supplied in the body
	409			Program name already exists




GET http://0.0.0.0/sprinkler/program

	List All Programs

	Status Codes
	200			All programs returned




GET http://0.0.0.0/sprinkler/program/Program%20Name

	List Specific Program

	Status Codes
	200	 		Program returned
	404 		Program name not found, doesn't exist




PUT http://0.0.0.0/sprinkler/program

	Modify a Program

	Parameters
	name 		string
	method 		"Add Zone", "Remove Zone", "Rename"
	params
	  number 	string 		Zone number to add or remove [Add zone, Remove zone]
	  duration  int 		duration the zone will run (in minutes) [Add zone]
	  name 		string		new name of program [Rename]

	Status Codes
	200 		Program sucessfully updated
	400 		Data supplied is invalid, reason supplied in the body
	404 		Program name not found, doesn't exist [All requests]
	404			Zone not found [Add zone, Remove zone]
	409			Program name already exists


DELETE http://0.0.0.0/sprinkler/program/Program%20Name

	Delete a Program

	Status Codes
	200 		Program deleted
	404			Program not found, Doesn't exist




GET http://0.0.0.0/sprinkler/program/Program%20Name/start

	Start a Program

	Status Codes
	200 		Program started
	404			Program not found, Doesn't exist




GET http://0.0.0.0/sprinkler/program/Program%20Name/stop

	Stop a Program

	Status Codes
	200 		Program stopped
	404			Program not found, Doesn't exist




GET http://0.0.0.0/sprinkler/program/stop

	Stop all Programs

	Status Codes
	200 		All programs stopped




GET http://0.0.0.0/sprinkler/program/Program%20Name/next

	Advance to next zone in a program

	Status Codes
	200 		OK




GET http://0.0.0.0/sprinkler/program/next

	Advance to next zone in any program

	Status Codes
	200 		OK