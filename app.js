/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */
var f = require('39f-meta');
var async = require('async');
var bcrypt = require('bcrypt');
var jf = require('jsonfile');
var path = require('path');
var settings = jf.readFileSync(path.join(__dirname, 'settings.json'));
var db = f.database;

f.database.init([{name: 'main', settings: settings.mongodb}]);

f.loadApp(settings.port, '0.0.0.0', 1, function(err, app) {
  app.io.sockets.route('authorize', function(req) {
    bcrypt.compare(req.data, settings.password,
        function(err, ok) {
          if (err) {
            req.emit('err', err.toString());
            return;
          }
          if (!ok) {
            return;
          }
          req.socket.route('add participant', function(req) {
            var participant = {
              name: req.data,
              rating: 0
            };
            db.main.collection('participants').insertOne(participant,
                sendResponse(req, true));
          });
          req.socket.route('add event', function(req) {
            var event = req.data;
            event.marks = [];
            db.main.collection('events').insertOne(event,
                sendResponse(req, true));
          });
          req.socket.route('add mark', function(req) {
            var data = req.data;
            for (var i = 0; i < data.participantIds.length; ++i) {
              data.participantIds[i] = new db.ObjectID(data.participantIds[i]);
            }
            async.series([
              function(callback) {
                db.main.collection('participants').updateOne(
                    {_id: {$in: data.participantIds}},
                    {$inc: {rating: data.mark}}, {multi: true}, callback);
              }, function(callback) {
                var markObject = {
                  mark: data.mark,
                  participantIds: data.participantIds,
                  comment: data.comment
                };
                db.main.collection('events').updateOne(
                    {_id: new db.ObjectID(data.eventId)},
                    {$push: {marks: markObject}}, callback);
              }
            ], sendResponse(req));
          });
          req.respond(ok);
        });
  });
  app.io.sockets.route('get participants', function(req) {
    db.main.collection('participants').find().toArray(sendResponse(req));
  });
  app.io.sockets.route('get event', function(req) {
    db.main.collection('events').findOne({_id: new db.ObjectID(req.data)},
        sendResponse(req));
  });
  app.io.sockets.route('get events', function(req) {
    db.main.collection('events').find().toArray(sendResponse(req));
  });
  app.io.sockets.route('get participant events', function(req) {
    db.main.collection('events').find({'marks.participantIds': req.data})
        .toArray(sendResponse(req));
  });
});


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
      if (data.ops) {
        data = data.ops;
      }
      req.respond(opt_responseWithFirst ? data[0] : data);
    }
  }
}
