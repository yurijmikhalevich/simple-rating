/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

mainApp.controller('Students', function($rootScope, $scope, $compile) {
  $rootScope.students = [];
  socket.emit('get students', null, function(students) {
    $rootScope.students = students;
    $rootScope.$apply();
  });
  $scope.add = function() {
    console.log($scope.newStudentName);
    socket.emit('add student', $scope.newStudentName, function(student) {
      $rootScope.students.push(student);
      $scope.newStudentName = null;
      $rootScope.$apply();
    });
  };
  $scope.show = function(studentId) {
    $.get('/public/html/studentmodal.html', function(template) {
      var student;
      for (var i = 0; i < $rootScope.students.length; ++i) {
        if ($rootScope.students[i]._id === studentId) {
          student = $rootScope.students[i];
          break;
        }
      }
      var myScope = $rootScope.$new();
      myScope.studentId = student._id;
      myScope.name = student.name;
      myScope.rating = student.rating;
      myScope.events = [];
      $rootScope.events.forEach(function(event) {
        var marks = [];
        event.marks.forEach(function(mark) {
          if (mark.studentIds.indexOf(student._id) !== -1) {
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
