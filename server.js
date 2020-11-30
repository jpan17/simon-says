const http = require('http')
const fs = require('fs')
// const { decode } = require('base-64')

http.createServer((req, res) => {
  let body = ''
  req.on('data', data => {
    body += data
  })
  req.on('end', () => {
    body = body.replace('data:image/png;base64,', '')
    body = body.replace(' ', '+')

    // Think we might need a way to decode the data... output.png doesn't open right now
    // body = Buffer.from(body, 'base64').toString()
    // body = decode(body)

    fs.writeFile('output.png', body, err => {
      if (err) throw err
    })
  })
}).listen(8000)