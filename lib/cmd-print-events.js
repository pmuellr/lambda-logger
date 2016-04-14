'use strict'

const moment = require('moment')

const savedLogs = require('./saved-logs')

exports.run = run

// print events
function run (lambda, opts, cb) {
  const dayOld = Date.now() - 24 * 60 * 60 * 1000
  const events = []

  for (let log of savedLogs.list(lambda)) {
    const entries = savedLogs.read(lambda, log)

    let seq = 0
    entries.forEach((event) => {
      if (event.timestamp < dayOld) return

      event = normalizeEvent(event)
      event.seq = seq++

      events.push(event)
    })
  }

  events.sort((a, b) => {
    const cmp = a.timestamp - b.timestamp
    if (cmp !== 0) return cmp

    return a.seq - b.seq
  })

  if (opts.grouped) return printGrouped(events)

  for (let event of events) {
    console.log(event.date, event.group, event.message)
  }
}

// print grouped events
function printGrouped (events) {
  // collect a map of groups -> earliest event
  const groupMap = []
  for (let event of events) {
    const gEvent = groupMap[event.group]
    if (gEvent == null) {
      groupMap[event.group] = event
    } else if (event.timestamp < gEvent.timestamp) {
      groupMap[event.group] = event
    }
  }

  // sort groups by earlies event
  const groups = []
  for (let group in groupMap) {
    groups.push(groupMap[group])
  }
  groups.sort((a,b) => a.timestamp - b.timestamp)

  // flatten to an array
  const groupNames = groups.map((event) => event.group)

  console.log(groupNames)

  // print
  for (let group of groupNames) {
    for (let event of events) {
      if (event.group !== group) continue
      console.log(event.date, event.message)
    }
    console.log('')
  }
}

// extract and save interesting bits on the events
function normalizeEvent (event) {
  const evMessage = event.message

  event.date = moment(event.timestamp).format('MM-DD HH:mm:ss.SSS')
  event.group = '???'

  // 2016-04-07T00:14:39.947Z	b5eb89fa-fc55-11e5-8488-2b633c731dee	[INFO] ...
  const MessageDatedPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
  if (evMessage.match(MessageDatedPattern)) {
    const match = evMessage.match(/.*?\s+(.*?)\s+(.*)/)
    event.group = left(match[1], 36)
    event.message = match[2]
    return event
  }

  // START RequestId: b5eb89fa-fc55-11e5-8488-2b633c731dee Version: $LATEST
  const MessageStartReqPattern = /^START RequestId:/
  if (evMessage.match(MessageStartReqPattern)) {
    const match = evMessage.match(/^START RequestId:\s+(.*?)\s+(.*)/)
    event.group = match[1]
    event.message = `START  RequestId: ${match[2]}`
    return event
  }

  // END RequestId: b5eb89fa-fc55-11e5-8488-2b633c731dee
  const MessageEndReqPattern = /^END RequestId:/
  if (evMessage.match(MessageEndReqPattern)) {
    const match = evMessage.match(/^END RequestId:\s*(.*)/)
    event.group = match[1]
    event.message = `END    RequestId:`
    return event
  }

  // REPORT RequestId: b61d211a-fc55-11e5-985c-95a08e5fa066	Duration: 4427.14 ms	Billed Duration: 4500 ms 	Memory Size: 512 MB	Max Memory Used: 23 MB
  const MessageReportReqPattern = /^REPORT RequestId:/
  if (evMessage.match(MessageReportReqPattern)) {
    const match = evMessage.match(/^REPORT RequestId:\s+(.*?)\s+(.*)/)
    event.group = match[1]
    event.message = `REPORT RequestId: ${match[2]}`
    return event
  }

  return event
}

function left (string, len) {
  while (string.length < len) string += ' '
  return string
}
