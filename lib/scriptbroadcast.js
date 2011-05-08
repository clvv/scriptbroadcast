(function() {
  var Buffer, fs, handleError;
  fs = require('fs');
  Buffer = require('buffer').Buffer;
  handleError = function(err) {
    throw err;
    return process.exit();
  };
  exports.readTimeLine = function(timingFile, typeScriptFile, callback) {
    return fs.readFile(timingFile, function(err, data) {
      var i, timeline, _ref;
      if (err) {
        handleError(err);
      }
      data = data.toString('ascii').split(/\n| /);
      timeline = [];
      for (i = 0, _ref = data.length / 2 - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        timeline[i] = {
          delay: parseFloat(data[i * 2] * 1000),
          bytes: parseInt(data[i * 2 + 1])
        };
      }
      return fs.readFile(typeScriptFile, function(err, scriptBuffer) {
        var slicedBytes;
        if (err) {
          handleError(err);
        }
        slicedBytes = 0;
        while (scriptBuffer[slicedBytes++] !== 0x0a) {}
        timeline.forEach(function(entry) {
          entry.data = scriptBuffer.slice(slicedBytes, slicedBytes + entry.bytes);
          return slicedBytes += entry.bytes;
        });
        if (scriptBuffer.length !== slicedBytes) {
          console.log('Something went wrong when slicing the file!');
          console.log("scriptBuffer size: " + scriptBuffer.length);
          console.log("slicedBytes: " + slicedBytes);
        }
        return callback(timeline);
      });
    });
  };
  exports.createReplayFunction = function(timeline, divisor) {
    if (divisor == null) {
      divisor = 1;
    }
    return function(stream, id) {
      if (id == null) {
        id = -1;
      }
      if (id !== -1) {
        if (stream.writable) {
          stream.write(timeline[id].data);
        } else {
          console.log('Lost a client!');
          return;
        }
      }
      if (++id < timeline.length) {
        return setTimeout(arguments.callee, timeline[id].delay / divisor, stream, id);
      } else {
        console.log('playback ended!');
        return stream.end();
      }
    };
  };
}).call(this);
