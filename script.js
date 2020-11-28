const cameraSensor = document.querySelector('#camera-sensor')
cameraSensor.width = 1280
cameraSensor.height = 960
ctx = cameraSensor.getContext('2d')

handpose.load().then(model => {
  g = 7, num = 2
  fileName = `http://127.0.0.1:8080/kinect_leap_dataset/acquisitions/P1/G${g}/${num}_rgb.png`
  
  img = new Image
  img.crossOrigin = 'anonymous'
  img.src = fileName
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    
    model.estimateHands(cameraSensor).then(predictions => {
      console.log(predictions)
    })
  }
  
})
