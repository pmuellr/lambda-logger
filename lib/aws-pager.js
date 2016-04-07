'use strict'

const awsCommand = require('./aws-command')

exports.build = build

// builds a paging function - pagedFn((err, items) => ...)
// eg:
//   build(['logs', 'describe-log-groups'], 'logGroups', '--starting-token', 'nextToken')
//   build(['logs', 'get-log-events', ...], 'events', '--next-token', 'nextForwardToken')
function build (cmd, collProperty, nextOption, nextProperty) {
  return function builtPager (cb) {
    const items = []

    awsCommand.run(cmd, awsCommandDone)

    function awsCommandDone (err, data) {
      if (err) return cb(err)

      // err if our collection property not found
      const collValue = data[collProperty]
      if (collValue == null) {
        return cb(new Error(`expected property ${collProperty} in data: ${JSON.stringify(data)}`))
      }

      // no items? done
      if (collValue.length === 0) return cb(null, items)

      // copy items to our list
      for (let item of collValue) items.push(item)

      // no next property? done
      if (data[nextProperty] == null) return cb(null, items)

      // set up next paged call
      const nextCmd = cmd.slice()
      nextCmd.push(nextOption)
      nextCmd.push(data[nextProperty])

      awsCommand.run(nextCmd, awsCommandDone)
    }
  }
}
