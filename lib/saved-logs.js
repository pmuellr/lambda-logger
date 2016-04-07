'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')

const util = require('./util')

exports.list = list
exports.read = read
exports.write = write
exports.append = append
exports.stream2log = stream2log

const ProgramDir = path.join(os.homedir(), `.${util.PROGRAM}`)
const LogsDir = path.join(ProgramDir, 'logs')

// return a list of saved logs
function list (lambda) {
  try {
    return fs.readdirSync(path.join(LogsDir, lambda))
  } catch (err) {
    return []
  }
}

// return contents of a log
function read (lambda, log) {
  const fileName = path.join(LogsDir, lambda, log)
  util.debugLog(`reading log ${fileName}`)
  if (!pathExists(fileName)) return []

  return JSON.parse(fs.readFileSync(fileName, 'utf8'))
}

// write entries to a log
function write (lambda, log, entries) {
  ensureDirectories(lambda)

  const fileName = path.join(LogsDir, lambda, log)
  entries.sort((a, b) => a.timestamp - b.timestamp)

  fs.writeFileSync(fileName, JSON.stringify(entries, null, 2))
}

// append entries to a log
function append (lambda, log, newEntries) {
  ensureDirectories(lambda)

  const fileName = path.join(LogsDir, lambda, log)
  util.debugLog(`appending log ${fileName}`)
  const entries = read(log)

  for (let entry of newEntries) entries.push(entry)

  entries.sort((a, b) => a.timestamp - b.timestamp)

  fs.writeFileSync(fileName, JSON.stringify(entries, null, 2))
}

// ensure all the directories we need have been created
function ensureDirectories (lambda) {
  if (!pathExists(ProgramDir)) fs.mkdirSync(ProgramDir)
  if (!pathExists(LogsDir)) fs.mkdirSync(LogsDir)

  const lambdaDir = path.join(LogsDir, lambda)
  if (!pathExists(lambdaDir)) fs.mkdirSync(lambdaDir)
}

// convert a stream name to a log name
function stream2log (streamName) {
  const logName = streamName
    .replace(/\$|\[|\]/g, '_')
    .replace(/\//g, '-')

  return `${logName}.json`
}

// fileExists
function pathExists (pathName) {
  return fstat(pathName) != null
}

// nicer stat function
function fstat (pathName) {
  try {
    return fs.statSync(pathName)
  } catch (err) {
    return null
  }
}
