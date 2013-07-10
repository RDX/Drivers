var GPIO_PATH = "/sys/class/gpio/";
//var GPIO_PATH = "./gpio/";


var self = this;
var fs = require('fs');
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
  index = _OutExported.indexOf(pin);
  
  if (index != -1)
  {
    _OutExported.splice(index,1);
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