'use strict'

const async = require('async')

const util = require('./util')
const awsLogs = require('./aws-logs')
const savedLogs = require('./saved-logs')

exports.run = run

function run (lambda, opts, cb) {
  const group = `/aws/lambda/${lambda}`
  const datePrefix = new Date().toISOString().substr(0, 10).replace(/-/g, '/')

  awsLogs.getLogStreamNames(group, gotLogGroupNames)

  function gotLogGroupNames (err, streams) {
    if (err) return cb(err)

    const result = []

    for (let stream of streams) {
      const streamName = stream.logStreamName

      if (opts.all) {
        result.push(stream)
      } else if (streamName.substr(0, datePrefix.length) === datePrefix) {
        result.push(stream)
      }
    }

    async.each(result, updateStream, cb)
  }

  function updateStream (stream, cb) {
    // console.log(`updateStream(${lambda}, ${stream.logStreamName})`)
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
