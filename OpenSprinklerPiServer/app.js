  var GPIO_PATH = "/sys/class/gpio/";
  //var GPIO_PATH = "./gpio/";

var zones = new Array();
var programs = new Array();
var currentTimeoutId = -1;
var gpio = new ShiftRegister(zones.length);
var fs = require('fs');
var sys = require("sys");
var restify = require('restify');
var server = restify.createServer();
var listenPort //default port

server.use(restify.bodyParser());
server.use(restify.jsonp());
server.use(restify.CORS());
server.use(restify.fullResponse());

loadConfig();
server.listen(listenPort, function() {console.log('%s listening at %s', server.name, server.url);});
gpio.startup();

var stdin = process.openStdin();
console.log("Press Enter to quit");
stdin.addListener("data", function(d){process.exit();});


process.on('exit', function() 
{
  gpio.cleanup();  
  saveConfig();
  console.log('Exit');
});


function loadConfig()
{
  var data = fs.readFileSync('./config.json');
  var temp;

  try
  {
    temp = JSON.parse(data);
    listenPort = temp.port || 8080;
    temp.zones.forEach(function(someElement, someIndex, someArray)
    {
      zones[someIndex] = new Zone(someElement.number, someElement.name);
    });

    temp.programs.forEach(function(someElement, someIndex, someArray)
    {
      programs[someIndex] = new Program(someElement.name, someElement.zones);
    });
  }
  catch (err)
  {
    console.log('Error parsing config.')

    // Set up a default config with 8 zones
    zones = new Array();
    programs = new Array ();

    for (var i=0; i<8; i++)
    {
      zones[0] = new Zone(i+1, "Zone " + i+1);
    }
  }
}

function saveConfig()
{
  console.log("Saving config...");
  fs.writeFileSync(
    "config.json", 
    JSON.stringify({port: listenPort, zones:zones, programs:programs }, null ,2), 
    null, function(err) {
      if(err)
      {
        console.log("Error saving config: " + err);
      }
  });
  console.log("Done!");
}


server.post('/sprinkler/zone', function createZone(req,res,next)
{
  var body;

  try
  {
    body = JSON.parse(req.body);
  }
  catch(err)
  {
    body = req.body;
  }

  try
  {
    // Make sure they sent the right data
    if (!body.number || !body.name)
    {
      throw new Error('Bad data');
    }

    if (body.number < 1 || body.number > 32)
    {
      throw new Error('Zone number is out of range');
    }

    // Check to see if zone already exists
    for (var i=0; i<zones.length; i++)
    {
      if (zones[i].number == body.number)
      {
        throw new Error('Zone already exists');
      }
    }

    // Add the new zone
    console.log("Adding zone :" + body.name);
    zones[zones.length] = new Zone(body.number, body.name);

    // Sort the zones
    zones.sort(function(a,b) { return a.number-b.number; });

    // Renumber the zones
    for (var i=0; i<zones.length; i++)
    {
      zones[i].number = i + 1;
    }

    // Done!
    res.send(200, {zones:zones});
  }  
  catch(err)
  {
    console.log("error: " + err);
    res.send(500, err);
  }

  next();
});


server.get('/sprinkler/zone', function ReadZones(req,res,next)
{
  res.send(200, {zones:zones});
  next();
});


server.get('/sprinkler/zone/:zoneNumber', function readZone(req,res,next)
{
  try
  {
    var foundIt = false;

    for (var i=0; i<zones.length; i++)
    {
      if(zones[i].number == req.params.zoneNumber)
      {
        foundIt = true;
        res.send(200, {zone:zones[i]});
      }
    }

    if (!foundIt)
    {
      throw new Error('Zone doesnt exist');
    }
  }
  catch(err)
  {
    console.log("error: " + err);
    res.send(500, err);
  }

  next();
});


server.put('/sprinkler/zone', function updateZone(req,res,next)
{
  var body;

  try
  {
    body = JSON.parse(req.body);
  }
  catch(err)
  {
    body = req.body;
  }

  try
  {
    if (!body.name || !body.number)
    {
      throw new Error('bad data');
    }

    var foundIt = false;

    for (var i=0; i<zones.length; i++)
    {
      if (zones[i].number == body.number)
      {
        foundIt = true;
        console.log("zone number " + body.number +"'s name is now '" + body.name + "'");
        zones[i].name = body.name;
        res.send(200, {zone:zones[i]});
      }
    }
 
    if (!foundIt)
    {
      throw new Error('Zone doesnt exist');
    }
  }
  catch(err)
  {
    console.log("error: " + err);
    res.send(500, err);
  }

  next();
});


