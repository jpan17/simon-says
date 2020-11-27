// const handpose = require('@tensorflow-models/handpose')
// const tf = require('@tensorflow/tfjs')
// const fs = require('fs')
// require('@tensorflow/tfjs-backend-wasm')
// // require('@tensorflow/tfjs-backend-webgl'); 

// tf.setBackend('wasm').then(() => main())

// let main = () => {
//   handpose.load().then(model => {
//     let num = 1
//     fileName = `kinect_leap_dataset/acquisitions/P1/G1/${num}_rgb.png`
//     fs.readFile(fileName, (err, data) => {
//       if (err) console.log(err)
//       console.log(`data is type ${data.length}`)
//       model.estimateHands(data).then(predictions => {
//         console.log(predictions)
//       })
//     })    
//   })
// }


const thing = document.querySelector('#the-thing'),
      cameraSensor = document.querySelector('#camera-sensor')

handpose.load().then(model => {
  let g = 5, 
      num = 2
  fileName = `kinect_leap_dataset/acquisitions/P1/G${g}/${num}_rgb.png`
  
  thing.src = fileName
  // thing.width = 1280
  // thing.height = 960
  cameraSensor.width = 1280
  cameraSensor.height = 960
  cameraSensor.getContext('2d').drawImage(thing, 0, 0)

  model.estimateHands(cameraSensor).then(predictions => {
    console.log(predictions)
  })
})
