var zones = new Array();
var programs = new Array();
var schedules = new Array();

var Zone = require('./Zone');
var Program = require('./Program');
var Schedule = require('node-schedule');

var fs = require('fs');
var sys = require("sys");
var restify = require('restify');
var server = restify.createServer();
var listenPort; //default port
var ShiftRegister = require('./ShiftRegister');
var Errors = require('./Errors');

server.use(restify.bodyParser());
server.use(restify.jsonp());
server.use(restify.CORS());
server.use(restify.fullResponse());

loadConfig();
server.listen(listenPort, function() {console.log('%s listening at %s', server.name, server.url);});
ShiftRegister.startup();

var stdin = process.openStdin();
console.log("Press Enter to quit without saving");
console.log("Press CTRL+C to quit and save");
stdin.addListener("data", function(d){process.exit();});


process.on('SIGINT', function()  // CTRL+C
{
  ShiftRegister.cleanup();  
  saveConfig();
  console.log('Exit');
});

process.on('SIGTERM', function() // service stopped
{
  ShiftRegister.cleanup();  
  saveConfig();
  console.log('Exit');
});

process.on('exit', function() 
{
  ShiftRegister.cleanup();  
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
      programs[someIndex] = new Program(zones, someElement.name, someElement.zones);
    });
  }
  catch (err)
  {
    console.log('Error parsing config: ' + err);

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
      throw new Errors.BadRequest('This request requires a number and a name element');
    }

    if (body.number < 1 || body.number > 32)
    {
      throw new Errors.BadRequest('Zone number is out of range');
    }

    // Check to see if zone already exists
    for (var i=0; i<zones.length; i++)
    {
      if (zones[i].number == body.number)
      {
        throw new Errors.Conflict('Zone number already exists');
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
    res.send(201, {zones:zones});
  }  
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode, {message:err.message});
  }

  next();
});


server.get('/sprinkler/zone', function ReadZones(req,res,next)
{
  res.send(200, {zones:zones});
  next();
});


server.get('/sprinkler/zone/stop', function startZoneGet(req,res,next)
{
  for (var i=0; i<zones.length; i++)
  {
    if (zones[i].isRunning) { zones[i].stop(); }
  }
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
      throw new Errors.NotFound('Zone doesnt exist');
    }
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode, {message:err.message});
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
    if (body.method == "Rename")
    {
      if (!body.number || !body.method)
      {
        throw new Errors.BadRequest('This request requires a number and a method element');
      }

      var zone;    
      var foundIt = false;

      for (var i=0; i<zones.length; i++)
      {
        if (zones[i].number == body.number)
        {
          foundIt = true;
          zone = zones[i];
        }
      }

      if (!foundIt)
      {
        throw new Errors.NotFound('Zone doesnt exist');
      }

      var params = body.params;
   
      console.log("zone number " + body.number +"'s name is now '" + params.name + "'");
      zone.name = params.name;
      res.send(200, {zone:zones[i]});
    }
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode, {message:err.message});
  }

  next();
});


server.del('/sprinkler/zone/:zoneNumber', function deleteZone(req,res,next)
{

  // It's Looptacular!
  var foundIt = false;
  var number = req.params.zoneNumber
  try
  {
    console.log("deleting zone " + number);

    for (var i=0; i<zones.length; i++)
    {
      if (zones[i].number == number)
      {
        // Remove the zone from any programs that use it
        for (var j=0; j<programs.length; j++)
        {
          for (var k=0; k<programs[j].zones.length; k++)
          {
            if (programs[j].zones[k].number == number)
            {
              programs[j].zones.splice(k,1);
            }
          }
        }
        zones.splice(i,1);
        foundIt = true;


        // adjust the zone numbers
        for (var j=0; j<zones.length; j++)
        {
          var zone = zones[j];
          

          for (var k=0; k<programs.length; k++)
          {
            for (var l=0; l<programs[k].zones.length; l++)
            {
                if (programs[k].zones[l].number  == zone.number)
                {
                  programs[k].zones[l].number = j+1;
                }
            }
          }

          zones[j].number = j+1;
        }

        res.send(200, {zones: zones});
      }
    }

    if (!foundIt)
    {
      throw new Errors.NotFound('Zone doesnt exist');
    }
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode, {message:err.message});
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
          throw new Errors.BadRequest('Requested action does not exist');
        }

        res.send(200, {zone:zones[i]});
      }
    }

    if (!foundIt)
    {
      throw new Errors.NotFound('Zone doesnt exist');
    }
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode, {message:err.message});
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
      throw new Errors.BadRequest('This request requires a name element');
    }

    // Check to see if zone already exists
    for (var i=0; i<programs.length; i++)
    {
      if (programs[i].name == body.name)
      {
        throw new Errors.Conflict('Zone number already exists');
      }
    }

    programs[programs.length] = new Program(zones, body.name);
    console.log("Added new Program, '" + body.name + "'");
    res.send(200, {programs:programs});
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode || 500, {message:err.message});
  }

  next();
});


server.get('/sprinkler/program', function readPrograms(req,res,next)
{
  res.send(200, {programs:programs});
  next();
});


