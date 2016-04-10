#!/usr/bin/env node

var fs = require("fs")
var readline = require("readline")
var args = process.argv.slice(2)

if (fs.existsSync(args[0])) {
    console.log("file exists")

    var buffer = readline.createInterface({
        input: fs.createReadStream(args[0])
    })

    buffer.on('line', function (line) {
        var string = line.substring(line.indexOf("/") + 1, line.lastIndexOf("/"))
        var re = new RegExp(string)

        console.log("string : " + string)
        console.log(re.test("..test.."))

        process.exit(0)
    })
} else {
    console.log("file missing")
    process.exit(0)
}

