#!/usr/bin/env node

var fs = require("fs")
var readline = require("readline")
var args = process.argv.slice(2)

// Assume the first argument as the file
filename = args[0]

fs.exists(filename, (exists) => {
    if (!exists) {
        console.log("[Error] No file given to open")
        process.exit(1)
    }

    var buffer = readline.createInterface({
        input: fs.createReadStream(filename)
    })

    buffer.on('line', function (line) {
        var string = line.substring(line.indexOf("/") + 1, line.lastIndexOf("/"))
        var re = new RegExp(string)

        console.log("string : " + string)
        console.log(re.test("..test.."))

        process.exit(0)
    })
})