server.del('/sprinkler/zone/:zoneNumber', function deleteZone(req,res,next)
{
  var foundIt = false;
  var number = req.params.zoneNumber
  try
  {
    console.log("deleting zone " + number);

    for (var i=0; i<zones.length; i++)
    {
      if (zones[i].number == number)
      {
        /* TODO: When removing a zone, the programs need to be updated
                for (var j=0; j<programs.length; j++)
                {
                  var program = programs[j];
                  for (var k=0; k<program.zones.length; k++)
                  {
                    var zone = program.zones[k];
                    if (zone.number == number)
                    {
                      program.zones.splice(k,1);
                    }
                  }
                }
        */
        zones.splice(i,1);
        foundIt = true;

        // adjust the zone numbers
        for (var j=0; j<zones.length; j++)
        {
          zones[j].number = j+1;
        }

        res.send(200, {zones: zones});
      }
    }

    if (!foundIt)
    {
      throw new Error('zone doesnt exist');
    }
  }
  catch(err)
  {
    console.log("error: " + err);
    res.send(500,err);
  }

  next();
});


server.get('/sprinkler/zone/:zoneNumber/:action', function startZoneGet(req,res,next)
{
  var number = req.params.zoneNumber;
  var action = req.params.action;
  
  try
  {
    var foundIt = false;

    for (var i=0; i<zones.length; i++)
    {
      if (zones[i].number == number)
      {
        foundIt = true;

        if (action == "start")
        {
          zones[i].start();
        }
        else if (action == "stop")
        {
          zones[i].stop();
        }
        else if (action == "toggle")
        {
          zones[i].toggle();
        }
        else
        {
          throw new Error('bad action');
        }

        res.send(200, {zone:zones[i]});
      }
    }

    if (!foundIt)
    {
      throw new Error('zone doesnt exist');
    }
  }
  catch(err)
  {
    console.log("error: " + err);
    res.send(500, err);
  }

  next();
});


server.post('/sprinkler/program', function createProgram(req,res,next)
{
  var body;

  try
  {
    body = JSON.parse(req.body);
  }
  catch(err)
  {
    body = req.body;
  }

  try
  {
    // Make sure they sent the right data
    if (!body.name)
    {
      throw new Error('bad data');
    }

    // Check to see if zone already exists
    for (var i=0; i<programs.length; i++)
    {
      if (programs[i].name == body.name)
      {
        throw new Error('Program name already exists');
      }
    }

    programs[programs.length] = new Program(body.name);
    console.log("Added new Program, '" + body.name + "'");
    res.send(200, {programs:programs});
  }
  catch(err)
  {
    console.log("error: " + err);
    res.send(500, err);
  }

  next();
});


server.get('/sprinkler/program', function readPrograms(req,res,next)
{
  res.send(200, {programs:programs});
  next();
});


server.get('/sprinkler/program/:programName', function readProgram(req,res,next)
{
  try
  {
    var foundIt = false;

    for (var i=0; i<programs.length; i++)
    {
      if (programs[i].name == req.params.programName)
      {
        foundIt = true;
        res.send(200, {program:programs[i]});
      }
    }

    if (!foundIt)
    {
      throw new Error('Program name doesnt exist');
    }
  }
  catch(err)
  {
    console.log("error: " + err);
    res.send(500, err);
  }

  next();
});

server.get('/sprinkler/program/:programName/:action', function updateZoneGet(req,res,next)
{
  var foundIt = false;

  for (var i=0; i<programs.length; i++)
  {
    if (programs[i].name == req.params.programName)
    {
      if (req.params.action == "start") { programs[i].start(); }
      else if (req.params.action == "stop") { programs[i].stop(); }
      else if (req.params.action == "next") { programs[i].next(); }
      foundIt = true;
      res.send(200);
    }
  }

  if (!foundIt)
  {
    res.send(500); 
  }

  next();
});

