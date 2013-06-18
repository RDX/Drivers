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


  $scope.ReadZones = function()
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


  $scope.UpdateZone = function(zone)
  {
    $http.put($scope.myUrl + 'zone', JSON.stringify({number:zone.number, name:zone.name})).
      success(function(data)
      {
        $scope.ReadZones();
      }).
      error(function(data, status, headers, config) 
      {
      });
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
    $http.put($scope.myUrl + 'zone/' + zone.number + '/toggle').
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
      $scope.ReadPrograms();
    }).
    error(function(data, status, headers, config)
    {
    });
  }

  $scope.ReadPrograms = function()
  {
    $http.get($scope.myUrl + 'program').
      success(function(data)
      {
        $scope.programs = data.programs;
      }).
      error(function(data, status, headers, config) 
      {
        $scope.programs = data.programs || "Request failed";
        $scope.status = status;
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
    $scope.UpdateProgram(oldProgram, "Rename", {name:newName});
  }
  $scope.UpdateProgramAddZone = function(program, number, duration)
  {
    $scope.UpdateProgram(program, "Add Zone", {number:number,duration:duration});
  }
  $scope.UpdateProgramRemoveZone = function(program, number)
  {
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










  $scope.myUrl = 'http://10.0.0.12:8080/sprinkler/';

  $http.defaults.useXDomain = true;
  delete $http.defaults.headers.common['X-Requested-With'];
       
  $scope.ReadZones();
  $scope.ReadPrograms();
}

SprinklerCtrl.$inject = ['$scope', '$http', '$templateCache'];
