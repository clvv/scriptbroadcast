fs       = require 'fs'
{Buffer} = require 'buffer'


handleError = (err) ->
    throw err
    process.exit()

# Function that create a timeline from the given files
exports.readTimeLine = (timingFile, typeScriptFile, callback) ->
    fs.readFile timingFile, (err, data) ->
        handleError err if err
        # Preprocessing raw data in to an array
        data = data.toString('ascii').split /\n| /
        # Prepare the timeline
        timeline = []
        for i in [0..data.length / 2 - 1]
            timeline[i] =
                delay: parseFloat(data[i * 2] * 1000)
                bytes: parseInt(data[i * 2 + 1])

        fs.readFile typeScriptFile, (err, scriptBuffer) ->
            handleError err if err
            # Initialize slicedBytes, ignoring the first line
            slicedBytes = 0
            while scriptBuffer[slicedBytes++] isnt 0x0a then

            # Slice scriptBuffer to desired chuncks
            timeline.forEach (entry) ->
                entry.data = scriptBuffer.slice slicedBytes,
                    slicedBytes + entry.bytes
                slicedBytes += entry.bytes

            # In case anything goes wrong
            if scriptBuffer.length isnt slicedBytes
                console.log 'Something went wrong when slicing the file!'
                console.log "scriptBuffer size: #{scriptBuffer.length}"
                console.log "slicedBytes: #{slicedBytes}"

            callback timeline

# Function that returns a closure that plays the given timeline on a stream
exports.createReplayFunction = (timeline, divisor = 1) ->

    return (stream, id = -1) ->
        unless id is -1
            # Send out the bytes if the connection is still open
            # Close the connection otherwise
            if stream.writable
                stream.write(timeline[id].data)
            else
                console.log 'Lost a client!'
                return

        # Increment id then test if we reached the end
        # If not, then set up the timeout for the next action
        # If yes, then close the connection
        if ++id < timeline.length
            setTimeout arguments.callee,
                timeline[id].delay / divisor, stream, id
        else
            console.log 'playback ended!'
            stream.end()