server.get('/sprinkler/program/stop', function updateZoneGet(req,res,next)
{
  for (var i=0; i<programs.length; i++)
  {
    if (programs[i].isRunning) { programs[i].stop(); }
  }

  res.send(200);
  next();
});

server.get('/sprinkler/program/next', function updateZoneGet(req,res,next)
{
  for (var i=0; i<programs.length; i++)
  {
    if (programs[i].isRunning) { programs[i].next(); }
  }

  res.send(200);
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
      throw new Errors.NotFound('Program doesnt exist');
    }
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode || 500, {message:err.message});
  }

  next();
});


server.get('/sprinkler/program/:programName/:action', function updateZoneGet(req,res,next)
{
  try
  {
    var foundIt = false;

    for (var i=0; i<programs.length; i++)
    {
      if (programs[i].name == req.params.programName)
      {
        foundIt = true;
        if (req.params.action == "start") { programs[i].start(); }
        else if (req.params.action == "stop") { programs[i].stop(); }
        else if (req.params.action == "next") { programs[i].next(); }
        else { throw new Errors.BadRequest('Requested action does not exist'); }
      }
    }

    if (!foundIt)
    {
      throw new Errors.NotFound('Program doesnt exist');
    }

    res.send(200);
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode || 500, {message:err.message});
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

  try
  {
    if (!body.name || !body.method)
    {
      throw new Errors.BadRequest('This request requires a name and method element');
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
      throw new Errors.NotFound('Program doesnt exist');
    }


    if (body.method == "Add Zone")
    {
      if(!body.params)
      {
        throw new Errors.BadRequest('This request requires a params element');
      }

      var params = body.params;
      if (!params.number || !params.duration)
      {
        throw new Errors.BadRequest('This request requires a number and duration element in params');
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
        throw new Errors.NotFound('Zone doesnt exist');
      }
    }

    else if (body.method == "Remove Zone")
    {
      var params = body.params;
      var foundZone=false;

      if (!params.number)
      {
        throw new Errors.BadRequest('This request requires a number element in params');
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
        throw new Errors.NotFound('Zone doesnt exist');
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
          throw new Errors.Conflict('Program name already exists');
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
    res.send(err.StatusCode || 500, {message:err.message});
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
      throw new Errors.NotFound('Program doesnt exist');
    }
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode || 500, {message:err.message});
  }

  next();
});


server.post('/sprinkler/schedule', function createSchedule(req,res,next)
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
      throw new Errors.BadRequest('This request requires a name element');
    }

    // Check to see if schedule already exists
    for (var i=0; i<schedules.length; i++)
    {
      if (schedules[i].name == body.name)
      {
        throw new Errors.Conflict('Schedule name already exists');
      }
    }

    // Add the new schedule
    console.log("Adding schedule: " + body.name);
    schedules[schedules.length] = { name:body.name, program:null, job:null };

    // Done!
    res.send(201, {schedules:schedules});
  }  
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode, {message:err.message});
  }

  next();
});


server.get('/sprinkler/schedule', function readSchedules(req,res,next)
{
  res.send(200, {schedules:schedules});
  next();
});


server.get('/sprinkler/schedule/:scheduleName', function readSchedule(req,res,next)
{
  try
  {
    var foundIt = false;

    for (var i=0; i<schedules.length; i++)
    {
      if (schedules[i].name == req.params.scheduleName)
      {
        foundIt = true;
        res.send(200, {schedule:schedules[i]});
      }
    }

    if (!foundIt)
    {
      throw new Errors.NotFound('Schedule doesnt exist');
    }
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode || 500, {message:err.message});
  }

  next();
});


server.put('/sprinkler/schedule', function updateSchedule(req,res,next)
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
    if (!body.name || !body.method)
    {
      throw new Errors.BadRequest('This request requires a name and method element');
    }

    var schedule;    
    var foundIt = false;

    for (var i=0; i<schedules.length; i++)
    {
      if (schedules[i].name == body.name)
      {
        foundIt = true;
        schedule = schedules[i];
      }
    }

    if (!foundIt)
    {
      throw new Errors.NotFound('Schedule doesnt exist');
    }

    if (body.method == "Add Zone")
    {
    }

    else if (body.method == "Update Program")
    {   
      var params = body.params;
      var updated = false;

      console.log(body);

      for (var i=0; i<programs.length; i++)
      {
        if (programs[i].name == params.name)
        {
          schedule.program = params.name;
          console.log("updated schedule to execute program " + programs[i].name);
          updated = true;
        }
      }

      if (!updated)
      {
        throw new Errors.NotFound('Program name doesn\'t exist')
      }
    }

    else if (body.method == "Rename")
    {
      var params = body.params;
      var canRename = true;

      for (var i=0; i<schedules.length; i++)
      {
        if (schedules[i].name == params.name)
        {
          throw new Errors.Conflict('Schedule name already exists');
        }
      }
   
      console.log("schedule " +  schedule.name + "'s name is now '" + params.name + "'");
      schedule.name = params.name;
    }

    res.send(200, {schedule: schedule});
  }
  catch(err)
  {
    console.log(err);
    res.send(err.StatusCode || 500, {message:err.message});
  }

  next();
});


server.get(/\/?.*/, restify.serveStatic(
{
  // blah
  directory: './www'
}));