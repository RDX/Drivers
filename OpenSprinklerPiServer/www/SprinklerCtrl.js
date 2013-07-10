angular.module('sprinkler', ['ui.bootstrap']);

function SprinklerCtrl ($scope, $http, $templateCache)
{
  $scope.CreateZone = function(number,name)
  {
    var myData;

    if (name && number)
    {
      myData = JSON.stringify({number:number,name:name});
    }
    else if (number)
    {
      myData = JSON.stringify({number:number,name:"Zone " + number});
    }
    else if (name)
    {
      myData = JSON.stringify({number:$scope.zones.length + 1,name:name});
    }
    else
    {
      myData = JSON.stringify({number:$scope.zones.length + 1, name:"Zone " + number});
    }
          
    $http.post($scope.myUrl + 'zone', myData ).
      success(function(data)
      {
        $scope.ReadZones();
      }).
      error(function(data, status, headers, config)
      {
      });
  }


  $scope.ReadZones = function(data)
  {
    if (!data)
    {
      $http.get($scope.myUrl + 'zone').
        success(function(data)
        {
          $scope.zones = data.zones;
        }).
        error(function(data, status, headers, config) 
        {
          $scope.zones = data.zones || "Request failed";
          $scope.status = status;
        });
    }
    else
    {
      console.log(data);

      if (data.zones)
      {
        $scope.zones = data.zones;
      }
      else if (data.zone)
      {
        $scope.zones[data.zone.number-1] = data.zone;
      }
    }
  }


  $scope.UpdateZone = function(zone, method, params)
  {
    $http.put($scope.myUrl + 'zone', JSON.stringify({number:zone.number, method:method, params:params})).
      success(function(data)
      {
        $scope.ReadZones();
      }).
      error(function(data, status, headers, config) 
      {
      });
  }


  $scope.UpdateZoneName = function(oldZone, newName)
  {
    //helper
    $scope.UpdateZone(oldZone, "Rename", {name:newName});
  }


  $scope.DeleteZone = function(zone)
  {
    $http.delete($scope.myUrl + 'zone/' + zone.number).
      success(function(data)
      {
        $scope.ReadZones();
        $scope.ReadPrograms();
      }).
      error(function(data, status, headers, config)
      {
      });
  }


  $scope.StartZone = function(zone)
  {
    $http.get($scope.myUrl + 'zone/' + zone.number + '/start' ).
      success(function(data)
      {
        $scope.ReadZones();
      }).
      error(function(data, status, headers, config) 
      {
      });
  }


  $scope.StopZone = function(zone)
  {
    $http.get($scope.myUrl + 'zone/' + zone.number + '/stop').
      success(function(data)
      {
        $scope.ReadZones();
      }).
      error(function(data, status, headers, config) 
      {
      });
  }

  $scope.ToggleZone = function(zone)
  {
    $http.get($scope.myUrl + 'zone/' + zone.number + '/toggle').
      success(function(data)
      {
        $scope.ReadZones();
      }).
      error(function(data, status, headers, config)
      {
      });
  }


  $scope.CreateProgram = function(name)
  {
    var myData;

    if (name)
    {
      myData = name
    }
    else
    {
      myData = "Program " + ($scope.programs.length + 1);
    }

    $http.post($scope.myUrl + 'program', JSON.stringify({name:myData})).
    success(function(data)
    {
      $scope.ReadPrograms(function() {$scope.openProgramEditor(name);});
      
    }).
    error(function(data, status, headers, config)
    {
    });
  }

  $scope.ReadPrograms = function(callback)
  {
    $http.get($scope.myUrl + 'program').
      success(function(data)
      {
        $scope.programs = data.programs;
        if(callback)
        {
          callback();
        }
      }).
      error(function(data, status, headers, config) 
      {
        $scope.programs = data.programs || "Request failed";
        $scope.status = status;
        if(callback)
        {
          callback();
        }
      });
  }


  $scope.UpdateProgram = function(program, method, params)
  {
    $http.put($scope.myUrl + 'program', JSON.stringify({name:program.name, method:method, params:params}) ).
    success(function(data)
    {
      $scope.ReadPrograms();
    }).
    error(function(data, status, headers, config) 
    {
    });
  }


  $scope.UpdateProgramName = function(oldProgram, newName)
  {
    //helper
    $scope.UpdateProgram(oldProgram, "Rename", {name:newName});
  }


  $scope.UpdateProgramAddZone = function(program, number, duration)
  {
    // helper
    $scope.UpdateProgram(program, "Add Zone", {number:number,duration:duration});
  }


  $scope.UpdateProgramRemoveZone = function(program, number)
  {
    //helper
    $scope.UpdateProgram(program, "Remove Zone", {number:number});
  }


  $scope.DeleteProgram = function(program)
  {
    $http.delete($scope.myUrl + 'program/' + program.name).
    success(function(data)
    {
      $scope.ReadPrograms();
    }).
    error(function(data, status, headers, config)
    {
    });
  }


  $scope.StartProgram = function(program)
  {
    $http.get($scope.myUrl + 'program/' + program.name + '/start').
    success(function(data)
    {
      $scope.ReadPrograms();
      $scope.ReadZones();
    }).
    error(function(data, status, headers, config) 
    {
    });
  }


  $scope.ProgramNext = function(program)
  {
    $http.get($scope.myUrl + 'program/' + program.name + '/next').
    success(function(data)
    {
      $scope.ReadPrograms();
      $scope.ReadZones();
    }).
    error(function(data, status, headers, config) 
    {
    });
  }


  $scope.StopProgram = function(program)
  {
    $http.get($scope.myUrl + 'program/' + program.name + '/stop').
    success(function(data)
    {
      $scope.ReadPrograms();
      $scope.ReadZones();
    }).
    error(function(data, status, headers, config)
    {
    });
  }


  $scope.ToggleProgram = function(program)
  {
    $http.get($scope.myUrl + 'program/' + program.name + '/toggle').
    success(function(data)
    {
      $scope.ReadPrograms();
      $scope.ReadZones();
    }).
    error(function(data, status, headers, config)
    {
    });
  }


  $scope.CreateSchedule = function(name)
  {
    var myData;

    if (name)
    {
      myData = name
    }
    else
    {
      myData = "Schedule " + ($scope.schedules.length + 1);
    }

    console.log(myData);
    
    $http.post($scope.myUrl + 'schedule', JSON.stringify({name:myData})).
    success(function(data)
    {
      $scope.ReadSchedules();
    }).
    error(function(data, status, headers, config)
    {
    });
  }


  $scope.ReadSchedules = function()
  {
    $http.get($scope.myUrl + 'schedule').
      success(function(data)
      {
        $scope.schedules = data.schedules;
      }).
      error(function(data, status, headers, config) 
      {
        $scope.schedules = data.schedules || "Request failed";
        $scope.status = status;
      });
  }


  $scope.UpdateSchedule = function(schedule, method, params)
  {
    $http.put($scope.myUrl + 'schedule', JSON.stringify({name:schedule.name, method:method, params:params}) ).
    success(function(data)
    {
      $scope.ReadSchedules();
    }).
    error(function(data, status, headers, config) 
    {
    });
  }


  $scope.UpdateScheduleName = function(oldSchedule, newName)
  {
    //helper
    $scope.UpdateSchedule(oldSchedule, "Rename", {name:newName});
  }


  $scope.UpdateScheduleProgram = function(oldSchedule, newProgramName)
  {
    //helper
    $scope.UpdateSchedule(oldSchedule, "Update Program", {name:newProgramName});
  }







  $scope.openProgramEditor = function(programName)
  {
    $scope.ProgramToEdit = -1;

    for (var i=0; i<$scope.programs.length; i++)
    {
      if ($scope.programs[i].name == programName)
      {
        $scope.ProgramToEdit = i;
      }
    }
    $scope.ProgramEditorIsOpen = true;
  };
  $scope.closeProgramEditor = function()
  {
    $scope.ProgramToEdit = null;
    $scope.ProgramEditorIsOpen = false; 
  };
  $scope.ProgramEditorOptions = 
  {
    backdropFade: true, 
    dialogFade: true
  };


  $scope.openZoneEditor = function()
  {
    $scope.ZoneEditorIsOpen = true;
  };

  $scope.closeZoneEditor = function(something)
  {     
    if(something)
    {
      console.log("BLAH!");  
    }
    else
    {
      console.log("blargh");
    }
    
    $scope.ZoneEditorIsOpen = false;
  };
 
  $scope.ZoneEditorOptions = 
  {
    backdropFade: true, 
    dialogFade: true
  };






  $scope.openScheduleEditor = function()
  {
    
    $scope.ScheduleEditorIsOpen = true;
  };
  $scope.closeScheduleEditor = function()
  {
$scope.ScheduleEditorIsOpen = false;
  };
  $scope.ScheduleEditorOptions = {backdropFade: true, dialogFade: true};


  $scope.scheduleEditorTimePicker = new Date();
  $scope.scheduleEditorhStep = 1;
  $scope.scheduleEditormStep = 5;
  $scope.scheduleEditorIsMeridian = true;


  $scope.myUrl = '/sprinkler/';
  $http.defaults.useXDomain = true;
  delete $http.defaults.headers.common['X-Requested-With'];
  $scope.ReadZones();
  $scope.ReadPrograms();
  $scope.ReadSchedules();
}

SprinklerCtrl.$inject = ['$scope', '$http', '$templateCache'];