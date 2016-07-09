#!/usr/bin/env node

var fs = require('fs')
var readline = require('readline')
var cp = require('child_process')
var wlog = require('wlog')

var logproc = require('./lib/logproc.js')

wlog.tag("TESTLOG")

// Normalize argument array
var args = process.argv.slice(2)

// Assume the first argument as rules file
var rulesfile = args[0]

// Assume the second argument as command or script to execute
var executable = args[1]
var exec_args = args.slice(2)

// List for failure (no) conditions
var nlist = []

// List for required (yes) conditions
var ylist = []

// placeholder for lines
var lines = []

if (executable === undefined || rulesfile === undefined)
    help()

fs.exists(rulesfile, (exists) => {
    if (!exists)
        wlog.err("rules-file not found: :" + rulesfile)

    var rf = readline.createInterface({
        input: fs.createReadStream(rulesfile)
    })

    rf.on('line', function(line) {
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
    }).on('close', function() {
        wlog.note("Rules read successfully..")
        command_runner()
    })
})

function command_runner() {
    fs.exists(executable, (exists) => {
        var child
        if (exists) {
            // If executable exists as local file, it's a script
            child = cp.execFile(__dirname + "/" + executable[0], { timeout: 5000 })
        } else {
            // Try run it as a command
            child = cp.spawn(executable, exec_args, { timeout: 5000 })
        }

        child.stdout.on('data', function(data) {
            // Concatenate lines to array
            lines = lines.concat(data.toString().split(/\r?\n/))
        })

        child.stdout.on('end', function() {
            wlog.note("Logs read successfully..")
            logproc.log_processor(lines, ylist, nlist)
        })
    })
}

function help() {
    wlog.note("Usage:")
    wlog.note("$ logtext <rules-file> <command/script>")
    process.exit(0)
}

