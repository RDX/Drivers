var self = this;
var PiGpio = require('./PiGpio');

var pinstates = new Array();
var pincount = 8;

this.startup = startup;
this.cleanup = cleanup;
this.setPinState = setPinState;

function startup()
{
  PiGpio.OutputPin(4,false);
  PiGpio.OutputPin(17,false);
  PiGpio.OutputPin(21,false);
  PiGpio.OutputPin(22,false);

  for (var i=0; i<pincount; i++)
  {
    pinstates[i] = false;
  }

  // not really sure why i need to do this,
  // but it wont work unless i do...
  PiGpio.OutputPin(17,true);
  setTimeout(function()
  {
    PiGpio.OutputPin(17, false);
  }, 500);

}

function cleanup()
{
  PiGpio.CleanUpAllPins();
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
    
    PiGpio.OutputPin(4,false);
    PiGpio.OutputPin(22,false);

    for (var i=0; i<pincount; i++)
    {
      PiGpio.OutputPin(4,false);
      PiGpio.OutputPin(21, pinstates[pincount-1-i]);
      PiGpio.OutputPin(4,true)

      //        console.log(pinstates[pincount-1-i]);
    }

    PiGpio.OutputPin(22,true);
  }
}