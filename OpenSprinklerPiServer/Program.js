function Program (_gZones, _name, _zones)
{
  var self = this;
  var currentTimeoutId = -1;
  var pZones = new Array();
  var zones = _gZones;

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
    console.log("starting program '" + self.name + "'");  
    self.isRunning = true;
      startHelper();
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

module.exports = Program;