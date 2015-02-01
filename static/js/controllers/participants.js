/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

mainApp.controller('Participants', function($rootScope, $scope, $compile) {
  $rootScope.participants = [];
  socket.emit('get participants', null, function(participants) {
    $rootScope.participants = participants;
    $rootScope.$apply();
  });
  $rootScope.findParticipant = function(participantId) {
    for (var i = 0; i < $rootScope.participants.length; ++i) {
      if ($rootScope.participants[i]._id === participantId) {
        return $rootScope.participants[i];
      }
    }
  };
  $scope.add = function() {
    socket.emit('add participant', {name: $scope.newParticipantName},
        function(participant) {
          $rootScope.participants.push(participant);
          $scope.newParticipantName = null;
          $rootScope.$apply();
        });
  };
  $scope.edit = function(participantId) {
    console.log('они мертвы внутри');
  };
  $scope.remove = function(participantId) {
    var participant = $rootScope.findParticipant(participantId);
    bootbox.confirm({
      title: 'Are you sure?',
      message: 'Are you sure you want to completely remove participant "' +
          participant.name + '"?',
      callback: function(confirmed) {
        if (confirmed) {
          socket.emit('remove participant', {_id: participantId}, function() {
            $rootScope.participants.splice(
                $rootScope.participants.indexOf(participant), 1);
            $rootScope.$apply();
          });
        }
      }
    });
  };
  $scope.show = function(participantId) {
    $.get('/static/html/participantmodal.html', function(template) {
      var participant = $rootScope.findParticipant(participantId);
      var myScope = $rootScope.$new();
      myScope.participantId = participant._id;
      myScope.name = participant.name;
      myScope.rating = participant.rating;
      myScope.events = [];
      $rootScope.events.forEach(function(event) {
        var marks = [];
        event.marks.forEach(function(mark) {
          if (mark.participantIds.indexOf(participant._id) !== -1) {
            marks.push(mark);
          }
        });
        if (marks.length) {
          var myEvent = {
            _id: event._id,
            date: event.date,
            title: event.title,
            description: event.description,
            marks: marks
          };
          myScope.events.push(myEvent);
        }
      });
      template = $compile(template)(myScope);
      $('body').append(template);
      var myModal = $('#myModal');
      myModal.on('hidden.bs.modal', function() {
        $('#myModal').remove();
      });
      myModal.modal();
    });
  };
});
