/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

mainApp.controller('Events', function($rootScope, $scope, $compile) {
  $rootScope.events = [];
  socket.emit('get events', null, function(events) {
    $rootScope.events = events;
    $rootScope.$apply();
  });
  $scope.add = function() {
    var newEvent = {
      title: $scope.newEventTitle,
      description: $scope.newEventDescription,
      date: $scope.newEventDate
    };
    socket.emit('add event', newEvent, function(event) {
      $rootScope.events.push(event);
      $rootScope.$apply();
    });
  };
  $scope.show = function(eventId) {
    $.get('/public/html/eventmodal.html', function(template) {
      var event;
      for (var i = 0; i < $rootScope.events.length; ++i) {
        if ($rootScope.events[i]._id === eventId) {
          event = $rootScope.events[i];
          break;
        }
      }
      var myScope = $rootScope.$new();
      myScope.eventId = event._id;
      myScope.title = event.title;
      myScope.description = event.description;
      myScope.marks = [];
      event.marks.forEach(function(mark) {
        var myMark = {
          mark: mark.mark,
          comment: mark.comment,
          students: []
        };
        mark.studentIds.forEach(function(studentId) {
          for (var i = 0; i < $rootScope.students.length; ++i) {
            if ($rootScope.students[i]._id === studentId) {
              myMark.students.push($rootScope.students[i]);
              break;
            }
          }
        });
        myScope.marks.push(myMark);
      });
      myScope.date = event.date;
      template = $compile(template)(myScope);
      $('body').append(template);
      var myModal = $('#myModal');
      myModal.on('hidden.bs.modal', function() {
        $('#myModal').remove();
      });
      myModal.modal();
    });
  };
  $scope.create = function() {
    $.get('/public/html/createevent.html', function(template) {
      var myScope = $rootScope.$new();
      myScope.title = 'New event';
      myScope.description = 'New event description';
      var today = new Date();
      var month = today.getMonth().toString();
      if (month.length === 1) {
        month = '0' + month;
      }
      var date = today.getUTCDate().toString();
      if (date.length === 1) {
        date = '0' + date;
      }
      myScope.date = today.getFullYear() + '-' + month + '-' + date;
      console.log(myScope.date);
      template = $compile(template)(myScope);
      $('body').append(template);
      var myModal = $('#myModal');
      myModal.on('hidden.bs.modal', function() {
        $('#myModal').remove();
      });
      myModal.modal();
    });
  };
  $scope.add = function() {
    var event = {
      title: $scope.title,
      description: $scope.description,
      date: $scope.date
    };
    socket.emit('add event', event, function(addedEvent) {
      $rootScope.events.push(addedEvent);
      $('#myModal').hide();
      $rootScope.$apply();
    });
  };
  $scope.addMark = function() {
    $scope.newMark.eventId = $scope.eventId;
    socket.emit('add mark', $scope.newMark, function() {
      for (var i = 0; i < $rootScope.events.length; ++i) {
        if ($rootScope.events[i]._id === $scope.eventId) {
          $rootScope.events[i].marks.push($scope.newMark);
          $scope.newMark.studentIds.forEach(function(studentId) {
            for (var i = 0; i < $rootScope.students.length; ++i) {
              if ($rootScope.students[i]._id === studentId) {
                $rootScope.students[i].rating += $scope.newMark.mark;
                break;
              }
            }
          });
          $scope.newMark = null;
          $rootScope.$apply();
          break;
        }
      }
    });
  };
  $scope.updateStudentIds = function(studentId) {
    if (!$scope.newMark) {
      $scope.newMark = {};
    }
    if (!$scope.newMark.studentIds) {
      $scope.newMark.studentIds = [];
    }
    var studentIdIndex = $scope.newMark.studentIds.indexOf(studentId);
    if (studentIdIndex === -1) {
      $scope.newMark.studentIds.push(studentId);
    } else {
      $scope.newMark.studentIds.splice(studentIdIndex, 1);
    }
  };
});
