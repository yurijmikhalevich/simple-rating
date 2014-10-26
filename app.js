/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */
var io = require('39f-socket.io');
var db = require('mongodb');
var async = require('async');
var bcrypt = require('bcrypt');
var jf = require('jsonfile');
var path = require('path');
var settings = jf.readFileSync(path.join(__dirname, 'settings.json'));
var dbConn;

db.MongoClient.connect(settings.mongodb,
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
var app = new io();
app.sockets.route('authorize', function(req) {
  bcrypt.compare(req.data, settings.password,
      function(err, ok) {
        if (err) {
          req.emit('err', err.toString());
          return;
        }
        if (!ok) {
          return;
        }
        req.socket.route('add student', function(req) {
          var student = {
            name: req.data,
            rating: 0
          };
          dbConn.collection('students').insert(student,
              sendResponse(req, true));
        });
        req.socket.route('add event', function(req) {
          var event = req.data;
          event.marks = [];
          dbConn.collection('events').insert(event,
              sendResponse(req, true));
        });
        req.socket.route('add mark', function(req) {
          var data = req.data;
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
          ], sendResponse(req));
        });
        req.respond(ok);
      });
});
app.sockets.route('get students', function(req) {
  dbConn.collection('students').find().toArray(sendResponse(req));
});
app.sockets.route('get event', function(req) {
  dbConn.collection('events').findOne({_id: new db.ObjectID(req.data)},
      sendResponse(req));
});
app.sockets.route('get events', function(req) {
  dbConn.collection('events').find().toArray(sendResponse(req));
});
app.sockets.route('get student events', function(req) {
  dbConn.collection('events').find({'marks.studentIds': req.data}).toArray(
      sendResponse(req));
});

app.listen(settings.port);


/**
 * @param {Object} req
 * @param {*=} opt_responseWithFirst
 * @return {function(Error, *)}
 */
function sendResponse(req, opt_responseWithFirst) {
  return function(err, data) {
    if (err) {
      req.emit('err', err.toString());
    } else {
      req.respond(opt_responseWithFirst ? data[0] : data);
    }
  }
}
