'use strict'

const async = require('async')

const util = require('./util')
const awsLogs = require('./aws-logs')
const savedLogs = require('./saved-logs')

exports.run = run

function run (lambda, opts, cb) {
  const group = `/aws/lambda/${lambda}`

  awsLogs.getLogStreamNames(group, gotLogStreamNames)

  function gotLogStreamNames (err, streams) {
    if (err) return cb(err)

    const dayOld = opts.since || Date.now() - 24 * 60 * 60 * 1000
    const result = []

    util.debugLog(`dayOld: ${dayOld}`)
    for (let stream of streams) {
      const streamName = stream.logStreamName

      if (opts.all) {
        result.push(stream)
      } else if (stream.lastEventTimestamp > dayOld) {
        result.push(stream)
      }
    }

    async.each(result, updateStream, cb)
  }

  function updateStream (stream, cb) {
    const streamName = stream.logStreamName
    util.debugLog(`updating ${lambda}/${streamName}: ${stream.lastEventTimestamp}`)
    updateLambdaStream(lambda, stream, cb)
  }
}

function updateLambdaStream (lambda, stream, cb) {
  const streamName = stream.logStreamName
  const logName = savedLogs.stream2log(streamName)
  const oldEntries = savedLogs.read(lambda, logName)

  if (oldEntries.length > 0) {
    const lastEntry = oldEntries[oldEntries.length - 1]
    if (stream.lastEventTimestamp === lastEntry.timestamp) {
      util.debugLog(`skipping ${lambda}/${logName} as it hasn't been updated`)

      return cb()
    }
  }

  awsLogs.getLogEvents(`/aws/lambda/${lambda}`, streamName, gotLogEvents)

  function gotLogEvents (err, events) {
    if (err) return cb(err)

    savedLogs.write(lambda, logName, events)

    const action = (oldEntries.length === 0) ? 'created' : 'updated'
    util.log(`${action}  ${lambda}/${logName}`)

    cb()
  }
}
