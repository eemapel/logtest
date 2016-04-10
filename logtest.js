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

if (logfile === undefined || rulesfile === undefined)
    help()

fs.exists(logfile, (exists) => {
    if (!exists)
        wlog.err("log-file not found: " + logfile)

   fs.exists(rulesfile, (exists) => {
       if (!exists)
           wlog.err("rules-file not found: " + rulesfile)

       var buffer = readline.createInterface({
           input: fs.createReadStream(rulesfile)
       })

       buffer.on('line', function (line) {
           var string = line.substring(line.indexOf("/") + 1, line.lastIndexOf("/"))
           var re = new RegExp(string)

           console.log("string : " + string)
           console.log(re.test("..test.."))

           process.exit(0)
       })
    })
})

function help() {
    wlog.note("Usage:")
    wlog.note("$ logtest <log-file> <rules-file>")
    process.exit(0)
}

