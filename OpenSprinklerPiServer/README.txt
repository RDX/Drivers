Run "npm install" in this directory to install all the dependencies (currently only restify).

You can access the web based frontend by browsing to http://<IP>:<PORT>/index.html

By default , the app is set up to run on the raspberry pi, but you can change it so a PC will emulate the GPIOs of a Raspberry Pi. This is useful for development work.  To run on a PC, you will need to do the following two steps:

in app.js, comment line number 1
in app.js, uncomment line number 2

It will then use the files in the ./gpio directory.  It won't really do anything, but won't throw errors while running.

http://blog.rueedlinger.ch/2013/03/raspberry-pi-and-nodejs-basic-setup/
^Here is a decent guide that shows how to install node.js on the raspberry pi.  





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
	name:"New Name"
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