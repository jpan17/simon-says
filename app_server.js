const http = require('http')
const fs = require('fs')

// const { decode } = require('base-64')

http.createServer((req, res) => {
  let body = ''
  req.on('data', data => {
    body = data.toString()
  })

  // FOR OUTPUTING KEYPOINTS INTO A FILE
  req.on('end', () => {
      var spawn = require("child_process").spawn;
      var process = spawn('python', ["./run_classifier.py", body])
      process.stdout.on('data', function(data) { 
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.write(data.toString())
        res.end()
      } ) 
  })
}).listen(8000)