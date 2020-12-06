const http = require('http')
const fs = require('fs')
// const { decode } = require('base-64')

http.createServer((req, res) => {
  let body = ''
  req.on('data', data => {
    body += data
  })

  // FOR OUTPUTING KEYPOINTS INTO A FILE
  req.on('end', () => {
    const firstLine = 'gesture_person+number_keypoints'
    fs.writeFile('keypoints.txt', firstLine + body, err => {
      if (err) console.log(err)
      else console.log('Keypoints file saved!')
    })
  })

  //// FOR SORTING IMAGES INTO FOLDERS
  // req.on('end', () => {
  //   body = body.replace('data:image/png;base64,', '')
  //   body = body.replace(' ', '+')

  //   // Think we might need a way to decode the data... output.png doesn't open right now
  //   // body = Buffer.from(body, 'base64').toString()
  //   // body = decode(body)

  //   fs.writeFile('output.png', body, err => {
  //     if (err) throw err
  //   })
  // })
}).listen(8000)