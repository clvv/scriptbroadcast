var fs = require('fs');
var Buffer = require('buffer').Buffer;

exports.readTimeLine = function (timingFile, typeScriptFile, callback) {
    // Function create a timeline from the given files

    fs.readFile(timingFile, function (err, data) {

        if (err) {
            throw err;
            process.exit();
        }

        data = data.toString('ascii').split(/ |\n/);

        var timeline = [];

        for (var i = 0; i < data.length / 2 - 1; i++ ) {
            //timeline[i] = [ parseFloat(data[i*2]) * 1000, parseInt(data[i*2+1]) ];
            timeline[i] = {
                delay: parseFloat(data[i*2] * 1000),
                bytes: parseInt(data[i*2+1]),
            }
        };

        fs.readFile(typeScriptFile, function (err, scriptBuffer) {

            if (err) {
                throw err;
                process.exit();
            }

            // Initialize slicedBytes, ignore the first line
            var slicedBytes = 0;
            while ( scriptBuffer[slicedBytes++] !== 0x0a );

            timeline.forEach(function (entry) {
                entry.data = scriptBuffer.slice(slicedBytes, slicedBytes + entry.bytes);
                slicedBytes += entry.bytes;
            });

            if ( scriptBuffer.length !== slicedBytes )
                console.log('Something went wrong when slicing the file!');

            //console.log('Timeline size: ' + timeline.length);
            //console.log('scriptBuffer size: ' + scriptBuffer.length);
            //console.log('slicedBytes: ' + slicedBytes)

            callback(timeline);
        });
    });
};

exports.createReplayFunction = function (timeline, divisor) {
    // Function which returns a closure that plays the given timeline on a stream
    if ( typeof divisor === 'undefined' )
        divisor = 1;

    return function (stream, id) {
        if ( typeof id === 'undefined' )
            id = -1; // Initialize id on first call

        if (id >= 0) {

            if ( stream.writable )
                stream.write(timeline[id].data);
            else {
                console.log('Lost a client!');
                return;
            }

            //console.log('Sent: ' + timeline[id][1]);
        }

        id++;

        if ( id < timeline.length) {
            setTimeout(arguments.callee, timeline[id].delay / divisor, stream, id);
            //console.log('Wait: ' + timeline[id][0]);
        } else {
            console.log('Playback ended!');
            stream.end();
        }
    }
}
