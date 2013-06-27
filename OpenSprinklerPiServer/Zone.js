function Zone(number, name)
{
  var self = this;
  var ShiftRegister = require('./ShiftRegister');

  this.number=number;
  this.name=name;
  this.isRunning=false;
  this.stop = stop;
  this.start = start;
  this.toggle = toggle;

  function start(duration, callback)
  {
    self.isRunning = true;
    ShiftRegister.setPinState(number - 1, true);

    if (duration)
    {
      currentTimeoutId = setTimeout(function() 
      {        
        currentTimeoutId = -1;
        if (!callback)
        {
          self.stop();
        }
        else
        {
          self.stop(callback);
        }
      }, duration * 60000);

    }
    console.log("Zone " + self.number + " is ON");
  }

  function stop(callback)
  {
    self.isRunning=false;
    ShiftRegister.setPinState(number - 1, false);

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

module.exports = Zone;