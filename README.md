lambda-logger - AWS Lambda log utility
================================================================================

Utility for AWS Lambda logs in Amazon CloudWatch.  


usage
================================================================================

    lambda-logger [options] <lambda>

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

This command will list lambdas that have logs at CloudWatch.  To see the
streams available (for curiousity, mainly) use:

    lambda-logger -l my-favorite-lambda

To download log streams so that you can print the log entries later, use:

    lambda-logger -u my-favorite-lambda

This will only download log streams with today's date.  To download all
the log streams, use the `-a` option:

    lambda-logger -ua my-favorite-lambda

After you've download the log streams, you can refresh them from CloudWatch
with the same commands, as they may have newer entries.

To view the log entries, just don't use the `-u` or `-l` option:

    lambda-logger my-favorite-lambda

This just shows log entries from streams. You can use the `-a` option here as well
to view all the log entries you have.  You can also use the `-g` option to
group messages by the transaction they were run in, instead of sorted by date.


pre-reqs
================================================================================

This command invokes the `aws` command, so you will need to have that installed,
and be logged into it appropriately, before using this command.
