/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */


var app = require('http').createServer(httpRequestHandler);
var io = require('socket.io');
var db = require('mongodb');
var async = require('async');
var bcrypt = require('bcrypt');
var dbConn;

db.MongoClient.connect('mongodb://localhost:27017/simple-rating',
    function(err, conn) {
      if (err) {
        throw err;
      } else {
        dbConn = conn;
      }
    });


/**
 * Initialized socket.io
 */
app.io = io.listen(app);
app.io.sockets.on('connection', function(socket) {
  socket.on('authorize', function(secret, callback) {
    bcrypt.compare(secret,
        '$2a$13$ZCw7J00OPubybCIa/aL5su1x23UHNsSKVyb57ArjgEI6jtCAig81G',
        function(err, ok) {
          if (err) {
            socket.emit('err', err.toString());
          } else {
            if (ok) {
              socket.on('add student', function(name, callback) {
                var student = {
                  name: name,
                  rating: 0
                };
                dbConn.collection('students').insert(student,
                    sendResponse(socket, callback, true));
              });
              socket.on('add event', function(event, callback) {
                event.marks = [];
                dbConn.collection('events').insert(event,
                    sendResponse(socket, callback, true));
              });
              socket.on('add mark', function(data, callback) {
                for (var i = 0; i < data.studentIds.length; ++i) {
                  data.studentIds[i] = new db.ObjectID(data.studentIds[i]);
                }
                async.series([
                  function(callback) {
                    dbConn.collection('students').update(
                        {_id: {$in: data.studentIds}},
                        {$inc: {rating: data.mark}}, {multi: true}, callback);
                  }, function(callback) {
                    var markObject = {
                      mark: data.mark,
                      studentIds: data.studentIds,
                      comment: data.comment
                    };
                    dbConn.collection('events').update(
                        {_id: new db.ObjectID(data.eventId)},
                        {$push: {marks: markObject}}, callback);
                  }
                ], sendResponse(socket, callback));
              });
              if (typeof callback === 'function') {
                callback(ok);
              }
            }
          }
        });
  });
  socket.on('get students', function(data, callback) {
    dbConn.collection('students').find().toArray(
        sendResponse(socket, callback));
  });
  socket.on('get event', function(eventId, callback) {
    dbConn.collection('events').findOne({_id: new db.ObjectID(eventId)},
        sendResponse(socket, callback));
  });
  socket.on('get events', function(data, callback) {
    dbConn.collection('events').find().toArray(sendResponse(socket, callback));
  });
  socket.on('get student events', function(studentId, callback) {
    dbConn.collection('events').find({'marks.studentIds': studentId}).toArray(
        sendResponse(socket, callback));
  });
});
app.listen(8080);


function httpRequestHandler(req, res) {
  res.writeHead(403);
  res.end();
}


/**
 * @param {Object} socket
 * @param {Function} callback
 * @param {*=} opt_responseWithFirst
 * @return {function(Error, *)}
 */
function sendResponse(socket, callback, opt_responseWithFirst) {
  return function(err, data) {
    if (err) {
      socket.emit('err', err.toString());
    } else {
      if (typeof callback === 'function') {
        callback(opt_responseWithFirst ? data[0] : data);
      }
    }
  }
}
