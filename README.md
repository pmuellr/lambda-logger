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

The basic story is to download the logs with:

    lambda-logger --update my-flavorite-lambda

and then you can have them printed to stdout with:

    lambda-logger my-flavorite-lambda

options:

    -l --list     list lambdas / streams with logs in CloudWatch
    -u --update   update the local logs from CloudWatch
    -a --all      show all entries, not just today's
    -g --grouped  group entries by transaction when printing
    -d --debug    generate debug information
    -h --help     print this help

If you don't specify help, list, or update, lamda-logger will print log
entries for the specified lambda from today.

Typical usage would be as follows:

    lambda-logger -l

This command will list lambdas that have logs at CloudWatch.  

To see the streams available (for curiousity, mainly) use:

    lambda-logger -l my-flavorite-lambda

To download log streams so that you can print the log entries later, use:

    lambda-logger -u my-flavorite-lambda

This will only download log streams with today's date.  To download all
the log streams, use the `-a` option:

    lambda-logger -ua my-flavorite-lambda

After you've download the log streams, you can refresh them from CloudWatch
with the same commands, as they may have newer entries.

To view the log entries, just don't use the `-u` or `-l` option:

    lambda-logger my-flavorite-lambda

This just shows log entries from streams created today. You can use the `-a`
option here as well to view all the log entries you have.  You can also use the
`-g` option to group messages by the transaction they were run in, instead of
sorted by date.


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
