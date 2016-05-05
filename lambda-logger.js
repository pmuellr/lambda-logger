#!/usr/bin/env node

'use strict'

const yargs = require('yargs')

const util = require('./lib/util')

const cmdListLambdas = require('./lib/cmd-list-lambdas')
const cmdListStreams = require('./lib/cmd-list-streams')
const cmdUpdateStreams = require('./lib/cmd-update-streams')
const cmdPrintEvents = require('./lib/cmd-print-events')

exports.main = main

if (require.main === module) main()

// main entry point
function main () {
  const argv = yargs
    .alias('l', 'list')
    .alias('u', 'update')
    .alias('p', 'print')
    .alias('a', 'all')
    .alias('s', 'since')
    .alias('g', 'grouped')
    .alias('d', 'debug')
    .alias('h', 'help')
    .boolean('list')
    .boolean('update')
    .boolean('print')
    .boolean('all')
    .boolean('grouped')
    .boolean('debug')
    .boolean('help')
    .argv

  if (argv.help) return util.help()

  if (argv.debug) util.debugLog = util.log

  util.debugLog('parsed args: %s', JSON.stringify(argv, null, 2))

  if (argv.all) argv.since = '1970-01-01'

  let since
  if (argv.since) {
    since = normalizeSince(argv.since)
    util.debugLog('since value: %s', new Date(since).toISOString())
  }

  const lambdas = argv._

  if (lambdas[0] == null) {
    if (argv.list) return listLambdas()
    return util.help()
  }

  var opts = {
    since: since,
    grouped: argv.grouped
  }

  if (argv.list) return listStreams(lambdas)
  if (argv.update) return updateStreams(lambdas, opts)
  if (argv.print) return printEvents(lambdas, opts)

  updateAndPrint(lambdas, opts)
}

// list log groups of lambdas
function listLambdas () {
  cmdListLambdas.run(function (err, lambdas) {
    if (err) return logError(err)

    for (let lambda of lambdas) {
      console.log(lambda)
    }
  })
}

// list log streams of a lambda
function listStreams (lambdas) {
  lambdas.forEach(function (lambda) {
    cmdListStreams.run(lambda, function (err, streams) {
      if (err) return logError(err)

      if (lambdas.length >= 1) console.log(lambda + ':')

      for (let stream of streams) {
        console.log(stream)
      }

      if (lambdas.length >= 1) console.log('')
    })
  })
}

// list log streams of a lambda
function updateStreams (lambdas, opts) {
  lambdas.forEach(function (lambda) {
    cmdUpdateStreams.run(lambda, opts, function (err) {
      if (err) return logError(err)
    })
  })
}

// print events
function printEvents (lambdas, opts) {
  lambdas.forEach(function (lambda) {
    cmdPrintEvents.run(lambda, opts, function (err) {
      if (err) return logError(err)
    })
  })
}

function updateAndPrint (lambdas, opts) {
  lambdas.forEach(function (lambda) {
    cmdUpdateStreams.run(lambda, opts, function (err) {
      if (err) return logError(err)

      cmdPrintEvents.run(lambda, opts, function (err) {
        if (err) return logError(err)
      })
    })
  })
}

// normalize a since option
function normalizeSince (since) {
  since = '' + since

  const origSince = since

  since = since.replace(/\//g, '-')
  const pieces = since.split('-')

  const currDate = new Date().toISOString()
  const currYY = currDate.substr(0, 4)
  const currMM = currDate.substr(5, 2)

  if (pieces.length === 1) {
    since = `${currYY}/${currMM}/${pieces[0]}`
  } else if (pieces.length === 2) {
    since = `${currYY}/${pieces[0]}/${pieces[1]}`
  } else {
    since = `${pieces[0]}/${pieces[1]}/${pieces[2]}`
  }

  since = Date.parse(since)
  if (isNaN(since)) {
    logError(`invalid since value ${origSince}`)
    process.exit(1)
  }

  return since
}

// print an error message
function logError (err) {
  util.log('error:', err)
}
