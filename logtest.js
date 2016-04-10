#!/usr/bin/env node

var fs = require("fs")
var readline = require("readline")
var wlog = require('wlog')

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
              log_processor(lines)
           })
       })
    })
})

function log_processor(lines) {
    console.log("")
    wlog.note("Starting the testing..")
    console.log("")

    // Counter for issues
    var failures = 0;

    lines.forEach(function(line, number) {
        ylist.forEach(function(re, index, object) {
            if(re.test(line)) {
                wlog.note("Found required match with condition " + re + " on line number " + number)
                console.log(line)
                console.log("")

                // Remove element from array
                object.splice(index, 1)
            }
        })

        nlist.forEach(function(re) {
            if(re.test(line)) {
                wlog.remark("Found disallowed match with condition " + re + " on line number " + number)
                console.log(line)
                console.log("")

                failures++
            }
        })
    })

    console.log("")
    wlog.note("Summary for processed log")
    wlog.note("=========================")
    wlog.note("Not allowed matches : " + failures)
    wlog.note("Matches not found   : " + ylist.length)
    console.log(ylist)
    console.log("")

    // The verdict
    if (failures || ylist.length) {
        wlog.remark("==> Test failed!")
        console.log("")
        process.exit(1)
    } else {
        wlog.note("==> Test succeeced!")
        console.log("")
        process.exit(0)
    }
}

function help() {
    wlog.note("Usage:")
    wlog.note("$ logtest <log-file> <rules-file>")
    process.exit(0)
}