server.put('/sprinkler/program', function updateProgram(req,res,next)
{
  var body;

  try
  {
    body = JSON.parse(req.body);
  }
  catch(err)
  {
    body = req.body;
  }

  console.log(body);

  try
  {
    if (!body.name || !body.method)
    {
      throw new Error('Bad Data 1');
    }

    var program;    
    var foundIt = false;

    for (var i=0; i<programs.length; i++)
    {
      if (programs[i].name == body.name)
      {
        foundIt = true;
        program = programs[i];
      }
    }

    if (!foundIt)
    {
      throw new Error('program doesnt exist');
    }


    if (body.method == "Add Zone")
    {
      if(!body.params)
      {
        throw new Error('Bad data 2');
      }

      var params = body.params;
      if (!params.number || !params.duration)
      {
        throw new Error('Bad Data 3');
      }

      var canAdd = false;

      for (var i=0; i<zones.length; i++)
      {
        if (zones[i].number == params.number)
        {
          canAdd=true;
          console.log("Adding zone " + params.number + " to program");
          program.zones[program.zones.length] = {number:params.number,duration:params.duration};
        }
      }

      if(!canAdd)
      {
        throw new Error('Zone doesnt exist');
      }
    }

    else if (body.method == "Remove Zone")
    {
      var params = body.params;
      var foundZone=false;

      if (!params.number)
      {
        throw new Error('Bad Data 3');
      }

      for (var i=0; i<program.zones.length; i++)
      {
        if (program.zones[i].number == params.number)
        {
          foundZone = true;
          console.log("removing zone " + params.number + " from program");
          program.zones.splice(i,1);
        }
      }
      
      if (!foundZone)
      {
        throw new Error('Zone doesnt exist');
      }     
    }

    else if (body.method == "Rename")
    {
      var params = body.params;
      var canRename = true;

      for (var i=0; i<programs.length; i++)
      {
        if (programs[i].name == params.name)
        {
          throw new Error('Program name already exists');
        }
      }
   
      console.log("program " +  program.name + "'s name is now '" + params.name + "'");
      program.name = params.name;
    }

    res.send(200, {program: program});
  }
  catch(err)
  {
    console.log(err);
    res.send(500,err);
  }

  next();
});


server.del('/sprinkler/program/:programName', function deleteProgram(req,res,next)
{
  var foundIt = false;
  var name = req.params.programName;

  try
  {
    console.log("deleting program " + name);

    for (var i=0; i<programs.length; i++)
    {
      if (programs[i].name == name)
      {
        foundIt = true;
        programs.splice(i,1);

        res.send(200, {programs: programs});
      }
    }
   
    if (!foundIt)
    {
      throw new Error('program doesnt exist');
    }
  }
  catch(err)
  {
    console.log("error: " + err);
    res.send(500,err);
  }
  next();
});


server.get(/\/?.*/, restify.serveStatic(
{
  // blah
  directory: './www'
}));


function Zone(number, name)
{
  var self = this;

  this.number=number;
  this.name=name;
  this.isRunning=false;
  this.stop = stop;
  this.start = start;
  this.toggle = toggle;

  function start(duration, callback)
  {
    self.isRunning = true;
    gpio.setPinState(number - 1, true);

    if (duration)
    {
      currentTimeoutId = setTimeout(function() 
      {
        currentTimeoutId = -1;
        if (!callback)
        {
          zones[number-1].stop();
        }
        else
        {
          zones[number-1].stop(callback);
        }
      }, duration * 60000);
    }
    console.log("Zone " + self.number + " is ON");
  }

  function stop(callback)
  {
    self.isRunning=false;
    gpio.setPinState(number - 1, false);

    console.log("Zone " + self.number + " is OFF");
    if (callback)
    {
      callback();
    }
  }

  function toggle(duration)
  {
    if (self.isRunning)
    {
      self.stop();
    }
    else
    {
      if (arguments.length == 1)
      {
        self.start(duration);
      }
      else
      {
        self.start();
      }
    }
  }
}


