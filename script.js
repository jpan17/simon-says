const cameraSensor = document.querySelector('#camera-sensor')
cameraSensor.width = 1280
cameraSensor.height = 960
ctx = cameraSensor.getContext('2d')

gLow = 1, gHigh = 10, nLow = 1, nHigh = 10
modelParams = {
  detectionConfidence: 0,
  iouThreshold: 0,
  scoreThreshold: 0
}

getFileName = (g, n) => `http://127.0.0.1:8080/kinect_leap_dataset/acquisitions/P1/G${g}/${n}_rgb.png`

handpose.load(modelParams).then(model => {
  g = gLow, n = nLow
  img = new Image
  img.crossOrigin = 'anonymous'
  img.src = getFileName(g, n)
  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    
    model.estimateHands(cameraSensor).then(predictions => {
      console.log(predictions)
      // TODO crop image and save it somewhere
    })
    
    g = n == nHigh ? g + 1 : g
    n = n == nHigh ? nLow : n + 1
    console.log(`new g and n: ${g}-${n}`)

    if (g < gHigh || n < nHigh) img.src = getFileName(g, n)  // 6,1,9,4
  }

  
})
