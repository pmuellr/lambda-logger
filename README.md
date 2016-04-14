lambda-logger - AWS Lambda log utility
================================================================================

Utility for AWS Lambda logs in Amazon CloudWatch.  

usage
================================================================================

    lambda-logger [options] <lambda>

`<lambda>` is the name of your AWS Lambda function.

The design of `lambda-logger` is to download your logs locally (into your
`~/.lambda-logger` directory), and then you can print the log entries after
downloading them.  My logs are too large and spread out to be able to view
them easily in CloudWatch itself, and I'd prefer to either bring up all the
entries in a file viewer, or just grep them from the command-line.

Since I tend to do a fair bit of analysis on these, I wanted to be able to
access the logs quickly, therefore the whole "download" bit, before-hand.  Plus,
I'm a cheap-ass - it costs money to download those things live all the time!

options:

    -h --help        print this help
    -l --list        list lambdas / streams with logs in CloudWatch
    -p --print       show log entries
    -u --update      update the local logs from CloudWatch
    -a --all         show/update entries since the beginning of time
    -s --since date  show/update entries since specified date
    -g --grouped     group entries by transaction when printing
    -d --debug       generate debug information

If you don't specify help, list, print or update, lamda-logger will update
and then print entries for the last 24 hours.

The date value for the `since` option should be in the form:

* n     - uses current year and month and specified day
* n-n   - uses current year and specified month and day
* n-n-n - uses specified year, month and day

Example, if today is 2014-07-13, given a `since` value of

* '5'        - uses date 2014-07-05
* '5-6'      - uses date 2014-05-06
* '2015-6-7' - uses date 2015-06-07

Typical usage would be as follows:

    lambda-logger -l

This command will list lambdas that have logs at CloudWatch.  

To see the streams available (for curiousity, mainly) use:

    lambda-logger -l my-flavorite-lambda

To download and print log entries for the last 24 hours, use:

    lambda-logger my-flavorite-lambda

To download log streams so that you can print the log entries later, use:

    lambda-logger -u my-flavorite-lambda

This will only download log streams updated in the last 24 hourse.  To download
all the log streams, use the `-a` option:

    lambda-logger -ua my-flavorite-lambda

After you've download the log streams, you can refresh them from CloudWatch
with the same commands, as they may have newer entries.

To view the log entries without downloading updates, use the `-p` option:

    lambda-logger -p my-flavorite-lambda

This just shows log entries since the last 24 hours.

You can also use the `-g` option to group messages by the transaction they were
run in, instead of sorting all messages by date.


install
================================================================================

    npm install -g https://github.com/pmuellr/lambda-logger.git


pre-reqs
================================================================================

This command invokes the `aws` command, so you will need to have that installed,
and be logged into it appropriately, before using this command.


contributing
================================================================================

See the documents [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
