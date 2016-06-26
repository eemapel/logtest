#!/usr/bin/env node

var fs = require("fs")
var readline = require("readline")
var wlog = require('wlog')

var logproc = require('./lib/logproc.js')

wlog.tag("TESTLOG")

// Normalize argument array
var args = process.argv.slice(2)

// Assume the first argument as the file
logfile = args[0]
rulesfile = args[1]

// List for failure (no) conditions
var nlist = []

// List for required (yes) conditions
var ylist = []

// placeholder for lines
var lines = []

if (logfile === undefined || rulesfile === undefined)
    help()

fs.exists(logfile, (exists) => {
    if (!exists)
        wlog.err("log-file not found: " + logfile)

   fs.exists(rulesfile, (exists) => {
        if (!exists)
            wlog.err("rules-file not found: " + rulesfile)

        var rf = readline.createInterface({
            input: fs.createReadStream(rulesfile)
        })

        var lf = readline.createInterface({
            input: fs.createReadStream(logfile)
        })

        rf.on('line', function (line) {
            if (line.length) {
                var cond = line[0]
                var regex_string = line.substring(line.indexOf("/") + 1, line.lastIndexOf("/"))
                if (!regex_string || regex_string == "/")
                    wlog.err("invalid regex string")

                if (cond == "y") {
                    ylist.push(new RegExp(regex_string))
                } else if (cond == "n") {
                    nlist.push(new RegExp(regex_string))
                } else {
                    wlog.err("invalid condition type")
                }
            }
       }).on('close', function () {
           wlog.note("Rules read successfully..")

           // Now we can read the log-file
           var lf = readline.createInterface({
               input: fs.createReadStream(logfile)
           })

           lf.on('line', function (line) {
              lines.push(line)
           }).on('close', function () {
              wlog.note("Logs read successfully..")
              logproc.log_processor(lines, ylist, nlist)
           })
       })
    })
})

function help() {
    wlog.note("Usage:")
    wlog.note("$ logtest <log-file> <rules-file>")
    process.exit(0)
}

