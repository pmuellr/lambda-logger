'use strict'

const child_process = require('child_process')

const async = require('async')
const BufferList = require('bl')

const util = require('./util')

// exports
exports.setConcurrent = setConcurrent
exports.run = run

// create queue, set concurrent request #
let queue
setConcurrent(10)

function setConcurrent (value) {
  queue = async.queue(runBasic, value)
}

// run an aws command, return object result
function run (cmd, cb) {
  queue.push({cmd: cmd}, cb)
}

// run an aws command, return object result
function runBasic (cmd, cb) {
  cmd = cmd.cmd
  cb = util.onlyCallOnce(cb)

  const cmdString = `aws ${cmd.join(' ')}`
  util.debugLog(`running command: ${cmdString}`)

  const opts = {
    stdio: ['ignore', 'pipe', process.stderr]
  }

  let proc = child_process.spawn('aws', cmd, opts)

  proc.on('error', cb)
  proc.on('exit', onExit)
  proc.stdout.pipe(new BufferList(collectStdout))

  function collectStdout (err, data) {
    if (err) return cb(err)

    const stdout = data.toString('utf8')

    try {
      cb(null, JSON.parse(stdout))
    } catch (err) {
      cb(err)
    }
  }

  function onExit (code, signal) {
    if (code !== 0) {
      return cb(new Error(`command exited with code ${code}: ${cmdString}`))
    }

    if (signal != null) {
      return cb(new Error(`command exited with signal ${signal}: ${cmdString}`))
    }
  }
}
