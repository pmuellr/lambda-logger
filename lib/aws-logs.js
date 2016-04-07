'use strict'

const awsPager = require('./aws-pager')

exports.getLogGroupNames = getLogGroupNames
exports.getLogStreamNames = getLogStreamNames
exports.getLogEvents = getLogEvents

function getLogGroupNames (cb) {
  const fn = awsPager.build(
    ['logs', 'describe-log-groups'],
    'logGroups',
    '--starting-token',
    'nextToken'
  )

  fn(cb)
}

function getLogStreamNames (group, cb) {
  const fn = awsPager.build(
    ['logs', 'describe-log-streams', '--log-group-name', group],
    'logStreams',
    '--starting-token',
    'nextToken'
  )

  fn(cb)
}

function getLogEvents (group, stream, cb) {
  const fn = awsPager.build(
    ['logs', 'get-log-events', '--log-group-name', group, '--log-stream-name', stream],
    'events',
    '--next-token',
    'nextForwardToken'
  )

  fn(cb)
}
