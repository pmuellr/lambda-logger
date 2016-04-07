'use strict'

const awsLogs = require('./aws-logs')

exports.run = run

function run (lambda, cb) {
  const group = `/aws/lambda/${lambda}`
  awsLogs.getLogStreamNames(group, gotLogGroupNames)

  function gotLogGroupNames (err, streams) {
    if (err) return cb(err)

    const result = []

    for (let stream of streams) {
      result.push(stream.logStreamName)
    }

    cb(null, result)
  }
}
