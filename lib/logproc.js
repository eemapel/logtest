// logproc.js
var exports = module.exports = {}

var wlog = require('wlog')

exports.log_processor = function(lines, ylist, nlist) {
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
