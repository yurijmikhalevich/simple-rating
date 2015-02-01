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

function saveParticipant(req) {
  var participant = req.data;
  if (undefined === req.data.rating) {
    req.data.rating = 0;
  }
  db.main.collection('participants').save(participant, sendResponse(req, true));
}

function addEvent(req) {
  var event = req.data;
  event.marks = [];
  db.main.collection('events').insertOne(event,
      sendResponse(req, true));
}

function addMark(req) {
  var data = req.data;
  for (var i = 0; i < data.participantIds.length; ++i) {
    data.participantIds[i] = new db.ObjectID(data.participantIds[i]);
  }
  async.series([
    function(callback) {
      var markObject = {
        mark: data.mark,
        participantIds: data.participantIds,
        comment: data.comment
      };
      db.main.collection('events').updateOne(
          {_id: new db.ObjectID(data.eventId)},
          {$push: {marks: markObject}}, callback);
    },
    function(callback) {
      db.main.collection('participants').updateMany(
          {_id: {$in: data.participantIds}},
          {$inc: {rating: data.mark}}, callback);
    }
  ], sendResponse(req));
}

function removeParticipant(req) {
  var participantId = new db.ObjectID(req.data._id);
  async.series([
    function(cb) {
      db.main.collection('participants').deleteOne({_id: participantId}, cb);
    },
    function(cb) {
      db.main.collection('events').updateMany(
          {'marks.participantIds': participantId},
          {$pull: {'marks.$.participantIds': participantId}},
          cb
      );
    },
    function(cb) {
      db.main.collection('events').updateMany(
          {'marks.participantIds': {$size: 0}},
          {$pull: {marks: {participantIds: {$size: 0}}}},
          cb
      );
    }
  ], sendResponse(req));
}

function removeMark(req) {
}

function removeEvent(req) {
}

function renameParticipant(req) {
}

function updateEvent(req) {
}

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
          req.socket.route('add participant', saveParticipant);
          req.socket.route('remove participant', removeParticipant);
          req.socket.route('add event', addEvent);
          req.socket.route('add mark', addMark);
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