function Program (_name, _zones)
{
  var self = this;
 
  var pZones = new Array();

  if (_zones)
  {
    pZones = _zones;
  }


  var index = -1;

  this.name = _name;
  this.zones = pZones;
  this.isRunning = false;


  this.start = start;
  this.stop = stop;
  this.next = next;
  this.add = add;
  this.removeOnce = removeOnce;
  this.removeAt = removeAt;
  this.remove = remove;
  this.clear = clear;

  function start()
  {
    var canStart = true;
    
    for (var i=0; i<programs.length; i++)
    {
      if (programs[i].isRunning)
      {
        canStart = false;
      }
    }
    
    if (canStart)
    {
      console.log("starting program '" + self.name + "'");
      self.isRunning = true;
      startHelper();
    }
    else
    {
      console.log("A program is already running");
    }
  }

  function startHelper()
  {
    index++;
    if (index < pZones.length)
    {
      if (self.isRunning)
      {
        zones[pZones[index].number - 1].start(pZones[index].duration, startHelper);
      }
    }
    else
    {
      self.stop();
    }
  }

  function stop()
  {
    if (self.isRunning)
    {
      index = -1;
      self.isRunning=false;
      console.log("stopping program '" + self.name + "'");  
      
      if (currentTimeoutId != -1)
      {
        clearTimeout(currentTimeoutId);
        currentTimeoutId = -1;
      }
      for (var i=0; i<pZones.length; i++)
      {
        if (zones[pZones[i].number - 1].isRunning == true)
        {
          zones[pZones[i].number - 1].stop();
        }
      }
    }
  }

  function next()
  {
    if (self.isRunning)
    {
      console.log("advancing to next zone on program '" + self.name + "'");

      if (currentTimeoutId != -1)
      {
        clearTimeout(currentTimeoutId);
        currentTimeoutId = -1;
      }
    
      zones[pZones[index].number - 1].stop();
      startHelper();
    }
  }

  function add(number, duration, order)
  {
    if (!order)
    {
      pZones[pZones.length] = { number: number, duration: duration }
    }
    else
    {
      pZones.splice(order,0, { number: number, duration: duration });
    }
  }

  /// removes first instance of a zone with specified number
  function removeOnce(number)
  {
    for (var i=0; i<pZones.length; i++)
    {
      if (pZones[i].number == number)
      {
        pZones.splice(i,1);
        return;
      }
    }
  }

  /// removes all instances of a zone with specified number
  function remove(number)
  {
    for (var i=0; i<pZones.length; i++)
    {
      if (pZones[i].number == number)
      {
        pZones.splice(i,1);
      }
    }
  }

  /// removes zone at specified index
  function removeAt(index)
  {
    pZones.splice(index,1);
  }

  /// removes all zones from program
  function clear()
  {
    pZones = new Array();
  }
}


function PiGpio()
{
  var self = this;
  var _OutExported = new Array();

  this.SetupPin = SetupPin;
  this.OutputPin = OutputPin;
  this.UnexportPin = UnexportPin;
  this.CleanUpAllPins = CleanUpAllPins;

  function SetupPin(pin, direction)
  {
    //console.log("blah: " + _OutExported.indexOf(pin));
    if (_OutExported.indexOf(pin) != -1 )
    {
      UnexportPin(pin);
    }

    fs.writeFileSync(GPIO_PATH + "export", pin);
    fs.writeFileSync(GPIO_PATH + "gpio" + pin + "/direction", direction);

    if (direction == "out")
    {
      _OutExported.push(pin);
    }
  }  

  function OutputPin(pin, value)
  {
    if (_OutExported.indexOf(pin) == -1)
      SetupPin(pin, "out");

    var writeValue = "0";
    if (value == true)
    {
      writeValue = "1";
    }

    fs.writeFileSync(GPIO_PATH + "gpio" + pin + "/value", writeValue);
  }

  function UnexportPin(pin)
  {
    if (_OutExported.indexOf(pin) != -1)
    {
      fs.writeFileSync(GPIO_PATH + "unexport", pin);
    }
  }

  function CleanUpAllPins()
  {
    for (var i=_OutExported.length - 1; i>=0; i--)
    {
      UnexportPin(_OutExported[i]);
    }
  }
}


function ShiftRegister (_pincount)
{
  var self = this;
  var gpio = new PiGpio();
  var pinstates = new Array();
  var pincount = _pincount;

  this.startup = startup;
  this.cleanup = cleanup;
  this.setPinState = setPinState;

  function startup()
  {
    gpio.OutputPin(4,false);
    gpio.OutputPin(17,false);
    gpio.OutputPin(21,false);
    gpio.OutputPin(22,false);

    for (var i=0; i<pincount; i++)
    {
      pinstates[i] = false;
    }

    // not really sure why i need to do this,
    // but it wont work unless i do...
    gpio.OutputPin(17,true);
    setTimeout(function()
    {
      gpio.OutputPin(17, false);
    }, 500);

  }

  function cleanup()
  {
    gpio.CleanUpAllPins();
  }

  function setPinState(number, value)
  {
    if (number < 0 || number > pincount)
    {
      return; // TODO: error
    }
    else
    {
      pinstates[number] = value;
      
      gpio.OutputPin(4,false);
      gpio.OutputPin(22,false);

      for (var i=0; i<pincount; i++)
      {
        gpio.OutputPin(4,false);
        gpio.OutputPin(21, pinstates[pincount-1-i]);
        gpio.OutputPin(4,true)

        //        console.log(pinstates[pincount-1-i]);
      }

      gpio.OutputPin(22,true);
    }
  }
}