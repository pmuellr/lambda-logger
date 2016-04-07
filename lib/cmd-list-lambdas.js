'use strict'

const awsLogs = require('./aws-logs')

exports.run = run

function run (cb) {
  awsLogs.getLogGroupNames(gotLogGroupNames)

  function gotLogGroupNames (err, groups) {
    if (err) return cb(err)

    const result = []

    for (let group of groups) {
      const match = group.logGroupName.match(/\/aws\/lambda\/(.*)/)
      if (!match) continue

      result.push(match[1])
    }

    cb(null, result)
  }
}
